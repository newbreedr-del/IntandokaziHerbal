"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Package, MapPin, Clock, CheckCircle, XCircle, Truck } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

interface TrackingEvent {
  status: string;
  timestamp: string;
  location: string;
  notes?: string;
}

interface TrackingInfo {
  trackingNumber: string;
  orderRef: string;
  courier: 'paxi' | 'pargo';
  status: 'registered' | 'collected' | 'in_transit' | 'at_pickup_point' | 'delivered' | 'cancelled';
  currentLocation: string;
  estimatedDelivery?: string;
  pickupPoint?: {
    name: string;
    address: string;
    phone: string;
    hours: string;
  };
  history: TrackingEvent[];
}

export default function TrackingPage() {
  const params = useParams();
  const router = useRouter();
  const [tracking, setTracking] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load tracking data - replace with actual API call
    const mockTracking: TrackingInfo = {
      trackingNumber: params.trackingNumber as string,
      orderRef: 'NTH-2024-001',
      courier: params.trackingNumber?.toString().startsWith('PX') ? 'paxi' : 'pargo',
      status: 'in_transit',
      currentLocation: 'Johannesburg Distribution Center',
      estimatedDelivery: new Date(Date.now() + 172800000).toISOString(),
      pickupPoint: {
        name: 'PEP Hatfield',
        address: '123 Burnett Street, Hatfield, Pretoria, 0028',
        phone: '+27 12 362 5555',
        hours: 'Mon-Fri: 8am-6pm, Sat: 8am-4pm, Sun: 9am-2pm'
      },
      history: [
        {
          status: 'Registered',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          location: 'Nthandokazi Herbal - Johannesburg',
          notes: 'Parcel registered and ready for collection'
        },
        {
          status: 'Collected',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          location: 'Johannesburg Hub',
          notes: 'Parcel collected by courier'
        },
        {
          status: 'In Transit',
          timestamp: new Date(Date.now() - 43200000).toISOString(),
          location: 'Johannesburg Distribution Center',
          notes: 'Parcel in transit to destination'
        }
      ]
    };

    setTracking(mockTracking);
    setLoading(false);
  }, [params.trackingNumber]);

  const handleRefresh = () => {
    toast.success('Tracking information refreshed');
    // Reload tracking data
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Tracking information not found</p>
          <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  const statusConfig = {
    registered: { icon: Package, color: 'bg-blue-500', text: 'Registered' },
    collected: { icon: Truck, color: 'bg-purple-500', text: 'Collected' },
    in_transit: { icon: Truck, color: 'bg-yellow-500', text: 'In Transit' },
    at_pickup_point: { icon: MapPin, color: 'bg-orange-500', text: 'At Pickup Point' },
    delivered: { icon: CheckCircle, color: 'bg-green-500', text: 'Delivered' },
    cancelled: { icon: XCircle, color: 'bg-red-500', text: 'Cancelled' }
  };

  const currentStatus = statusConfig[tracking.status];
  const StatusIcon = currentStatus.icon;

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
                <h1 className="text-2xl font-bold text-brand-900">Track Shipment</h1>
                <p className="text-sm text-brand-600">Tracking: {tracking.trackingNumber}</p>
              </div>
            </div>
            <Button onClick={handleRefresh} variant="secondary">
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`${currentStatus.color} w-16 h-16 rounded-full flex items-center justify-center`}>
                <StatusIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{currentStatus.text}</h2>
                <p className="text-gray-600">Order: {tracking.orderRef}</p>
              </div>
            </div>
            <Badge variant="info" size="lg" className="uppercase">
              {tracking.courier}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-brand-600 mt-1" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Current Location</p>
                <p className="text-sm text-gray-600">{tracking.currentLocation}</p>
              </div>
            </div>
            {tracking.estimatedDelivery && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-brand-600 mt-1" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Estimated Delivery</p>
                  <p className="text-sm text-gray-600">{formatDate(tracking.estimatedDelivery)}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Pickup Point Info */}
        {tracking.pickupPoint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-600" />
              Pickup Point
            </h3>
            <div className="space-y-2">
              <p className="font-semibold text-gray-900">{tracking.pickupPoint.name}</p>
              <p className="text-sm text-gray-600">{tracking.pickupPoint.address}</p>
              <p className="text-sm text-gray-600">📞 {tracking.pickupPoint.phone}</p>
              <p className="text-sm text-gray-600">🕒 {tracking.pickupPoint.hours}</p>
            </div>
          </motion.div>
        )}

        {/* Tracking History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">Tracking History</h3>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            {/* Events */}
            <div className="space-y-6">
              {tracking.history.map((event, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="relative flex gap-4"
                >
                  {/* Timeline Dot */}
                  <div className="relative z-10">
                    <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    </div>
                  </div>
                  
                  {/* Event Details */}
                  <div className="flex-1 pb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{event.status}</h4>
                        <span className="text-xs text-gray-500">{formatDate(event.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">📍 {event.location}</p>
                      {event.notes && (
                        <p className="text-sm text-gray-500 italic">{event.notes}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-brand-50 border border-brand-200 rounded-xl p-6"
        >
          <h4 className="font-semibold text-brand-900 mb-2">Need Help?</h4>
          <p className="text-sm text-brand-700 mb-4">
            If you have any questions about your shipment, please contact our support team.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              Contact Support
            </Button>
            <Button variant="ghost" size="sm">
              View Order Details
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
