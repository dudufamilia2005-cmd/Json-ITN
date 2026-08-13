# Gera versoes auto-contidas (_*.html) para teste no preview do Claude Code,
# que carrega file:// como data: URL e por isso nao resolve <script src> relativo.
# Para uso normal, abra index.html direto no navegador - nao precisa disto.
param([string]$Root = (Split-Path -Parent $PSScriptRoot))

Add-Type -AssemblyName System.Web.Extensions
$ser = New-Object System.Web.Script.Serialization.JavaScriptSerializer
$ser.MaxJsonLength = [int]::MaxValue
$ser.RecursionLimit = 200

function MinJson($path) {
  $ser.Serialize($ser.DeserializeObject([System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)))
}

function Inline($htmlPath, $saidaPath) {
  $html = [System.IO.File]::ReadAllText($htmlPath, [System.Text.Encoding]::UTF8)
  $baseHtml = Split-Path -Parent $htmlPath

  # Schemas e fixture grande entram minificados: indentados, estouram o limite da data: URL.
  $substituicoes = @{
    'schemas/rural.schema.js'  = "window.ONR_SCHEMA_RURAL=$(MinJson "$Root\schemas\imoveis-rurais-onr.schema.json");"
    'schemas/urbano.schema.js' = "window.ONR_SCHEMA_URBANO=$(MinJson "$Root\schemas\imoveis-urbanos-onr.schema.json");"
  }
  # A remessa real e fixture local (nao vai para o repositorio publico): se nao
  # existir, o teste que a usa simplesmente nao roda.
  $remessa = Join-Path $Root 'tests\fixtures\remessa.json'
  if (Test-Path $remessa) {
    $substituicoes['fixtures/remessa.js'] = "window.FIXTURE_REMESSA=$(MinJson $remessa);"
  }

  $re = [regex]'<script src="([^"]+\.js)"></script>'
  $html = $re.Replace($html, {
      param($m)
      $src = $m.Groups[1].Value
      foreach ($chave in $substituicoes.Keys) {
        if ($src.EndsWith($chave)) { return "<script>$($substituicoes[$chave])</script>" }
      }
      $rel = $src.Replace('/', [char]92)
      $caminho = Join-Path $baseHtml $rel
      if (-not (Test-Path $caminho)) { return $m.Value }
      "<script>`r`n" + [System.IO.File]::ReadAllText($caminho, [System.Text.Encoding]::UTF8) + "`r`n</script>"
    })

  [System.IO.File]::WriteAllText($saidaPath, $html, (New-Object System.Text.UTF8Encoding($false)))
  Write-Output ("{0} ({1:N0} bytes)" -f (Split-Path -Leaf $saidaPath), (Get-Item $saidaPath).Length)
}

Inline "$Root\tests\run-tests.html" "$Root\tests\_run-tests-inline.html"
Inline "$Root\tests\run-tests-extrator.html" "$Root\tests\_run-tests-extrator-inline.html"
Inline "$Root\index.html" "$Root\_index-inline.html"

# Entregavel: arquivo unico, para rodar em qualquer maquina sem a pasta do projeto.
Inline "$Root\index.html" "$Root\Conversor-ONR.html"
