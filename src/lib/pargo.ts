/**
 * PARGO Click & Collect Integration
 * Documentation: https://pargo.co.za/
 */

import axios from 'axios';

export interface PargoConfig {
  apiKey: string;
  storeId: string;
  environment: 'sandbox' | 'production';
}

export interface PargoDelivery {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  pargoPointCode: string;
  items: Array<{
    name: string;
    quantity: number;
    value: number;
  }>;
  totalValue: number;
  collectionInstructions?: string;
}

export interface PargoTrackingInfo {
  orderNumber: string;
  status: 'pending' | 'in_transit' | 'at_pargo_point' | 'collected' | 'returned';
  pargoPointName: string;
  pargoPointAddress: string;
  collectionCode: string;
  estimatedArrival?: string;
  trackingHistory: Array<{
    status: string;
    timestamp: string;
    notes: string;
  }>;
}

export interface PargoPoint {
  code: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  hours: string;
  latitude: number;
  longitude: number;
  type: 'store' | 'locker' | 'pickup_point';
}

class PargoCourier {
  private config: PargoConfig;
  private baseUrl: string;

  constructor(config: PargoConfig) {
    this.config = config;
    this.baseUrl = config.environment === 'production'
      ? 'https://api.pargo.co.za/v2'
      : 'https://api-sandbox.pargo.co.za/v2';
  }

  /**
   * Create a new Pargo delivery
   */
  async createDelivery(delivery: PargoDelivery): Promise<{ trackingNumber: string; collectionCode: string }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/deliveries`,
        {
          storeId: this.config.storeId,
          orderNumber: delivery.orderNumber,
          customer: {
            name: delivery.customerName,
            phone: delivery.customerPhone,
            email: delivery.customerEmail
          },
          pargoPointCode: delivery.pargoPointCode,
          items: delivery.items,
          totalValue: delivery.totalValue,
          collectionInstructions: delivery.collectionInstructions
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        trackingNumber: response.data.trackingNumber,
        collectionCode: response.data.collectionCode
      };
    } catch (error: any) {
      console.error('Failed to create Pargo delivery:', error.response?.data || error.message);
      throw new Error('Failed to create Pargo delivery');
    }
  }

  /**
   * Track a Pargo delivery
   */
  async trackDelivery(trackingNumber: string): Promise<PargoTrackingInfo> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/deliveries/track/${trackingNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        }
      );

      return {
        orderNumber: response.data.orderNumber,
        status: response.data.status,
        pargoPointName: response.data.pargoPoint.name,
        pargoPointAddress: response.data.pargoPoint.address,
        collectionCode: response.data.collectionCode,
        estimatedArrival: response.data.estimatedArrival,
        trackingHistory: response.data.history || []
      };
    } catch (error: any) {
      console.error('Failed to track Pargo delivery:', error.response?.data || error.message);
      throw new Error('Failed to track delivery');
    }
  }

  /**
   * Find Pargo points near a location
   */
  async findPargoPoints(city: string, province?: string, type?: 'store' | 'locker' | 'pickup_point'): Promise<PargoPoint[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/pargo-points/search`,
        {
          params: { city, province, type },
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        }
      );

      return response.data.pargoPoints || [];
    } catch (error: any) {
      console.error('Failed to find Pargo points:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Calculate shipping cost
   */
  async calculateShipping(totalValue: number, destination: string): Promise<number> {
    // Pargo flat-rate pricing (verify with actual API)
    // Typically R60-R80 depending on location
    const baseRate = 65;
    
    // Free shipping threshold
    if (totalValue >= 500) {
      return 0;
    }

    return baseRate;
  }

  /**
   * Send collection notification to customer
   */
  async sendCollectionNotification(trackingNumber: string): Promise<boolean> {
    try {
      await axios.post(
        `${this.baseUrl}/deliveries/${trackingNumber}/notify`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        }
      );
      return true;
    } catch (error) {
      console.error('Failed to send Pargo notification:', error);
      return false;
    }
  }

  /**
   * Cancel a delivery
   */
  async cancelDelivery(trackingNumber: string): Promise<boolean> {
    try {
      await axios.post(
        `${this.baseUrl}/deliveries/${trackingNumber}/cancel`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        }
      );
      return true;
    } catch (error) {
      console.error('Failed to cancel Pargo delivery:', error);
      return false;
    }
  }
}

// Singleton instance
let pargoInstance: PargoCourier | null = null;

export function getPargoClient(): PargoCourier {
  if (!pargoInstance) {
    const config: PargoConfig = {
      apiKey: process.env.PARGO_API_KEY || '',
      storeId: process.env.PARGO_STORE_ID || '',
      environment: (process.env.PARGO_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
    };

    if (!config.apiKey || !config.storeId) {
      console.warn('PARGO credentials not configured. Set PARGO_API_KEY and PARGO_STORE_ID environment variables.');
    }

    pargoInstance = new PargoCourier(config);
  }

  return pargoInstance;
}

export default PargoCourier;
