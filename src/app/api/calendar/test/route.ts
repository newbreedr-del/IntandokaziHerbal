import { NextRequest, NextResponse } from 'next/server';
import { getCalendarClient } from '@/lib/calendar';

export async function GET(request: NextRequest) {
  try {
    const calendar = getCalendarClient();

    // Test 1: Check if we can access the calendar
    const upcomingBookings = await calendar.getUpcomingBookings(5);

    // Test 2: Create a test event
    const testEventId = await calendar.createBookingEvent({
      clientName: 'Test Client',
      clientEmail: 'test@example.com',
      clientPhone: '0712345678',
      bookingDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      startTime: '10:00',
      endTime: '11:00',
      consultationType: 'phone',
      bookingReference: 'TEST-' + Date.now(),
      notes: 'This is a test booking - can be deleted'
    });

    return NextResponse.json({
      success: true,
      message: 'Google Calendar integration is working!',
      details: {
        calendarId: process.env.GOOGLE_CALENDAR_ID,
        serviceAccount: process.env.GOOGLE_CALENDAR_CLIENT_EMAIL,
        upcomingEventsCount: upcomingBookings.length,
        testEventCreated: !!testEventId,
        testEventId: testEventId
      },
      upcomingBookings: upcomingBookings.map(event => ({
        id: event.id,
        summary: event.summary,
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date
      }))
    });
  } catch (error: any) {
    console.error('Calendar test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: {
        calendarId: process.env.GOOGLE_CALENDAR_ID,
        serviceAccount: process.env.GOOGLE_CALENDAR_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.GOOGLE_CALENDAR_PRIVATE_KEY
      },
      troubleshooting: {
        step1: 'Verify the service account email has access to the calendar',
        step2: 'Check that Calendar API is enabled in Google Cloud Console',
        step3: 'Ensure the calendar is shared with: ' + process.env.GOOGLE_CALENDAR_CLIENT_EMAIL,
        step4: 'Verify the private key is correctly formatted in .env.local'
      }
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const calendar = getCalendarClient();
    const deleted = await calendar.deleteBookingEvent(eventId);

    return NextResponse.json({
      success: deleted,
      message: deleted ? 'Test event deleted' : 'Failed to delete event'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
