import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, MessageCircle, FileText, TrendingUp, ArrowRight, Mail, Lock, User, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LandingPageProps {
  onAuthSuccess: () => void;
}

export function LandingPage({ onAuthSuccess }: LandingPageProps) {
  const [mode, setMode] = useState<'marketing' | 'login' | 'register'>('marketing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Por favor, insira um e-mail válido.');
      return;
    }
    
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    
    if (mode === 'register' && name.trim().length < 3) {
      setError('Por favor, insira seu nome completo.');
      return;
    }

    setIsLoading(true);

    try {
      // --- BACKEND STANDBY ---
      // Caso queira voltar a usar o backend, descomente as linhas abaixo:
      /*
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const payload = mode === 'register' ? { name, email, password } : { email, password };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Ocorreu um erro. Tente novamente.');
        setIsLoading(false);
        return;
      }
      localStorage.setItem('erp_auth_token', data.token);
      */
      
      // --- LOGICA LOCALSTORAGE (Atual) ---
      const usersStr = localStorage.getItem('erp_users');
      const users = usersStr ? JSON.parse(usersStr) : [];
      
      if (mode === 'register') {
        const existing = users.find((u: any) => u.email === email);
        if (existing) {
          setError('Email já cadastrado.');
          setIsLoading(false);
          return;
        }
        const newUser = { id: Date.now().toString(), name, email, password };
        users.push(newUser);
        localStorage.setItem('erp_users', JSON.stringify(users));
        localStorage.setItem('erp_auth_token', 'local-token-' + newUser.id);
      } else {
        const user = users.find((u: any) => u.email === email && u.password === password);
        if (!user) {
          setError('E-mail ou senha inválidos.');
          setIsLoading(false);
          return;
        }
        localStorage.setItem('erp_auth_token', 'local-token-' + user.id);
      }

      onAuthSuccess();
    } catch (err) {
      console.error(err);
      setError('Falha de conexão com o servidor.');
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
      title: 'Ordem de Serviço em segundos',
      description: 'Crie e gerencie OS de forma rápida e intuitiva.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-blue-500" />,
      title: 'Checklist com foto na entrada',
      description: 'A prova fica salva, acabou acusação falsa de clientes.'
    },
    {
      icon: <MessageCircle className="w-6 h-6 text-green-500" />,
      title: 'Aviso Automático no WhatsApp',
      description: 'Cliente avisado automaticamente em cada etapa do serviço.'
    },
    {
      icon: <FileText className="w-6 h-6 text-indigo-500" />,
      title: 'Nota fiscal em 1 clique',
      description: 'Emissão simplificada sem burocracia.'
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-amber-500" />,
      title: 'Financeiro Claro',
      description: 'Saiba exatamente quanto entrou, saiu e quanto você REALMENTE lucrou.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl mb-6 shadow-lg shadow-blue-200">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            O ERP Definitivo para o seu Negócio
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Projetado para mobile, tablet e desktop. Assuma o controle total da sua operação hoje mesmo.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Tudo que você precisa:</h2>
            <ul className="space-y-6">
              {features.map((feature, idx) => (
                <li key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">{feature.icon}</div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{feature.title}</h3>
                    <p className="text-slate-500 text-sm mt-1">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          <AnimatePresence mode="wait">
            {mode === 'marketing' ? (
              <motion.div 
                key="marketing"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col justify-center items-center bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white text-center shadow-2xl shadow-blue-900/20"
              >
                <h2 className="text-3xl font-bold mb-4">Pronto para transformar sua gestão?</h2>
                <p className="text-blue-100 mb-8 text-lg">
                  Sem taxas escondidas. Sem necessidade de cartão de crédito.
                </p>
                <button 
                  onClick={() => setMode('register')}
                  className="group relative w-full inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 mb-4"
                >
                  Cadastre-se e teste grátis
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => setMode('login')}
                  className="w-full inline-flex items-center justify-center gap-2 bg-transparent border border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-colors"
                >
                  Já tenho uma conta
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-3xl p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-center"
              >
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {mode === 'login' ? 'Acesse sua conta' : 'Crie sua conta'}
                </h2>
                <p className="text-slate-500 mb-6">
                  {mode === 'login' ? 'Bem-vindo de volta! Insira seus dados.' : 'Comece seu teste grátis de 14 dias hoje.'}
                </p>

                {error && (
                  <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex gap-3 text-rose-700 text-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'register' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nome completo</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" 
                          placeholder="Seu nome"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" 
                        placeholder={mode === 'login' ? 'admin@gestaopro.com' : 'seu@email.com'}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" 
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-600/30 transition-all mt-6 disabled:opacity-70"
                  >
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : mode === 'login' ? 'Entrar' : 'Começar Agora'}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button 
                    onClick={() => {
                      setMode(mode === 'login' ? 'register' : 'login');
                      setError('');
                    }}
                    className="text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors"
                  >
                    {mode === 'login' ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entrar'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
