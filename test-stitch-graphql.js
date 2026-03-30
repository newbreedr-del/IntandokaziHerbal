const axios = require('axios');

async function testStitchGraphQL() {
  try {
    console.log('Testing Stitch GraphQL authentication...');
    
    // Try the GraphQL API endpoint instead
    const tokenResponse = await axios.post('https://api.stitch.money/graphql', {
      query: `
        mutation CreateToken {
          clientTokenCreate(input: {
            clientId: "test-4c716693-3514-4953-8d98-d8f90c116731",
            clientSecret: "HpUfenLrmKyR1j3gqOXoIu8XvIOrhES1HCYurxO6lSWAqSsE6lcfi7QaRDwoqRfB",
            scopes: ["client_paymentrequest"]
          }) {
            token {
              accessToken
              expiresIn
            }
          }
        }
      `
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('GraphQL Response:', JSON.stringify(tokenResponse.data, null, 2));
    
    if (tokenResponse.data.data?.clientTokenCreate?.token?.accessToken) {
      console.log('\n✅ GraphQL Token acquired!');
      console.log('Token:', tokenResponse.data.data.clientTokenCreate.token.accessToken.substring(0, 50) + '...');
    }
  } catch (error) {
    console.error('GraphQL Error:', error.response?.status);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
  }
}

testStitchGraphQL();
