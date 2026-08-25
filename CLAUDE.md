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
3. **NIRF e CIB são o mesmo número** — decisão da serventia (17/08/2026): o NIRF
   virou CIB e substituir um pelo outro não traz problema. Continuam em campos
   separados no parser, e o `cib` só é preenchido a partir do NIRF (ou de
   "Cadastrado na Receita Federal sob o n.º") quando a matrícula não traz o
   rótulo novo — dizendo na tela de onde veio. Ver `docs/divergencias.md`, item 2.
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

16. **A abertura da matrícula é sempre um ato** — é o primeiro ato do fólio real.
   Basta o preâmbulo descrever o imóvel (ou a titularidade) e ter data
   (`parser.aberturaEhAto`); nos livros antigos não há protocolo nem selo
   escritos, e o protocolo só é exigido pelo layout quando `motivo_envio` = 1.
   Entra como `numero_ato` "0", `ato` 1. Quando não há cabeçalho, a data sai do
   fecho ("Morrinhos-GO, 12 de agosto de 2026").
17. **A área da descrição vence a "área total" do CCIR.** O CCIR é do cadastro
   no INCRA, que pode reunir várias matrículas (Fazenda Monjolinho: 281,5458ha
   na matrícula, 1.685,5720ha no CCIR). A do CCIR continua candidata e visível.
18. **`codigo_incra` é o número da certificação**, não o código do imóvel rural
   do SNCR: sai de "certificação n.º \<uuid\>" com os hífens removidos (32
   caracteres). Sem ele o arquivo é reprovado sempre que `certificacao_incra`
   for true.

19. **Ato antigo recebe o dono da época, não o de hoje.** `apuraVigente` guarda
   um retrato da titularidade depois de cada bloco (`vigente.snapshots`); um
   óbito averbado antes do inventário estava sendo vinculado aos herdeiros, que
   só viraram donos depois.
20. **Averbação de casamento muda o histórico da pessoa.** O ato nomeia o
   proprietário sem requalificá-lo (nem repete o CPF), então ele continuava
   "solteiro" nos atos seguintes. Sob comunhão universal declarada, o cônjuge
   nomeado entra como proprietário; na parcial a pendência fica de pé.
21. **"Comunhão de bens", sem qualificar, é o nome antigo da comunhão
   universal.** Antes de 26/12/1977 é certeza; depois vira presunção *marcada*
   — quem se casa sob o regime legal de hoje aparece escrito "comunhão
   parcial". O regime presumido fica guardado à parte do declarado e só é usado
   como último recurso (ver invariante 14).
22. **Matrícula encerrada sai como `situacao` 4.** A frase está no próprio ato
   ("Fica desta forma ENCERRADA A PRESENTE MATRÍCULA"); sem lê-la o arquivo
   declarava "1 - Ativa" um imóvel que não existe mais, e nada acusava.

23. **Divisão amigável é transmissão só quando atribui quinhão** (ato 4,
   `alteracao_titularidade` 16). A que apenas parte o imóvel em glebas e encerra
   a matrícula (AV.51 da 1.999) é desmembramento, ato 5 — e não pede
   `valor_transacao`. O que separa as duas é o "coube" no texto - e, faltando ele, se o ato é registro ou averbação (ver 30). Além disso, o
   "coube **exclusivamente** aos condôminos" substitui a titularidade em vez de
   somar. Sem isso o condômino que saiu ficava dono para sempre — a divisão o
   cita como "acima qualificado", sem repetir o CPF, e ele nunca entrava na
   lista de alienantes.
24. **"portadores das CI nos. A e B e dos CPF nos. C e D; respectivamente"**: a
   ordem dos números segue a dos nomes. A qualificação do casal é longa, então
   o nome do primeiro fica além da janela normal de 320 caracteres.

25. **A mesma escritura gera dois atos, e o corpo é que os separa.** "Doação da
   parte disponível com reserva de usufruto" aparece no ato que transmite (ato 4)
   e no que registra o usufruto (ato 3); o que decide é o rótulo das partes
   ("Usufrutuários:", "Nú-Proprietários:"), e ele vence o título — o título tem
   120 caracteres e corta a palavra "usufruto" no meio. Pela mesma razão,
   "Cancelamento de Usufruto" e "Pacto Comissório" precisam de regra própria:
   os dois citam a escritura de compra e venda do ato anterior.
26. **CPF único do casal é normal nos livros antigos** — "inscritos no CPF em
   conjunto sob o nº". Fica com o titular (o primeiro nomeado), e a janela de
   busca do nome é ampliada, porque a qualificação do casal é longa. O doador
   também precisa de rótulo próprio ("por doação que lhes fizeram X e Y"), senão
   herda o "adquirente" da frase anterior e nunca sai da titularidade.

27. **Urbano sem CCI averbado sai com `cif` "0"** — decisão da serventia
   (17/08/2026). CCI é o **Certificado de Cadastro Imobiliário** do imóvel, a
   designação cadastral do Município — não é cédula de crédito imobiliário.
   O campo é exigido pelo próprio schema no ramo do ato novo
   (`motivo_envio` 1) e não há o que ler quando a designação cadastral nunca foi
   averbada. Fica dito na tela que foi assumido. Ver `docs/divergencias.md`, 7.1.

28. **A NOTA do ato explica, nao qualifica partes.** No inventario da 28.501 ela
   cita sete CPF de cedentes de direitos hereditarios, que ja cederam - e todos
   herdavam o "ADQUIRENTE:" da frase anterior, entrando na titularidade.
29. **A area do ato que DESMEMBRA e dos imoveis novos.** "foi DESMEMBRADO em"
   descreve as glebas que ganharam matricula propria; a area desta matricula e a
   de antes da divisao. Cuidado: "procedida em virtude de desmembramento" e a
   ORIGEM da matricula, e ali a area E a do imovel (38.971).
30. **Divisao amigavel registrada (R) transmite; averbada (AV) nao.** O valor do
   negocio e a base de calculo do ITBI (nao ha preco), e na divisao RECIPROCA
   cada condomino entra duas vezes - alienante e adquirente - porque transmite e
   adquire no mesmo ato. Decisoes da serventia (17/08/2026), em
   `docs/divergencias.md`, 7.2. Na 28.501 o
   R.09 registra a divisao e a AV.10 desmembra - a atribuicao dos quinhoes esta
   na averbacao, mas a transmissao e o registro.
31. **O casal tem um estado civil e um regime, declarados no titular.** Quando a
   qualificacao dele e longa - 429 caracteres na 39.492, por causa do pacto
   antenupcial citado no meio - a janela do conjuge nao alcanca o "casado" e
   ainda le "Pacto Antenupcial" como se fosse o regime dela.

## Estado atual

Rural padrão e urbano padrão funcionam ponta a ponta (exemplos reais: matrículas
uma rural de 56 atos, uma urbana, usufruto, edificacao e servidao). União (2) e Estrangeiros
(3) têm regras em `builder.js` mas não têm campos na interface.

O urbano exige endereço completo no schema (`tipo_logradouro`,
`numero_logradouro`, `cep`); endereço e quadra/lote só são lidos da abertura ou de
ato com `ato = 5`, porque em ato de transmissão o endereço citado é o
**residencial das partes**.
