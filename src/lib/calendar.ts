/**
 * Google Calendar Integration
 * Manages consultation bookings in Google Calendar
 */

import { google } from 'googleapis';

export interface CalendarEvent {
  id?: string;
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  conferenceData?: any;
}

export interface BookingDetails {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  consultationType: 'video' | 'phone' | 'whatsapp';
  bookingReference: string;
  notes?: string;
}

class GoogleCalendarClient {
  private calendar: any;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CALENDAR_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_CALENDAR_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    this.calendar = google.calendar({ version: 'v3', auth });
  }

  /**
   * Create a calendar event for a booking
   */
  async createBookingEvent(booking: BookingDetails): Promise<string | null> {
    try {
      const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
      
      // Combine date and time
      const startDateTime = `${booking.bookingDate}T${booking.startTime}:00`;
      const endDateTime = `${booking.bookingDate}T${booking.endTime}:00`;

      const event: CalendarEvent = {
        summary: `Consultation - ${booking.clientName}`,
        description: `
Consultation Booking
-------------------
Client: ${booking.clientName}
Email: ${booking.clientEmail}
Phone: ${booking.clientPhone}
Type: ${booking.consultationType.toUpperCase()}
Reference: ${booking.bookingReference}

${booking.notes ? `Notes: ${booking.notes}` : ''}

Manage booking: ${process.env.NEXT_PUBLIC_BASE_URL}/admin/bookings
        `.trim(),
        start: {
          dateTime: startDateTime,
          timeZone: 'Africa/Johannesburg',
        },
        end: {
          dateTime: endDateTime,
          timeZone: 'Africa/Johannesburg',
        },
        attendees: [
          {
            email: booking.clientEmail,
            displayName: booking.clientName,
          },
        ],
      };

      // Add video conference for video consultations
      if (booking.consultationType === 'video') {
        event.conferenceData = {
          createRequest: {
            requestId: booking.bookingReference,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        };
      }

      const response = await this.calendar.events.insert({
        calendarId,
        resource: event,
        conferenceDataVersion: booking.consultationType === 'video' ? 1 : 0,
        sendUpdates: 'all', // Send email notifications
      });

      console.log('Calendar event created:', response.data.id);
      return response.data.id;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      return null;
    }
  }

  /**
   * Update a calendar event
   */
  async updateBookingEvent(
    eventId: string,
    updates: Partial<BookingDetails>
  ): Promise<boolean> {
    try {
      const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

      const event: Partial<CalendarEvent> = {};

      if (updates.clientName) {
        event.summary = `Consultation - ${updates.clientName}`;
      }

      if (updates.bookingDate && updates.startTime && updates.endTime) {
        event.start = {
          dateTime: `${updates.bookingDate}T${updates.startTime}:00`,
          timeZone: 'Africa/Johannesburg',
        };
        event.end = {
          dateTime: `${updates.bookingDate}T${updates.endTime}:00`,
          timeZone: 'Africa/Johannesburg',
        };
      }

      await this.calendar.events.patch({
        calendarId,
        eventId,
        resource: event,
        sendUpdates: 'all',
      });

      console.log('Calendar event updated:', eventId);
      return true;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      return false;
    }
  }

  /**
   * Delete a calendar event
   */
  async deleteBookingEvent(eventId: string): Promise<boolean> {
    try {
      const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

      await this.calendar.events.delete({
        calendarId,
        eventId,
        sendUpdates: 'all',
      });

      console.log('Calendar event deleted:', eventId);
      return true;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      return false;
    }
  }

  /**
   * Get upcoming bookings
   */
  async getUpcomingBookings(maxResults: number = 10): Promise<any[]> {
    try {
      const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

      const response = await this.calendar.events.list({
        calendarId,
        timeMin: new Date().toISOString(),
        maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching upcoming bookings:', error);
      return [];
    }
  }

  /**
   * Check if a time slot is available
   */
  async isTimeSlotAvailable(date: string, startTime: string, endTime: string): Promise<boolean> {
    try {
      const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
      
      const timeMin = `${date}T${startTime}:00+02:00`;
      const timeMax = `${date}T${endTime}:00+02:00`;

      const response = await this.calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
      });

      return (response.data.items || []).length === 0;
    } catch (error) {
      console.error('Error checking time slot availability:', error);
      return false;
    }
  }
}

// Singleton instance
let calendarInstance: GoogleCalendarClient | null = null;

export function getCalendarClient(): GoogleCalendarClient {
  if (!calendarInstance) {
    calendarInstance = new GoogleCalendarClient();
  }
  return calendarInstance;
}

export default GoogleCalendarClient;
