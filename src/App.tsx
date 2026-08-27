import React, { useState } from 'react';
import { ViewState } from './types';
import { LandingPage } from './components/LandingPage';
import { ERPShell } from './components/ERPShell';
import { FinanceDashboard } from './components/FinanceDashboard';
import { NewOrderForm } from './components/NewOrderForm';
import { OrdersDashboard } from './components/OrdersDashboard';
import { NotificationsDashboard } from './components/NotificationsDashboard';
import { NewCustomerForm } from './components/NewCustomerForm';
import { QuoteForm } from './components/QuoteForm';
import { InventoryDashboard } from './components/InventoryDashboard';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, TrendingUp, Users, ArrowRight, UserPlus, FileSignature, Package, AlertTriangle, Clock } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('erp_auth_token');
  });
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');

  const handleAuthSuccess = () => {
    // Note: The token is already set by LandingPage.tsx
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('erp_auth_token');
    setIsAuthenticated(false);
    setCurrentView('dashboard');
  };

  if (!isAuthenticated) {
    return <LandingPage onAuthSuccess={handleAuthSuccess} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'finance':
        return <FinanceDashboard />;
      case 'new-order':
        return <NewOrderForm onSuccess={() => setCurrentView('orders')} />;
      case 'orders':
        return <OrdersDashboard />;
      case 'notifications':
        return <NotificationsDashboard />;
      case 'new-customer':
        return <NewCustomerForm onSuccess={() => setCurrentView('dashboard')} />;
      case 'quote':
        return <QuoteForm onSuccess={() => setCurrentView('dashboard')} />;
      case 'inventory':
        return <InventoryDashboard />;
      case 'dashboard':
      default:
        return <OverviewDashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <ERPShell 
      currentView={currentView} 
      onNavigate={setCurrentView}
      onLogout={handleLogout}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </ERPShell>
  );
}

function OverviewDashboard({ onNavigate }: { onNavigate: (v: ViewState) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Olá, Administrador 👋</h2>
          <p className="text-slate-500 mt-1">Aqui está o resumo da sua operação hoje.</p>
        </div>
        <button 
          onClick={() => onNavigate('new-order')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/30 transition-colors"
        >
          + Nova OS Rápida
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold text-slate-800">12</div>
          <div className="text-slate-500 font-medium mt-1">OS Concluídas Hoje</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold text-slate-800">R$ 4.250</div>
          <div className="text-slate-500 font-medium mt-1">Faturado Hoje</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
            <Users className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold text-slate-800">5</div>
          <div className="text-slate-500 font-medium mt-1">OS Aguardando Aprovação</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <button 
          onClick={() => onNavigate('new-customer')}
          className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:bg-slate-50 hover:border-blue-200 transition-all group"
        >
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <UserPlus className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-slate-700">Novo Cliente</span>
        </button>
        <button 
          onClick={() => onNavigate('quote')}
          className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:bg-slate-50 hover:border-blue-200 transition-all group"
        >
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <FileSignature className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-slate-700">Orçamento</span>
        </button>
        <button 
          onClick={() => onNavigate('inventory')}
          className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:bg-slate-50 hover:border-blue-200 transition-all group"
        >
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Package className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-slate-700">Estoque</span>
        </button>
        <button 
          onClick={() => onNavigate('notifications')}
          className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:bg-slate-50 hover:border-blue-200 transition-all group"
        >
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-slate-700">Avisos</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Pendências e Alertas</h3>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-4">
            <div className="flex gap-4 items-start p-3 bg-rose-50 rounded-xl border border-rose-100">
               <div className="mt-0.5 text-rose-500">
                 <Clock className="w-5 h-5" />
               </div>
               <div>
                 <div className="font-bold text-rose-800">2 Serviços Atrasados</div>
                 <div className="text-sm text-rose-600 mt-1">OS-1038 e OS-1039 passaram do prazo de entrega.</div>
               </div>
            </div>
            <div className="flex gap-4 items-start p-3 bg-amber-50 rounded-xl border border-amber-100">
               <div className="mt-0.5 text-amber-500">
                 <Package className="w-5 h-5" />
               </div>
               <div>
                 <div className="font-bold text-amber-800">Peça Aguardando Retirada</div>
                 <div className="text-sm text-amber-600 mt-1">Tela iPhone 13 (OS-1041) chegou no fornecedor.</div>
               </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Últimas Atividades</h3>
            <button 
              onClick={() => onNavigate('orders')}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Ver todas <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-2">
             <div className="p-4 border-b border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-lg">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                   CO
                 </div>
                 <div>
                   <div className="font-bold text-slate-800">Carlos Oliveira</div>
                   <div className="text-sm text-slate-500">Revisão Motor + Suspensão</div>
                 </div>
               </div>
               <div className="text-right">
                 <div className="font-bold text-emerald-600">R$ 1.850,00</div>
                 <div className="text-xs text-slate-400">Há 10 min</div>
               </div>
             </div>
             
             <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-lg">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                   MS
                 </div>
                 <div>
                   <div className="font-bold text-slate-800">Marina Silva</div>
                   <div className="text-sm text-slate-500">Troca de Tela iPhone 13</div>
                 </div>
               </div>
               <div className="text-right">
                 <div className="font-bold text-emerald-600">R$ 850,00</div>
                 <div className="text-xs text-slate-400">Há 1 hora</div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
