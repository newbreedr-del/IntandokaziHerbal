// Simple calendar integration test
// Run this with: node test-calendar.js

require('dotenv').config({ path: '.env.local' });

async function testCalendarIntegration() {
  console.log('=== Testing Google Calendar Integration ===');
  
  // Check environment variables
  console.log('Environment Variables Check:');
  console.log('✅ Calendar ID:', process.env.GOOGLE_CALENDAR_ID ? 'SET' : 'MISSING');
  console.log('✅ Service Email:', process.env.GOOGLE_CALENDAR_CLIENT_EMAIL ? 'SET' : 'MISSING');
  console.log('✅ Private Key:', process.env.GOOGLE_CALENDAR_PRIVATE_KEY ? 'SET' : 'MISSING');
  
  if (!process.env.GOOGLE_CALENDAR_ID || 
      !process.env.GOOGLE_CALENDAR_CLIENT_EMAIL || 
      !process.env.GOOGLE_CALENDAR_PRIVATE_KEY) {
    console.log('❌ Missing environment variables');
    return;
  }
  
  console.log('\n✅ All environment variables are set');
  console.log('📅 Calendar ID:', process.env.GOOGLE_CALENDAR_ID);
  console.log('🤖 Service Account:', process.env.GOOGLE_CALENDAR_CLIENT_EMAIL);
  
  // Test calendar connection
  try {
    const { getCalendarClient } = require('./src/lib/calendar.ts');
    const calendar = getCalendarClient();
    
    console.log('\n🧪 Testing calendar connection...');
    
    // Test getting upcoming events
    const upcomingBookings = await calendar.getUpcomingBookings(5);
    console.log('✅ Successfully connected to calendar');
    console.log(`📊 Found ${upcomingBookings.length} upcoming events`);
    
    // Test creating an event
    console.log('\n🧪 Creating test event...');
    const testEventId = await calendar.createBookingEvent({
      clientName: 'Test Client',
      clientEmail: 'test@example.com',
      clientPhone: '0712345678',
      bookingDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:00',
      consultationType: 'phone',
      bookingReference: 'TEST-' + Date.now(),
      notes: 'This is a test booking - can be deleted'
    });
    
    if (testEventId) {
      console.log('✅ Successfully created test event');
      console.log('🆔 Event ID:', testEventId);
      
      // Clean up - delete the test event
      console.log('\n🧹 Cleaning up test event...');
      const deleted = await calendar.deleteBookingEvent(testEventId);
      console.log(deleted ? '✅ Test event deleted' : '❌ Failed to delete test event');
    } else {
      console.log('❌ Failed to create test event');
    }
    
    console.log('\n🎉 Calendar integration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Calendar test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify calendar is shared with service account');
    console.log('2. Check service account has "Make changes to events" permission');
    console.log('3. Ensure Google Calendar API is enabled in Google Cloud Console');
  }
}

// Run the test
testCalendarIntegration().catch(console.error);
