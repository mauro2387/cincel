/**
 * Meta Service - Integración con Facebook e Instagram Messenger
 * Docs: https://developers.facebook.com/docs/messenger-platform
 */

const META_API_VERSION = 'v18.0';
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

interface MetaConfig {
  pageAccessToken: string;
  pageId: string;
  appSecret: string;
  verifyToken: string;
}

interface MetaMessage {
  id: string;
  from: {
    id: string;
    name?: string;
  };
  to: {
    id: string;
  };
  message: {
    text?: string;
    attachments?: Array<{
      type: string;
      payload: {
        url: string;
      };
    }>;
  };
  timestamp: number;
}

interface MetaProfile {
  id: string;
  name: string;
  profile_pic?: string;
}

class MetaService {
  private config: MetaConfig | null = null;
  private isConfigured = false;

  configure(config: MetaConfig) {
    this.config = config;
    this.isConfigured = true;
    console.log('Meta Service configured for page:', config.pageId);
  }

  getConfig(): MetaConfig | null {
    return this.config;
  }

  isReady(): boolean {
    return this.isConfigured && this.config !== null;
  }

  /**
   * Enviar mensaje de texto a Facebook/Instagram
   */
  async sendMessage(recipientId: string, text: string, platform: 'facebook' | 'instagram' = 'facebook'): Promise<boolean> {
    if (!this.isReady() || !this.config) {
      throw new Error('Meta Service not configured');
    }

    const endpoint = platform === 'instagram' 
      ? `${META_BASE_URL}/me/messages`
      : `${META_BASE_URL}/me/messages`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text },
          access_token: this.config.pageAccessToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Meta API error:', data);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending Meta message:', error);
      return false;
    }
  }

  /**
   * Obtener información del perfil de usuario
   */
  async getUserProfile(userId: string): Promise<MetaProfile | null> {
    if (!this.isReady() || !this.config) {
      throw new Error('Meta Service not configured');
    }

    try {
      const response = await fetch(
        `${META_BASE_URL}/${userId}?fields=id,name,profile_pic&access_token=${this.config.pageAccessToken}`
      );

      if (!response.ok) {
        console.error('Error fetching user profile:', await response.text());
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Verificar webhook (para configuración inicial)
   */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (!this.config) {
      return null;
    }

    if (mode === 'subscribe' && token === this.config.verifyToken) {
      console.log('Webhook verified successfully');
      return challenge;
    }

    console.error('Webhook verification failed');
    return null;
  }

  /**
   * Procesar webhook entrante
   */
  processWebhook(body: any): MetaMessage[] {
    const messages: MetaMessage[] = [];

    if (body.object !== 'page') {
      return messages;
    }

    body.entry?.forEach((entry: any) => {
      entry.messaging?.forEach((event: any) => {
        if (event.message && !event.message.is_echo) {
          messages.push({
            id: event.message.mid,
            from: {
              id: event.sender.id,
              name: undefined, // Se obtiene después con getUserProfile
            },
            to: {
              id: event.recipient.id,
            },
            message: {
              text: event.message.text,
              attachments: event.message.attachments,
            },
            timestamp: event.timestamp,
          });
        }
      });
    });

    return messages;
  }

  /**
   * Obtener conversaciones recientes
   */
  async getConversations(limit: number = 50): Promise<any[]> {
    if (!this.isReady() || !this.config) {
      throw new Error('Meta Service not configured');
    }

    try {
      const response = await fetch(
        `${META_BASE_URL}/${this.config.pageId}/conversations?fields=id,updated_time,participants,messages{message,from,created_time}&limit=${limit}&access_token=${this.config.pageAccessToken}`
      );

      if (!response.ok) {
        console.error('Error fetching conversations:', await response.text());
        return [];
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  }

  /**
   * Marcar mensaje como leído
   */
  async markAsRead(senderId: string): Promise<boolean> {
    if (!this.isReady() || !this.config) {
      return false;
    }

    try {
      const response = await fetch(`${META_BASE_URL}/me/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: { id: senderId },
          sender_action: 'mark_seen',
          access_token: this.config.pageAccessToken,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error marking as read:', error);
      return false;
    }
  }

  /**
   * Mostrar indicador de "escribiendo..."
   */
  async sendTypingIndicator(recipientId: string, on: boolean = true): Promise<boolean> {
    if (!this.isReady() || !this.config) {
      return false;
    }

    try {
      const response = await fetch(`${META_BASE_URL}/me/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          sender_action: on ? 'typing_on' : 'typing_off',
          access_token: this.config.pageAccessToken,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending typing indicator:', error);
      return false;
    }
  }

  /**
   * Subscribir la página a webhooks
   */
  async subscribeToWebhooks(): Promise<boolean> {
    if (!this.isReady() || !this.config) {
      return false;
    }

    try {
      const response = await fetch(
        `${META_BASE_URL}/${this.config.pageId}/subscribed_apps?subscribed_fields=messages,messaging_postbacks&access_token=${this.config.pageAccessToken}`,
        { method: 'POST' }
      );

      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error('Error subscribing to webhooks:', error);
      return false;
    }
  }
}

// Singleton instance
export const metaService = new MetaService();

// Función helper para inicializar desde variables de entorno
export const initializeMetaService = () => {
  const pageAccessToken = import.meta.env.VITE_META_PAGE_ACCESS_TOKEN;
  const pageId = import.meta.env.VITE_META_PAGE_ID;
  const appSecret = import.meta.env.VITE_META_APP_SECRET;
  const verifyToken = import.meta.env.VITE_META_VERIFY_TOKEN;

  if (pageAccessToken && pageId && appSecret && verifyToken) {
    metaService.configure({
      pageAccessToken,
      pageId,
      appSecret,
      verifyToken,
    });
    return true;
  }

  console.warn('Meta credentials not found in environment variables');
  return false;
};
