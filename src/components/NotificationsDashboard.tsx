import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, MessageCircle, Package, Clock, AlertTriangle, Check, CheckCircle2 } from 'lucide-react';
import { useNotifications, AppNotification } from '../context/NotificationContext';

export function NotificationsDashboard() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter(n => 
    filter === 'unread' ? !n.read : true
  );

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'whatsapp': return <MessageCircle className="w-5 h-5" />;
      case 'stock': return <Package className="w-5 h-5" />;
      case 'delay': return <Clock className="w-5 h-5" />;
      case 'system': return <AlertTriangle className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getColorClass = (type: AppNotification['type'], read: boolean) => {
    if (read) return 'bg-slate-100 text-slate-400 border-slate-200';
    switch (type) {
      case 'whatsapp': return 'bg-green-100 text-green-600 border-green-200';
      case 'stock': return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'delay': return 'bg-rose-100 text-rose-600 border-rose-200';
      case 'system': return 'bg-blue-100 text-blue-600 border-blue-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Central de Avisos
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h2>
          <p className="text-slate-500 mt-1">Acompanhe todos os alertas do sistema e atualizações.</p>
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Marcar todas como lidas
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => setFilter('all')}
            className={`flex-1 py-4 text-sm font-bold text-center transition-colors border-b-2 ${
              filter === 'all' 
                ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            Todas
          </button>
          <button 
            onClick={() => setFilter('unread')}
            className={`flex-1 py-4 text-sm font-bold text-center transition-colors border-b-2 ${
              filter === 'unread' 
                ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            Não lidas ({unreadCount})
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`p-5 flex gap-4 transition-colors ${notification.read ? 'bg-white' : 'bg-slate-50/50'}`}
                >
                  <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border ${getColorClass(notification.type, notification.read)}`}>
                    {getIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`font-bold truncate ${notification.read ? 'text-slate-600' : 'text-slate-900'}`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                        {notification.time}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 line-clamp-2 ${notification.read ? 'text-slate-400' : 'text-slate-600'}`}>
                      {notification.description}
                    </p>
                    
                    {!notification.read && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Marcar como lida
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Tudo limpo por aqui!</h3>
                <p className="mt-1">Você não tem novas notificações no momento.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
