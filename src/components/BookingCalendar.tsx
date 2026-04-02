"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, User, Mail, Phone, MessageSquare, CreditCard, CheckCircle, Loader2 } from "lucide-react";

interface AvailableSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface BookingFormData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientNotes: string;
  consultationType: string;
}

export default function BookingCalendar() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Date/Time, 2: Details, 3: Payment
  const [bookingId, setBookingId] = useState<string>("");
  const [paymentData, setPaymentData] = useState<any>(null);

  const [formData, setFormData] = useState<BookingFormData>({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientNotes: "",
    consultationType: "video"
  });

  // Generate next 30 days
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  useEffect(() => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    setAvailableDates(dates);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      generateDefaultSlots(selectedDate);
    }
  }, [selectedDate]);

  const generateDefaultSlots = (date: string) => {
    // Generate default time slots for the selected date
    // 9 AM to 5 PM, hourly slots
    const slots: AvailableSlot[] = [];
    const times = [
      { start: "09:00", end: "10:00" },
      { start: "10:00", end: "11:00" },
      { start: "11:00", end: "12:00" },
      { start: "12:00", end: "13:00" },
      { start: "13:00", end: "14:00" },
      { start: "14:00", end: "15:00" },
      { start: "15:00", end: "16:00" },
      { start: "16:00", end: "17:00" },
    ];

    times.forEach((time, index) => {
      slots.push({
        id: `${date}-${index}`,
        date: date,
        start_time: time.start,
        end_time: time.end,
        is_available: true
      });
    });

    setAvailableSlots(slots);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
  };

  const handleContinueToDetails = () => {
    if (selectedSlot) {
      setStep(2);
    }
  };

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create booking in database first
      const bookingRef = `BK-${Date.now().toString().slice(-8)}`;
      
      const bookingData = {
        slotId: selectedSlot?.id,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail || formData.clientPhone,
        clientPhone: formData.clientPhone,
        clientNotes: formData.clientNotes,
        bookingDate: selectedDate,
        startTime: selectedSlot?.start_time,
        endTime: selectedSlot?.end_time,
        consultationType: formData.consultationType,
        amount: 1500.00,
        paymentReference: bookingRef
      };

      // Create booking and payment records
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create booking');
      }

      const data = await response.json();
      setBookingId(data.booking.id);
      
      // Prepare payment data for PayFast
      const paymentData = {
        paymentUrl: process.env.NEXT_PUBLIC_PAYFAST_URL || 'https://sandbox.payfast.co.za/eng/process',
        paymentData: {
          merchant_id: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID || '10000100',
          merchant_key: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY || '46f0cd694581a',
          amount: '1500.00',
          item_name: 'Online Consultation - 60 minutes',
          item_description: `Consultation booking for ${selectedDate} at ${selectedSlot?.start_time} - ${formData.clientName}`,
          name_first: formData.clientName.split(' ')[0] || formData.clientName,
          name_last: formData.clientName.split(' ').slice(1).join(' ') || '',
          email_address: formData.clientEmail || formData.clientPhone,
          cell_number: formData.clientPhone,
          m_payment_id: bookingRef,
          return_url: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/booking/success?ref=${bookingRef}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/booking/cancel?ref=${bookingRef}`,
          notify_url: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/bookings/payment/notify`,
        }
      };
      
      setPaymentData(paymentData);
      setStep(3);
    } catch (error) {
      console.error("Error creating booking:", error);
      alert(error instanceof Error ? error.message : "Error creating booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (paymentData && paymentData.paymentData) {
      // Create form and submit to PayFast
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = paymentData.paymentUrl;

      Object.keys(paymentData.paymentData).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = paymentData.paymentData[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${step >= 1 ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
              {step > 1 ? <CheckCircle className="w-6 h-6" /> : '1'}
            </div>
            <span className="ml-2 font-medium">Date & Time</span>
          </div>
          <div className="flex-1 h-1 mx-4 bg-gray-200">
            <div className={`h-full ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`} style={{ width: step >= 2 ? '100%' : '0%', transition: 'width 0.3s' }}></div>
          </div>
          <div className={`flex items-center ${step >= 2 ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
              {step > 2 ? <CheckCircle className="w-6 h-6" /> : '2'}
            </div>
            <span className="ml-2 font-medium">Your Details</span>
          </div>
          <div className="flex-1 h-1 mx-4 bg-gray-200">
            <div className={`h-full ${step >= 3 ? 'bg-purple-600' : 'bg-gray-200'}`} style={{ width: step >= 3 ? '100%' : '0%', transition: 'width 0.3s' }}></div>
          </div>
          <div className={`flex items-center ${step >= 3 ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="ml-2 font-medium">Payment</span>
          </div>
        </div>
      </div>

      {/* Step 1: Date & Time Selection */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Date & Time</h2>
            <p className="text-gray-600">Choose your preferred consultation date and time slot</p>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Date</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {availableDates.map((date) => (
                <button
                  key={date}
                  onClick={() => handleDateSelect(date)}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    selectedDate === date
                      ? 'border-purple-600 bg-purple-50 text-purple-900'
                      : 'border-gray-200 hover:border-purple-300 text-gray-700'
                  }`}
                >
                  <div className="font-semibold">{formatDate(date)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Slot Selection */}
          {selectedDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Time Slot</label>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No available time slots for this date</p>
                  <p className="text-sm text-gray-500 mt-2">Please select another date</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => handleSlotSelect(slot)}
                      disabled={!slot.is_available}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        selectedSlot?.id === slot.id
                          ? 'border-purple-600 bg-purple-50 text-purple-900'
                          : slot.is_available
                          ? 'border-gray-200 hover:border-purple-300 text-gray-700'
                          : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold">{slot.start_time}</span>
                      </div>
                      <div className="text-xs mt-1">{slot.end_time}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Continue Button */}
          {selectedSlot && (
            <div className="flex justify-end">
              <button
                onClick={handleContinueToDetails}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold flex items-center gap-2"
              >
                Continue to Details
                <CheckCircle className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Client Details */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Details</h2>
            <p className="text-gray-600">Please provide your contact information</p>
          </div>

          {/* Selected Date/Time Summary */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-4 text-purple-900">
              <Calendar className="w-5 h-5" />
              <span className="font-semibold">{formatDate(selectedDate)}</span>
              <Clock className="w-5 h-5" />
              <span className="font-semibold">{selectedSlot?.start_time} - {selectedSlot?.end_time}</span>
            </div>
          </div>

          <form onSubmit={handleSubmitDetails} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name *
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address *
              </label>
              <input
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.clientPhone}
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., 0768435876"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultation Type *
              </label>
              <select
                value={formData.consultationType}
                onChange={(e) => setFormData({ ...formData, consultationType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="video">Video Call</option>
                <option value="phone">Phone Call</option>
                <option value="whatsapp">WhatsApp Call</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Additional Notes (Optional)
              </label>
              <textarea
                value={formData.clientNotes}
                onChange={(e) => setFormData({ ...formData, clientNotes: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={4}
                placeholder="Any specific concerns or topics you'd like to discuss..."
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue to Payment
                    <CreditCard className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Payment</h2>
            <p className="text-gray-600">Secure payment processing via PayFast</p>
          </div>

          {/* Booking Summary */}
          <div className="bg-white border-2 border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold">{formatDate(selectedDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-semibold">{selectedSlot?.start_time} - {selectedSlot?.end_time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-semibold">60 minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-semibold capitalize">{formData.consultationType}</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-gray-900">Total Amount:</span>
                  <span className="font-bold text-purple-600">R1,500.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <div className="space-y-4">
            <button
              onClick={handlePayment}
              className="w-full px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold text-lg flex items-center justify-center gap-2"
            >
              <CreditCard className="w-6 h-6" />
              Proceed to Secure Payment
            </button>
            <p className="text-sm text-gray-500 text-center">
              You will be redirected to PayFast for secure payment processing
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
