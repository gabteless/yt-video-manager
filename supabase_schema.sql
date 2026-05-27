-- =============================================
-- Controle de Vídeos — Supabase Database Schema
-- Execute no SQL Editor do Supabase Dashboard
-- =============================================

-- Perfil do usuário (criado automaticamente via trigger no signup)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projetos
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Novo Projeto',
  is_completed BOOLEAN DEFAULT FALSE,
  created_at BIGINT NOT NULL,
  completed_at BIGINT
);

-- Índice para queries por user_id
CREATE INDEX idx_projects_user_id ON projects(user_id);

-- Tarefas (vinculadas a projeto)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Nova tarefa',
  "column" TEXT NOT NULL DEFAULT 'novo',
  urgency TEXT NOT NULL DEFAULT 'baixa',
  created_at BIGINT NOT NULL,
  moved_to_production_at BIGINT,
  moved_to_pronto_at BIGINT
);

-- Índice para queries por project_id
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);

-- Estado de gamificação (1 registro por usuário)
CREATE TABLE game_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_active_date TEXT,
  total_projects_completed INTEGER DEFAULT 0,
  total_tasks_created INTEGER DEFAULT 0,
  total_tasks_completed INTEGER DEFAULT 0,
  unlocked_achievements TEXT[] DEFAULT '{}',
  fastest_project BIGINT,
  no_procrastination_project BOOLEAN DEFAULT FALSE
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects
CREATE POLICY "Users CRUD own projects" ON projects
  FOR ALL USING (auth.uid() = user_id);

-- Tasks
CREATE POLICY "Users CRUD own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);

-- Game State
CREATE POLICY "Users CRUD own game_state" ON game_state
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- TRIGGER: Auto-create profile + game_state on signup
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  );
  INSERT INTO game_state (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
