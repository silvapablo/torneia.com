import React from 'react';
import { useAuth } from './hooks/useAuth';
import { LandingPage } from './components/LandingPage/LandingPage';
import { AdminDashboard } from './components/Dashboards/AdminDashboard';
import { ClientDashboard } from './components/Dashboards/ClientDashboard';
import { EmployeeDashboard } from './components/Dashboards/EmployeeDashboard';
import { Loader2 } from 'lucide-react';

function App() {
  const { user, loading, isAuthenticated } = useAuth();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show login
  if (!isAuthenticated || !user) {
    return <LandingPage />;
  }

  // Authenticated - show appropriate dashboard based on role
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'client':
      return <ClientDashboard />;
    case 'employee':
      return <EmployeeDashboard />;
    default:
      return <LoginPage />;
  }
}

export default App;