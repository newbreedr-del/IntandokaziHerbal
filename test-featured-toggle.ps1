# Get products and extract first ID
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/products"
$firstProduct = $response.products[0]
$productId = $firstProduct.id

Write-Host "First product ID: $productId"
Write-Host "Product name: $($firstProduct.name)"
Write-Host "Current featured status: $($firstProduct.is_featured)"

# Test toggle
$body = @{
    id = $productId
    is_featured = !$firstProduct.is_featured
} | ConvertTo-Json

Write-Host "Testing toggle with: $body"

$toggleResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/products" -Method Put -ContentType "application/json" -Body $body
Write-Host "Toggle response: $($toggleResponse | ConvertTo-Json -Depth 3)"
