-- Add recurrence columns to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS recurrence_type text DEFAULT NULL;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS recurrence_end_date date DEFAULT NULL;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS parent_appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_sent_at timestamptz DEFAULT NULL;

-- Create index for parent appointments
CREATE INDEX IF NOT EXISTS idx_appointments_parent_id ON appointments(parent_appointment_id);

-- Create index for reminder queries
CREATE INDEX IF NOT EXISTS idx_appointments_reminder ON appointments(appointment_date, reminder_sent_at) WHERE reminder_sent_at IS NULL;