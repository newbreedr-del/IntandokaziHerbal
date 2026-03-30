const axios = require('axios');

async function testStitchSimple() {
  const clientId = 'test-4c716693-3514-4953-8d98-d8f90c116731';
  const clientSecret = 'HpUfenLrmKyR1j3gqOXoIu8XvIOrhES1HCYurxO6lSWAqSsE6lcfi7QaRDwoqRfB';

  console.log('Testing with credentials:');
  console.log('Client ID:', clientId);
  console.log('Client Secret:', clientSecret.substring(0, 20) + '...\n');

  // Test different scopes
  const scopes = [
    'client_paymentrequest',
    'client_paymentauthorizationrequest',
    'client_recurringpaymentconsentrequest'
  ];

  for (const scope of scopes) {
    try {
      console.log(`\nTrying scope: ${scope}`);
      
      const response = await axios.post('https://api.stitch.money/api/v1/token', {
        clientId,
        clientSecret,
        scope
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        validateStatus: () => true // Don't throw on any status
      });

      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(response.data, null, 2));

      if (response.data.success) {
        console.log('✅ SUCCESS with scope:', scope);
        return;
      }
    } catch (error) {
      console.log('Error:', error.message);
    }
  }

  console.log('\n❌ All scopes failed. Credentials may not be activated yet.');
  console.log('\n💡 Next steps:');
  console.log('1. Check if you need to activate your account in Stitch dashboard');
  console.log('2. Verify these are Express API credentials (not GraphQL)');
  console.log('3. Contact Stitch support if issue persists');
}

testStitchSimple();
