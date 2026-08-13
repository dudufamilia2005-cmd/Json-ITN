# Servidor estatico minimo para rodar o projeto localmente como ele roda de
# verdade: index.html + src/*.js + schemas/*.js separados, caminhos relativos.
#
# Existe porque nesta maquina nao ha Node nem Python, e porque o preview do
# Claude Code carrega file:// como data: URL (onde <script src> relativo nao
# resolve). Para uso normal, basta abrir o HTML - isto e so para teste.
#
#   .\tools\servir.ps1            # porta 8787
#   .\tools\servir.ps1 -Porta 9000
param(
  [int]$Porta = 8787,
  [string]$Raiz = (Split-Path -Parent $PSScriptRoot)
)

$tipos = @{
  '.html' = 'text/html; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.md'   = 'text/plain; charset=utf-8'
}

$ouvinte = New-Object System.Net.HttpListener
$ouvinte.Prefixes.Add("http://localhost:$Porta/")
$ouvinte.Start()
Write-Output "servindo $Raiz em http://localhost:$Porta/ (Ctrl+C para parar)"

try {
  while ($ouvinte.IsListening) {
    $ctx = $ouvinte.GetContext()
    $rel = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
    if ([string]::IsNullOrWhiteSpace($rel)) { $rel = 'index.html' }
    $caminho = Join-Path $Raiz ($rel -replace '/', [char]92)

    # Nao serve nada fora da pasta do projeto.
    $completo = [System.IO.Path]::GetFullPath($caminho)
    $raizCompleta = [System.IO.Path]::GetFullPath($Raiz)
    if (-not $completo.StartsWith($raizCompleta) -or -not (Test-Path $completo -PathType Leaf)) {
      $ctx.Response.StatusCode = 404
      $ctx.Response.Close()
      continue
    }

    $ext = [System.IO.Path]::GetExtension($completo).ToLower()
    $ctx.Response.ContentType = if ($tipos.ContainsKey($ext)) { $tipos[$ext] } else { 'application/octet-stream' }
    $bytes = [System.IO.File]::ReadAllBytes($completo)
    $ctx.Response.ContentLength64 = $bytes.Length
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $ctx.Response.Close()
    Write-Output ("{0} {1} ({2:N0} bytes)" -f $ctx.Request.HttpMethod, $rel, $bytes.Length)
  }
} finally {
  $ouvinte.Stop()
  $ouvinte.Close()
}
