const axios = require('axios');

async function testStitchAuth() {
  try {
    console.log('Testing Stitch Express authentication...');
    
    const response = await axios.post('https://api.stitch.money/api/v1/token', {
      clientId: 'test-4c716693-3514-4953-8d98-d8f90c116731',
      clientSecret: 'HpUfenLrmKyR1j3gqOXoIu8XvIOrhES1HCYurxO6lSWAqSsE6lcfi7QaRDwoqRfB',
      scope: 'client_paymentrequest'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Success!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.data?.accessToken) {
      console.log('\n✅ Token acquired:', response.data.data.accessToken.substring(0, 50) + '...');
    }
  } catch (error) {
    console.error('Error:', error.response?.status, error.response?.statusText);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
  }
}

testStitchAuth();
