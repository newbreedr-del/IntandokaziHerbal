const axios = require('axios');

async function testWebhook() {
  console.log('🧪 Testing webhook...\n');

  try {
    const response = await axios.post('http://localhost:3000/api/payments/stitch-mock/webhook', {
      type: 'payment.paid',
      data: {
        id: 'test_123',
        status: 'PAID',
        paidAt: new Date().toISOString()
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Webhook test successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Webhook test failed:', error.message);
  }
}

testWebhook();
