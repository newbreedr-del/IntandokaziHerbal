/**
 * PAXI Courier Integration
 * Documentation: https://www.paxi.co.za/business-tools
 */

import axios from 'axios';

export interface PaxiConfig {
  apiKey: string;
  businessId: string;
  environment: 'sandbox' | 'production';
}

export interface PaxiParcel {
  reference: string;
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  paxiPointId: string;
  weight: number; // in kg
  value: number; // parcel value in ZAR
  description: string;
  insurance?: boolean;
}

export interface PaxiTrackingInfo {
  reference: string;
  status: 'registered' | 'collected' | 'in_transit' | 'at_paxi_point' | 'delivered' | 'cancelled';
  paxiPointName: string;
  paxiPointAddress: string;
  estimatedDelivery?: string;
  trackingHistory: Array<{
    status: string;
    timestamp: string;
    location: string;
  }>;
}

export interface PaxiPoint {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  hours: string;
  latitude: number;
  longitude: number;
}

class PaxiCourier {
  private config: PaxiConfig;
  private baseUrl: string;

  constructor(config: PaxiConfig) {
    this.config = config;
    this.baseUrl = config.environment === 'production'
      ? 'https://api.paxi.co.za/v1'
      : 'https://api-sandbox.paxi.co.za/v1';
  }

  /**
   * Register a new parcel with PAXI
   */
  async registerParcel(parcel: PaxiParcel): Promise<{ trackingNumber: string; qrCode: string }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/parcels/register`,
        {
          businessId: this.config.businessId,
          reference: parcel.reference,
          sender: {
            name: parcel.senderName,
            phone: parcel.senderPhone,
            email: parcel.senderEmail
          },
          recipient: {
            name: parcel.recipientName,
            phone: parcel.recipientPhone,
            email: parcel.recipientEmail
          },
          paxiPointId: parcel.paxiPointId,
          parcelDetails: {
            weight: parcel.weight,
            value: parcel.value,
            description: parcel.description,
            insurance: parcel.insurance || false
          }
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
        qrCode: response.data.qrCode
      };
    } catch (error: any) {
      console.error('Failed to register PAXI parcel:', error.response?.data || error.message);
      throw new Error('Failed to register parcel with PAXI');
    }
  }

  /**
   * Track a parcel by tracking number or reference
   */
  async trackParcel(trackingNumber: string): Promise<PaxiTrackingInfo> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/parcels/track/${trackingNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        }
      );

      return {
        reference: response.data.reference,
        status: response.data.status,
        paxiPointName: response.data.paxiPoint.name,
        paxiPointAddress: response.data.paxiPoint.address,
        estimatedDelivery: response.data.estimatedDelivery,
        trackingHistory: response.data.history || []
      };
    } catch (error: any) {
      console.error('Failed to track PAXI parcel:', error.response?.data || error.message);
      throw new Error('Failed to track parcel');
    }
  }

  /**
   * Find PAXI points near a location
   */
  async findPaxiPoints(city: string, province?: string): Promise<PaxiPoint[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/paxi-points/search`,
        {
          params: { city, province },
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        }
      );

      return response.data.paxiPoints || [];
    } catch (error: any) {
      console.error('Failed to find PAXI points:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Calculate shipping cost
   */
  async calculateShipping(weight: number, value: number, insurance: boolean = false): Promise<number> {
    // PAXI pricing (approximate - verify with actual API)
    let cost = 0;
    
    if (weight <= 2) cost = 60;
    else if (weight <= 5) cost = 75;
    else if (weight <= 10) cost = 95;
    else if (weight <= 20) cost = 120;
    else cost = 150;

    // Add insurance if requested
    if (insurance) {
      if (value <= 2500) cost += 10;
      else if (value <= 5000) cost += 20;
    }

    return cost;
  }

  /**
   * Cancel a parcel
   */
  async cancelParcel(trackingNumber: string): Promise<boolean> {
    try {
      await axios.post(
        `${this.baseUrl}/parcels/${trackingNumber}/cancel`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        }
      );
      return true;
    } catch (error) {
      console.error('Failed to cancel PAXI parcel:', error);
      return false;
    }
  }
}

// Singleton instance
let paxiInstance: PaxiCourier | null = null;

export function getPaxiClient(): PaxiCourier {
  if (!paxiInstance) {
    const config: PaxiConfig = {
      apiKey: process.env.PAXI_API_KEY || '',
      businessId: process.env.PAXI_BUSINESS_ID || '',
      environment: (process.env.PAXI_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
    };

    if (!config.apiKey || !config.businessId) {
      console.warn('PAXI credentials not configured. Set PAXI_API_KEY and PAXI_BUSINESS_ID environment variables.');
    }

    paxiInstance = new PaxiCourier(config);
  }

  return paxiInstance;
}

export default PaxiCourier;
