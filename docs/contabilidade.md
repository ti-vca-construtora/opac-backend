# Contabilidade no OPAC

## Situação e acesso

A área fica em `https://opac-frontend.vercel.app/panel/contabilidade` e usa o login atual do OPAC. A API exige o mesmo token JWT das demais telas; não há perfil exclusivo de Contabilidade. Os dados são separados nas tabelas `contabilidade_mensal`, `aditivos_contabeis` e `mapeamentos_contabeis`. A nova área lê o orçamento corrigido e os aditivos da OPAC, mas não altera seus cálculos ou lançamentos.

A interface e a API foram publicadas, e a migração das novas tabelas foi aplicada. Isso não significa que um fechamento contábil esteja pronto: é preciso importar os relatórios de cada mês e reconciliar os resultados com a Contabilidade antes de usar os números como definitivos. A sincronização identifica as contas da API automaticamente quando encontra uma correspondência única; casos ambíguos exigem mapeamento manual. A fórmula e as contas do Balancete ainda dependem de conferência com um balancete real.

## Variáveis de ambiente

| Local | Variável | Uso |
| --- | --- | --- |
| Frontend, Vercel | `NEXT_PUBLIC_API_URL` | URL base da API, sem barra final. É a mesma variável já usada pelo login e pelas telas da OPAC. A Contabilidade não introduziu variável nova no frontend. |
| Backend, VCA | `SIENGE_VCA_USER`, `SIENGE_VCA_PASSWORD` | Autenticação Basic na API `api.sienge.com.br/vca`. |
| Backend, Lotear | `SIENGE_LOTEAR_USER`, `SIENGE_LOTEAR_PASSWORD` | Autenticação Basic na API `api.sienge.com.br/vcalotear`. |

As credenciais Sienge estão no arquivo local `C:\Users\silaspires\Desktop\PROJECTS\opac-backend\.env.development.local` e no `.env` do backend da EC2 em `/home/ec2-user/vca/opac-backend/.env`; não são enviadas ao navegador nem versionadas no Git. O Nest carrega `.env.<NODE_ENV>.local`, `.env.<NODE_ENV>` e `.env`, nessa ordem. O Dockerfile atual copia o `.env` para a imagem; portanto, após a rotação das senhas, atualize o `.env` da EC2, reconstrua a imagem e recrie o contêiner. Apenas reiniciar o contêiner antigo não atualiza as credenciais. Não coloque essas credenciais na Vercel ou em uma variável `NEXT_PUBLIC_`. O backend também precisa das variáveis de banco e autenticação já existentes.

Se o login e as telas existentes funcionam na Vercel, `NEXT_PUBLIC_API_URL` já está disponível no build atual. O valor da configuração na Vercel deve ser conferido no painel do projeto se a API mudar de endereço. A origem `https://opac-frontend.vercel.app` está autorizada no CORS do backend.

## Como operar um mês

1. Abra **Contabilidade** no menu. A tela abre no período mais recente com dados. Use os seletores de empreendimento, mês e ano para navegar. Os CSVs podem conter vários empreendimentos.
2. Importe o CSV **Receita Societária**. Ele alimenta o POC. O sistema lê o período do arquivo e troca os filtros automaticamente. O arquivo precisa ter as colunas `Empreendimento`, `Mês/Ano` e `POC` nas posições do modelo recebido; um POC divergente para o mesmo empreendimento é rejeitado.
3. Importe o CSV **Estoque**. Ele alimenta custo incorrido mensal, custo incorrido acumulado e estoque. O formato esperado é o do exemplo recebido: blocos por empreendimento, linha `Mês/Ano`, valor de `Custo incorrido acumulado` e linhas de unidades. O custo mensal soma a sexta coluna das unidades; o estoque soma a nona coluna. O arquivo é limitado a 20 MB.
4. Clique **Sincronizar Balancete do Sienge** para o mês selecionado. A API consulta primeiro as empresas dos dois ambientes, associa cada uma ao empreendimento pelo CNPJ e consulta o Balancete. A sincronização tenta identificar automaticamente as contas sintéticas de **Construções em Andamento** e **Transferência de Custo Incorrido** e a conta analítica de **Terreno** no grupo de ativos. A resposta lista empresas sincronizadas e pendências. O recurso requer saldos contábeis consolidados e permissão da API Sienge.
5. Se uma empresa continuar pendente por contas ambíguas ou ausentes, use **Contas do Balancete por empresa** para informar os códigos conferidos com a Contabilidade. A chave da empresa combina o ID Sienge e a origem `VCA` ou `LOTEAR`.
6. Em **Aditivos contábeis**, selecione um mês/ano e clique **Baixar modelo Excel**. O modelo traz todos os empreendimentos e preenche `Competência (MM/AAAA)` com o mês selecionado. Confira ou altere essa competência em cada linha, preencha `Valor (R$)` e, se quiser, `Observação`. A planilha pode conter aditivos de meses diferentes. A importação usa a competência de **cada linha**, não o filtro da tela; valor informado sem competência é rejeitado. Linhas sem valor são ignoradas, e zero explícito permite zerar lançamentos anteriores daquela competência. Reimportar uma competência substitui só os aditivos importados por planilha naquele mês; lançamentos manuais são preservados. Também é possível lançar ou excluir um aditivo individual, usando o mês/ano selecionado na tela. Esses aditivos não entram nos cálculos da OPAC.
7. Confira o aviso **Fontes pendentes** e compare os valores com os relatórios contábeis. Receita, Estoque e Balancete são fontes independentes; importar uma não preenche a outra. Reimportar um relatório substitui apenas os campos daquela fonte para os empreendimentos presentes no arquivo. Empreendimentos sem cadastro são listados e não importados. Os exemplos recebidos são de períodos distintos: Receita `08/2026`, Estoque `04/2026`; não formam um fechamento único.

## Fórmulas dos cards

Todos os cards se referem ao empreendimento e mês selecionados. Valores monetários são exibidos em reais. POC, Evolução Mês e INCC são exibidos em pontos percentuais/percentual conforme o valor importado.

| Card | Origem ou cálculo |
| --- | --- |
| Custo incorrido mensal | Soma da coluna de custo mensal das unidades do CSV Estoque naquele mês. |
| Custo incorrido acumulado | Valor `Custo incorrido acumulado` informado no cabeçalho do bloco do CSV Estoque. Não é recalculado pela soma de importações anteriores. |
| Custo apropriado mensal | Balancete: `(débito − crédito de Construções em Andamento) − (débito − crédito de Transferência de Custo Incorrido)`. Os códigos das duas contas vêm do mapeamento por empresa. |
| Custo apropriado acumulado | Soma dos custos apropriados mensais importados até o mês selecionado. Só aparece se os meses desde o primeiro mês importado até o selecionado forem consecutivos. Não comprova o saldo anterior ao primeiro mês importado. |
| Estoque | Soma da coluna de saldo final das unidades do CSV Estoque. |
| Evolução Total (POC) | POC do CSV Receita Societária para o empreendimento e mês. |
| Evolução Mês | POC atual menos o POC do mês imediatamente anterior. Sem os dois meses, fica indisponível. |
| Terreno | Saldo atual da conta Terreno no Balancete; saldo credor é convertido para negativo. Se não houver saldo do mês selecionado, usa o último valor importado em mês anterior. Entra uma única vez no orçamento. |
| Orçamento original | `orcamentoExecutivo` cadastrado no empreendimento; se ausente, `chequeValor`. |
| Correção INCC | Orçamento corrigido da medição OPAC do mês menos orçamento original menos soma nominal dos aditivos OPAC até o mês. É uma diferença derivada da base OPAC; deve ser reconciliada se a base contiver outras parcelas além do INCC. |
| Aditivos OPAC | Soma nominal dos aditivos OPAC lançados até o mês. Esse valor é informativo: já está incorporado ao orçamento corrigido da OPAC e não é somado outra vez no orçamento total contábil. |
| Aditivo contábil do mês | Soma nominal dos aditivos contábeis lançados no mês selecionado. É informativo; já está dentro do total de aditivos contábeis corrigidos. |
| Aditivos contábeis corrigidos | Soma dos aditivos contábeis até o mês, cada um multiplicado por `1 + INCC/100` em cada mês posterior ao lançamento. Se faltar um índice necessário, o card fica pendente. |
| Orçamento total contábil | Orçamento corrigido da OPAC no mês + aditivos contábeis corrigidos + terreno. Requer a base OPAC, terreno e todos os INCC necessários aos aditivos. |
| Saldo | Orçamento original + aditivos OPAC nominais + aditivos contábeis nominais + terreno − custo incorrido acumulado. É a visão nominal, sem correção INCC. |
| Saldo atualizado | Orçamento total contábil − custo incorrido acumulado. |
| INCC | Índice do mês cadastrado na área INCC existente da OPAC. |

`Fonte pendente` indica campo sem dado ou dependência necessária. O aviso no topo separa ausências de Receita, Estoque, Balancete, orçamento corrigido OPAC, terreno e INCC dos aditivos. O POC do mês anterior só pode ser comparado se o mês imediatamente anterior estiver importado. Dados de meses posteriores não são usados para completar o mês selecionado.

## Conferência antes do uso definitivo

- Confirme o período e o código Sienge de cada empreendimento nos dois CSVs. Os arquivos de exemplo fornecidos são de meses diferentes.
- Valide os três códigos de conta por empresa e compare, para pelo menos um empreendimento em dois meses, os débitos, créditos, sinal do terreno e custo apropriado com o Balancete oficial.
- Confirme os índices INCC e os aditivos do intervalo; compare orçamento original, base OPAC, correção, orçamento total e saldos com a planilha da Contabilidade.
- Quando a API Sienge retornar pendência, consulte a consolidação contábil, permissões da credencial e presença das contas antes de tratar o card como zero.

O backend expõe os endpoints sob `/contabilidade` e a documentação Swagger em `/api/docs`. Os endpoints exigem autenticação JWT.
