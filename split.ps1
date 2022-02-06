if ($null -eq $env:CONFIG) {
    Write-Host 'Переменная среды CONFIG не найдена.'
    exit -1
}

$cfgPath = "$(Get-Location)/$($env:CONFIG)"
$splitterBin = "$(Get-Location)/bin/splitter"

$cfg = Get-Content -Path $cfgPath

if ($cfgPath.EndsWith('.yaml') -or $cfgPath.EndsWith('.yml')) {
    Install-Module -Name powershell-yaml -Confirm
    $cfg = $cfg | ConvertFrom-Yaml
}
else {
    $cfg = $cfg | ConvertFrom-Json
}

if ($null -eq $cfg.layerSettings -or $cfg.layerSettings.type -eq 'Single') {
    Write-Host 'Нарезка изображении не требуется.'
    exit 0
}

if ($IsWindows) {
    $splitterBin += '.exe'
}
else {
    chmod +x "$splitterBin"
}

Write-Host "Путь до splitter: $splitterBin"

Write-Host "::group::splitter"

Invoke-Expression "$splitterBin 'images/*.png' -w $($cfg.layerSettings.tileSize) -h $($cfg.layerSettings.tileSize) --min-zoom 0 --max-zoom 4 -r"

Write-Host "::endgroup::"
