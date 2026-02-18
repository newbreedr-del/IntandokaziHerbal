export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  createdAt: string;
  totalSpent: number;
  lastPurchase: string | null;
  tags: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  unit: string;
  minStock: number;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale {
  id: string;
  clientId: string;
  clientName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  balance: number;
  status: "pending" | "partial" | "paid" | "overdue";
  notes: string;
  createdAt: string;
  dueDate: string;
}

export interface Payment {
  id: string;
  saleId: string;
  clientId: string;
  clientName: string;
  amount: number;
  method: "cash" | "card" | "eft" | "mobile";
  reference: string;
  createdAt: string;
}

export interface AutoMessage {
  id: string;
  type: "payment_reminder" | "thank_you" | "follow_up" | "promotion" | "low_stock_alert" | "birthday";
  trigger: string;
  template: string;
  isActive: boolean;
  lastSent: string | null;
  sentCount: number;
}

export interface MessageLog {
  id: string;
  clientId: string;
  clientName: string;
  type: string;
  message: string;
  channel: "sms" | "email" | "whatsapp";
  status: "sent" | "pending" | "failed";
  createdAt: string;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  receipt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalClients: number;
  totalOrders: number;
  pendingPayments: number;
  lowStockProducts: number;
  messagesSent: number;
}
