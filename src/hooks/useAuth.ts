import { useState, useEffect } from 'react';
import { 
  AuthUser, 
  Company, 
  Employee, 
  loginUser, 
  registerUser,
  logoutUser, 
  getCurrentSession,
  getUserWithRelations 
} from '../lib/supabase';

interface AuthState {
  user: AuthUser | null;
  company: Company | null;
  employee: Employee | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    company: null,
    employee: null,
    loading: true,
    isAuthenticated: false
  });

  useEffect(() => {
    // Configurar logout automático quando todas as abas fecham
    const setupAutoLogout = () => {
      const tabId = Math.random().toString(36).substring(2);
      sessionStorage.setItem('tab_id', tabId);
      
      // Registrar aba ativa
      const activeTabs = JSON.parse(localStorage.getItem('cleanflow_tabs') || '[]');
      activeTabs.push(tabId);
      localStorage.setItem('cleanflow_tabs', JSON.stringify(activeTabs));

      // Cleanup ao fechar aba
      const handleBeforeUnload = () => {
        const currentTabs = JSON.parse(localStorage.getItem('cleanflow_tabs') || '[]');
        const updatedTabs = currentTabs.filter((id: string) => id !== tabId);
        
        if (updatedTabs.length === 0) {
          // Última aba fechando - fazer logout
          sessionStorage.removeItem('cleanflow_session');
          localStorage.removeItem('cleanflow_tabs');
        } else {
          localStorage.setItem('cleanflow_tabs', JSON.stringify(updatedTabs));
        }
      };

      // Cleanup periódico de abas inativas
      const cleanupInterval = setInterval(() => {
        const currentTabId = sessionStorage.getItem('tab_id');
        if (currentTabId) {
          const activeTabs = JSON.parse(localStorage.getItem('cleanflow_tabs') || '[]');
          if (!activeTabs.includes(currentTabId)) {
            activeTabs.push(currentTabId);
            localStorage.setItem('cleanflow_tabs', JSON.stringify(activeTabs));
          }
        }
      }, 30000);

      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('unload', handleBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('unload', handleBeforeUnload);
        clearInterval(cleanupInterval);
      };
    };

    const cleanup = setupAutoLogout();

    // Verificar sessão existente
    const checkSession = async () => {
      try {
        const session = getCurrentSession();
        
        if (session && session.user) {
          const { data: relationData } = await getUserWithRelations(
            session.user.id, 
            session.user.role
          );

          setAuthState({
            user: session.user,
            company: session.user.role === 'client' ? relationData : null,
            employee: session.user.role === 'employee' ? relationData : null,
            loading: false,
            isAuthenticated: true
          });
        } else {
          setAuthState({
            user: null,
            company: null,
            employee: null,
            loading: false,
            isAuthenticated: false
          });
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setAuthState({
          user: null,
          company: null,
          employee: null,
          loading: false,
          isAuthenticated: false
        });
      }
    };

    checkSession();

    return cleanup;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));

      const { user, error } = await loginUser(email, password);
      
      if (error || !user) {
        throw new Error(error || 'Falha no login');
      }

      // Buscar dados relacionados baseado no role
      const { data: relationData } = await getUserWithRelations(user.id, user.role);

      setAuthState({
        user,
        company: user.role === 'client' ? relationData : null,
        employee: user.role === 'employee' ? relationData : null,
        loading: false,
        isAuthenticated: true
      });

      return { success: true, error: null };
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: false, error: error.message };
    }
  };

  const signUp = async (userData: {
    email: string;
    password: string;
    name: string;
    username: string;
    cpf: string;
  }) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));

      const { user, error } = await registerUser(userData);
      
      if (error || !user) {
        throw new Error(error || 'Falha no cadastro');
      }

      // Após registro bem-sucedido, fazer login automático
      const loginResult = await login(userData.email, userData.password);
      
      return loginResult;
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setAuthState({
        user: null,
        company: null,
        employee: null,
        loading: false,
        isAuthenticated: false
      });
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
    userData: { name: string; username: string; cpf: string }
  }

  const getDashboardRoute = () => {
    if (!authState.user) return '/login';
    
    switch (authState.user.role) {
      case 'admin':
        return '/admin';
      case 'client':
        return '/client';
      case 'employee':
        return '/employee';
      default:
        return '/login';
    }
  };

  return {
    ...authState,
    login,
    signUp,
    logout,
    getDashboardRoute,
    isAdmin: authState.user?.role === 'admin',
    isClient: authState.user?.role === 'client',
    isEmployee: authState.user?.role === 'employee'
  };
};