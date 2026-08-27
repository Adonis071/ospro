import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export interface AppNotification {
  id: string;
  type: 'whatsapp' | 'stock' | 'system' | 'delay';
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const initialNotifications: AppNotification[] = [
  {
    id: '1',
    type: 'delay',
    title: 'Atraso na Ordem de Serviço',
    description: 'A OS-1038 (João da Silva) ultrapassou o prazo estimado de entrega em 2 horas.',
    time: 'Há 15 min',
    read: false,
  },
  {
    id: '2',
    type: 'whatsapp',
    title: 'Falha no envio do WhatsApp',
    description: 'Não foi possível notificar Marina Silva sobre a OS-1041. Verifique o número cadastrado.',
    time: 'Há 45 min',
    read: false,
  },
  {
    id: '3',
    type: 'stock',
    title: 'Peça disponível para retirada',
    description: 'A "Tela iPhone 13" encomendada no fornecedor já está pronta para retirada.',
    time: 'Há 2 horas',
    read: false,
  },
  {
    id: '4',
    type: 'system',
    title: 'Fechamento de Caixa',
    description: 'O seu faturamento de ontem (R$ 1.250,00) foi processado e salvo no histórico.',
    time: 'Ontem, 18:00',
    read: true,
  },
  {
    id: '5',
    type: 'whatsapp',
    title: 'Cliente confirmou orçamento',
    description: 'Roberto Costa aprovou o orçamento da OS-1040 via WhatsApp.',
    time: 'Ontem, 15:30',
    read: true,
  }
];

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'time' | 'read'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useLocalStorage<AppNotification[]>('erp_notifications', initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addNotification = (notification: Omit<AppNotification, 'id' | 'time' | 'read'>) => {
    const newNotification: AppNotification = {
      ...notification,
      id: Math.random().toString(36).substring(7),
      time: 'Agora mesmo',
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
