"use client";

import { Client, Product, Sale, Payment, AutoMessage, MessageLog, Expense } from "@/types";

const STORAGE_KEYS = {
  clients: "nthandokazi_clients",
  products: "nthandokazi_products",
  sales: "nthandokazi_sales",
  payments: "nthandokazi_payments",
  autoMessages: "nthandokazi_auto_messages",
  messageLogs: "nthandokazi_message_logs",
  expenses: "nthandokazi_expenses",
};

function getItem<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

// --- Clients ---
export function getClients(): Client[] {
  return getItem<Client>(STORAGE_KEYS.clients, []);
}
export function saveClients(clients: Client[]): void {
  setItem(STORAGE_KEYS.clients, clients);
}
export function addClient(client: Client): void {
  const clients = getClients();
  clients.push(client);
  saveClients(clients);
}
export function updateClient(updated: Client): void {
  const clients = getClients().map((c) => (c.id === updated.id ? updated : c));
  saveClients(clients);
}
export function deleteClient(id: string): void {
  saveClients(getClients().filter((c) => c.id !== id));
}

// --- Products ---
export function getProducts(): Product[] {
  return getItem<Product>(STORAGE_KEYS.products, []);
}
export function saveProducts(products: Product[]): void {
  setItem(STORAGE_KEYS.products, products);
}
export function addProduct(product: Product): void {
  const products = getProducts();
  products.push(product);
  saveProducts(products);
}
export function updateProduct(updated: Product): void {
  const products = getProducts().map((p) => (p.id === updated.id ? updated : p));
  saveProducts(products);
}
export function deleteProduct(id: string): void {
  saveProducts(getProducts().filter((p) => p.id !== id));
}

// --- Sales ---
export function getSales(): Sale[] {
  return getItem<Sale>(STORAGE_KEYS.sales, []);
}
export function saveSales(sales: Sale[]): void {
  setItem(STORAGE_KEYS.sales, sales);
}
export function addSale(sale: Sale): void {
  const sales = getSales();
  sales.push(sale);
  saveSales(sales);
}
export function updateSale(updated: Sale): void {
  const sales = getSales().map((s) => (s.id === updated.id ? updated : s));
  saveSales(sales);
}

// --- Payments ---
export function getPayments(): Payment[] {
  return getItem<Payment>(STORAGE_KEYS.payments, []);
}
export function savePayments(payments: Payment[]): void {
  setItem(STORAGE_KEYS.payments, payments);
}
export function addPayment(payment: Payment): void {
  const payments = getPayments();
  payments.push(payment);
  savePayments(payments);
}

// --- Auto Messages ---
export function getAutoMessages(): AutoMessage[] {
  return getItem<AutoMessage>(STORAGE_KEYS.autoMessages, []);
}
export function saveAutoMessages(messages: AutoMessage[]): void {
  setItem(STORAGE_KEYS.autoMessages, messages);
}
export function updateAutoMessage(updated: AutoMessage): void {
  const msgs = getAutoMessages().map((m) => (m.id === updated.id ? updated : m));
  saveAutoMessages(msgs);
}

// --- Message Logs ---
export function getMessageLogs(): MessageLog[] {
  return getItem<MessageLog>(STORAGE_KEYS.messageLogs, []);
}
export function saveMessageLogs(logs: MessageLog[]): void {
  setItem(STORAGE_KEYS.messageLogs, logs);
}
export function addMessageLog(log: MessageLog): void {
  const logs = getMessageLogs();
  logs.push(log);
  saveMessageLogs(logs);
}

// --- Expenses ---
export function getExpenses(): Expense[] {
  return getItem<Expense>(STORAGE_KEYS.expenses, []);
}
export function saveExpenses(expenses: Expense[]): void {
  setItem(STORAGE_KEYS.expenses, expenses);
}
export function addExpense(expense: Expense): void {
  const expenses = getExpenses();
  expenses.push(expense);
  saveExpenses(expenses);
}
export function deleteExpense(id: string): void {
  saveExpenses(getExpenses().filter((e) => e.id !== id));
}
