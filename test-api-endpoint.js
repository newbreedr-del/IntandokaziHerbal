// Test script to check if API endpoints are working
// Run this with: node test-api-endpoint.js

const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing GET /api/admin/products...');
    const response = await fetch('https://www.intandokaziherbal.co.za/api/admin/products');
    
    console.log('Status:', response.status);
    console.log('Headers:', response.headers.raw());
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success! Found', data.length, 'products');
    } else {
      const error = await response.text();
      console.log('Error:', error);
    }
  } catch (error) {
    console.error('Network error:', error.message);
  }
}

testAPI();
