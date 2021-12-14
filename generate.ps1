if ($null -eq $env:TARGET_REPOSITORY) {
    Write-Host 'Переменная среды TARGET_REPOSITORY не найдена.'
    exit
}

Write-Host "Путь до репозитория: $($env:TARGET_REPOSITORY)"

$imagesPath = "$(Get-Location)\images"
$config = Get-Content .\maps.json | ConvertFrom-Json
$originalBin = "$(Get-Location)\bin\dmm-tools"

if ($IsWindows) {
    $originalBin += ".exe"
}

if ($IsLinux) {
    chmod +x $originalBin
}

Write-Host "Путь до dmm-tools: $originalBin"

$binPath = Copy-Item -Path $originalBin -Destination $env:TARGET_REPOSITORY -PassThru

Push-Location -Path $env:TARGET_REPOSITORY

foreach ($map in $config.maps) {
    $imageFolder = "$($imagesPath)\$($map.name.ToLower())"
    Write-Host "Создание снимков для карты '$($map.name)':"

    if ($false -eq (Test-Path -Path $imageFolder)) {
        New-Item -Path $imageFolder -ItemType Directory
    }

    foreach ($level in $map.levels.PSObject.Properties) {
        $index = $level.Name
        $levelData = $level.Value
        Write-Host "[*] '$($levelData.name)' - $index"

        Invoke-Expression "$binPath minimap -o $imageFolder $($levelData.path)" 2>&1 | Out-Null
    }
}

Remove-Item $binPath
Pop-Location
