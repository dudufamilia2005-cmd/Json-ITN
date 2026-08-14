# Contexto do projeto

Ferramenta do Cartório do 1º Ofício de Morrinhos/GO (CNS 026187) para converter
matrículas no JSON de importação da ITN 003/2025 do ONR.

## Ambiente

**Não há Node, npm nem Python nesta máquina** (o `python` do PATH é o atalho da
Microsoft Store, que não executa). O projeto é deliberadamente zero-build: HTML +
JavaScript clássico, aberto direto do disco. Não introduza dependências, bundler
ou `import`/`export` de módulo — `file://` bloqueia módulos ES e `fetch`, por
isso os schemas também existem embrulhados em `.js` (`schemas/*.schema.js`,
gerados a partir dos `.json`).

## Como rodar os testes

Abrir `tests/run-tests.html` no navegador. O preview do Claude Code carrega
`file://` como `data:` URL e não resolve `<script src>` relativo; para testar por
aqui, rode `tools/build-inline.ps1` e abra `tests/_run-tests-inline.html`
(os `_*.html` são artefatos gerados, não edite).

## Fonte da verdade

`schemas/*.schema.json` são cópias intactas do Anexo II e mandam na forma do
arquivo. O manual (Anexo I) manda nas regras condicionais e nos enums, que o
schema **não** expressa — por isso `builder.js` e `enums.js` existem.

Documentação de origem, fora do repositório:
`Desktop\Nova pasta (2)\` — Anexos I a IV da ITN 003/2025.

## Invariantes que não devem ser quebradas

1. **Nada é inventado.** Campo exigido por regra e ausente no texto vira
   pendência com o motivo. A única derivação automática é `motivo_envio`, e ela
   emite aviso quando sobrescreve um valor informado.
2. **`motivo_envio` sai do JavaScript, não de julgamento.** Corte 02/12/2025.
3. **CIB nunca recebe NIRF.** São campos separados no parser (ver
   `docs/divergencias.md`, item 2).
4. **Separação de atos:** divisórias de traços primeiro, cabeçalho só rotula; e
   todo casamento de cabeçalho é case-insensitive. Há teste de regressão para as
   duas coisas — elas já quebraram em produção.
5. **`version` 1.2.0 é o padrão**, porque é o que o schema publicado aceita.
   `decisao_jud` e `nao_CPF` são removidos nessa versão.
6. **Dígito verificador de CPF/CNPJ é conferido** em `documento.js` — validação
   nossa, não do ONR (o `pattern` só olha formato). Quando falta o DV, a sugestão
   é *oferecida* num botão, nunca aplicada sozinha: base transcrita errada gera
   CPF válido de outra pessoa. Ver `docs/divergencias.md`, item 5.

7. **A extração automática é calibrada sobre texto real**, não sintético
   (`tests/fixtures/matricula_1118_real.js`). Ao mexer em `extrator.js`, rode
   `tests/run-tests-extrator.html` — cada teste ali corresponde a um padrão que
   existe no acervo (data no cabeçalho em `dd.mm.aaaa`, CAR com hífens,
   "REMANESCENTE de", "e com, <nome>" no fim da lista de confrontantes).

8. **O DV do CNM (ISO 7064 MOD 97-10) e algoritmo deduzido, nao especificado.**
   Os 7 CNM reais que o fixaram estao como teste em `run-tests.html` (grupo
   `CNM`). Se o ONR publicar outro calculo, sao esses testes que apontam o erro.

9. **A classificacao do ato sai do TITULO, nao do corpo.** `INSTITUICAO DE
   USUFRUTO` e `DOACAO` citam a mesma escritura; `CLAUSULAS RESTRITIVAS` cita a
   doacao do R.12. O corpo e apenas reserva, e o rotulo diz qual dos dois decidiu.
10. **`imovel_possui_nome`/`nome_imovel` nao existem no urbano Padrao** - so no
   ramo da Uniao do schema. Emiti-los no contexto 1 reprova o arquivo inteiro.
11. **Ler uma matricula zera a ficha.** Ficha remanescente vaza dado de outro
   imovel (foi assim que o nome da fazenda apareceu numa matricula urbana).

12. **Ato sem parte recebe o proprietario vigente.** CAR/CEP/CCIR nao qualificam
   ninguem, mas o layout exige `dados_pessoa`. A titularidade sai das tabelas de
   indicacao (que substituem a lista) e dos adquirentes de cada transmissao.
13. **CPF de 9 digitos so vale com "CPF/CIC" por perto.** Um numero como
   `123.456.789` pode ser o inicio do codigo do imovel rural
   `123.456.789.012-3`, e nao um documento.

14. **Regime de bens: declaracao vence presuncao.** So entra no historico da
   pessoa o regime DECLARADO; o presumido pela Lei 6.515/77 (universal antes de
   26/12/1977, parcial depois) vale so no ato onde nada foi declarado, e aparece
   marcado como presuncao.
15. **Ato de garantia nao e transmissao.** Cedula rural, hipoteca e "permuta de
   bens VINCULADOS" (troca de garantia) sao ato 3 - nao pedem valor_transacao.

16. **A abertura da matrícula é um ato**, quando ela mesma tem protocolo e selo
   (`parser.aberturaEhAto`). Entra como `numero_ato` "0", `ato` 1, e a data sai
   do fecho ("Morrinhos-GO, 12 de agosto de 2026"), não do cabeçalho — não há
   cabeçalho. Preâmbulo antigo, sem protocolo, continua sendo só preâmbulo.
17. **A área da descrição vence a "área total" do CCIR.** O CCIR é do cadastro
   no INCRA, que pode reunir várias matrículas (Fazenda Monjolinho: 281,5458ha
   na matrícula, 1.685,5720ha no CCIR). A do CCIR continua candidata e visível.
18. **`codigo_incra` é o número da certificação**, não o código do imóvel rural
   do SNCR: sai de "certificação n.º \<uuid\>" com os hífens removidos (32
   caracteres). Sem ele o arquivo é reprovado sempre que `certificacao_incra`
   for true.

## Estado atual

Rural padrão e urbano padrão funcionam ponta a ponta (exemplos reais: matrículas
uma rural de 56 atos, uma urbana, usufruto, edificacao e servidao). União (2) e Estrangeiros
(3) têm regras em `builder.js` mas não têm campos na interface.

O urbano exige endereço completo no schema (`tipo_logradouro`,
`numero_logradouro`, `cep`); endereço e quadra/lote só são lidos da abertura ou de
ato com `ato = 5`, porque em ato de transmissão o endereço citado é o
**residencial das partes**.
