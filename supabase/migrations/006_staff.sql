CREATE TABLE staff_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  role user_role NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TYPE attendance_type AS ENUM ('clock_in', 'clock_out', 'break_start', 'break_end');

CREATE TABLE attendance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  type attendance_type NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT now(),
  source TEXT DEFAULT 'manual',
  lat DECIMAL(9,6),
  lng DECIMAL(9,6)
);

CREATE INDEX idx_schedules_location_date ON staff_schedules(location_id, shift_date);
CREATE INDEX idx_schedules_user ON staff_schedules(user_id, shift_date);
CREATE INDEX idx_attendance_location ON attendance_logs(location_id, logged_at);
CREATE INDEX idx_attendance_user ON attendance_logs(user_id, logged_at);

ALTER TABLE staff_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "schedules_location_rw" ON staff_schedules
  FOR ALL USING (location_id IN (SELECT user_location_ids()));

CREATE POLICY "attendance_location_rw" ON attendance_logs
  FOR ALL USING (location_id IN (SELECT user_location_ids()));
