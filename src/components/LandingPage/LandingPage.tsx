import React, { useState } from 'react';
import { Trophy, Users, Calendar, Star, ArrowRight, Play, Crown, Zap } from 'lucide-react';
import { LoginModal } from '../Auth/LoginModal';
import { RegisterModal } from '../Auth/RegisterModal';

export const LandingPage: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white">
      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <span className="text-2xl font-bold">TORNEIA</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Entrar
            </button>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-bold transition-colors"
            >
              Cadastrar
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
              TORNEIA
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              A plataforma definitiva para torneios de <span className="text-yellow-400 font-bold">Xadrez</span> e <span className="text-yellow-400 font-bold">Buraco</span>. 
              Compete, evolui e conquista o topo!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => setShowRegisterModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center"
            >
              <Play className="w-6 h-6 mr-2" />
              Começar a Jogar
            </button>
            <button className="px-8 py-4 border-2 border-white/20 rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center">
              <Trophy className="w-6 h-6 mr-2" />
              Ver Torneios
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">1,200+</div>
              <div className="text-gray-400">Jogadores Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">50+</div>
              <div className="text-gray-400">Torneios/Mês</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">R$ 10k+</div>
              <div className="text-gray-400">Em Prêmios</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">24/7</div>
              <div className="text-gray-400">Disponível</div>
            </div>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="px-6 py-20 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Escolha Seu <span className="text-yellow-400">Jogo</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Chess */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                  <Crown className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Xadrez</h3>
                  <p className="text-gray-400">O jogo dos reis</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6">
                Participe de torneios de xadrez com diferentes formatos: blitz, rápido e clássico. 
                Sistema de rating ELO para acompanhar sua evolução.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-yellow-400 font-bold">Rating inicial: 1200</span>
                <ArrowRight className="w-5 h-5 text-yellow-400" />
              </div>
            </div>

            {/* Buraco */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Buraco</h3>
                  <p className="text-gray-400">Tradição brasileira</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6">
                Torneios de buraco em duplas ou individual. Sistema de pontuação tradicional 
                com ranking nacional e regional.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-yellow-400 font-bold">Rating inicial: 1200</span>
                <ArrowRight className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Por que escolher o <span className="text-yellow-400">TORNEIA</span>?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-bold mb-4">Torneios Profissionais</h3>
              <p className="text-gray-400">
                Organize e participe de torneios com sistema de brackets, eliminatórias e finais emocionantes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Sistema de Rating</h3>
              <p className="text-gray-400">
                Acompanhe sua evolução com sistema de rating oficial e rankings atualizados em tempo real.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Prêmios Reais</h3>
              <p className="text-gray-400">
                Ganhe prêmios em dinheiro, troféus e reconhecimento na comunidade de jogadores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-yellow-400 to-orange-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-black mb-6">
            Pronto para Dominar?
          </h2>
          <p className="text-xl text-black/80 mb-8">
            Junte-se a milhares de jogadores e comece sua jornada rumo ao topo!
          </p>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-8 py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors flex items-center justify-center mx-auto"
          >
            <Play className="w-6 h-6 mr-2" />
            Cadastrar Agora - É Grátis!
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-black">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <span className="text-xl font-bold">TORNEIA</span>
          </div>
          <p className="text-gray-400">
            © 2024 TORNEIA. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={handleSwitchToRegister}
      />
      
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  );
};