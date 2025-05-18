-- StudySync Physical Data Model
-- SQL DDL for Supabase (PostgreSQL)

-- 2. Users table
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  created_at    TIMESTAMP   NOT NULL DEFAULT now()
);

-- 3. Study groups
DROP TABLE IF EXISTS study_groups CASCADE;
CREATE TABLE study_groups (
  id          SERIAL PRIMARY KEY,
  name        TEXT      NOT NULL,
  description TEXT,
  created_by  INTEGER   NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMP NOT NULL DEFAULT now()
);

-- 4. Group members (N:N relationship)
DROP TABLE IF EXISTS group_members;
CREATE TABLE group_members (
  group_id INTEGER NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id  INTEGER NOT NULL REFERENCES users(id)        ON DELETE CASCADE,
  role     TEXT    NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

DROP VIEW IF EXISTS group_sync_status;
CREATE VIEW group_sync_status AS
SELECT
  g.id                 AS group_id,
  g.name               AS group_name,
  t.due_date,
  COUNT(t.id)          AS total_tasks,
  SUM((t.status = 'done')::int) AS done_tasks,
  CASE
    WHEN COUNT(t.id) = 0 THEN NULL
    WHEN COUNT(t.id) = SUM((t.status = 'done')::int) THEN true
    ELSE false
  END AS all_synced
FROM study_groups g
LEFT JOIN tasks t ON t.group_id = g.id
GROUP BY g.id, g.name, t.due_date
ORDER BY g.id, t.due_date;

-- 5. Tasks
DROP TABLE IF EXISTS tasks CASCADE;
CREATE TABLE tasks (
  id          SERIAL       PRIMARY KEY,
  group_id    INTEGER      NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id     INTEGER      NOT NULL REFERENCES users(id)        ON DELETE CASCADE,
  title       TEXT         NOT NULL,
  description TEXT,
  due_date    DATE         NOT NULL,
  status      task_status  NOT NULL DEFAULT 'to-do', -- CORRIGIDO AQUI
  created_at  TIMESTAMP    NOT NULL DEFAULT now(),
  updated_at  TIMESTAMP    NOT NULL DEFAULT now()
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE PROCEDURE fn_update_timestamp();

-- 6. Pomodoro sessions (optional)
DROP TABLE IF EXISTS pomodoro_sessions;
CREATE TABLE pomodoro_sessions (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id          INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
  start_time       TIMESTAMP NOT NULL,
  end_time         TIMESTAMP NOT NULL,
  duration_minutes INTEGER NOT NULL
);

-- 7. Calendar events (shared calendar)
DROP TABLE IF EXISTS calendar_events;
CREATE TABLE calendar_events (
  id          SERIAL PRIMARY KEY,
  group_id    INTEGER NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  title       TEXT    NOT NULL,
  description TEXT,
  start_time  TIMESTAMP NOT NULL,
  end_time    TIMESTAMP NOT NULL
);