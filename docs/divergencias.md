# Divergências e armadilhas conhecidas

Levantadas conferindo o pacote da ITN 003/2025 (Anexos I a IV) contra os arquivos
que a serventia já produziu. Cada item aqui custou ou pode custar uma remessa
rejeitada.

## 1. O schema publicado está uma versão atrás do manual

Os manuais do **Anexo I** são v1.3.0. Os JSON Schemas do **Anexo II** declaram
`"version": {"const": "1.2.0"}` e, conferido campo a campo, são mesmo 1.2.0:

| Item | Manual v1.3.0 | Schema publicado (Anexo II) |
|---|---|---|
| `decisao_jud` | existe | **não existe** |
| `nao_CPF` | existe | **não existe** |
| `coordenadas` | até 15000 caracteres | até 3000 |
| `numero_matricula` | `Numeric` | `string` |
| máscara do CEP | `00000-000` (ERRATA 01) | aceita `00000000`, `00.000-000` e `00000-000` |

Como o schema usa `additionalProperties: false`, mandar `decisao_jud` ou
`nao_CPF` **reprova o arquivo inteiro**.

**O que a ferramenta faz:** o seletor `version` na tela controla isso. Em
`1.2.0` (padrão) esses dois campos são removidos e um aviso explica por quê. Em
`1.3.0` eles são mantidos.

**Pendente de confirmação com o ONR:** qual dos dois anexos está desatualizado, e
o que o ambiente de produção realmente aceita hoje. Até essa resposta, `1.2.0` é
a opção segura — é o que o validador oficial do Anexo IV aceita.

## 2. NIRF e CIB

Numa matrícula do acervo o mesmo número aparece como **NIRF** num registro e
rotulado como **CIB** numa averbação posterior — na 1.118, `05429102` nos dois.
Os nomes são de épocas diferentes:

- **NIRF** — Número do Imóvel na Receita Federal, formato numérico antigo.
- **CIB** — Cadastro Imobiliário Brasileiro, que o substituiu; formato
  `A0A0A0A-0`, 8 caracteres alfanuméricos.

**Decisão da serventia (17/08/2026):** é o mesmo número, e substituir um pelo
outro não traz problema. A ferramenta captura os dois em campos separados e
preenche o `cib` a partir do NIRF apenas quando a matrícula não traz o rótulo
novo — os três formatos do acervo são "NIRF: 9.389.122-9", "Cadastrado na Receita
Federal sob o n.º 4.706.960-0" e "Número do Imóvel na Receita Federal - CIB".
A origem fica dita na tela ("numero na Receita Federal (NIRF) usado como CIB"),
para que a conferência seja possível.

Antes dessa decisão o campo ficava vazio e a matrícula era reprovada por
`cib` ausente em todo ato com `motivo_envio` 1 — foi o caso da 11.958, cujo
único registro do número é "Cadastrado na Receita Federal sob o n.° 4.706.960-0".

## 3. Regime de bens foi unificado — as opções antigas não existem mais

Até a v1.0.0 o enum distinguia "antes / na vigência da Lei 6.515/77" e ia até 8.
Da v1.1.0 em diante são 7 valores, sem distinção temporal:

| v1.3.0 | |
|---|---|
| 1 | Comunhão parcial |
| 2 | Comunhão universal |
| 3 | Separação convencional/absoluta |
| 4 | Separação legal/obrigatória |
| 5 | Participação final nos aquestos |
| 6 | Regime misto definido em pacto antenupcial |
| 7 | Regime estrangeiro |

Atos antigos que dizem "comunhão universal, anterior à vigência da Lei 6.515/77"
mapeiam para **2**. A nota de vigência não tem para onde ir no layout.

Mesma coisa em `estado_civil`: o valor **7** deixou de ser "Outros" e virou "Não
se aplica" — é o valor correto para pessoa jurídica. E `situacao` ganhou o **6:
Cancelada**, separado do **2: Anulada**.

## 4. Problemas encontrados numa remessa já gerada (27 atos de uma matrícula)

Rodando o arquivo já gerado contra o schema oficial: **104 erros**.

| Ocorrências | Problema |
|---|---|
| 65 | `dados_pessoa[].estrangeiro` ausente (obrigatório) |
| 27 | `ato` ausente (obrigatório quando `motivo_envio = 1`) |
| 11 | `cpf_cnpj` inválido |
| 1 | `estado_civil` ausente |

### Por que os CPFs estão errados — duas causas distintas

**Causa 1: preenchimento com espaços para "fechar" o tamanho.** O manual diz que
CPF/CNPJ tem *"exatamente 11 ou 14 caracteres"*. A ferramenta anterior tratou isso
como comprimento a ser atingido, e não como formato: quando o dado faltava, ela
completava com espaços. A prova está no campo de um banco credor, que veio com
**14 espaços** — exatamente o comprimento de um CNPJ; nos demais, 11, o de um CPF.
Atinge cinco pessoas e, de forma inconsistente, dois casos em que o campo foi
simplesmente omitido — entre eles o juízo da penhora do AV.42, que sendo o juízo
provavelmente nem deveria estar em `dados_pessoa`.

**Causa 2: CPF de 9 dígitos, sem os dígitos verificadores.** Um dos
co-proprietários aparece 6 vezes com o CPF em 9 dígitos — o formato antigo, como consta em escrituras
anteriores à transcrição rotineira do DV. Os 2 dígitos que faltam são
**calculáveis**: para uma base de 9 dígitos existe um único par válido. A
ferramenta oferece essa sugestão com um botão, mas nunca a
aplica sozinha — se os 9 dígitos estiverem transcritos errado, o cálculo produz um
CPF válido na forma e pertencente a outra pessoa.

Os 10 CPFs restantes do arquivo passam todos no dígito verificador: a base de
dados está sadia, o problema foi só o preenchimento do que faltava.

### Demais problemas do arquivo

O `pattern` exige `[A-Za-z0-9]`, então espaço reprova. Além disso:

- `dados_confrontantes` está como `[{}]` nos 27 atos — passa no schema (nenhum
  campo é obrigatório lá dentro), mas não transmite informação nenhuma;
- `percentual` está `0` em boa parte das pessoas, embora o arquivo tenha
  percentuais reais em outras (47.36, 45.1, 23.68, 11.84, 10.67, 6.17, 1.37);
- `cib` está com o NIRF (item 2 acima).

Para reproduzir: aba **Validar JSON existente** → carregar o arquivo.

## 5. O dígito verificador não é conferido por ninguém no caminho oficial

Nem o schema nem o manual conferem o DV de CPF/CNPJ — o `pattern` só olha o
formato. Um CPF com um dígito trocado tem 11 caracteres, é aceito pelo validador
oficial e entra na base do ONR como o documento de outra pessoa. Por isso
`src/documento.js` faz a conta, incluindo o **CNPJ alfanumérico** (IN RFB
2.229/2024, em vigor desde 2026), que usa o mesmo cálculo tratando cada caractere
pelo código ASCII menos 48.

Isso é validação **nossa**, não exigência do ONR: aparece como pendência para
conferência, com o DV esperado indicado.

## 6. O dígito verificador do CNM — algoritmo deduzido

O manual não publica o cálculo do dígito verificador do Código Nacional de
Matrícula. Ele foi deduzido de **7 CNM reais** da serventia (com números bem
espaçados, incluindo pares vizinhos) e é o **ISO 7064
MOD 97-10**, o mesmo padrão do IBAN:

```
base   = CNS (6) + livro (1) + número da matrícula (7, com zeros à esquerda)
resto  = (base || "00") mod 97
dígito = 98 − resto     (dois dígitos, com zero à esquerda)
```

Exemplo: matrícula 1.234 → base `02618720001234` → resto 34 → dígito 64 →
`026187.2.0001234-64`.

Acerto de 7/7, e o fato de recair num padrão ISO conhecido reforça a dedução.
Ainda assim é **inferência, não especificação**: os sete casos estão fixados como
teste em `run-tests.html` (grupo "CNM"). Se o ONR publicar o algoritmo e ele for
outro, esses testes quebram e apontam onde corrigir.

A ferramenta calcula o CNM ao ler a matrícula e confere o dígito de qualquer CNM
digitado à mão — DV errado vira pendência dizendo qual era o esperado.

## 7. Enquadramento das averbações cadastrais

Decisão da serventia: averbações de **CAR, CEP, CCIR/CIB, óbito, pacto
antenupcial, premonitória e qualificação pessoal** entram como `ato: 6` (Outro).
É o que a ferramenta faz, registrando em cada caso o trecho que motivou a
classificação.

## 8. Armadilhas do texto da matrícula

- **Caixa inconsistente no cabeçalho.** Uma das matrículas tem `AV.38` e `Av.39` no mesmo
  documento. Regex sensível a maiúsculas engole o ato seguinte dentro do
  anterior — o ato 39 simplesmente sumia.
- **Citação de ato dentro de ato.** O AV.37 tem uma tabela de recálculo de
  titularidade que cita `R-30`, `R-31`, `R-32`. Cortar o texto por cabeçalho
  quebra o ato em pedaços. Por isso o corte primário é pelas linhas de traços que
  a própria matrícula usa como divisor, e o cabeçalho só rotula o bloco.
- **Dados que só existem na abertura.** Área, CCIR e COD_SNCR costumam aparecer
  antes do primeiro ato. O preâmbulo é lido e alimenta o estado vigente.

## 9. Prazos da ITN 003/2025

- Envio até o **último dia útil do mês subsequente** ao da prática do ato.
- Corte entre acervo e novo ato: **02/12/2025**. Antes disso, `motivo_envio: 2`
  (acervo); a partir dessa data, `motivo_envio: 1` (novo ato).
