"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, XCircle, Clock, Mail, MessageCircle, ExternalLink } from "lucide-react";

interface EFTConfirmation {
  orderRef: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: string;
  proofSent: boolean;
  confirmed: boolean;
  confirmedAt?: string;
  createdAt: string;
}

export default function EFTConfirmations() {
  const [confirmations, setConfirmations] = useState<EFTConfirmation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingConfirmations();
    // Refresh every 5 minutes
    const interval = setInterval(fetchPendingConfirmations, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingConfirmations = async () => {
    try {
      const response = await fetch('/api/eft-confirmations?status=pending');
      if (response.ok) {
        const data = await response.json();
        // Map to component format
        const mapped = (data.confirmations || []).map((conf: any) => ({
          orderRef: conf.order_reference || 'N/A',
          customerName: conf.customer_name,
          customerEmail: conf.customer_email,
          customerPhone: conf.customer_phone,
          paymentMethod: 'eft',
          proofSent: !!conf.proof_of_payment_url,
          confirmed: conf.status === 'verified',
          confirmedAt: conf.verified_at,
          createdAt: conf.created_at,
          id: conf.id,
          amount: conf.amount,
          paymentReference: conf.payment_reference
        }));
        setConfirmations(mapped);
      }
    } catch (error) {
      console.error('Failed to fetch EFT confirmations:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfirmation = async (orderRef: string, confirmed: boolean) => {
    try {
      // Find the confirmation to get its ID
      const confirmation = confirmations.find(c => c.orderRef === orderRef);
      if (!confirmation) return;

      const response = await fetch('/api/eft-confirmations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          confirmationId: (confirmation as any).id,
          status: confirmed ? 'verified' : 'rejected',
          verifiedBy: 'admin',
          orderReference: orderRef
        }),
      });

      if (response.ok) {
        fetchPendingConfirmations(); // Refresh list
      }
    } catch (error) {
      console.error('Failed to update confirmation:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">EFT Payment Confirmations</h3>
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (confirmations.length === 0) {
    return (
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">EFT Payment Confirmations</h3>
        <div className="text-center py-8">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No pending EFT confirmations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          EFT Payment Confirmations
          <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-semibold">
            {confirmations.length}
          </span>
        </h3>
        <button
          onClick={fetchPendingConfirmations}
          className="text-brand-500 hover:text-brand-700 text-xs"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {confirmations.map((confirmation) => (
          <div key={confirmation.orderRef} className="border border-amber-200 bg-amber-50 rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-sm text-gray-900">{confirmation.orderRef}</p>
                <p className="text-xs text-gray-600">{confirmation.customerName}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-amber-600">
                <Clock className="w-3 h-3" />
                {formatTimeAgo(confirmation.createdAt)}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
              {confirmation.customerEmail && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {confirmation.customerEmail}
                </span>
              )}
              {confirmation.customerPhone && (
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  {confirmation.customerPhone}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => updateConfirmation(confirmation.orderRef, true)}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
              >
                <CheckCircle className="w-3 h-3" />
                Confirm
              </button>
              <button
                onClick={() => updateConfirmation(confirmation.orderRef, false)}
                className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
              >
                <XCircle className="w-3 h-3" />
                Reject
              </button>
              <a
                href={`https://wa.me/27${confirmation.customerPhone?.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Contact
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700">
          <strong>Tip:</strong> Verify payment proof in your WhatsApp/email before confirming. Orders will be processed within 2 hours of confirmation.
        </p>
      </div>
    </div>
  );
}
