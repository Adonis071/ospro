export type ViewState = 'dashboard' | 'orders' | 'finance' | 'new-order' | 'notifications' | 'new-customer' | 'quote' | 'inventory';

export interface Order {
  id: string;
  customer: string;
  service: string;
  status: 'Pendente' | 'Em Andamento' | 'Concluído';
  total: number;
  date: string;
  whatsappNotified: boolean;
  hasPhotoChecklist: boolean;
  photos?: string[];
  invoiceGenerated: boolean;
}
