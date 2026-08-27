export interface WhatsAppPayload {
  messaging_product: "whatsapp";
  to: string;
  type: "template" | "text";
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: any[];
  };
  text?: {
    body: string;
  };
}

/**
 * Função responsável por chamar o backend que integra com a API do WhatsApp.
 * As chaves da API agora ficam armazenadas de forma segura no servidor.
 */
export async function sendWhatsAppNotification(phone: string, message: string): Promise<boolean> {
  try {
    const response = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, message })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('[WhatsApp Service] Erro retornado pelo servidor:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[WhatsApp Service] Falha de conexão com o backend:', error);
    return false;
  }
}
