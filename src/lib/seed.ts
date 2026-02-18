"use client";

import { Client, Product, Sale, Payment, AutoMessage, MessageLog, Expense } from "@/types";

const SEEDED_KEY = "sontos_seeded";

export function seedIfNeeded(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(SEEDED_KEY)) return;

  const now = new Date();
  const d = (daysAgo: number) => new Date(now.getTime() - daysAgo * 86400000).toISOString();

  const clients: Client[] = [
    { id: "c1", name: "Thandi Mokoena", email: "thandi@email.co.za", phone: "072 345 6789", address: "12 Jacaranda St, Pretoria", notes: "Loves the lavender range", createdAt: d(90), totalSpent: 2850, lastPurchase: d(3), tags: ["loyal", "wholesale"] },
    { id: "c2", name: "Sipho Ndlovu", email: "sipho@email.co.za", phone: "083 456 7890", address: "45 Main Rd, Johannesburg", notes: "Orders monthly for his shop", createdAt: d(60), totalSpent: 5200, lastPurchase: d(7), tags: ["wholesale"] },
    { id: "c3", name: "Lerato Dlamini", email: "lerato@email.co.za", phone: "061 567 8901", address: "8 Bloom Ave, Sandton", notes: "Sensitive skin — prefers unscented", createdAt: d(45), totalSpent: 980, lastPurchase: d(14), tags: ["retail"] },
    { id: "c4", name: "Nomsa Khumalo", email: "nomsa@email.co.za", phone: "079 678 9012", address: "23 Protea Lane, Centurion", notes: "Birthday: March 15", createdAt: d(30), totalSpent: 1650, lastPurchase: d(5), tags: ["loyal", "retail"] },
    { id: "c5", name: "Bongani Mthembu", email: "bongani@email.co.za", phone: "084 789 0123", address: "67 Oak St, Midrand", notes: "Interested in bulk pricing", createdAt: d(20), totalSpent: 420, lastPurchase: d(21), tags: ["new"] },
    { id: "c6", name: "Zanele Nkosi", email: "zanele@email.co.za", phone: "071 890 1234", address: "3 Fern Rd, Rosebank", notes: "Referred by Thandi", createdAt: d(10), totalSpent: 750, lastPurchase: d(2), tags: ["retail"] },
  ];

  const products: Product[] = [
    { id: "p1", name: "Lavender Body Butter", description: "Rich body butter with organic lavender essential oil", category: "Body Care", price: 185, costPrice: 65, stock: 45, unit: "200ml jar", minStock: 10, imageUrl: "", isActive: true, createdAt: d(120) },
    { id: "p2", name: "Rosemary Shampoo Bar", description: "Solid shampoo bar with rosemary and tea tree", category: "Hair Care", price: 95, costPrice: 30, stock: 62, unit: "100g bar", minStock: 15, imageUrl: "", isActive: true, createdAt: d(120) },
    { id: "p3", name: "Moringa Face Serum", description: "Lightweight face serum with cold-pressed moringa oil", category: "Face Care", price: 280, costPrice: 95, stock: 28, unit: "30ml bottle", minStock: 8, imageUrl: "", isActive: true, createdAt: d(100) },
    { id: "p4", name: "Rooibos Lip Balm", description: "Nourishing lip balm with rooibos and beeswax", category: "Face Care", price: 55, costPrice: 15, stock: 120, unit: "15g tin", minStock: 20, imageUrl: "", isActive: true, createdAt: d(100) },
    { id: "p5", name: "Aloe & Chamomile Soap", description: "Gentle cleansing bar for sensitive skin", category: "Body Care", price: 65, costPrice: 20, stock: 85, unit: "120g bar", minStock: 20, imageUrl: "", isActive: true, createdAt: d(80) },
    { id: "p6", name: "Baobab Hair Oil", description: "Deep conditioning oil with baobab and argan", category: "Hair Care", price: 220, costPrice: 80, stock: 5, unit: "100ml bottle", minStock: 10, imageUrl: "", isActive: true, createdAt: d(80) },
    { id: "p7", name: "Marula Body Scrub", description: "Exfoliating scrub with marula oil and brown sugar", category: "Body Care", price: 150, costPrice: 50, stock: 35, unit: "250ml jar", minStock: 10, imageUrl: "", isActive: true, createdAt: d(60) },
    { id: "p8", name: "Shea Butter Hand Cream", description: "Intensive hand cream with raw shea butter", category: "Body Care", price: 120, costPrice: 40, stock: 3, unit: "75ml tube", minStock: 12, imageUrl: "", isActive: true, createdAt: d(40) },
  ];

  const sales: Sale[] = [
    { id: "s1", clientId: "c1", clientName: "Thandi Mokoena", items: [{ productId: "p1", productName: "Lavender Body Butter", quantity: 5, unitPrice: 185, total: 925 }, { productId: "p4", productName: "Rooibos Lip Balm", quantity: 10, unitPrice: 55, total: 550 }], subtotal: 1475, discount: 75, tax: 210, total: 1610, amountPaid: 1610, balance: 0, status: "paid", notes: "Wholesale order", createdAt: d(3), dueDate: d(-4) },
    { id: "s2", clientId: "c2", clientName: "Sipho Ndlovu", items: [{ productId: "p2", productName: "Rosemary Shampoo Bar", quantity: 20, unitPrice: 95, total: 1900 }, { productId: "p5", productName: "Aloe & Chamomile Soap", quantity: 20, unitPrice: 65, total: 1300 }], subtotal: 3200, discount: 200, tax: 450, total: 3450, amountPaid: 2000, balance: 1450, status: "partial", notes: "Will pay balance end of month", createdAt: d(7), dueDate: d(-7) },
    { id: "s3", clientId: "c3", clientName: "Lerato Dlamini", items: [{ productId: "p3", productName: "Moringa Face Serum", quantity: 2, unitPrice: 280, total: 560 }, { productId: "p5", productName: "Aloe & Chamomile Soap", quantity: 3, unitPrice: 65, total: 195 }], subtotal: 755, discount: 0, tax: 113.25, total: 868.25, amountPaid: 868.25, balance: 0, status: "paid", notes: "", createdAt: d(14), dueDate: d(0) },
    { id: "s4", clientId: "c4", clientName: "Nomsa Khumalo", items: [{ productId: "p1", productName: "Lavender Body Butter", quantity: 3, unitPrice: 185, total: 555 }, { productId: "p7", productName: "Marula Body Scrub", quantity: 2, unitPrice: 150, total: 300 }], subtotal: 855, discount: 0, tax: 128.25, total: 983.25, amountPaid: 500, balance: 483.25, status: "partial", notes: "Paying in 2 installments", createdAt: d(5), dueDate: d(-2) },
    { id: "s5", clientId: "c5", clientName: "Bongani Mthembu", items: [{ productId: "p4", productName: "Rooibos Lip Balm", quantity: 4, unitPrice: 55, total: 220 }, { productId: "p2", productName: "Rosemary Shampoo Bar", quantity: 2, unitPrice: 95, total: 190 }], subtotal: 410, discount: 0, tax: 61.5, total: 471.5, amountPaid: 0, balance: 471.5, status: "pending", notes: "", createdAt: d(21), dueDate: d(-7) },
    { id: "s6", clientId: "c6", clientName: "Zanele Nkosi", items: [{ productId: "p3", productName: "Moringa Face Serum", quantity: 1, unitPrice: 280, total: 280 }, { productId: "p6", productName: "Baobab Hair Oil", quantity: 1, unitPrice: 220, total: 220 }, { productId: "p4", productName: "Rooibos Lip Balm", quantity: 2, unitPrice: 55, total: 110 }], subtotal: 610, discount: 30, tax: 87, total: 667, amountPaid: 667, balance: 0, status: "paid", notes: "Gift set for friend", createdAt: d(2), dueDate: d(5) },
  ];

  const payments: Payment[] = [
    { id: "pay1", saleId: "s1", clientId: "c1", clientName: "Thandi Mokoena", amount: 1610, method: "eft", reference: "REF-TM-001", createdAt: d(3) },
    { id: "pay2", saleId: "s2", clientId: "c2", clientName: "Sipho Ndlovu", amount: 2000, method: "eft", reference: "REF-SN-001", createdAt: d(7) },
    { id: "pay3", saleId: "s3", clientId: "c3", clientName: "Lerato Dlamini", amount: 868.25, method: "card", reference: "REF-LD-001", createdAt: d(14) },
    { id: "pay4", saleId: "s4", clientId: "c4", clientName: "Nomsa Khumalo", amount: 500, method: "cash", reference: "CASH-NK-001", createdAt: d(5) },
    { id: "pay5", saleId: "s6", clientId: "c6", clientName: "Zanele Nkosi", amount: 667, method: "mobile", reference: "MOB-ZN-001", createdAt: d(2) },
  ];

  const autoMessages: AutoMessage[] = [
    { id: "am1", type: "payment_reminder", trigger: "3 days before due date", template: "Hi {name}, this is a friendly reminder that your payment of R{amount} for order #{orderId} is due on {dueDate}. Please let us know if you have any questions! 🌿 — Sonto's Organics", isActive: true, lastSent: d(1), sentCount: 12 },
    { id: "am2", type: "thank_you", trigger: "After payment received", template: "Thank you {name}! 💚 We've received your payment of R{amount}. We appreciate your support of Sonto's Organics. Your skin will thank you! 🌿", isActive: true, lastSent: d(2), sentCount: 28 },
    { id: "am3", type: "follow_up", trigger: "14 days after last purchase", template: "Hi {name}, it's been a while! We miss you at Sonto's Organics. 🌸 Check out our latest products and enjoy 10% off your next order with code WELCOME10.", isActive: true, lastSent: d(5), sentCount: 8 },
    { id: "am4", type: "promotion", trigger: "Monthly newsletter", template: "🌿 Sonto's Organics Monthly Special! Hi {name}, this month we're featuring our {product} at a special price. Order now and get free delivery on orders over R500!", isActive: true, lastSent: d(15), sentCount: 45 },
    { id: "am5", type: "low_stock_alert", trigger: "When product stock below minimum", template: "⚠️ Stock Alert: {product} is running low ({stock} remaining). Consider reordering soon to avoid stockouts.", isActive: true, lastSent: d(1), sentCount: 6 },
    { id: "am6", type: "birthday", trigger: "On client birthday", template: "Happy Birthday {name}! 🎂🌿 As a gift from Sonto's Organics, enjoy 20% off your next purchase. Use code BDAY{year}. Have a beautiful day!", isActive: false, lastSent: null, sentCount: 0 },
  ];

  const messageLogs: MessageLog[] = [
    { id: "ml1", clientId: "c2", clientName: "Sipho Ndlovu", type: "payment_reminder", message: "Hi Sipho, this is a friendly reminder that your payment of R1,450 for order #s2 is due soon.", channel: "whatsapp", status: "sent", createdAt: d(1) },
    { id: "ml2", clientId: "c6", clientName: "Zanele Nkosi", type: "thank_you", message: "Thank you Zanele! We've received your payment of R667.", channel: "sms", status: "sent", createdAt: d(2) },
    { id: "ml3", clientId: "c5", clientName: "Bongani Mthembu", type: "payment_reminder", message: "Hi Bongani, your payment of R471.50 for order #s5 is overdue.", channel: "whatsapp", status: "sent", createdAt: d(3) },
    { id: "ml4", clientId: "c1", clientName: "Thandi Mokoena", type: "thank_you", message: "Thank you Thandi! We've received your payment of R1,610.", channel: "email", status: "sent", createdAt: d(3) },
    { id: "ml5", clientId: "c3", clientName: "Lerato Dlamini", type: "follow_up", message: "Hi Lerato, it's been a while! Check out our latest products.", channel: "whatsapp", status: "sent", createdAt: d(5) },
    { id: "ml6", clientId: "c4", clientName: "Nomsa Khumalo", type: "payment_reminder", message: "Hi Nomsa, your balance of R483.25 for order #s4 is due.", channel: "sms", status: "pending", createdAt: d(0) },
  ];

  const expenses: Expense[] = [
    { id: "e1", category: "Raw Materials", description: "Shea butter bulk order — 10kg", amount: 2800, date: d(25), receipt: "" },
    { id: "e2", category: "Raw Materials", description: "Essential oils — lavender, rosemary, tea tree", amount: 1500, date: d(20), receipt: "" },
    { id: "e3", category: "Packaging", description: "Glass jars and tins — 200 units", amount: 3200, date: d(18), receipt: "" },
    { id: "e4", category: "Packaging", description: "Labels and stickers printing", amount: 850, date: d(15), receipt: "" },
    { id: "e5", category: "Marketing", description: "Instagram ads — February", amount: 600, date: d(10), receipt: "" },
    { id: "e6", category: "Delivery", description: "Courier fees — weekly deliveries", amount: 450, date: d(7), receipt: "" },
    { id: "e7", category: "Utilities", description: "Electricity and water", amount: 380, date: d(5), receipt: "" },
    { id: "e8", category: "Equipment", description: "New mixing bowls and measuring tools", amount: 720, date: d(3), receipt: "" },
  ];

  localStorage.setItem("sontos_clients", JSON.stringify(clients));
  localStorage.setItem("sontos_products", JSON.stringify(products));
  localStorage.setItem("sontos_sales", JSON.stringify(sales));
  localStorage.setItem("sontos_payments", JSON.stringify(payments));
  localStorage.setItem("sontos_auto_messages", JSON.stringify(autoMessages));
  localStorage.setItem("sontos_message_logs", JSON.stringify(messageLogs));
  localStorage.setItem("sontos_expenses", JSON.stringify(expenses));
  localStorage.setItem(SEEDED_KEY, "true");
}
