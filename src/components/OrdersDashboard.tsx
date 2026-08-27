import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { FileText, MoreVertical, MessageCircle, Camera, CheckCircle2, Search } from 'lucide-react';
import { Order } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

const initialOrders: Order[] = [
  { id: 'OS-1042', customer: 'Carlos Oliveira', service: 'Revisão Motor + Suspensão', status: 'Em Andamento', total: 1850.00, date: 'Hoje, 09:30', whatsappNotified: true, hasPhotoChecklist: true, invoiceGenerated: false },
  { id: 'OS-1041', customer: 'Marina Silva', service: 'Troca de Tela iPhone 13', status: 'Concluído', total: 850.00, date: 'Ontem, 16:45', whatsappNotified: true, hasPhotoChecklist: true, invoiceGenerated: true },
  { id: 'OS-1040', customer: 'Roberto Costa', service: 'Formatação Notebook Dell', status: 'Pendente', total: 150.00, date: 'Ontem, 14:20', whatsappNotified: false, hasPhotoChecklist: false, invoiceGenerated: false },
];

export function OrdersDashboard() {
  const [orders, setOrders] = useLocalStorage<Order[]>('erp_orders', initialOrders);
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: Order['status']) => {
    switch(status) {
      case 'Concluído': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Em Andamento': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Pendente': return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const handleGenerateInvoice = (id: string) => {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    // Simulate NF-e Data Contract generation
    const nfePayload = {
      natureza_operacao: "Prestação de Serviço",
      data_emissao: new Date().toISOString(),
      prestador: {
        cnpj: "00.000.000/0001-00",
        inscricao_municipal: "123456",
        codigo_municipio: "3550308"
      },
      tomador: {
        razao_social: order.customer,
        cpf_cnpj: "000.000.000-00",
        email: "cliente@email.com"
      },
      servico: {
        descricao: order.service,
        valor_servicos: order.total
      }
    };

    const blob = new Blob([JSON.stringify(nfePayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nfe_${order.id}_payload.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setOrders(orders.map(o => 
      o.id === id ? { ...o, invoiceGenerated: true } : o
    ));
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => 
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.service.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Painel de Ordens de Serviço</h2>
          <p className="text-slate-500 mt-1">Acompanhe todos os serviços em tempo real.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar cliente ou OS..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-shadow" 
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="p-4 font-semibold">Número / Cliente</th>
                <th className="p-4 font-semibold">Serviço</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Garantias</th>
                <th className="p-4 font-semibold text-right">Valor</th>
                <th className="p-4 font-semibold text-center">NF</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{order.id}</div>
                      <div className="text-sm text-slate-600">{order.customer}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{order.date}</div>
                    </td>
                    <td className="p-4 text-slate-700 font-medium">
                      {order.service}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${order.whatsappNotified ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`} title="WhatsApp Automático">
                          <MessageCircle className="w-4 h-4" />
                        </div>
                        <div className={`p-1.5 rounded-md ${order.hasPhotoChecklist ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`} title="Checklist com Foto">
                          <Camera className="w-4 h-4" />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right font-bold text-slate-900">
                      R$ {order.total.toFixed(2)}
                    </td>
                    <td className="p-4 text-center">
                      {order.invoiceGenerated ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                          <CheckCircle2 className="w-3 h-3" /> Emitida
                        </span>
                      ) : (
                        <button 
                          onClick={() => handleGenerateInvoice(order.id)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-md border border-blue-200 transition-colors"
                        >
                          Gerar NF
                        </button>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Nenhuma ordem de serviço encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
