import React, { useState, useEffect } from 'react';
import { FileSignature, Send, Calculator } from 'lucide-react';
import { motion } from 'motion/react';
import { useNotifications } from '../context/NotificationContext';
import { sendWhatsAppNotification } from '../services/whatsapp';

interface QuoteFormProps {
  onSuccess: () => void;
}

export function QuoteForm({ onSuccess }: QuoteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotifications();
  const [customer, setCustomer] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [customersList, setCustomersList] = useState<any[]>([]);

  useEffect(() => {
    // --- BACKEND STANDBY ---
    /*
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => setCustomersList(data))
      .catch(console.error);
    */
    
    // --- LOGICA LOCALSTORAGE (Atual) ---
    const customersStr = localStorage.getItem('erp_customers');
    if (customersStr) {
      setCustomersList(JSON.parse(customersStr));
    }
  }, []);

  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      setCustomer('');
      setWhatsapp('');
      return;
    }
    const selected = customersList.find(c => c.id === selectedId);
    if (selected) {
      setCustomer(selected.name);
      setWhatsapp(selected.phone);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (whatsapp) {
      const message = `Olá, ${customer}! Seu orçamento para "${description}" foi gerado. Valor estimado: R$ ${value}.`;
      const success = await sendWhatsAppNotification(whatsapp, message);
      if (!success) {
        console.warn('Falha ao enviar orçamento via WhatsApp.');
      }
    }

    setTimeout(() => {
      setIsSubmitting(false);
      addNotification({
        type: 'whatsapp',
        title: 'Orçamento Enviado',
        description: 'O orçamento foi gerado e o link enviado para o WhatsApp do cliente.',
      });
      onSuccess();
    }, 800);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FileSignature className="w-6 h-6 text-indigo-600" />
          Gerar Orçamento Rápido
        </h2>
        <p className="text-slate-500 mt-1">Crie um orçamento sem precisar abrir uma Ordem de Serviço.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Buscar Cliente Cadastrado (Opcional)</label>
            <select onChange={handleCustomerSelect} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
              <option value="">-- Selecione ou digite abaixo --</option>
              {customersList.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
            <input required type="text" value={customer} onChange={e => setCustomer(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Nome do cliente" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp</label>
            <input required type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="(11) 99999-9999" />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Descrição do Serviço / Produtos</label>
          <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="Descreva os problemas relatados e o que será feito..." />
        </div>

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-slate-500" /> Valor Estimado (R$)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
            <input 
              required 
              type="number" 
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-2xl font-bold text-slate-800 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
              placeholder="0,00" 
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">Este valor é uma estimativa e pode ser ajustado na aprovação.</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t border-slate-100">
          <button 
            type="button" 
            onClick={onSuccess}
            className="px-6 py-3 font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            Gerar e Enviar por WhatsApp
          </button>
        </div>
      </form>
    </motion.div>
  );
}
