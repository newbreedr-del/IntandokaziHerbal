# Test toggling back to featured
$body = @{
    id = "83b641a7-6998-4f8a-9657-e2c6323cfbfe"
    is_featured = $true
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/products" -Method Put -ContentType "application/json" -Body $body

Write-Host "Toggle back to featured response:"
Write-Host ($response | ConvertTo-Json -Depth 3)
