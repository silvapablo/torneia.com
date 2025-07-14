/*
  # Verificação e Completude do Setup do Banco

  Este arquivo verifica se todas as tabelas necessárias existem e estão configuradas corretamente.
  
  ## Tabelas Verificadas:
  1. **tournaments** - Sistema de torneios
  2. **tournament_participants** - Participantes dos torneios  
  3. **auth_users** - Sistema de autenticação customizado
  4. **companies** - Empresas/clientes
  5. **employees** - Funcionários
  6. **profiles** - Perfis de usuários (já existe)

  ## Segurança:
  - RLS habilitado em todas as tabelas
  - Políticas de acesso configuradas
  - Triggers de atualização automática
*/

-- Verificar se a tabela tournaments existe, se não, criar
CREATE TABLE IF NOT EXISTS tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  game_type text NOT NULL CHECK (game_type IN ('chess', 'buraco')),
  buy_in numeric DEFAULT 0,
  prize_pool numeric DEFAULT 0,
  current_players integer DEFAULT 0,
  max_players integer NOT NULL,
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'finished')),
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  type text NOT NULL CHECK (type IN ('blitz', 'rapid', 'elite')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Verificar se a tabela tournament_participants existe, se não, criar
CREATE TABLE IF NOT EXISTS tournament_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);

-- Verificar se a tabela auth_users existe, se não, criar
CREATE TABLE IF NOT EXISTS auth_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'client', 'employee')),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Verificar se a tabela companies existe, se não, criar
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  address text,
  city text,
  state text,
  zip_code text,
  subscription_plan text DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')),
  subscription_status text DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'suspended')),
  user_id uuid NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Verificar se a tabela employees existe, se não, criar
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  position text,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Políticas para tournaments
DROP POLICY IF EXISTS "tournaments_select_policy" ON tournaments;
CREATE POLICY "tournaments_select_policy"
  ON tournaments
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "tournaments_insert_policy" ON tournaments;
CREATE POLICY "tournaments_insert_policy"
  ON tournaments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Políticas para tournament_participants
DROP POLICY IF EXISTS "participants_select_policy" ON tournament_participants;
CREATE POLICY "participants_select_policy"
  ON tournament_participants
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "participants_insert_policy" ON tournament_participants;
CREATE POLICY "participants_insert_policy"
  ON tournament_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "participants_delete_policy" ON tournament_participants;
CREATE POLICY "participants_delete_policy"
  ON tournament_participants
  FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para auth_users
DROP POLICY IF EXISTS "auth_users_select_policy" ON auth_users;
CREATE POLICY "auth_users_select_policy"
  ON auth_users
  FOR SELECT
  TO public
  USING (true);

-- Políticas para companies
DROP POLICY IF EXISTS "companies_select_policy" ON companies;
CREATE POLICY "companies_select_policy"
  ON companies
  FOR SELECT
  TO authenticated
  USING (true);

-- Políticas para employees
DROP POLICY IF EXISTS "employees_select_policy" ON employees;
CREATE POLICY "employees_select_policy"
  ON employees
  FOR SELECT
  TO authenticated
  USING (true);

-- Trigger para atualizar current_players automaticamente
CREATE OR REPLACE FUNCTION update_tournament_players()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tournaments 
    SET current_players = (
      SELECT COUNT(*) 
      FROM tournament_participants 
      WHERE tournament_id = NEW.tournament_id
    )
    WHERE id = NEW.tournament_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tournaments 
    SET current_players = (
      SELECT COUNT(*) 
      FROM tournament_participants 
      WHERE tournament_id = OLD.tournament_id
    )
    WHERE id = OLD.tournament_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tournament_participants_count_trigger ON tournament_participants;
CREATE TRIGGER tournament_participants_count_trigger
  AFTER INSERT OR DELETE ON tournament_participants
  FOR EACH ROW EXECUTE FUNCTION update_tournament_players();

-- Inserir dados de teste se não existirem
INSERT INTO auth_users (email, password_hash, name, role) 
VALUES 
  ('admin@cleanflowpro.com', encode(digest('admin123cleanflow_salt', 'sha256'), 'base64'), 'Administrador', 'admin'),
  ('assinante@cleanflowpro.com', encode(digest('admin123cleanflow_salt', 'sha256'), 'base64'), 'Cliente Assinante', 'client'),
  ('funcionario@cleanflowpro.com', encode(digest('admin123cleanflow_salt', 'sha256'), 'base64'), 'Funcionário', 'employee')
ON CONFLICT (email) DO NOTHING;

-- Inserir empresa de teste
DO $$
DECLARE
  client_user_id uuid;
  company_id uuid;
  employee_user_id uuid;
BEGIN
  -- Buscar ID do usuário cliente
  SELECT id INTO client_user_id FROM auth_users WHERE email = 'assinante@cleanflowpro.com';
  
  -- Inserir empresa se não existir
  INSERT INTO companies (name, email, phone, user_id, subscription_plan)
  VALUES ('Empresa Teste Ltda', 'assinante@cleanflowpro.com', '(11) 99999-9999', client_user_id, 'premium')
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO company_id;
  
  -- Se não retornou ID, buscar o existente
  IF company_id IS NULL THEN
    SELECT id INTO company_id FROM companies WHERE email = 'assinante@cleanflowpro.com';
  END IF;
  
  -- Buscar ID do usuário funcionário
  SELECT id INTO employee_user_id FROM auth_users WHERE email = 'funcionario@cleanflowpro.com';
  
  -- Inserir funcionário se não existir
  INSERT INTO employees (name, email, position, company_id, user_id)
  VALUES ('João Silva', 'funcionario@cleanflowpro.com', 'Técnico de Limpeza', company_id, employee_user_id)
  ON CONFLICT (email) DO NOTHING;
END $$;

-- Inserir torneios de exemplo
INSERT INTO tournaments (name, game_type, buy_in, prize_pool, max_players, start_time, type)
VALUES 
  ('Torneio de Xadrez Blitz', 'chess', 50.00, 500.00, 16, now() + interval '1 day', 'blitz'),
  ('Campeonato de Buraco', 'buraco', 100.00, 1000.00, 32, now() + interval '3 days', 'elite'),
  ('Xadrez Rápido Semanal', 'chess', 25.00, 200.00, 8, now() + interval '7 days', 'rapid')
ON CONFLICT DO NOTHING;