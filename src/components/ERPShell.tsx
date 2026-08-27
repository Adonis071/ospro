import React, { useState } from 'react';
import { Menu, X, Home, FileText, PieChart, Plus, Bell, LogOut, User, Settings } from 'lucide-react';
import { ViewState } from '../types';
import { useNotifications } from '../context/NotificationContext';

interface ERPShellProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export function ERPShell({ currentView, onNavigate, onLogout, children }: ERPShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { unreadCount } = useNotifications();

  const navItems = [
    { id: 'dashboard' as ViewState, label: 'Visão Geral', icon: Home },
    { id: 'orders' as ViewState, label: 'Ordens de Serviço', icon: FileText },
    { id: 'finance' as ViewState, label: 'Financeiro', icon: PieChart },
  ];

  const handleNav = (view: ViewState) => {
    onNavigate(view);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="flex items-center justify-between p-4 md:px-8">
            <div className="flex items-center gap-4">
              <button 
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setIsMenuOpen(true)}
                aria-label="Abrir menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold text-slate-800">GestãoPro</h1>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => onNavigate('notifications')}
                className={`p-2 rounded-full transition-colors relative ${currentView === 'notifications' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>
              <div className="relative">
                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden flex items-center justify-center hover:bg-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span className="text-sm font-bold text-slate-500 hover:text-slate-700">AD</span>
                </button>
                
                {isProfileMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsProfileMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden transform origin-top-right transition-all">
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                        <p className="text-sm font-bold text-slate-800">Administrador</p>
                        <p className="text-xs text-slate-500 font-medium truncate mt-0.5">admin@gestaopro.com</p>
                      </div>
                      <div className="p-2">
                        <button 
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg flex items-center gap-2.5 transition-colors"
                        >
                          <User className="w-4 h-4" /> 
                          Meu Perfil
                        </button>
                        <button 
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg flex items-center gap-2.5 transition-colors"
                        >
                          <Settings className="w-4 h-4" /> 
                          Configurações
                        </button>
                      </div>
                      <div className="p-2 border-t border-slate-100">
                        <button 
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onLogout();
                          }}
                          className="w-full text-left px-3 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2.5 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> 
                          Sair do Sistema
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Drawer */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div 
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
              onClick={() => setIsMenuOpen(false)} 
            />
            <div className="relative w-72 max-w-[80%] bg-slate-900 flex flex-col h-full shadow-2xl animate-in slide-in-from-left duration-200">
              <div className="p-6 flex items-center justify-between">
                <div className="text-white font-bold text-xl tracking-tight">
                  GestãoPro
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
                <button
                  onClick={() => handleNav('new-order')}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium mb-6 transition-colors shadow-lg shadow-blue-900/20"
                >
                  <Plus className="w-5 h-5" />
                  Nova OS
                </button>

                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                        isActive 
                          ? 'bg-slate-800 text-white' 
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-800">
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800/50 transition-colors text-slate-400 hover:text-white"
                >
                  <LogOut className="w-5 h-5" />
                  Sair
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
