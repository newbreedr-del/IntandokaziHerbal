# Calendar Integration Setup Guide

This guide explains how to set up Google Calendar integration with Respond.io for managing Nthandokazi's consultation bookings.

## Overview

The system integrates:
- **Google Calendar** - Stores all consultation appointments
- **Respond.io** - Agents can view and manage bookings via WhatsApp
- **Your Website** - Automatic calendar sync when bookings are created

## Google Calendar Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Calendar API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

### Step 2: Create a Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the details:
   - Name: `Intandokazi Booking System`
   - Description: `Service account for managing consultation bookings`
4. Click "Create and Continue"
5. Grant the service account the "Editor" role
6. Click "Done"

### Step 3: Generate Service Account Key

1. Click on the service account you just created
2. Go to the "Keys" tab
3. Click "Add Key" > "Create New Key"
4. Choose "JSON" format
5. Click "Create" - a JSON file will be downloaded

### Step 4: Share Calendar with Service Account

1. Open [Google Calendar](https://calendar.google.com/)
2. Create a new calendar or use an existing one for consultations
3. Click the three dots next to the calendar name
4. Select "Settings and sharing"
5. Scroll to "Share with specific people"
6. Click "Add people"
7. Enter the service account email (found in the JSON file: `client_email`)
8. Set permission to "Make changes to events"
9. Click "Send"

### Step 5: Get Calendar ID

1. In Calendar settings, scroll to "Integrate calendar"
2. Copy the "Calendar ID" (looks like: `abc123@group.calendar.google.com`)

### Step 6: Add Environment Variables

Add these to your `.env.local` file:

```env
# Google Calendar Configuration
GOOGLE_CALENDAR_CLIENT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_CALENDAR_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
```

**Important:** 
- Get `client_email` from the downloaded JSON file
- Get `private_key` from the JSON file (keep the `\n` characters)
- Use the Calendar ID from step 5

## Respond.io Integration

### How Agents Can Manage Bookings

#### 1. View Upcoming Bookings

Agents can fetch bookings via API:

```
GET https://intandokaziherbal.co.za/api/respondio/bookings?status=confirmed&limit=10
```

This returns all upcoming confirmed bookings with client details.

#### 2. Create Booking for Customer

Agents can create bookings directly:

```
POST https://intandokaziherbal.co.za/api/respondio/bookings
{
  "clientName": "John Doe",
  "clientPhone": "0712345678",
  "clientEmail": "john@example.com",
  "bookingDate": "2026-04-15",
  "startTime": "10:00",
  "endTime": "11:00",
  "consultationType": "phone",
  "notes": "First consultation",
  "agentId": "agent_001"
}
```

#### 3. Share Booking Link with Customers

Agents can share this link via WhatsApp:

```
https://intandokaziherbal.co.za/book/[agent_id]
```

Replace `[agent_id]` with the agent's Respond.io ID.

Customers can then:
- Select date and time
- Choose consultation type (video/phone/WhatsApp)
- Enter their details
- Book instantly

#### 4. Update Booking Status

```
PUT https://intandokaziherbal.co.za/api/respondio/bookings
{
  "bookingId": "booking-id-here",
  "status": "completed"
}
```

Possible statuses: `confirmed`, `completed`, `cancelled`, `no_show`

## Respond.io Workflow Setup

### Create a Booking Management Workflow

1. Log into Respond.io
2. Go to "Workflows" > "Create Workflow"
3. Name it: "Booking Management"

### Add Trigger: Customer Says "Book" or "Appointment"

```
Trigger: Message Contains
Keywords: book, appointment, consultation, schedule
```

### Add Action: Send Booking Link

```
Action: Send Message
Message: 
"Hi! I'd be happy to help you book a consultation with Nthandokazi 🌿

Click here to choose your preferred date and time:
https://intandokaziherbal.co.za/book/{{agent.id}}

Or I can help you book right now. What date works best for you?"
```

### Add Action: Fetch Today's Bookings

```
Action: HTTP Request
Method: GET
URL: https://intandokaziherbal.co.za/api/respondio/bookings?date={{today}}&status=confirmed
Save Response As: todayBookings
```

### Display Bookings to Agent

```
Action: Send Internal Note
Message: 
"📅 Today's Bookings:
{{#each todayBookings.bookings}}
- {{this.client.name}} at {{this.appointment.time}}
  Type: {{this.appointment.type}}
  Phone: {{this.client.phone}}
{{/each}}"
```

## What Happens When a Booking is Created

1. **Customer books** (via website or agent link)
2. **System creates**:
   - Database record in Supabase
   - Google Calendar event (visible to Nthandokazi)
   - Payment record
3. **Notifications sent**:
   - WhatsApp to customer (booking confirmation)
   - WhatsApp to admin (new booking alert)
   - Email to customer (if provided)
   - Calendar invite to customer
4. **Calendar event includes**:
   - Client name, email, phone
   - Consultation type
   - Booking reference
   - Link to admin panel
   - Video meeting link (for video consultations)

## Benefits for Agents

✅ **View all bookings** in one place via API
✅ **Create bookings** for customers instantly
✅ **Share booking links** via WhatsApp
✅ **See real-time availability** from Google Calendar
✅ **Update booking status** (completed, cancelled, etc.)
✅ **Access client details** for follow-ups
✅ **Track payment status** for each booking

## Benefits for Nthandokazi

✅ **All bookings in Google Calendar** - accessible on phone/computer
✅ **Automatic reminders** from Google Calendar
✅ **Video meeting links** auto-generated for video consultations
✅ **Client contact info** in every calendar event
✅ **Sync across devices** - phone, tablet, computer
✅ **Share calendar** with team members if needed

## Testing the Integration

### Test 1: Create a Booking

```bash
curl -X POST https://intandokaziherbal.co.za/api/respondio/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Test Client",
    "clientPhone": "0712345678",
    "bookingDate": "2026-04-15",
    "startTime": "10:00",
    "endTime": "11:00",
    "consultationType": "phone",
    "agentId": "test_agent"
  }'
```

### Test 2: Check Google Calendar

1. Open Google Calendar
2. Look for the event on the selected date
3. Verify all details are correct

### Test 3: Fetch Bookings

```bash
curl https://intandokaziherbal.co.za/api/respondio/bookings?status=confirmed
```

## Troubleshooting

### Calendar events not appearing?

- Check service account has access to calendar
- Verify Calendar ID is correct
- Check private key format in .env.local

### Agents can't access bookings?

- Verify Respond.io API token is correct
- Check agent has proper permissions
- Test API endpoints directly

### Notifications not sending?

- Check Respond.io API token
- Verify phone numbers are in correct format
- Check Respond.io message logs

## Support

For issues or questions:
- Check admin panel: https://intandokaziherbal.co.za/admin/bookings
- View calendar: https://calendar.google.com
- Contact: nthandokazi@intandokaziherbal.co.za
