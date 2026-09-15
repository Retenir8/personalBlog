-- PostgresSQL schema for Tang Seniors Academy Course Platform
-- Created with focus on readability and maintainability for a small-scale project.

BEGIN;

-- Shared helper to keep updated_at in sync.
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TABLE IF NOT EXISTS users (
  user_id         BIGSERIAL PRIMARY KEY,
  username        TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  gender          TEXT,
  date_of_birth   DATE,
  age             INTEGER CHECK (age IS NULL OR age >= 0),
  phone           VARCHAR(20),
  avatar_url      TEXT,
  hobbies         TEXT,
  health_condition TEXT,
  last_login_at   TIMESTAMPTZ,
  status          SMALLINT NOT NULL DEFAULT 0 CHECK (status IN (0, 1)),
  role            TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'teacher', 'caregiver', 'admin')),
  is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('user', 'teacher', 'caregiver', 'admin'));

CREATE UNIQUE INDEX IF NOT EXISTS users_phone_unique
  ON users (phone)
  WHERE phone IS NOT NULL;

DROP TRIGGER IF EXISTS trg_users_set_timestamp ON users;
CREATE TRIGGER trg_users_set_timestamp
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();


CREATE TABLE IF NOT EXISTS courses (
  course_id       BIGSERIAL PRIMARY KEY,
  title           TEXT NOT NULL,
  category        TEXT,
  description     TEXT,
  start_date      DATE,
  end_date        DATE,
  class_time      TEXT NOT NULL,
  location        TEXT NOT NULL,
  capacity        INTEGER NOT NULL CHECK (capacity > 0),
  status          SMALLINT NOT NULL DEFAULT 0 CHECK (status IN (0, 1, 2)),
  image_url       TEXT,
  contact_phone   VARCHAR(20),
  is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS courses_category_idx ON courses (category);
CREATE INDEX IF NOT EXISTS courses_start_date_idx ON courses (start_date);

DROP TRIGGER IF EXISTS trg_courses_set_timestamp ON courses;
CREATE TRIGGER trg_courses_set_timestamp
BEFORE UPDATE ON courses
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();


CREATE TABLE IF NOT EXISTS course_enrollments (
  enrollment_id BIGSERIAL PRIMARY KEY,
  user_id       BIGINT NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  course_id     BIGINT NOT NULL REFERENCES courses (course_id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT course_enrollments_user_course_unique UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS course_enrollments_course_idx ON course_enrollments (course_id);
CREATE INDEX IF NOT EXISTS course_enrollments_user_idx ON course_enrollments (user_id);


CREATE TABLE IF NOT EXISTS care_records (
  record_id        BIGSERIAL PRIMARY KEY,
  user_id          BIGINT NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  recorder_id      BIGINT NOT NULL REFERENCES users (user_id),
  physical_status  TEXT NOT NULL,
  mental_status    TEXT NOT NULL,
  check_details    TEXT,
  checked_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  advice           TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS care_records_user_checked_idx
  ON care_records (user_id, checked_at DESC);

DROP TRIGGER IF EXISTS trg_care_records_set_timestamp ON care_records;
CREATE TRIGGER trg_care_records_set_timestamp
BEFORE UPDATE ON care_records
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();


CREATE TABLE IF NOT EXISTS activities (
  activity_id      BIGSERIAL PRIMARY KEY,
  title            TEXT NOT NULL,
  summary          TEXT,
  activity_date    TIMESTAMPTZ NOT NULL,
  location         TEXT NOT NULL,
  contact_phone    VARCHAR(20),
  publisher_id     BIGINT NOT NULL REFERENCES users (user_id),
  is_published     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS activities_upcoming_idx
  ON activities (is_published, activity_date);

DROP TRIGGER IF EXISTS trg_activities_set_timestamp ON activities;
CREATE TRIGGER trg_activities_set_timestamp
BEFORE UPDATE ON activities
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();


-- Convenience view to expose enrollment counts alongside course metadata.
CREATE OR REPLACE VIEW course_enrollment_summary AS
SELECT
  c.course_id,
  c.title,
  c.category,
  c.start_date,
  c.end_date,
  c.class_time,
  c.location,
  c.capacity,
  c.status,
  c.image_url,
  c.contact_phone,
  c.is_deleted,
  c.created_at,
  c.updated_at,
  COALESCE(enrollment_counts.enrolled, 0) AS enrolled
FROM courses AS c
LEFT JOIN (
  SELECT course_id, COUNT(*) AS enrolled
  FROM course_enrollments
  GROUP BY course_id
) AS enrollment_counts
ON c.course_id = enrollment_counts.course_id;


COMMIT;
