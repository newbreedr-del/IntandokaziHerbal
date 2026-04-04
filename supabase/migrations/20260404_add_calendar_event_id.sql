-- Add calendar_event_id column to consultation_bookings table
ALTER TABLE consultation_bookings
ADD COLUMN IF NOT EXISTS calendar_event_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookings_calendar_event_id 
ON consultation_bookings(calendar_event_id);

-- Add comment
COMMENT ON COLUMN consultation_bookings.calendar_event_id IS 'Google Calendar event ID for this booking';
