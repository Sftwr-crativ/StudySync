-- StudySync Physical Data Model
-- SQL DDL for Supabase (PostgreSQL)

-- 1. Remova tabelas que usam o tipo ENUM
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS group_members;
DROP TABLE IF EXISTS study_groups CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Task status enum
DROP TYPE IF EXISTS task_status;
CREATE TYPE task_status AS ENUM ('to-do', 'doing', 'done');

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
  id_user     INTEGER    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT      NOT NULL,
  description TEXT,
  created_by  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMP NOT NULL DEFAULT now()
);

-- 4. Group members
DROP TABLE IF EXISTS group_members;
CREATE TABLE group_members (
  group_id INTEGER NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id  INTEGER NOT NULL REFERENCES users(id)        ON DELETE CASCADE,
  role     TEXT    NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

-- 5. Tasks
DROP TABLE IF EXISTS tasks CASCADE;
CREATE TABLE tasks (
  id          SERIAL       PRIMARY KEY,
  group_id    INTEGER      NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id     INTEGER      NOT NULL REFERENCES users(id)        ON DELETE CASCADE,
  title       TEXT         NOT NULL,
  description TEXT,
  due_date    DATE         NOT NULL,
  status      task_status  NOT NULL DEFAULT 'to-do',
  created_at  TIMESTAMP    NOT NULL DEFAULT now(),
  updated_at  TIMESTAMP    NOT NULL DEFAULT now()
);

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

-- 1. Crie a tabela de status (DROP se já existir)
DROP TABLE IF EXISTS group_sync_status;
CREATE TABLE group_sync_status (
  group_id INTEGER NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,
  due_date DATE NOT NULL, 
  total_tasks INTEGER NOT NULL DEFAULT 0,
  done_tasks INTEGER NOT NULL DEFAULT 0,
  all_synced BOOLEAN,
  last_updated TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_id, due_date)
);

-- 2. Função para atualizar o status
CREATE OR REPLACE FUNCTION update_group_sync_status()
RETURNS TRIGGER AS $$
DECLARE
  v_due_date DATE;
BEGIN
  IF TG_TABLE_NAME = 'tasks' THEN
    v_due_date := COALESCE(NEW.due_date, OLD.due_date);
    -- Atualiza só para o due_date afetado
    INSERT INTO group_sync_status (group_id, group_name, due_date, total_tasks, done_tasks, all_synced)
    SELECT 
      g.id,
      g.name,
      v_due_date,
      COUNT(t.id),
      SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END),
      CASE 
        WHEN COUNT(t.id) = 0 THEN NULL
        WHEN COUNT(t.id) = SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) THEN true
        ELSE false
      END
    FROM study_groups g
    LEFT JOIN tasks t ON t.group_id = g.id AND t.due_date = v_due_date
    WHERE g.id = COALESCE(NEW.group_id, OLD.group_id)
    GROUP BY g.id, g.name, v_due_date
    ON CONFLICT (group_id, due_date) 
    DO UPDATE SET
      total_tasks = EXCLUDED.total_tasks,
      done_tasks = EXCLUDED.done_tasks,
      all_synced = EXCLUDED.all_synced,
      last_updated = NOW();
  ELSE
    -- Para novos grupos, atualize para todos os due_dates existentes desse grupo
    FOR v_due_date IN SELECT DISTINCT due_date FROM tasks WHERE group_id = NEW.id LOOP
      INSERT INTO group_sync_status (group_id, group_name, due_date, total_tasks, done_tasks, all_synced)
      SELECT 
        NEW.id,
        NEW.name,
        v_due_date,
        COUNT(t.id),
        SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END),
        CASE 
          WHEN COUNT(t.id) = 0 THEN NULL
          WHEN COUNT(t.id) = SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) THEN true
          ELSE false
        END
      FROM tasks t
      WHERE t.group_id = NEW.id AND t.due_date = v_due_date
      GROUP BY v_due_date
      ON CONFLICT (group_id, due_date) 
      DO UPDATE SET
        total_tasks = EXCLUDED.total_tasks,
        done_tasks = EXCLUDED.done_tasks,
        all_synced = EXCLUDED.all_synced,
        last_updated = NOW();
    END LOOP;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. Triggers para atualização automática
CREATE TRIGGER trg_task_sync_status
AFTER INSERT OR UPDATE OR DELETE ON tasks
FOR EACH ROW EXECUTE FUNCTION update_group_sync_status();

-- 4. Trigger para novos grupos
CREATE TRIGGER trg_group_sync_status
AFTER INSERT ON study_groups
FOR EACH ROW EXECUTE FUNCTION update_group_sync_status();

-- 5. Preencha a tabela com dados iniciais (opcional)