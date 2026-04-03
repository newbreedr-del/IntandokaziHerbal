/**
 * Respond.io Integration
 * Documentation: https://docs.respond.io
 */

import axios from 'axios';

export interface RespondIOConfig {
  apiKey: string;
  channelId: string;
  baseUrl: string;
}

export interface SendMessageRequest {
  to: string; // Phone number or contact ID
  message: string;
  channelType?: 'whatsapp' | 'sms' | 'telegram';
  metadata?: Record<string, any>;
}

export interface CreateContactRequest {
  firstName: string;
  lastName?: string;
  email?: string;
  phone: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface SendTemplateMessageRequest {
  to: string;
  templateName: string;
  templateLanguage?: string;
  parameters?: Record<string, any>;
}

class RespondIOClient {
  private config: RespondIOConfig;

  constructor(config: RespondIOConfig) {
    this.config = config;
  }

  /**
   * Send a message to a contact
   */
  async sendMessage(request: SendMessageRequest): Promise<any> {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/v2/messages`,
        {
          channelId: this.config.channelId,
          recipient: {
            phone: request.to
          },
          message: {
            type: 'text',
            text: request.message
          },
          metadata: request.metadata
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Failed to send message via Respond.io:', error.response?.data || error.message);
      throw new Error('Failed to send message');
    }
  }

  /**
   * Send a WhatsApp template message
   */
  async sendTemplateMessage(request: SendTemplateMessageRequest): Promise<any> {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/v2/messages`,
        {
          channelId: this.config.channelId,
          recipient: {
            phone: request.to
          },
          message: {
            type: 'whatsapp_template',
            template: {
              name: request.templateName,
              language: request.templateLanguage || 'en',
              components: this.buildTemplateComponents(request.parameters || {})
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Failed to send template message:', error.response?.data || error.message);
      throw new Error('Failed to send template message');
    }
  }

  /**
   * Create or update a contact
   */
  async createContact(request: CreateContactRequest): Promise<any> {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/v2/contacts`,
        {
          firstName: request.firstName,
          lastName: request.lastName,
          email: request.email,
          phone: request.phone,
          tags: request.tags || [],
          customFields: request.customFields || {}
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Failed to create contact:', error.response?.data || error.message);
      throw new Error('Failed to create contact');
    }
  }

  /**
   * Build template components for WhatsApp templates
   */
  private buildTemplateComponents(parameters: Record<string, any>): any[] {
    const components = [];

    // Header parameters
    if (parameters.header) {
      components.push({
        type: 'header',
        parameters: [{ type: 'text', text: parameters.header }]
      });
    }

    // Body parameters
    if (parameters.body && Array.isArray(parameters.body)) {
      components.push({
        type: 'body',
        parameters: parameters.body.map((text: string) => ({ type: 'text', text }))
      });
    }

    // Button parameters
    if (parameters.buttons && Array.isArray(parameters.buttons)) {
      parameters.buttons.forEach((button: any, index: number) => {
        components.push({
          type: 'button',
          sub_type: button.type || 'url',
          index: index,
          parameters: [{ type: 'text', text: button.text }]
        });
      });
    }

    return components;
  }

  /**
   * Send order confirmation via WhatsApp
   */
  async sendOrderConfirmation(orderData: {
    customerPhone: string;
    customerName: string;
    orderRef: string;
    total: number;
    items: Array<{ name: string; quantity: number; price: number }>;
  }): Promise<any> {
    const itemsList = orderData.items
      .map(item => `• ${item.quantity}x ${item.name} - R${(item.price * item.quantity).toFixed(2)}`)
      .join('\n');

    const message = `🌿 *Order Confirmation - Intandokazi Herbal*

Hi ${orderData.customerName}! 

Thank you for your order! 

*Order Reference:* ${orderData.orderRef}
*Total:* R${orderData.total.toFixed(2)}

*Items:*
${itemsList}

Your order will be processed and shipped via PAXI Courier within 1-2 business days.

You'll receive tracking information once your order ships.

Need help? Reply to this message anytime!

_Healing the natural way_ 🌿`;

    return this.sendMessage({
      to: orderData.customerPhone,
      message,
      metadata: {
        orderRef: orderData.orderRef,
        type: 'order_confirmation'
      }
    });
  }

  /**
   * Send payment reminder
   */
  async sendPaymentReminder(data: {
    customerPhone: string;
    customerName: string;
    orderRef: string;
    amount: number;
  }): Promise<any> {
    const message = `Hi ${data.customerName},

This is a friendly reminder about your pending payment for order ${data.orderRef}.

*Amount Due:* R${data.amount.toFixed(2)}

Please complete your payment to process your order.

Need assistance? Reply to this message!

Thank you 🌿
Intandokazi Herbal`;

    return this.sendMessage({
      to: data.customerPhone,
      message,
      metadata: {
        orderRef: data.orderRef,
        type: 'payment_reminder'
      }
    });
  }
}

// Singleton instance
let respondIOInstance: RespondIOClient | null = null;

export function getRespondIOClient(): RespondIOClient {
  if (!respondIOInstance) {
    const config: RespondIOConfig = {
      apiKey: process.env.RESPONDIO_API_TOKEN || '',
      channelId: process.env.RESPONDIO_CHANNEL_ID || '',
      baseUrl: process.env.RESPONDIO_API_URL || 'https://api.respond.io'
    };

    if (!config.apiKey) {
      console.warn('Respond.io API token not configured. Set RESPONDIO_API_TOKEN environment variable.');
    }

    respondIOInstance = new RespondIOClient(config);
  }

  return respondIOInstance;
}

export default RespondIOClient;
