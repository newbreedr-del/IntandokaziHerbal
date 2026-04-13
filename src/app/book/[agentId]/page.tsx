"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, Clock, Video, Phone, MessageCircle, Leaf, CheckCircle } from "lucide-react";

export default function AgentBookingPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.agentId as string;

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [consultationType, setConsultationType] = useState<"video" | "phone" | "whatsapp">("phone");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState("");

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

  const getNextDays = (count: number) => {
    const days = [];
    for (let i = 1; i <= count; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const [hours] = selectedTime.split(':');
      const endHour = String(parseInt(hours) + 1).padStart(2, '0');
      const endTime = `${endHour}:00`;

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          clientEmail,
          clientPhone,
          bookingDate: selectedDate,
          startTime: selectedTime,
          endTime,
          consultationType,
          notes,
          agentId
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setBookingRef(data.booking.reference);
      } else {
        alert('Failed to create booking. Please try again.');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-6">Your consultation has been scheduled successfully.</p>
          
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Booking Reference</p>
            <p className="text-xl font-bold text-gray-900">{bookingRef}</p>
          </div>

          <div className="space-y-3 text-left mb-6">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">
                {new Date(selectedDate).toLocaleDateString('en-ZA', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">{selectedTime}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              {consultationType === 'video' && <Video className="w-5 h-5 text-green-600" />}
              {consultationType === 'phone' && <Phone className="w-5 h-5 text-green-600" />}
              {consultationType === 'whatsapp' && <MessageCircle className="w-5 h-5 text-green-600" />}
              <span className="text-gray-700 capitalize">{consultationType} Consultation</span>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            You'll receive a WhatsApp confirmation message shortly with all the details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Intandokazi Herbal</h1>
          </div>
          <p className="text-gray-600">Book Your Consultation</p>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Personal Details */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., 0712345678"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>
          </div>

          {/* Consultation Type */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Consultation Type</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'video', icon: Video, label: 'Video Call' },
                { value: 'phone', icon: Phone, label: 'Phone Call' },
                { value: 'whatsapp', icon: MessageCircle, label: 'WhatsApp' }
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setConsultationType(type.value as any)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    consultationType === type.value
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <type.icon className={`w-6 h-6 mx-auto mb-2 ${
                    consultationType === type.value ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    consultationType === type.value ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {type.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Date</h2>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Choose a date</option>
              {getNextDays(30).map(date => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString('en-ZA', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </option>
              ))}
            </select>
          </div>

          {/* Time Selection */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Time</h2>
            <div className="grid grid-cols-3 gap-3">
              {timeSlots.map(time => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedTime === time
                      ? 'border-green-600 bg-green-50 text-green-600'
                      : 'border-gray-200 hover:border-green-300 text-gray-700'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Any specific concerns or questions?"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !selectedDate || !selectedTime || !clientName || !clientPhone}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>

          <p className="text-xs text-center text-gray-500">
            Consultation fee: R1,500 • Payment details will be sent via WhatsApp
          </p>
        </form>
      </div>
    </div>
  );
}
