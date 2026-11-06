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

  async importar(fonte: string, buffer: Buffer | undefined, mes: number, ano: number) {
    this.validatePeriod(mes, ano);
    if (!['receita', 'estoque'].includes(fonte)) throw new BadRequestException('Fonte inválida');
    const rows = this.rows(buffer);
    const projects = await this.prisma.empreendimento.findMany({ select: { id: true, idSienge: true } });
    const byCode = new Map(projects.map(p => [p.idSienge, p.id]));
    const updates = new Map<string, Record<string, unknown>>();
    if (fonte === 'receita') {
      const h = rows[0];
      if (h?.[1] !== 'Empreendimento' || h?.[2] !== 'Mês/Ano' || h?.[3] !== 'POC') throw new BadRequestException('Cabeçalho da Receita Societária inválido');
      for (const row of rows.slice(1)) {
        if (!row[1]) continue;
        const p = period(row[2]);
        if (!p || p.mes !== mes || p.ano !== ano) throw new BadRequestException('Período da Receita não corresponde ao selecionado');
        const code = idFrom(row[1]);
        if (!code || !byCode.has(code)) throw new BadRequestException(`Empreendimento não cadastrado: ${row[1]}`);
        const poc = money(row[3]);
        const previous = updates.get(code);
        if (previous && previous.poc !== poc) throw new BadRequestException(`POC divergente no empreendimento ${code}`);
        updates.set(code, { poc, empresaSienge: idFrom(row[0]), receitaImportadaEm: new Date() });
      }
    } else {
      let code = ''; let active: { mensal: number; acumulado: number; estoque: number } | null = null;
      const finish = () => { if (active && code) updates.set(code, { custoIncorridoMensal: active.mensal, custoIncorridoAcumulado: active.acumulado, estoque: active.estoque, estoqueImportadoEm: new Date() }); };
      for (const row of rows) {
        if (row[0] === 'Empreendimento') {
          finish(); code = idFrom(row[1]) || '';
          if (!byCode.has(code)) throw new BadRequestException(`Empreendimento não cadastrado: ${row[1]}`);
          active = null;
        } else if (row[0] === 'Mês/Ano') {
          const p = period(row[1]);
          if (!p || p.mes !== mes || p.ano !== ano || row[2] !== 'Custo incorrido acumulado') throw new BadRequestException('Período ou cabeçalho do Estoque inválido');
          active = { mensal: 0, acumulado: money(row[3]), estoque: 0 };
        } else if (active && row[0] && !['Unidade', 'Tipo de imóvel'].includes(row[0]) && row.length >= 9) {
          active.mensal += money(row[5]); active.estoque += money(row[8]);
        }
      }
      finish();
    }
    if (!updates.size) throw new BadRequestException('Nenhum empreendimento encontrado');
    await this.prisma.$transaction([...updates].map(([code, data]) => this.prisma.contabilidadeMensal.upsert({
      where: { empreendimentoId_mes_ano: { empreendimentoId: byCode.get(code)!, mes, ano } },
      create: { empreendimentoId: byCode.get(code)!, mes, ano, ...data },
      update: data,
    })));
    return { fonte, mes, ano, empreendimentos: updates.size };
  }

  async aditivos(empreendimentoId: string) { return this.prisma.aditivoContabil.findMany({ where: { empreendimentoId }, orderBy: [{ ano: 'desc' }, { mes: 'desc' }] }); }
  async criarAditivo(body: { empreendimentoId: string; mes: number; ano: number; valor: number; observacao?: string }) {
    this.validatePeriod(Number(body.mes), Number(body.ano));
    if (!Number.isFinite(Number(body.valor)) || Number(body.valor) <= 0) throw new BadRequestException('Valor inválido');
    return this.prisma.aditivoContabil.create({ data: { ...body, mes: Number(body.mes), ano: Number(body.ano), valor: new Decimal(body.valor) } });
  }
  async removerAditivo(id: string) { return this.prisma.aditivoContabil.delete({ where: { id } }); }
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
          const map = maps.find(m => m.empresaSienge === key);
          if (!map) { errors.push({ empresa: key, erro: 'Mapeamento de contas pendente' }); continue; }
          try {
            const query = new URLSearchParams({ companyId: String(company.id), initialPeriod: start, finalPeriod: end, desconsiderClosingBalance: 'true', onlyAccountsWithMovements: 'false', thirdParties: 'false' });
            const payload = await get(`trial-balance?${query}`);
            const accounts: any[] = payload.results || [];
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
