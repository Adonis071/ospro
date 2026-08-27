import React, { useState } from 'react';
import { Package, Search, Plus, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const initialInventory = [
  { id: '1', name: 'Tela iPhone 13 (Original)', category: 'Peças', quantity: 12, minQuantity: 5, price: 350.00 },
  { id: '2', name: 'Óleo Motor Sintético 5W30', category: 'Insumos', quantity: 3, minQuantity: 10, price: 45.00 },
  { id: '3', name: 'Filtro de Ar Condicionado', category: 'Insumos', quantity: 8, minQuantity: 5, price: 25.00 },
  { id: '4', name: 'Bateria Samsung S22', category: 'Peças', quantity: 1, minQuantity: 3, price: 180.00 },
  { id: '5', name: 'Kit Suspensão Dianteira', category: 'Peças', quantity: 4, minQuantity: 2, price: 450.00 },
];

export function InventoryDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [inventory, setInventory] = useLocalStorage('erp_inventory', initialInventory);

  const filteredItems = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-600" />
            Controle de Estoque
          </h2>
          <p className="text-slate-500 mt-1">Gerencie suas peças e insumos em tempo real.</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-600/30 transition-colors flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" />
          Novo Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 font-medium mb-1">Total de Itens</div>
          <div className="text-3xl font-bold text-slate-800">145</div>
        </div>
        <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 shadow-sm">
          <div className="text-rose-600 font-medium mb-1 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" /> Estoque Baixo
          </div>
          <div className="text-3xl font-bold text-rose-800">2</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 font-medium mb-1">Valor em Estoque</div>
          <div className="text-3xl font-bold text-slate-800">R$ 12.450</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar item ou categoria..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="p-4 font-semibold">Produto / Peça</th>
                <th className="p-4 font-semibold">Categoria</th>
                <th className="p-4 font-semibold text-center">Em Estoque</th>
                <th className="p-4 font-semibold text-right">Valor Unit.</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const isLow = item.quantity <= item.minQuantity;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{item.name}</td>
                    <td className="p-4 text-slate-600">{item.category}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        isLow ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.quantity} un
                        {isLow && <AlertTriangle className="w-3 h-3 ml-1" />}
                      </span>
                    </td>
                    <td className="p-4 text-right font-medium text-slate-700">
                      R$ {item.price.toFixed(2)}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => {
                          setInventory(inventory.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 5 } : i));
                        }}
                        className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center justify-end gap-1 w-full"
                      >
                        Repor <ArrowRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
