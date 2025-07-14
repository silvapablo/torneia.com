import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false, // Sessão não persiste entre fechamentos do navegador
    detectSessionInUrl: true
  }
});

// Types para CleanFlow PRO
export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'client' | 'employee';
  name: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  subscription_plan: 'basic' | 'premium' | 'enterprise';
  subscription_status: 'active' | 'inactive' | 'suspended';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  company_id: string;
  user_id: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Função para hash de senha (deve coincidir com o backend)
export const hashPassword = (password: string): string => {
  // Em produção, usar uma biblioteca adequada como bcrypt
  // Por simplicidade, usando o mesmo método do SQL
  return btoa(password + 'cleanflow_salt'); // Base64 simples para demo
};

// Função de login
export const loginUser = async (email: string, password: string) => {
  try {
    const hashedPassword = hashPassword(password);
    
    const { data, error } = await supabase
      .from('auth_users')
      .select('*')
      .eq('email', email)
      .eq('password_hash', hashedPassword)
      .eq('active', true)
      .single();

    if (error || !data) {
      throw new Error('Credenciais inválidas');
    }

    // Criar sessão customizada
    const sessionData = {
      user: data,
      access_token: btoa(JSON.stringify({ userId: data.id, role: data.role, timestamp: Date.now() })),
      expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
    };

    // Armazenar no sessionStorage (não persiste entre fechamentos)
    sessionStorage.setItem('cleanflow_session', JSON.stringify(sessionData));

    return { user: data, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

// Função de registro
export const registerUser = async (userData: {
  email: string;
  password: string;
  name: string;
  username: string;
  cpf: string;
}) => {
  userData: { name: string; username: string; cpf: string }
    const hashedPassword = hashPassword(userData.password);
  const { data, error } = await supabase.rpc('register_user', {
    user_email: email,
    user_password: password,
    user_data: userData
  });

  if (error) {
    return { data: null, error: error.message };
  }

  if (data.error) {
    return { data: null, error: data.error };
  }

  return { data: data.user, error: null };
};

// Função de logout
export const logoutUser = async () => {
  try {
    // Remover sessão customizada
    sessionStorage.removeItem('cleanflow_session');
    
    // Limpar abas ativas
    localStorage.removeItem('cleanflow_tabs');
    
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Função para obter sessão atual
export const getCurrentSession = () => {
  try {
    const sessionStr = sessionStorage.getItem('cleanflow_session');
    if (!sessionStr) return null;

    const session = JSON.parse(sessionStr);
    
    // Verificar se a sessão expirou
    if (Date.now() > session.expires_at) {
      sessionStorage.removeItem('cleanflow_session');
      return null;
    }

    return session;
  } catch {
    return null;
  }
};

// Função para obter dados do usuário com relacionamentos
export const getUserWithRelations = async (userId: string, role: string) => {
  try {
    if (role === 'client') {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      return { data, error };
    }
    
    if (role === 'employee') {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          company:companies(*)
        `)
        .eq('user_id', userId)
        .single();
      
      return { data, error };
    }

    return { data: null, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};