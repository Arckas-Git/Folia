# Hook Claude Code (PostToolUse) : reçoit sur stdin le JSON de l'appel d'outil.
# Si la commande est un `git push`, lance watch-deploy.ps1 en arrière-plan
# (fenêtre cachée, détaché) puis rend la main immédiatement.
$raw = [Console]::In.ReadToEnd()
try { $inp = $raw | ConvertFrom-Json } catch { exit 0 }
$cmd = ''
if ($inp -and $inp.tool_input -and $inp.tool_input.command) { $cmd = [string]$inp.tool_input.command }
if ($cmd -notmatch 'git\s+push') { exit 0 }

$watcher = Join-Path $PSScriptRoot 'watch-deploy.ps1'
if (-not (Test-Path $watcher)) { exit 0 }
Start-Process -FilePath 'powershell.exe' `
  -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-WindowStyle','Hidden','-File',"`"$watcher`"") `
  -WindowStyle Hidden
exit 0
