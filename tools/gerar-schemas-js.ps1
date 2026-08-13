# Regera schemas/*.schema.js a partir dos .json oficiais.
# Necessario porque a pagina roda em file://, onde fetch() de .json e bloqueado:
# o schema precisa chegar como <script>. Rode isto sempre que o ONR publicar uma
# versao nova do Anexo II (substitua o .json e execute).
param([string]$Root = (Split-Path -Parent $PSScriptRoot))

$pares = @(
  @{ json = 'imoveis-rurais-onr.schema.json';  js = 'rural.schema.js';  var = 'ONR_SCHEMA_RURAL' },
  @{ json = 'imoveis-urbanos-onr.schema.json'; js = 'urbano.schema.js'; var = 'ONR_SCHEMA_URBANO' }
)

foreach ($p in $pares) {
  $origem = Join-Path $Root "schemas\$($p.json)"
  if (-not (Test-Path $origem)) { Write-Warning "ausente: $origem"; continue }
  $texto = [System.IO.File]::ReadAllText($origem, [System.Text.Encoding]::UTF8)
  $saida = "// Gerado por tools/gerar-schemas-js.ps1 a partir de schemas/$($p.json).`r`n" +
           "// Nao editar a mao: altere o .json oficial e rode o script.`r`n" +
           "window.$($p.var) = $texto;`r`n"
  $destino = Join-Path $Root "schemas\$($p.js)"
  [System.IO.File]::WriteAllText($destino, $saida, (New-Object System.Text.UTF8Encoding($false)))
  Write-Output ("{0} ({1:N0} bytes)" -f $p.js, (Get-Item $destino).Length)
}
