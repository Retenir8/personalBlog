BEGIN;

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('user', 'teacher', 'caregiver', 'admin'));

CREATE TABLE IF NOT EXISTS care_records (
  record_id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  recorder_id BIGINT NOT NULL REFERENCES users (user_id),
  physical_status TEXT NOT NULL,
  mental_status TEXT NOT NULL,
  check_details TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  advice TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS care_records_user_checked_idx ON care_records (user_id, checked_at DESC);
DROP TRIGGER IF EXISTS trg_care_records_set_timestamp ON care_records;
CREATE TRIGGER trg_care_records_set_timestamp BEFORE UPDATE ON care_records
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TABLE IF NOT EXISTS activities (
  activity_id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  activity_date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  contact_phone VARCHAR(20),
  publisher_id BIGINT NOT NULL REFERENCES users (user_id),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS activities_upcoming_idx ON activities (is_published, activity_date);
DROP TRIGGER IF EXISTS trg_activities_set_timestamp ON activities;
CREATE TRIGGER trg_activities_set_timestamp BEFORE UPDATE ON activities
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

COMMIT;
