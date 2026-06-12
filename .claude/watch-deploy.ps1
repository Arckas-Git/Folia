# Surveille le déploiement Cloudflare de Folia.
# Lit la version locale dans public/index.html (footer "vX.Y.Z"), puis
# interroge le site en ligne jusqu'à ce que la même version apparaisse.
# Affiche alors une notification Windows. Abandonne après MaxTries essais.
param(
  [int]$MaxTries = 30,   # 30 essais x 20 s = 10 minutes max
  [int]$DelaySec = 20,
  [string]$Url = 'https://folia.dca-tool.workers.dev/'
)
$ErrorActionPreference = 'SilentlyContinue'

$indexPath = Join-Path (Split-Path $PSScriptRoot -Parent) 'public\index.html'
$html = Get-Content $indexPath -Raw -Encoding UTF8
if ($html -notmatch 'v(\d+\.\d+\.\d+)') { exit 1 }
$localVer = $Matches[1]

function Show-Toast([string]$title, [string]$msg) {
  try {
    # Notification toast Windows 10/11 (WinRT)
    [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
    $t = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
    $t.GetElementsByTagName('text').Item(0).AppendChild($t.CreateTextNode($title)) | Out-Null
    $t.GetElementsByTagName('text').Item(1).AppendChild($t.CreateTextNode($msg)) | Out-Null
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('Folia').Show([Windows.UI.Notifications.ToastNotification]::new($t))
  } catch {
    # Repli : info-bulle classique de la barre des tâches
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing
    $n = New-Object System.Windows.Forms.NotifyIcon
    $n.Icon = [System.Drawing.SystemIcons]::Information
    $n.Visible = $true
    $n.ShowBalloonTip(8000, $title, $msg, [System.Windows.Forms.ToolTipIcon]::Info)
    Start-Sleep -Seconds 9
    $n.Dispose()
  }
}

for ($i = 0; $i -lt $MaxTries; $i++) {
  try {
    # ?t=... contourne les caches pour voir la vraie version en ligne
    $r = Invoke-WebRequest -Uri ($Url + '?t=' + [DateTimeOffset]::Now.ToUnixTimeSeconds()) -UseBasicParsing -TimeoutSec 15
    if ($r.Content -match 'v(\d+\.\d+\.\d+)' -and $Matches[1] -eq $localVer) {
      Show-Toast 'Folia déployé' "La version v$localVer est en ligne."
      exit 0
    }
  } catch {}
  Start-Sleep -Seconds $DelaySec
}
Show-Toast 'Folia : déploiement non confirmé' ("v$localVer n'est pas apparue après " + [math]::Round($MaxTries * $DelaySec / 60) + ' min.')
exit 0
