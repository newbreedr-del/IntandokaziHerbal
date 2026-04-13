// Test PayFast Sandbox Configuration
require('dotenv').config({ path: '.env.local' });

console.log('=== PAYFAST SANDBOX CONFIGURATION TEST ===');

// Check environment variables
console.log('Environment Variables:');
console.log('✅ Merchant ID:', process.env.PAYFAST_MERCHANT_ID);
console.log('✅ Merchant Key:', process.env.PAYFAST_MERCHANT_KEY ? 'SET' : 'MISSING');
console.log('✅ Passphrase:', process.env.PAYFAST_PASSPHRASE ? 'SET' : 'MISSING');
console.log('✅ Environment:', process.env.PAYFAST_ENVIRONMENT);

// Check if sandbox mode is configured
const isSandbox = process.env.PAYFAST_ENVIRONMENT === 'sandbox';
const merchantId = process.env.PAYFAST_MERCHANT_ID;

console.log('\nConfiguration Status:');
console.log('🧪 Sandbox Mode:', isSandbox ? '✅ ENABLED' : '❌ DISABLED');
console.log('🏪 Merchant ID:', merchantId ? '✅ SET' : '❌ MISSING');

if (isSandbox && merchantId) {
  console.log('\n🎉 PayFast Sandbox is properly configured!');
  console.log('📱 Payment URL: https://sandbox.payfast.co.za/eng/process');
  console.log('🔔 ITN URL: https://intandokaziherbal.co.za/api/payments/payfast/notify');
  
  console.log('\n📋 Next Steps:');
  console.log('1. Restart your application to load new environment variables');
  console.log('2. Test a booking payment on your website');
  console.log('3. Verify payment redirects to sandbox.payfast.co.za');
  console.log('4. Check if ITN webhook updates booking status');
} else {
  console.log('\n❌ Configuration issues detected');
  console.log('Please check your environment variables');
}

console.log('\n=== END TEST ===');
