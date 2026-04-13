// Test the new Respond.io API token
const axios = require('axios');

async function testNewToken() {
  const newToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjUwOTEsInNwYWNlSWQiOjM5MDk1Nywib3JnSWQiOjM4NDczNSwidHlwZSI6ImFwaSIsImlhdCI6MTc3NTQ3NjI4Mn0.b5_RIx5akg7FoahNZ30w1gAGdCQVUOlw59v9FsAkGU4';
  
  console.log('🔍 Testing New Respond.io Token\n');
  
  // Decode the new token
  try {
    const tokenParts = newToken.split('.');
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    
    console.log('📋 New Token Information:');
    console.log('   User ID:', payload.id);
    console.log('   Space ID:', payload.spaceId);
    console.log('   Org ID:', payload.orgId);
    console.log('   Type:', payload.type);
    console.log('   Issued At:', new Date(payload.iat * 1000).toLocaleString());
    console.log('   Expires At:', payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'No expiration');
    console.log();
    
    // Compare with old token
    console.log('🔄 Token Changes:');
    console.log('   Old User ID: 24981 → New User ID:', payload.id);
    console.log('   Space ID: Same (390957)');
    console.log('   Org ID: Same (384735)');
    console.log('   Type: Same (api)');
    console.log('   Issued: Old → New:', new Date(payload.iat * 1000).toLocaleString());
    console.log();
    
  } catch (error) {
    console.log('❌ Could not decode new token:', error.message);
    return;
  }
  
  // Test the new token with API endpoints
  console.log('🧪 Testing New Token with API Endpoints...\n');
  
  const endpoints = [
    'https://api.respond.io/v2/messages',
    'https://api.respond.io/v1/messages',
    `https://api.respond.io/v2/spaces/390957/messages`,
    `https://api.respond.io/v1/spaces/390957/messages`,
    `https://api.respond.io/v2/spaces/390957/channels/481385/messages`,
    `https://api.respond.io/v1/spaces/390957/channels/481385/messages`
  ];
  
  for (const endpoint of endpoints) {
    console.log(`📍 Testing: ${endpoint}`);
    
    try {
      const response = await axios.post(endpoint, {
        channelId: '481385',
        recipient: { phone: '27645509130' },
        message: { type: 'text', text: '🌿 Testing with NEW token!' }
      }, {
        headers: {
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ SUCCESS! Message sent!');
      console.log('Response:', response.data);
      console.log('\n🎉 WORKING ENDPOINT:', endpoint);
      console.log('🎉 NEW TOKEN WORKS!');
      
      // Update the system with new token
      console.log('\n📝 Update your .env.local with:');
      console.log(`RESPONDIO_API_TOKEN=${newToken}`);
      
      return endpoint;
      
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 404) {
          console.log('   ❌ 404 - Not Found');
        } else if (status === 401) {
          console.log('   ❌ 401 - Unauthorized');
        } else if (status === 403) {
          console.log('   ❌ 403 - Forbidden (might need permissions)');
        } else {
          console.log(`   ❌ ${status} - ${error.response.data?.message || 'Unknown error'}`);
          if (error.response.data) {
            console.log('   Details:', error.response.data);
          }
        }
      } else {
        console.log('   ❌ Network Error:', error.message);
      }
    }
  }
  
  // Test workspace access with new token
  console.log('\n🏢 Testing Workspace Access with New Token...');
  
  try {
    const response = await axios.get('https://api.respond.io/v2/spaces/390957', {
      headers: {
        'Authorization': `Bearer ${newToken}`
      }
    });
    
    console.log('✅ Workspace accessible with new token!');
    console.log('Workspace data:', response.data);
    
  } catch (error) {
    console.log('❌ Workspace access failed with new token:', error.response?.status);
    
    // Try getting user info
    try {
      const userResponse = await axios.get('https://api.respond.io/v2/me', {
        headers: {
          'Authorization': `Bearer ${newToken}`
        }
      });
      console.log('✅ User info accessible:', userResponse.data);
    } catch (userError) {
      console.log('❌ User info also failed:', userError.response?.status);
    }
  }
  
  console.log('\n💡 Next Steps:');
  console.log('1. If any endpoint worked, update .env.local with the new token');
  console.log('2. If still 404, check if Developer API is enabled');
  console.log('3. Test the updated integration');
}

testNewToken().catch(console.error);
