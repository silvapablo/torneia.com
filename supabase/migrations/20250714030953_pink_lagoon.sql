/*
  # Reset completo do sistema de autenticação

  1. Tabelas
    - `auth_users` - Usuários do sistema
    - `companies` - Empresas/clientes
    - `employees` - Funcionários vinculados às empresas
    
  2. Roles
    - admin: Acesso total ao sistema
    - client: Acesso ao dashboard do cliente
    - employee: Acesso ao dashboard do funcionário
    
  3. Credenciais padrão
    - admin@cleanflowpro.com (admin)
    - assinante@cleanflowpro.com (client) 
    - funcionario@cleanflowpro.com (employee)
*/

-- Limpar dados existentes
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS auth_users CASCADE;

-- Criar tabela de usuários
CREATE TABLE auth_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'client', 'employee')),
  name text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de empresas
CREATE TABLE companies (
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
  user_id uuid REFERENCES auth_users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de funcionários
CREATE TABLE employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  position text,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth_users(id) ON DELETE CASCADE,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE auth_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para auth_users
CREATE POLICY "Users can read own data" ON auth_users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can read all users" ON auth_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth_users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas RLS para companies
CREATE POLICY "Companies can read own data" ON companies
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can read all companies" ON companies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth_users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas RLS para employees
CREATE POLICY "Employees can read own data" ON employees
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Companies can read their employees" ON employees
  FOR SELECT USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all employees" ON employees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth_users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Função para hash de senha (simulada - em produção usar bcrypt)
CREATE OR REPLACE FUNCTION hash_password(password text)
RETURNS text AS $$
BEGIN
  -- Em produção, usar bcrypt ou similar
  -- Por simplicidade, usando encode com digest
  RETURN encode(digest(password || 'cleanflow_salt', 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Inserir credenciais padrão
INSERT INTO auth_users (email, password_hash, role, name) VALUES
  ('admin@cleanflowpro.com', hash_password('admin123'), 'admin', 'Administrador'),
  ('assinante@cleanflowpro.com', hash_password('admin123'), 'client', 'Cliente Assinante'),
  ('funcionario@cleanflowpro.com', hash_password('admin123'), 'employee', 'Funcionário');

-- Inserir empresa para o cliente
INSERT INTO companies (name, email, phone, user_id)
SELECT 
  'Empresa Assinante LTDA',
  'assinante@cleanflowpro.com',
  '(11) 99999-9999',
  id
FROM auth_users WHERE email = 'assinante@cleanflowpro.com';

-- Inserir funcionário vinculado à empresa
INSERT INTO employees (name, email, position, company_id, user_id)
SELECT 
  'Funcionário da Empresa',
  'funcionario@cleanflowpro.com',
  'Operador de Limpeza',
  c.id,
  u.id
FROM auth_users u, companies c 
WHERE u.email = 'funcionario@cleanflowpro.com' 
AND c.email = 'assinante@cleanflowpro.com';

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_auth_users_updated_at
  BEFORE UPDATE ON auth_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();