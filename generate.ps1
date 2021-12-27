if ($null -eq $env:TARGET_REPOSITORY) {
    Write-Host 'Переменная среды TARGET_REPOSITORY не найдена.'
    exit
}

Write-Host "Путь до репозитория: $($env:TARGET_REPOSITORY)"

$configPath = "$(Get-Location)/dmm-renderer.json"
$imagesPath = "$(Get-Location)/images/"
$originalBin = "$(Get-Location)/bin/dmm-renderer-cli"

if ($IsWindows) {
    $originalBin += ".exe"
}

Write-Host "Путь до dmm-renderer-cli: $originalBin"

$binPath = Copy-Item -Path $originalBin -Destination $env:TARGET_REPOSITORY -PassThru

Push-Location -Path $env:TARGET_REPOSITORY

if ($IsLinux) {
    chmod +x "./dmm-renderer-cli"
}

$env:DMM_RENDERER_LOG = "trace"
Write-Host "::group::dmm-renderer-cli"
Invoke-Expression "$binPath --config $configPath"
Write-Host '::endgroup::'

Move-Item "*.png" -Destination $imagesPath -Force

Remove-Item $binPath
Pop-Location
