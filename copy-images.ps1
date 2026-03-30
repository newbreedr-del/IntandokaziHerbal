# PowerShell script to copy product images
$sourceFolder = "C:\Users\newbr\Documents\Clients\Nthandokazi Herbal\Products\Production For The Website"
$destFolder = "c:\Users\newbr\Documents\Web Apps\DOJA\Intandokazi Herbal Products\public\images\products"

# Create destination folder if it doesn't exist
if (-not (Test-Path $destFolder)) {
    New-Item -ItemType Directory -Path $destFolder -Force
}

# Copy all images
Get-ChildItem -Path $sourceFolder -Filter "*.jpeg" | ForEach-Object {
    $newName = $_.Name.ToLower().Replace(" ", "-").Replace("(", "").Replace(")", "")
    Copy-Item -Path $_.FullName -Destination (Join-Path $destFolder $newName) -Force
    Write-Host "Copied: $($_.Name) -> $newName"
}

Write-Host "`nAll images copied successfully!"
