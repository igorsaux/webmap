if ($null -eq $env:TARGET_REPOSITORY) {
    Write-Host 'Переменная среды TARGET_REPOSITORY не найдена.'
    exit -1
}

Write-Host "Путь до репозитория: $($env:TARGET_REPOSITORY)"

$configPath = "$(Get-Location)/sputnik.yaml"
$imagesPath = "$(Get-Location)/images/"
$originalBin = "$(Get-Location)/bin/sputnik-cli"

if ((Test-Path $imagesPath) -eq $false) {
    New-Item $imagesPath -ItemType Directory
}

if ($IsWindows) {
    $originalBin += ".exe"
}

Write-Host "Путь до sputnik-cli: $originalBin"

$binPath = Copy-Item -Path $originalBin -Destination $env:TARGET_REPOSITORY -PassThru

Push-Location -Path $env:TARGET_REPOSITORY

if ($IsLinux) {
    chmod +x "./sputnik-cli"
}

$env:SPUTNIK_LOG = "trace"
Write-Host "::group::sputnik-cli"
Invoke-Expression "$binPath --config $configPath"
Write-Host '::endgroup::'

Move-Item "*.png" -Destination $imagesPath -Force

Remove-Item $binPath
Pop-Location
