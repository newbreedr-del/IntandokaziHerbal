const axios = require('axios');

async function testNewCredentials() {
  const clientId = 'test-4c7f8693-3514-4953-5d88-d8f90c116731';
  const clientSecret = 'w0Raphl9eHpde96Y2CvqEM84DyvCN+zBOAiaKDdJsOkkGw6aaItE81GGZi3NStYF';

  console.log('🧪 Testing NEW Stitch Express credentials...\n');
  console.log('Client ID:', clientId);
  console.log('Client Secret:', clientSecret.substring(0, 20) + '...\n');

  try {
    console.log('📡 Requesting token from Stitch Express API...');
    
    const response = await axios.post('https://api.stitch.money/api/v1/token', {
      clientId,
      clientSecret,
      scope: 'client_paymentrequest'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('\n✅ SUCCESS!');
    console.log('Response:', JSON.stringify(response.data, null, 2));

    if (response.data.success && response.data.data?.accessToken) {
      const token = response.data.data.accessToken;
      console.log('\n🎉 TOKEN ACQUIRED!');
      console.log('Token (first 50 chars):', token.substring(0, 50) + '...');
      
      // Test creating a payment link
      console.log('\n📝 Testing payment link creation...');
      const paymentResponse = await axios.post('https://api.stitch.money/api/v1/payment-links', {
        amount: 10000, // R100 in cents
        merchantReference: 'TEST-' + Date.now(),
        payerName: 'Test Customer',
        payerEmailAddress: 'test@example.com'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('\n🎊 PAYMENT LINK CREATED SUCCESSFULLY!');
      console.log('Payment Link:', paymentResponse.data.data.payment.link);
      console.log('Payment ID:', paymentResponse.data.data.payment.id);
      console.log('\n✅✅✅ STITCH EXPRESS IS NOW FULLY WORKING! ✅✅✅');
      console.log('\n🚀 Ready for production testing!');
    }
  } catch (error) {
    console.error('\n❌ Error:', error.response?.status, error.response?.statusText);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
  }
}

testNewCredentials();
