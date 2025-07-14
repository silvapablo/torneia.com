import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  UserCheck, 
  Calendar, 
  MapPin, 
  Clock,
  CheckCircle,
  AlertCircle,
  LogOut,
  Building2
} from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const { user, employee, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const stats = [
    { label: 'Tarefas Hoje', value: '6', icon: Calendar, color: 'blue' },
    { label: 'Concluídas', value: '4', icon: CheckCircle, color: 'green' },
    { label: 'Pendentes', value: '2', icon: AlertCircle, color: 'orange' },
    { label: 'Horas Trabalhadas', value: '6.5h', icon: Clock, color: 'purple' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <UserCheck className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  CleanFlow PRO - Funcionário
                </h1>
                <p className="text-sm text-gray-600">
                  {employee?.company?.name || 'Dashboard do Funcionário'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Olá, {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bem-vindo ao seu Dashboard
          </h2>
          <p className="text-gray-600">
            Gerencie suas tarefas e horários de trabalho
          </p>
        </div>

        {/* Employee Info */}
        {employee && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Suas Informações
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center">
                <UserCheck className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Cargo</p>
                  <p className="font-medium">{employee.position || 'Funcionário'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Empresa</p>
                  <p className="font-medium">{employee.company?.name}</p>
                </div>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium text-green-600">
                    {employee.active ? 'Ativo' : 'Inativo'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tasks and Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tarefas de Hoje
            </h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Limpeza Escritório A</p>
                  <p className="text-xs text-gray-500">08:00 - 10:00</p>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Concluída
                </span>
              </div>
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Limpeza Banheiros</p>
                  <p className="text-xs text-gray-500">10:30 - 11:30</p>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Concluída
                </span>
              </div>
              <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-600 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Limpeza Sala de Reuniões</p>
                  <p className="text-xs text-gray-500">14:00 - 15:00</p>
                </div>
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                  Pendente
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Próximas Tarefas
            </h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium">Limpeza Geral - Andar 2</p>
                  <p className="text-xs text-gray-500">Amanhã, 09:00</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium">Limpeza Externa</p>
                  <p className="text-xs text-gray-500">Quinta, 08:00</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium">Manutenção Equipamentos</p>
                  <p className="text-xs text-gray-500">Sexta, 16:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};