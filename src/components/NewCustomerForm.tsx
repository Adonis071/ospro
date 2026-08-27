import React, { useState } from 'react';
import { UserPlus, Save, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useNotifications } from '../context/NotificationContext';

interface NewCustomerFormProps {
  onSuccess: () => void;
}

export function NewCustomerForm({ onSuccess }: NewCustomerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  const { addNotification } = useNotifications();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // --- BACKEND STANDBY ---
      /*
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        throw new Error('Falha ao salvar cliente');
      }
      */
      
      // --- LOGICA LOCALSTORAGE (Atual) ---
      const customersStr = localStorage.getItem('erp_customers');
      const customers = customersStr ? JSON.parse(customersStr) : [];
      const newCustomer = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      customers.push(newCustomer);
      localStorage.setItem('erp_customers', JSON.stringify(customers));
      
      setIsSubmitting(false);
      setIsSuccess(true);
      
      addNotification({
        type: 'system',
        title: 'Novo Cliente Cadastrado',
        description: 'O cadastro foi salvo com sucesso na sua base de dados.',
      });

      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      addNotification({
        type: 'system',
        title: 'Erro',
        description: 'Não foi possível salvar o cliente. Tente novamente.',
      });
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-800">Cliente Salvo!</h2>
        <p className="text-slate-500 mt-2">Redirecionando para o painel...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-blue-600" />
          Novo Cliente
        </h2>
        <p className="text-slate-500 mt-1">Cadastre as informações básicas do seu novo cliente.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" placeholder="Ex: Maria da Silva" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp</label>
            <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" placeholder="(00) 90000-0000" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail (Opcional)</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" placeholder="maria@email.com" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Endereço (Opcional)</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" placeholder="Rua, Número, Bairro" />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
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
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Salvar Cliente
          </button>
        </div>
      </form>
    </motion.div>
  );
}
