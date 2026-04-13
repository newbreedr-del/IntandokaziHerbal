// Site-wide constants for Intandokazi Herbal Products

export const SITE_CONFIG = {
  name: 'Intandokazi Herbal Products',
  shortName: 'Ntankokazi Herbal',
  description: 'Traditional African herbal remedies and natural wellness products',
  url: 'https://intandokaziherbal.co.za',
  
  // Contact Information
  phone: '0625842441',
  phoneFormatted: '062 584 2441',
  whatsappNumber: '27625842441', // International format without +
  whatsappFormatted: '+27 62 584 2441',
  email: 'info@intandokaziherbal.co.za',
  
  // Additional Emails
  emails: {
    info: 'info@intandokaziherbal.co.za',
    sales: 'sales@intandokaziherbal.co.za',
    disputes: 'disputes@intandokaziherbal.co.za',
    accounts: 'accounts@intandokaziherbal.co.za',
    admin: 'admin@intandokaziherbal.co.za',
  },
  
  // Branch Locations
  branches: ['Durban', 'Cape Town', 'PMB', 'Johannesburg (Marble Towers)'],
  
  // Operating Hours
  operatingHours: '09:00 – 17:00',
  
  // Social Media
  social: {
    facebook: 'https://www.facebook.com/profile.php?id=61580754737593',
    tiktok: 'https://www.tiktok.com/@nthonambeautygarden',
    instagram: '', // Add when available
    twitter: '', // Add when available
  },
  
  // Business Details
  business: {
    owner: 'Intandokazi Mokoatle',
    registrationNumber: '', // Add if registered
    vatNumber: '', // Add if VAT registered
    accredited: true, // Company is accredited
  },
  
  // Banking Details (for EFT)
  banking: {
    accountName: 'Miss Mokoatle',
    bank: 'Capitec Bank',
    accountType: 'Active Savings',
    accountNumber: '1506845620',
    linkedNumber: '0625842441',
    paxiFee: 110, // R110 PAXI delivery fee
  },
  
  // Shipping
  shipping: {
    defaultCourier: 'PAXI',
    defaultFee: 110,
    freeShippingThreshold: 500, // Free shipping over R500
    estimatedDays: '2-5 business days',
    followUpDays: 5, // Follow up 5 days after order confirmation
  },
  
  // Support
  support: {
    hours: 'Monday - Friday: 09:00 - 17:00',
    responseTime: '24 hours',
    urgentNote: 'For urgent inquiries, please call 062 584 2441 (no WhatsApp calls). Kindly avoid calling for faster response messages are attended to in order received.',
  },
};

// PayFast Configuration
export const PAYFAST_CONFIG = {
  merchantId: process.env.PAYFAST_MERCHANT_ID || '',
  merchantKey: process.env.PAYFAST_MERCHANT_KEY || '',
  passphrase: process.env.PAYFAST_PASSPHRASE || '',
  environment: process.env.PAYFAST_ENVIRONMENT || 'sandbox',
  urls: {
    sandbox: 'https://sandbox.payfast.co.za/eng/process',
    production: 'https://www.payfast.co.za/eng/process',
  },
};

// Supabase Configuration
export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '',
};

// Order Status Options
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

// Payment Status Options
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
  PAYFAST: 'payfast',
  EFT: 'eft',
  CASH: 'cash',
} as const;

// South African Provinces
export const SA_PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
  'Western Cape',
] as const;

// Product Categories
export const PRODUCT_CATEGORIES = [
  'Teas',
  'Tonics',
  'Skincare',
  'Oils',
  'Balms',
  'Other',
] as const;
