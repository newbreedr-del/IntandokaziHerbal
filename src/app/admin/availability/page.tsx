"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

interface Slot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  current_bookings: number;
  max_bookings: number;
}

const PRESET_TIMES = [
  { start: "08:00", end: "09:00" },
  { start: "09:00", end: "10:00" },
  { start: "10:00", end: "11:00" },
  { start: "11:00", end: "12:00" },
  { start: "13:00", end: "14:00" },
  { start: "14:00", end: "15:00" },
  { start: "15:00", end: "16:00" },
  { start: "16:00", end: "17:00" },
];

function getMonthDates(year: number, month: number): string[] {
  const dates: string[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    dates.push(date.toISOString().split("T")[0]);
  }
  return dates;
}

function formatDate(dateString: string) {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-ZA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatShortDate(dateString: string) {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric" });
}

export default function AdminAvailabilityPage() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [allSlots, setAllSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedPresets, setSelectedPresets] = useState<Set<string>>(new Set());
  const [customStart, setCustomStart] = useState("09:00");
  const [customEnd, setCustomEnd] = useState("10:00");
  const [successMsg, setSuccessMsg] = useState("");

  const monthDates = getMonthDates(viewYear, viewMonth);
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    try {
      const startDate = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(viewYear, viewMonth + 1, 0).getDate();
      const endDate = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      const res = await fetch(
        `/api/admin/availability?startDate=${startDate}&endDate=${endDate}`
      );
      const data = await res.json();
      setAllSlots(data.slots || []);
    } catch (err) {
      console.error("Failed to fetch slots:", err);
    } finally {
      setLoading(false);
    }
  }, [viewYear, viewMonth]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const slotsForDate = (date: string) =>
    allSlots.filter((s) => s.date === date);

  const hasSlots = (date: string) => slotsForDate(date).length > 0;

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedPresets(new Set());
  };

  const togglePreset = (key: string) => {
    setSelectedPresets((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const isPresetAlreadySaved = (start: string) =>
    slotsForDate(selectedDate).some((s) => s.start_time === start);

  const handleSaveSlots = async () => {
    if (!selectedDate) return;
    const slotsToAdd = PRESET_TIMES.filter(
      (t) => selectedPresets.has(t.start) && !isPresetAlreadySaved(t.start)
    );
    if (slotsToAdd.length === 0) {
      setSuccessMsg("No new slots to add.");
      setTimeout(() => setSuccessMsg(""), 3000);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, slots: slotsToAdd }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSuccessMsg(`${slotsToAdd.length} slot(s) added successfully!`);
      setTimeout(() => setSuccessMsg(""), 4000);
      setSelectedPresets(new Set());
      await fetchSlots();
    } catch (err) {
      console.error(err);
      alert("Error saving slots. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddCustomSlot = async () => {
    if (!selectedDate || !customStart || !customEnd) return;
    if (customStart >= customEnd) {
      alert("End time must be after start time.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          slots: [{ start_time: customStart, end_time: customEnd }],
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSuccessMsg("Custom slot added!");
      setTimeout(() => setSuccessMsg(""), 4000);
      await fetchSlots();
    } catch (err) {
      console.error(err);
      alert("Error adding custom slot.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    if (!confirm("Remove this time slot?")) return;
    try {
      const res = await fetch(`/api/admin/availability?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchSlots();
    } catch (err) {
      console.error(err);
      alert("Error removing slot.");
    }
  };

  const handleDeleteAllForDate = async (date: string) => {
    if (!confirm(`Remove ALL slots for ${formatShortDate(date)}?`)) return;
    try {
      const res = await fetch(`/api/admin/availability?date=${date}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      if (selectedDate === date) setSelectedDate("");
      await fetchSlots();
    } catch (err) {
      console.error(err);
      alert("Error removing slots.");
    }
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
    setSelectedDate("");
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
    setSelectedDate("");
  };

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    "en-ZA",
    { month: "long", year: "numeric" }
  );

  const todayStr = today.toISOString().split("T")[0];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Availability Management
          </h1>
          <p className="text-gray-600">
            Set the dates and times clients can book consultations
          </p>
        </div>
        <button
          onClick={fetchSlots}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {successMsg && (
        <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          <CheckCircle className="w-5 h-5" />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">{monthLabel}</h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className="text-center text-xs font-medium text-gray-500 py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {monthDates.map((date) => {
              const isPast = date < todayStr;
              const isSelected = selectedDate === date;
              const hasSavedSlots = hasSlots(date);

              return (
                <button
                  key={date}
                  onClick={() => !isPast && handleSelectDate(date)}
                  disabled={isPast}
                  className={`
                    relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm font-medium transition-all
                    ${isPast ? "text-gray-300 cursor-not-allowed" : "cursor-pointer"}
                    ${isSelected ? "bg-purple-600 text-white" : ""}
                    ${!isSelected && !isPast ? "hover:bg-purple-50 text-gray-700" : ""}
                    ${date === todayStr && !isSelected ? "ring-2 ring-purple-400" : ""}
                  `}
                >
                  <span>{new Date(date + "T00:00:00").getDate()}</span>
                  {hasSavedSlots && (
                    <span
                      className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                        isSelected ? "bg-white" : "bg-purple-500"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
              Has available slots
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded ring-2 ring-purple-400 inline-block" />
              Today
            </div>
          </div>
        </div>

        {/* Slot Management Panel */}
        <div className="space-y-4">
          {!selectedDate ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Select a date to manage slots</p>
              <p className="text-gray-400 text-sm mt-1">Click any future date on the calendar</p>
            </div>
          ) : (
            <>
              {/* Date header */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{formatDate(selectedDate)}</h3>
                  <p className="text-sm text-gray-500">
                    {slotsForDate(selectedDate).length} slot(s) configured
                  </p>
                </div>
                {slotsForDate(selectedDate).length > 0 && (
                  <button
                    onClick={() => handleDeleteAllForDate(selectedDate)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear All
                  </button>
                )}
              </div>

              {/* Existing Slots */}
              {slotsForDate(selectedDate).length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Current Slots
                  </h4>
                  <div className="space-y-2">
                    {slotsForDate(selectedDate).map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-900">
                            {slot.start_time} – {slot.end_time}
                          </span>
                          {slot.current_bookings > 0 && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                              {slot.current_bookings} booked
                            </span>
                          )}
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              slot.is_available
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {slot.is_available ? "Available" : "Closed"}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          disabled={slot.current_bookings > 0}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title={
                            slot.current_bookings > 0
                              ? "Cannot delete — has active bookings"
                              : "Remove slot"
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Preset Slots */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Time Slots
                </h4>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {PRESET_TIMES.map((t) => {
                    const alreadySaved = isPresetAlreadySaved(t.start);
                    const isSelected = selectedPresets.has(t.start);
                    return (
                      <button
                        key={t.start}
                        onClick={() => !alreadySaved && togglePreset(t.start)}
                        disabled={alreadySaved}
                        className={`
                          flex items-center justify-between px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all
                          ${alreadySaved ? "border-green-200 bg-green-50 text-green-700 cursor-not-allowed opacity-70" : ""}
                          ${!alreadySaved && isSelected ? "border-purple-600 bg-purple-50 text-purple-900" : ""}
                          ${!alreadySaved && !isSelected ? "border-gray-200 hover:border-purple-300 text-gray-700" : ""}
                        `}
                      >
                        <span>
                          {t.start} – {t.end}
                        </span>
                        {alreadySaved ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : isSelected ? (
                          <ToggleRight className="w-4 h-4 text-purple-600" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedPresets.size > 0 && (
                  <button
                    onClick={handleSaveSlots}
                    disabled={saving}
                    className="w-full py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors mb-4"
                  >
                    {saving ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Add {selectedPresets.size} Selected Slot(s)
                  </button>
                )}

                {/* Custom time slot */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    Or add a custom time slot:
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <span className="text-gray-500 text-sm">to</span>
                    <input
                      type="time"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleAddCustomSlot}
                      disabled={saving}
                      className="px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Month overview of all configured dates */}
      {allSlots.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Configured Dates This Month
          </h3>
          <div className="space-y-2">
            {Array.from(new Set(allSlots.map((s) => s.date))).sort().map((date) => {
              const slots = slotsForDate(date);
              return (
                <div
                  key={date}
                  className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <span className="font-medium text-gray-900 text-sm">
                      {formatDate(date)}
                    </span>
                    <span className="text-gray-500 text-sm ml-3">
                      {slots.length} slot(s):{" "}
                      {slots.map((s) => s.start_time).join(", ")}
                    </span>
                  </div>
                  <button
                    onClick={() => handleSelectDate(date)}
                    className="text-sm text-purple-600 hover:underline"
                  >
                    Edit
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
