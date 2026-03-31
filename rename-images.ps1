# PowerShell script to rename product images to correct slug format

$imagesPath = "public\images\products"

# Define the correct mappings (current name -> correct slug name)
$renames = @{
    "imbiza-yama-ulcer-.jpeg" = "imbiza-yama-ulcer.jpeg"
    # All other files are already correctly named
}

Write-Host "Renaming product images to correct slug format..." -ForegroundColor Green

foreach ($oldName in $renames.Keys) {
    $newName = $renames[$oldName]
    $oldPath = Join-Path $imagesPath $oldName
    $newPath = Join-Path $imagesPath $newName
    
    if (Test-Path $oldPath) {
        Rename-Item -Path $oldPath -NewName $newName -Force
        Write-Host "✓ Renamed: $oldName -> $newName" -ForegroundColor Cyan
    } else {
        Write-Host "✗ File not found: $oldName" -ForegroundColor Yellow
    }
}

Write-Host "`nListing all product images:" -ForegroundColor Green
Get-ChildItem -Path $imagesPath | Select-Object Name, Length | Format-Table -AutoSize

Write-Host "`nImage renaming complete!" -ForegroundColor Green
Write-Host "All images are now using correct slug-based naming." -ForegroundColor Green
