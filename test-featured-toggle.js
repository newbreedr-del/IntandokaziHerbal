// Test script for featured toggle
const testFeaturedToggle = async () => {
  try {
    // First, get all products
    const productsResponse = await fetch('http://localhost:3000/api/admin/products');
    const productsData = await productsResponse.json();
    
    console.log('Products loaded:', productsData.products?.length || 0);
    
    if (productsData.products && productsData.products.length > 0) {
      const firstProduct = productsData.products[0];
      console.log('First product:', firstProduct.name);
      console.log('Current featured status:', firstProduct.is_featured);
      
      // Test toggling featured status
      const toggleResponse = await fetch('http://localhost:3000/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: firstProduct.id,
          is_featured: !firstProduct.is_featured
        })
      });
      
      const toggleResult = await toggleResponse.json();
      console.log('Toggle response:', toggleResponse);
      
      if (toggleResponse.ok) {
        console.log('✅ Featured toggle successful!');
        console.log('New featured status:', toggleResult.product.is_featured);
      } else {
        console.log('❌ Featured toggle failed:', toggleResult.error);
      }
    }
  } catch (error) {
    console.error('Test error:', error);
  }
};

testFeaturedToggle();
