import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Download, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const dataAnual = [
  { name: 'Jan', receitas: 4000, despesas: 2400, lucro: 1600 },
  { name: 'Fev', receitas: 3000, despesas: 1398, lucro: 1602 },
  { name: 'Mar', receitas: 2000, despesas: 9800, lucro: -7800 },
  { name: 'Abr', receitas: 2780, despesas: 3908, lucro: -1128 },
  { name: 'Mai', receitas: 1890, despesas: 4800, lucro: -2910 },
  { name: 'Jun', receitas: 2390, despesas: 3800, lucro: -1410 },
  { name: 'Jul', receitas: 3490, despesas: 4300, lucro: -810 },
  { name: 'Ago', receitas: 5000, despesas: 2400, lucro: 2600 },
  { name: 'Set', receitas: 8500, despesas: 3100, lucro: 5400 },
];

const dataSemestral = [
  { name: 'Abr', receitas: 2780, despesas: 3908, lucro: -1128 },
  { name: 'Mai', receitas: 1890, despesas: 4800, lucro: -2910 },
  { name: 'Jun', receitas: 2390, despesas: 3800, lucro: -1410 },
  { name: 'Jul', receitas: 3490, despesas: 4300, lucro: -810 },
  { name: 'Ago', receitas: 5000, despesas: 2400, lucro: 2600 },
  { name: 'Set', receitas: 8500, despesas: 3100, lucro: 5400 },
];

const initialTransactions = [
  { id: 1, type: 'receita', title: 'Pagamento OS-1042', amount: 1850.00, date: 'Hoje, 10:45' },
  { id: 2, type: 'despesa', title: 'Compra Peças (Fornecedor A)', amount: 450.00, date: 'Hoje, 09:15' },
  { id: 3, type: 'receita', title: 'Pagamento OS-1041', amount: 850.00, date: 'Ontem, 17:30' },
  { id: 4, type: 'despesa', title: 'Conta de Energia', amount: 280.00, date: 'Ontem, 14:00' },
];

export function FinanceDashboard() {
  const [period, setPeriod] = useState<'anual' | 'semestral'>('anual');
  const [isExporting, setIsExporting] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [transactions, setTransactions] = useLocalStorage('erp_finance_transactions', initialTransactions);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const activeData = period === 'anual' ? dataAnual : dataSemestral;

  const handleGenerateAiSummary = async () => {
    setIsGeneratingAi(true);
    setAiSummary(null);
    try {
      const response = await fetch('/api/gemini/finance-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dataAnual,
          transactions
        })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Falha ao gerar resumo');
      }
      
      setAiSummary(data.summary);
    } catch (error) {
      console.error(error);
      setAiSummary("Não foi possível gerar o resumo. Verifique a chave de API.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    
    // Generate actual CSV content
    const csvContent = [
      ['ID', 'Data', 'Tipo', 'Descricao', 'Valor (R$)'].join(','),
      ...transactions.map((tx: any) => [
        tx.id,
        `"${tx.date}"`,
        tx.type,
        `"${tx.title}"`,
        tx.amount.toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_financeiro_${period}.csv`;

    setTimeout(() => {
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setIsExporting(false);
      setShowExportSuccess(true);
      setTimeout(() => setShowExportSuccess(false), 3000);
    }, 800);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Financeiro Claro</h2>
        
        <div className="flex flex-wrap items-center gap-2">
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value as 'anual' | 'semestral')}
            className="px-3 py-1.5 sm:px-4 sm:py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium text-slate-600 bg-white outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="anual">Este Ano</option>
            <option value="semestral">Últimos 6 Meses</option>
          </select>
          
          <button 
            onClick={handleGenerateAiSummary}
            disabled={isGeneratingAi}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 border rounded-lg font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 sm:gap-2 bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 ${isGeneratingAi ? 'opacity-70 cursor-wait' : ''}`}
          >
            {isGeneratingAi ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            Resumo IA
          </button>
          
          <button 
            onClick={handleExport}
            disabled={isExporting || showExportSuccess}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 border rounded-lg font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 sm:gap-2
              ${showExportSuccess 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }
              ${isExporting ? 'opacity-70 cursor-wait' : ''}
            `}
          >
            {isExporting ? (
              <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            ) : showExportSuccess ? (
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
            <span className="hidden sm:inline">
              {isExporting ? 'Exportando...' : showExportSuccess ? 'Relatório Baixado!' : 'Exportar Relatório'}
            </span>
            <span className="sm:hidden">
              {isExporting ? 'Exportando...' : showExportSuccess ? 'Baixado!' : 'Exportar'}
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center gap-3 mb-2 text-slate-500 font-medium">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            Total Receitas
          </div>
          <div className="text-3xl font-bold text-slate-800 mt-2">R$ 32.950,00</div>
          <div className="text-sm text-emerald-600 font-medium mt-2 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" /> +12% este mês
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center gap-3 mb-2 text-slate-500 font-medium">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
              <TrendingDown className="w-5 h-5" />
            </div>
            Total Despesas
          </div>
          <div className="text-3xl font-bold text-slate-800 mt-2">R$ 14.200,00</div>
          <div className="text-sm text-rose-600 font-medium mt-2 flex items-center gap-1">
            <TrendingDown className="w-4 h-4" /> -5% este mês
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg flex flex-col text-white">
          <div className="flex items-center gap-3 mb-2 text-blue-100 font-medium">
            <div className="p-2 bg-white/20 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            Lucro Real
          </div>
          <div className="text-3xl font-bold mt-2">R$ 18.750,00</div>
          <div className="text-sm text-blue-100 font-medium mt-2">
            Margem de 56.9%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="font-bold text-slate-800 mb-6">Desempenho Financeiro</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val/1000}k`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`R$ ${value}`, '']}
                />
                <Area type="monotone" dataKey="receitas" stroke="#10b981" fillOpacity={1} fill="url(#colorReceitas)" />
                <Area type="monotone" dataKey="despesas" stroke="#f43f5e" fillOpacity={1} fill="url(#colorDespesas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Últimas Transações</h3>
          </div>
          
          <div className="space-y-4">
            {transactions.map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${tx.type === 'receita' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {tx.type === 'receita' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-800 truncate max-w-[120px] sm:max-w-[160px]">{tx.title}</div>
                    <div className="text-xs text-slate-400">{tx.date}</div>
                  </div>
                </div>
                <div className={`font-bold text-sm ${tx.type === 'receita' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {tx.type === 'receita' ? '+' : '-'} R$ {tx.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {aiSummary && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-indigo-50 p-6 rounded-2xl shadow-sm border border-indigo-100 flex flex-col gap-3"
        >
          <div className="flex items-center gap-2 text-indigo-700 font-bold">
            <Sparkles className="w-5 h-5" />
            Resumo Inteligente (Gemini AI)
          </div>
          <div className="text-slate-700 leading-relaxed text-sm">
            {aiSummary}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
