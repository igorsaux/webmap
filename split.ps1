$splitterBin = "$(Get-Location)/bin/splitter"

if ($IsWindows) {
    $splitterBin += '.exe'
}
else {
    chmod +x "$splitterBin"
}

Write-Host "Путь до splitter: $splitterBin"

Write-Host "::group::splitter"

Invoke-Expression "$splitterBin 'images/*.png' -w 1024 -h 1024 --min-zoom 0 --max-zoom 4 -r"

Write-Host "::endgroup::"
