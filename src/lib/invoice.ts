/**
 * Invoice Generation Library
 * Generates PDF invoices for orders
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

export interface InvoiceData {
  invoiceNumber: string;
  orderReference: string;
  date: string;
  dueDate?: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  
  // Business details
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  businessVAT?: string;
  
  // Customer details
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  
  // Items
  items: Array<{
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  
  // Totals
  subtotal: number;
  delivery: number;
  discount?: number;
  tax?: number;
  total: number;
  
  // Payment
  paymentMethod: string;
  paymentStatus: string;
  
  // Notes
  notes?: string;
  terms?: string;
}

export class InvoiceGenerator {
  private doc: jsPDF;
  
  constructor() {
    this.doc = new jsPDF();
  }

  /**
   * Generate a PDF invoice
   */
  async generateInvoice(data: InvoiceData): Promise<Blob> {
    const doc = new jsPDF();
    
    // Colors
    const primaryColor: [number, number, number] = [101, 67, 159]; // Brand purple
    const textColor: [number, number, number] = [51, 51, 51];
    const lightGray: [number, number, number] = [240, 240, 240];
    
    let yPos = 20;
    
    // Header - Company Logo/Name
    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Nthandokazi Herbal', 20, yPos);
    
    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');
    doc.text(data.businessAddress, 20, yPos + 7);
    doc.text(`${data.businessPhone} | ${data.businessEmail}`, 20, yPos + 12);
    if (data.businessVAT) {
      doc.text(`VAT: ${data.businessVAT}`, 20, yPos + 17);
    }
    
    // Invoice Title
    doc.setFontSize(28);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 200, yPos, { align: 'right' });
    
    // Invoice Details Box
    yPos += 25;
    doc.setFillColor(...lightGray);
    doc.rect(140, yPos, 70, 25, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Number:', 145, yPos + 6);
    doc.text('Order Reference:', 145, yPos + 12);
    doc.text('Date:', 145, yPos + 18);
    
    doc.setFont('helvetica', 'normal');
    doc.text(data.invoiceNumber, 205, yPos + 6, { align: 'right' });
    doc.text(data.orderReference, 205, yPos + 12, { align: 'right' });
    doc.text(data.date, 205, yPos + 18, { align: 'right' });
    
    // Status Badge
    yPos += 30;
    const statusColors: Record<string, [number, number, number]> = {
      paid: [34, 197, 94],
      pending: [251, 191, 36],
      overdue: [239, 68, 68],
      cancelled: [156, 163, 175]
    };
    const statusColor = statusColors[data.status] || statusColors.pending;
    
    doc.setFillColor(...statusColor);
    doc.roundedRect(140, yPos - 5, 35, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(data.status.toUpperCase(), 157.5, yPos, { align: 'center' });
    
    // Bill To Section
    yPos += 10;
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', 20, yPos);
    
    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'bold');
    doc.text(data.customerName, 20, yPos + 7);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(data.customerAddress, 20, yPos + 12);
    doc.text(data.customerPhone, 20, yPos + 17);
    doc.text(data.customerEmail, 20, yPos + 22);
    
    // Items Table
    yPos += 35;
    
    const tableData = data.items.map(item => [
      item.name + (item.description ? `\n${item.description}` : ''),
      item.quantity.toString(),
      `R${item.unitPrice.toFixed(2)}`,
      `R${item.total.toFixed(2)}`
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Item', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        textColor: textColor
      },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 40, halign: 'right' },
        3: { cellWidth: 40, halign: 'right' }
      },
      margin: { left: 20, right: 20 }
    });
    
    // Get final Y position after table
    const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
    
    // Totals Section
    yPos = finalY + 10;
    const totalsX = 140;
    
    doc.setFontSize(9);
    doc.setTextColor(...textColor);
    
    // Subtotal
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', totalsX, yPos);
    doc.text(`R${data.subtotal.toFixed(2)}`, 205, yPos, { align: 'right' });
    
    // Delivery
    yPos += 6;
    doc.text('Delivery:', totalsX, yPos);
    doc.text(data.delivery === 0 ? 'FREE' : `R${data.delivery.toFixed(2)}`, 205, yPos, { align: 'right' });
    
    // Discount (if any)
    if (data.discount && data.discount > 0) {
      yPos += 6;
      doc.text('Discount:', totalsX, yPos);
      doc.text(`-R${data.discount.toFixed(2)}`, 205, yPos, { align: 'right' });
    }
    
    // Tax (if any)
    if (data.tax && data.tax > 0) {
      yPos += 6;
      doc.text('VAT (15%):', totalsX, yPos);
      doc.text(`R${data.tax.toFixed(2)}`, 205, yPos, { align: 'right' });
    }
    
    // Total
    yPos += 8;
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(totalsX, yPos - 2, 205, yPos - 2);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('TOTAL:', totalsX, yPos + 4);
    doc.text(`R${data.total.toFixed(2)}`, 205, yPos + 4, { align: 'right' });
    
    // Payment Information
    yPos += 15;
    doc.setFillColor(...lightGray);
    doc.rect(20, yPos, 170, 15, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Method:', 25, yPos + 6);
    doc.text('Payment Status:', 25, yPos + 11);
    
    doc.setFont('helvetica', 'normal');
    doc.text(data.paymentMethod, 70, yPos + 6);
    doc.text(data.paymentStatus, 70, yPos + 11);
    
    // Notes (if any)
    if (data.notes) {
      yPos += 25;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('Notes:', 20, yPos);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...textColor);
      const splitNotes = doc.splitTextToSize(data.notes, 170);
      doc.text(splitNotes, 20, yPos + 6);
      yPos += 6 + (splitNotes.length * 5);
    }
    
    // Terms & Conditions
    if (data.terms) {
      yPos += 10;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('Terms & Conditions:', 20, yPos);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      const splitTerms = doc.splitTextToSize(data.terms, 170);
      doc.text(splitTerms, 20, yPos + 4);
    }
    
    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for your business! 🌿', 105, pageHeight - 15, { align: 'center' });
    doc.text('Healing the natural way - Nthandokazi Herbal', 105, pageHeight - 10, { align: 'center' });
    
    // Generate QR Code for invoice
    try {
      const qrData = `INV:${data.invoiceNumber}|REF:${data.orderReference}|TOTAL:R${data.total}`;
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, { width: 60 });
      doc.addImage(qrCodeDataUrl, 'PNG', 175, pageHeight - 30, 25, 25);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
    
    return doc.output('blob');
  }

  /**
   * Download invoice as PDF
   */
  async downloadInvoice(data: InvoiceData, filename?: string): Promise<void> {
    const blob = await this.generateInvoice(data);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `invoice-${data.invoiceNumber}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Print invoice
   */
  async printInvoice(data: InvoiceData): Promise<void> {
    const blob = await this.generateInvoice(data);
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    
    iframe.onload = () => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(url);
      }, 100);
    };
  }
}

export default InvoiceGenerator;
