import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import * as XLSX from 'xlsx';

type Row = string[];
const money = (value: unknown) => {
  const raw = String(value ?? '').trim().replace(/\./g, '').replace(',', '.');
  const result = Number(raw);
  if (!Number.isFinite(result)) throw new BadRequestException(`Valor numérico inválido: ${String(value)}`);
  return result;
};
const idFrom = (value: string) => /^\s*(\d+)\s*-/.exec(value)?.[1];
const period = (value: string) => { const m = /^(\d{2})\/(\d{4})$/.exec(value.trim()); return m ? { mes: Number(m[1]), ano: Number(m[2]) } : null; };
const monthKey = (ano: number, mes: number) => ano * 12 + mes;
const decodeLegacyName = (value: string) => value.replace(/%([0-9a-f]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
const nameTokens = (value: string) => decodeLegacyName(value)
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
  .match(/[A-Z]{3,}/g)?.filter(token => !['RESIDENCIAL', 'INCORPORACAO', 'EMPREENDIMENTOS', 'INCORPORADORA'].includes(token)) || [];

@Injectable()
export class ContabilidadeService {
  constructor(private readonly prisma: PrismaService) {}

  private validatePeriod(mes: number, ano: number) {
    if (!Number.isInteger(mes) || mes < 1 || mes > 12 || !Number.isInteger(ano) || ano < 2000 || ano > 2100) throw new BadRequestException('Mês/ano inválido');
  }

  private rows(buffer?: Buffer): Row[] {
    if (!buffer?.length) throw new BadRequestException('Arquivo CSV obrigatório');
    const csv = new TextDecoder('windows-1252').decode(buffer);
    const book = XLSX.read(csv, { type: 'string', FS: ';', raw: true });
    return XLSX.utils.sheet_to_json<Row>(book.Sheets[book.SheetNames[0]], { header: 1, defval: '', raw: false }).map(r => r.map(x => String(x ?? '').trim()));
  }

  async importar(fonte: string, buffer: Buffer | undefined, mes?: number, ano?: number) {
    if (mes !== undefined || ano !== undefined) this.validatePeriod(mes!, ano!);
    if (!['receita', 'estoque'].includes(fonte)) throw new BadRequestException('Fonte inválida');
    const rows = this.rows(buffer);
    const projects = await this.prisma.empreendimento.findMany({ select: { id: true, idSienge: true, nome: true } });
    const resolve = (raw: string) => {
      const code = idFrom(raw);
      if (!code) return null;
      const tokens = nameTokens(raw);
      const similar = (name: string) => nameTokens(name).some(token => tokens.includes(token));
      const candidates = projects.filter(p => p.idSienge.split('_')[0] === code || Number(p.idSienge.split('_')[0]) === Number(code) + 1);
      const matched = candidates.filter(p => similar(p.nome));
      if (matched.length === 1) return matched[0];
      const byName = projects.filter(p => nameTokens(p.nome).filter(token => tokens.includes(token)).length >= 2);
      return byName.length === 1 ? byName[0] : null;
    };
    const updates = new Map<string, Record<string, unknown>>();
    const unmatched = new Set<string>();
    let filePeriod: { mes: number; ano: number } | null = null;
    const checkPeriod = (value: string) => {
      const found = period(value);
      if (!found) throw new BadRequestException(`Período inválido: ${value}`);
      if (filePeriod && (found.mes !== filePeriod.mes || found.ano !== filePeriod.ano)) throw new BadRequestException('Arquivo contém períodos diferentes');
      if (mes !== undefined && (found.mes !== mes || found.ano !== ano)) throw new BadRequestException('Período do arquivo não corresponde ao selecionado');
      filePeriod = found;
    };
    if (fonte === 'receita') {
      const h = rows[0];
      if (h?.[1] !== 'Empreendimento' || h?.[2] !== 'Mês/Ano' || h?.[3] !== 'POC') throw new BadRequestException('Cabeçalho da Receita Societária inválido');
      for (const row of rows.slice(1)) {
        if (!row[1]) continue;
        checkPeriod(row[2]);
        const project = resolve(row[1]);
        if (!project) { unmatched.add(decodeLegacyName(row[1])); continue; }
        const poc = money(row[3]);
        const previous = updates.get(project.id);
        if (previous && previous.poc !== poc) throw new BadRequestException(`POC divergente no empreendimento ${project.idSienge}`);
        updates.set(project.id, { poc, receitaImportadaEm: new Date() });
      }
    } else {
      let projectId = ''; let active: { mensal: number; acumulado: number; estoque: number } | null = null;
      const finish = () => { if (active && projectId) updates.set(projectId, { custoIncorridoMensal: active.mensal, custoIncorridoAcumulado: active.acumulado, estoque: active.estoque, estoqueImportadoEm: new Date() }); };
      for (const row of rows) {
        if (row[0] === 'Empreendimento') {
          finish(); const project = resolve(row[1]); projectId = project?.id || '';
          if (!project) unmatched.add(decodeLegacyName(row[1]));
          active = null;
        } else if (row[0] === 'Mês/Ano') {
          checkPeriod(row[1]);
          if (row[2] !== 'Custo incorrido acumulado') throw new BadRequestException('Cabeçalho do Estoque inválido');
          active = { mensal: 0, acumulado: money(row[3]), estoque: 0 };
        } else if (active && row[0] && !['Unidade', 'Tipo de imóvel'].includes(row[0]) && row.length >= 9) {
          active.mensal += money(row[5]); active.estoque += money(row[8]);
        }
      }
      finish();
    }
    if (!filePeriod || !updates.size) throw new BadRequestException('Nenhum empreendimento cadastrado encontrado no arquivo');
    const { mes: importMes, ano: importAno } = filePeriod;
    await this.prisma.$transaction([...updates].map(([empreendimentoId, data]) => this.prisma.contabilidadeMensal.upsert({
      where: { empreendimentoId_mes_ano: { empreendimentoId, mes: importMes, ano: importAno } },
      create: { empreendimentoId, mes: importMes, ano: importAno, ...data },
      update: data,
    })));
    return { fonte, mes: importMes, ano: importAno, empreendimentos: updates.size, empreendimentoIds: [...updates.keys()], naoCadastrados: [...unmatched] };
  }

  async aditivos(empreendimentoId: string) { return this.prisma.aditivoContabil.findMany({ where: { empreendimentoId }, orderBy: [{ ano: 'desc' }, { mes: 'desc' }] }); }
  async periodos() {
    const records = await this.prisma.contabilidadeMensal.findMany({ select: { empreendimentoId: true, mes: true, ano: true, receitaImportadaEm: true, estoqueImportadoEm: true, balanceteImportadoEm: true }, orderBy: [{ ano: 'desc' }, { mes: 'desc' }] });
    const periods = new Map<string, { mes: number; ano: number; empreendimentoIds: string[]; receita: number; estoque: number; balancete: number }>();
    for (const record of records) {
      const key = `${record.ano}-${record.mes}`;
      if (!periods.has(key)) periods.set(key, { mes: record.mes, ano: record.ano, empreendimentoIds: [], receita: 0, estoque: 0, balancete: 0 });
      const item = periods.get(key)!;
      item.empreendimentoIds.push(record.empreendimentoId);
      if (record.receitaImportadaEm) item.receita++;
      if (record.estoqueImportadoEm) item.estoque++;
      if (record.balanceteImportadoEm) item.balancete++;
    }
    return [...periods.values()];
  }
  async criarAditivo(body: { empreendimentoId: string; mes: number; ano: number; valor: number; observacao?: string }) {
    this.validatePeriod(Number(body.mes), Number(body.ano));
    if (!Number.isFinite(Number(body.valor)) || Number(body.valor) <= 0) throw new BadRequestException('Valor inválido');
    return this.prisma.aditivoContabil.create({ data: { ...body, mes: Number(body.mes), ano: Number(body.ano), valor: new Decimal(body.valor) } });
  }
  async removerAditivo(id: string) { return this.prisma.aditivoContabil.delete({ where: { id } }); }
  async modeloAditivos() {
    const projects = await this.prisma.empreendimento.findMany({ select: { idSienge: true, nome: true }, orderBy: { nome: 'asc' } });
    const sheet = XLSX.utils.aoa_to_sheet([
      ['Código OPAC', 'Empreendimento', 'Valor (R$)', 'Observação'],
      ...projects.map(p => [p.idSienge, p.nome, '', '']),
    ]);
    sheet['!cols'] = [{ wch: 18 }, { wch: 42 }, { wch: 18 }, { wch: 45 }];
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, 'Aditivos');
    return XLSX.write(book, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  }
  async importarAditivos(buffer: Buffer | undefined, mes: number, ano: number) {
    this.validatePeriod(mes, ano);
    if (!buffer?.length) throw new BadRequestException('Planilha obrigatória');
    let book: XLSX.WorkBook;
    try { book = XLSX.read(buffer, { type: 'buffer' }); }
    catch { throw new BadRequestException('Planilha inválida'); }
    const rows = XLSX.utils.sheet_to_json<unknown[]>(book.Sheets[book.SheetNames[0]], { header: 1, defval: '', raw: true });
    const header = (rows[0] || []).map(v => String(v).trim());
    if (header[0] !== 'Código OPAC' || header[1] !== 'Empreendimento' || header[2] !== 'Valor (R$)' || header[3] !== 'Observação') throw new BadRequestException('Use o modelo de aditivos baixado no sistema');
    const projects = await this.prisma.empreendimento.findMany({ select: { id: true, idSienge: true, nome: true } });
    const byCode = new Map(projects.map(p => [p.idSienge, p]));
    const entries: { empreendimentoId: string; mes: number; ano: number; valor: Decimal; observacao: string; origem: string }[] = [];
    const seen = new Set<string>();
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const code = String(row[0] ?? '').trim();
      const value = String(row[2] ?? '').trim();
      if (!code && !value) continue;
      if (!code) throw new BadRequestException(`Linha ${i + 1}: código OPAC ausente`);
      const project = byCode.get(code);
      if (!project || String(row[1] ?? '').trim() !== project.nome.trim()) throw new BadRequestException(`Linha ${i + 1}: empreendimento não corresponde ao cadastro`);
      if (seen.has(code)) throw new BadRequestException(`Linha ${i + 1}: empreendimento duplicado`);
      seen.add(code);
      if (!value) continue;
      const parsed = typeof row[2] === 'number' ? row[2] : money(value);
      if (!Number.isFinite(parsed)) throw new BadRequestException(`Linha ${i + 1}: valor inválido`);
      if (parsed < 0) throw new BadRequestException(`Linha ${i + 1}: valor negativo`);
      if (parsed === 0) continue;
      entries.push({ empreendimentoId: project.id, mes, ano, valor: new Decimal(parsed), observacao: String(row[3] ?? '').trim(), origem: 'PLANILHA' });
    }
    await this.prisma.$transaction(async tx => {
      await tx.aditivoContabil.deleteMany({ where: { mes, ano, origem: 'PLANILHA' } });
      if (entries.length) await tx.aditivoContabil.createMany({ data: entries });
    });
    return { mes, ano, importados: entries.length, ignorados: seen.size - entries.length };
  }
  async mapeamentos() { return this.prisma.mapeamentoContabil.findMany({ orderBy: { empresaSienge: 'asc' } }); }
  async empresasSienge() {
    const output: { chave: string; nome: string; cnpj: string; empreendimento: string | null }[] = [];
    const projects = await this.prisma.empreendimento.findMany({ select: { nome: true, cnpj: true } });
    for (const source of [
      { name: 'VCA', domain: 'vca', user: process.env.SIENGE_VCA_USER, password: process.env.SIENGE_VCA_PASSWORD },
      { name: 'LOTEAR', domain: 'vcalotear', user: process.env.SIENGE_LOTEAR_USER, password: process.env.SIENGE_LOTEAR_PASSWORD },
    ]) {
      if (!source.user || !source.password) throw new ServiceUnavailableException(`Credenciais ${source.name} ausentes`);
      const auth = `Basic ${Buffer.from(`${source.user}:${source.password}`).toString('base64')}`;
      for (let offset = 0; ; offset += 200) {
        const response = await fetch(`https://api.sienge.com.br/${source.domain}/public/api/v1/companies?limit=200&offset=${offset}`, { headers: { Authorization: auth, 'X-origin-request': 'opac/contabilidade' }, signal: AbortSignal.timeout(30000) });
        if (!response.ok) throw new ServiceUnavailableException(`Sienge ${source.name}: HTTP ${response.status}`);
        const data = await response.json() as { results: { id: number; name: string; cnpj: string }[] };
        for (const c of data.results) {
          const project = projects.find(p => p.cnpj.replace(/\D/g, '') === String(c.cnpj).replace(/\D/g, ''));
          if (project) output.push({ chave: `${c.id}_${source.name}`, nome: c.name, cnpj: c.cnpj, empreendimento: project.nome });
        }
        if (data.results.length < 200) break;
      }
    }
    return output;
  }
  async mapear(body: { empresaSienge: string; contaConstrucao: string; contaTransferencia: string; contaTerreno: string }) {
    if (Object.values(body).some(v => !v?.trim())) throw new BadRequestException('Todas as contas são obrigatórias');
    return this.prisma.mapeamentoContabil.upsert({ where: { empresaSienge: body.empresaSienge }, create: body, update: body });
  }

  async acompanhar(empreendimentoId: string, mes: number, ano: number) {
    this.validatePeriod(mes, ano);
    const project = await this.prisma.empreendimento.findUnique({ where: { id: empreendimentoId } });
    if (!project) throw new NotFoundException('Empreendimento não encontrado');
    const months = await this.prisma.contabilidadeMensal.findMany({ where: { empreendimentoId, OR: [{ ano: { lt: ano } }, { ano, mes: { lte: mes } }] }, orderBy: [{ ano: 'asc' }, { mes: 'asc' }] });
    const current = months.find(m => m.mes === mes && m.ano === ano);
    const previous = months.find(m => monthKey(m.ano, m.mes) === monthKey(ano, mes) - 1);
    const medicao = await this.prisma.medicaoMensal.findFirst({ where: { empreendimentoId, mes, ano } });
    const aditivos = await this.prisma.aditivoContabil.findMany({ where: { empreendimentoId, OR: [{ ano: { lt: ano } }, { ano, mes: { lte: mes } }] } });
    const indices = await this.prisma.incc.findMany({ where: { OR: [{ ano: { lt: ano } }, { ano, mes: { lte: mes } }] } });
    const index = new Map(indices.map(i => [monthKey(i.ano, i.mes), i.incc]));
    let inccPendente = false;
    const aditivosCorrigidos = aditivos.reduce((sum, a) => { let value = new Decimal(a.valor); for (let k = monthKey(a.ano, a.mes) + 1; k <= monthKey(ano, mes); k++) { if (!index.has(k)) inccPendente = true; else value = value.times(new Decimal(1).plus(new Decimal(index.get(k)!).div(100))); } return sum.plus(value); }, new Decimal(0));
    const base = medicao?.orcamentoCorrigido ? new Decimal(medicao.orcamentoCorrigido) : null;
    const original = project.orcamentoExecutivo || project.chequeValor;
    const aditivosOpac = await this.prisma.aditivo.findMany({ where: { empreendimentoId, OR: [{ ano: { lt: ano } }, { ano, mes: { lte: mes } }] } });
    const totalAditivosOpac = aditivosOpac.reduce((s, a) => s.plus(a.aditivo), new Decimal(0));
    const terreno = current?.terreno ?? [...months].reverse().find(m => m.terreno !== null)?.terreno ?? null;
    const total = base && terreno !== null && !inccPendente ? base.plus(aditivosCorrigidos).plus(terreno) : null;
    const appropriatedMonths = months.filter(m => m.custoApropriadoMensal !== null);
    const completeHistory = appropriatedMonths.length > 0 && appropriatedMonths[appropriatedMonths.length - 1].mes === mes && appropriatedMonths[appropriatedMonths.length - 1].ano === ano && appropriatedMonths.every((m, i) => i === 0 || monthKey(m.ano, m.mes) === monthKey(appropriatedMonths[i - 1].ano, appropriatedMonths[i - 1].mes) + 1);
    const apropriadoAcumulado = completeHistory ? appropriatedMonths.reduce((s, m) => s.plus(m.custoApropriadoMensal!), new Decimal(0)) : null;
    const aditivosContabeisNominais = aditivos.reduce((s, a) => s.plus(a.valor), new Decimal(0));
    const saldo = terreno !== null && current?.custoIncorridoAcumulado != null ? new Decimal(original).plus(totalAditivosOpac).plus(aditivosContabeisNominais).plus(terreno).minus(current.custoIncorridoAcumulado) : null;
    return { empreendimento: project, mes, ano, dados: current, custoApropriadoAcumulado: apropriadoAcumulado, evolucaoMes: current?.poc != null && previous?.poc != null ? new Decimal(current.poc).minus(previous.poc) : null, orcamentoOriginal: original, orcamentoOpacCorrigido: base, totalAditivosOpac, totalCorrecaoIncc: base ? base.minus(original).minus(totalAditivosOpac) : null, aditivosContabeisMes: aditivos.filter(a => a.mes === mes && a.ano === ano).reduce((s, a) => s.plus(a.valor), new Decimal(0)), aditivosContabeisCorrigidos: inccPendente ? null : aditivosCorrigidos, terreno, orcamentoTotalContabil: total, saldo, saldoAtualizado: total && current?.custoIncorridoAcumulado != null ? total.minus(current.custoIncorridoAcumulado) : null, incc: index.get(monthKey(ano, mes)) ?? null, pendencias: { incc: inccPendente, opac: !base, terreno: terreno === null, receita: !current?.receitaImportadaEm, estoque: !current?.estoqueImportadoEm, balancete: !current?.balanceteImportadoEm } };
  }

  async sincronizarBalancete(mes: number, ano: number) {
    this.validatePeriod(mes, ano);
    const start = `${ano}-${String(mes).padStart(2, '0')}-01`;
    const end = `${ano}-${String(mes).padStart(2, '0')}-${new Date(ano, mes, 0).getDate()}`;
    const projects = await this.prisma.empreendimento.findMany();
    const maps = await this.prisma.mapeamentoContabil.findMany();
    const byCnpj = new Map(projects.map(p => [p.cnpj.replace(/\D/g, ''), p]));
    const results: { empresa: string; empreendimento: string; apropriado: string; terreno: string }[] = [];
    const errors: { empresa: string; erro: string }[] = [];
    for (const source of [
      { name: 'VCA', user: process.env.SIENGE_VCA_USER, password: process.env.SIENGE_VCA_PASSWORD, domain: 'vca' },
      { name: 'LOTEAR', user: process.env.SIENGE_LOTEAR_USER, password: process.env.SIENGE_LOTEAR_PASSWORD, domain: 'vcalotear' },
    ]) {
      if (!source.user || !source.password) throw new ServiceUnavailableException(`Credenciais Sienge ${source.name} ausentes`);
      const auth = `Basic ${Buffer.from(`${source.user}:${source.password}`).toString('base64')}`;
      const get = async (path: string): Promise<any> => {
        const response = await fetch(`https://api.sienge.com.br/${source.domain}/public/api/v1/${path}`, { headers: { Authorization: auth, 'X-origin-request': 'opac/contabilidade' }, signal: AbortSignal.timeout(30000) });
        if (!response.ok) throw new Error(`Sienge HTTP ${response.status}`);
        return response.json();
      };
      let offset = 0;
      while (true) {
        let companies: any[];
        try { const page = await get(`companies?limit=200&offset=${offset}`); companies = page.results || []; }
        catch (e) { throw new ServiceUnavailableException(`Falha ao consultar empresas ${source.name}: ${String(e)}`); }
        for (const company of companies) {
          const project = byCnpj.get(String(company.cnpj || '').replace(/\D/g, ''));
          if (!project) continue;
          const key = `${company.id}_${source.name}`;
          try {
            const query = new URLSearchParams({ companyId: String(company.id), initialPeriod: start, finalPeriod: end, desconsiderClosingBalance: 'true', onlyAccountsWithMovements: 'false', thirdParties: 'false' });
            const payload = await get(`trial-balance?${query}`);
            const accounts: any[] = payload.results || [];
            let map = maps.find(m => m.empresaSienge === key);
            if (!map) {
              const normalize = (value: unknown) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();
              const unique = (predicate: (account: any) => boolean) => { const found = accounts.filter(predicate); return found.length === 1 ? found[0].account as string : null; };
              const contaConstrucao = unique(a => a.accountType === 'SYNTHETIC' && /CONSTRU.*ANDAMENTO/.test(normalize(a.accountName)));
              const contaTransferencia = unique(a => a.accountType === 'SYNTHETIC' && /TRANSFERENCIA DE CUSTO INCORRIDO/.test(normalize(a.accountName)));
              const contaTerreno = unique(a => a.accountType === 'ANALYTICAL' && a.accountGroup === 'ASSETS' && normalize(a.accountName) === 'TERRENO');
              if (!contaConstrucao || !contaTransferencia || !contaTerreno) throw new Error('Não foi possível identificar três contas únicas no Balancete; revise o mapeamento manual');
              map = await this.prisma.mapeamentoContabil.upsert({ where: { empresaSienge: key }, create: { empresaSienge: key, contaConstrucao, contaTransferencia, contaTerreno }, update: {} });
            }
            const account = (code: string) => accounts.find(a => String(a.account) === code);
            const construction = account(map.contaConstrucao), transfer = account(map.contaTransferencia), land = account(map.contaTerreno);
            if (!construction || !transfer || !land) throw new Error('Conta mapeada ausente no Balancete');
            const decimal = (v: unknown) => new Decimal(String(v ?? 0));
            const net = (a: any) => decimal(a.debit).minus(decimal(a.credit));
            const appropriated = net(construction).minus(net(transfer));
            const current = land.balances?.current;
            if (!current) throw new Error('Saldo atual do terreno ausente');
            const landValue = decimal(current.value).times(String(current.type).toUpperCase().startsWith('C') ? -1 : 1);
            await this.prisma.contabilidadeMensal.upsert({ where: { empreendimentoId_mes_ano: { empreendimentoId: project.id, mes, ano } }, create: { empreendimentoId: project.id, mes, ano, empresaSienge: key, custoApropriadoMensal: appropriated, terreno: landValue, balanceteImportadoEm: new Date() }, update: { empresaSienge: key, custoApropriadoMensal: appropriated, terreno: landValue, balanceteImportadoEm: new Date() } });
            results.push({ empresa: key, empreendimento: project.idSienge, apropriado: appropriated.toString(), terreno: landValue.toString() });
          } catch (e) { errors.push({ empresa: key, erro: String(e) }); }
        }
        if (companies.length < 200) break;
        offset += 200;
      }
    }
    return { mes, ano, sincronizados: results, pendencias: errors };
  }
}
