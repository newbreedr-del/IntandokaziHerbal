"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, Printer, ArrowLeft, Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import { InvoiceGenerator, InvoiceData } from "@/lib/invoice";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load invoice data - replace with actual API call
    const mockInvoice: InvoiceData = {
      invoiceNumber: `INV-${params.id}`,
      orderReference: `NTH-2024-${params.id}`,
      date: formatDate(new Date().toISOString()),
      status: 'paid',
      
      businessName: 'Nthandokazi Herbal',
      businessAddress: '123 Herbal Street, Johannesburg, 2000, South Africa',
      businessPhone: '+27 11 123 4567',
      businessEmail: 'info@nthandokazi.co.za',
      businessVAT: 'VAT123456789',
      
      customerName: 'Thandi Mokoena',
      customerEmail: 'thandi@email.com',
      customerPhone: '+27 72 345 6789',
      customerAddress: '12 Jacaranda Street, Hatfield, Pretoria, 0028',
      
      items: [
        {
          name: 'Immune Booster Tea',
          description: '100g organic herbal blend',
          quantity: 2,
          unitPrice: 150,
          total: 300
        },
        {
          name: 'Digestive Wellness Capsules',
          description: '60 capsules',
          quantity: 1,
          unitPrice: 250,
          total: 250
        }
      ],
      
      subtotal: 550,
      delivery: 0,
      discount: 50,
      total: 500,
      
      paymentMethod: 'Stitch Instant EFT',
      paymentStatus: 'Paid',
      
      notes: 'Thank you for your order! Your health is our priority.',
      terms: 'All sales are final. Products are not intended to diagnose, treat, cure or prevent any disease. Please consult a healthcare professional for medical advice.'
    };

    setInvoice(mockInvoice);
    setLoading(false);
  }, [params.id]);

  const handleDownload = async () => {
    if (!invoice) return;
    
    try {
      const generator = new InvoiceGenerator();
      await generator.downloadInvoice(invoice);
      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  const handlePrint = async () => {
    if (!invoice) return;
    
    try {
      const generator = new InvoiceGenerator();
      await generator.printInvoice(invoice);
    } catch (error) {
      toast.error('Failed to print invoice');
    }
  };

  const handleEmail = () => {
    toast.success('Email sent to customer!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Invoice not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={() => router.back()} variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-brand-900">Invoice {invoice.invoiceNumber}</h1>
                <p className="text-sm text-brand-600">Order: {invoice.orderReference}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleEmail} variant="outline" icon={<Mail className="w-4 h-4" />}>
                Email
              </Button>
              <Button onClick={handlePrint} variant="secondary" icon={<Printer className="w-4 h-4" />}>
                Print
              </Button>
              <Button onClick={handleDownload} icon={<Download className="w-4 h-4" />}>
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Invoice Preview */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 md:p-12"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-8 pb-8 border-b border-gray-200">
            <div>
              <h2 className="text-3xl font-bold text-brand-900 mb-2">{invoice.businessName}</h2>
              <p className="text-sm text-gray-600">{invoice.businessAddress}</p>
              <p className="text-sm text-gray-600">{invoice.businessPhone} | {invoice.businessEmail}</p>
              {invoice.businessVAT && <p className="text-sm text-gray-600">VAT: {invoice.businessVAT}</p>}
            </div>
            <div className="text-right">
              <h3 className="text-4xl font-bold text-brand-600 mb-2">INVOICE</h3>
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <p className="text-xs text-gray-600">Invoice Number</p>
                <p className="font-bold text-gray-900">{invoice.invoiceNumber}</p>
              </div>
            </div>
          </div>

          {/* Bill To & Invoice Details */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="text-sm font-bold text-brand-900 mb-3">BILL TO:</h4>
              <p className="font-bold text-gray-900">{invoice.customerName}</p>
              <p className="text-sm text-gray-600">{invoice.customerAddress}</p>
              <p className="text-sm text-gray-600">{invoice.customerPhone}</p>
              <p className="text-sm text-gray-600">{invoice.customerEmail}</p>
            </div>
            <div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Order Reference:</span>
                  <span className="font-semibold text-gray-900">{invoice.orderReference}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-semibold text-gray-900">{invoice.date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-semibold ${invoice.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {invoice.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead className="bg-brand-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Item</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Qty</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Unit Price</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
                    </td>
                    <td className="px-4 py-4 text-center text-gray-900">{item.quantity}</td>
                    <td className="px-4 py-4 text-right text-gray-900">{formatCurrency(item.unitPrice)}</td>
                    <td className="px-4 py-4 text-right font-semibold text-gray-900">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery:</span>
                <span className="font-semibold text-gray-900">
                  {invoice.delivery === 0 ? 'FREE' : formatCurrency(invoice.delivery)}
                </span>
              </div>
              {invoice.discount && invoice.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-semibold text-green-600">-{formatCurrency(invoice.discount)}</span>
                </div>
              )}
              <div className="border-t border-gray-300 pt-2 flex justify-between">
                <span className="font-bold text-gray-900">TOTAL:</span>
                <span className="font-bold text-brand-600 text-lg">{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Payment Method:</span>
                <span className="ml-2 font-semibold text-gray-900">{invoice.paymentMethod}</span>
              </div>
              <div>
                <span className="text-gray-600">Payment Status:</span>
                <span className="ml-2 font-semibold text-green-600">{invoice.paymentStatus}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-6">
              <h4 className="text-sm font-bold text-brand-900 mb-2">Notes:</h4>
              <p className="text-sm text-gray-600">{invoice.notes}</p>
            </div>
          )}

          {/* Terms */}
          {invoice.terms && (
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-xs font-bold text-gray-600 mb-2">TERMS & CONDITIONS:</h4>
              <p className="text-xs text-gray-500">{invoice.terms}</p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">Thank you for your business! 🌿</p>
            <p className="text-xs text-gray-500 mt-1">Healing the natural way - Nthandokazi Herbal</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
