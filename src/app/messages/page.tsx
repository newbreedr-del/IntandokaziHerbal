"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Send, Bell, Clock, CheckCircle, XCircle, ToggleLeft, ToggleRight } from "lucide-react";
import { getAutoMessages, getMessageLogs, updateAutoMessage, addMessageLog } from "@/lib/store";
import { formatDate, formatDateTime, generateId, getStatusColor } from "@/lib/utils";
import type { AutoMessage, MessageLog } from "@/types";

export default function MessagesPage() {
  const [mounted, setMounted] = useState(false);
  const [autoMessages, setAutoMessages] = useState<AutoMessage[]>([]);
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([]);
  const [tab, setTab] = useState<"automation" | "logs">("automation");

  useEffect(() => {
    setMounted(true);
    setAutoMessages(getAutoMessages());
    setMessageLogs(getMessageLogs());
  }, []);

  if (!mounted) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>;

  const toggleActive = (msg: AutoMessage) => {
    const updated = { ...msg, isActive: !msg.isActive };
    updateAutoMessage(updated);
    setAutoMessages(getAutoMessages());
  };

  const typeLabel = (type: string) => {
    const labels: Record<string, string> = {
      payment_reminder: "Payment Reminder",
      thank_you: "Thank You",
      follow_up: "Follow Up",
      promotion: "Promotion",
      low_stock_alert: "Stock Alert",
      birthday: "Birthday",
    };
    return labels[type] || type;
  };

  const typeColor = (type: string) => {
    const colors: Record<string, string> = {
      payment_reminder: "bg-yellow-100 text-yellow-700",
      thank_you: "bg-green-100 text-green-700",
      follow_up: "bg-blue-100 text-blue-700",
      promotion: "bg-purple-100 text-purple-700",
      low_stock_alert: "bg-red-100 text-red-700",
      birthday: "bg-pink-100 text-pink-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  const channelIcon = (ch: string) => {
    switch (ch) {
      case "whatsapp": return "🟢";
      case "sms": return "💬";
      case "email": return "📧";
      default: return "📨";
    }
  };

  const sortedLogs = [...messageLogs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="p-4 pt-16 lg:p-8 lg:pt-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Automated Messages</h1>
        <p className="text-sm text-gray-500 mt-1">Set up automatic messages to keep your clients informed and engaged.</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab("automation")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "automation" ? "bg-brand-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
          <span className="flex items-center gap-2"><Bell className="h-4 w-4" /> Automation Rules</span>
        </button>
        <button onClick={() => setTab("logs")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "logs" ? "bg-brand-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
          <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> Message History ({messageLogs.length})</span>
        </button>
      </div>

      {tab === "automation" && (
        <div className="space-y-4">
          {autoMessages.map((msg) => (
            <div key={msg.id} className={`card border-l-4 ${msg.isActive ? "border-l-green-500" : "border-l-gray-300"}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`badge ${typeColor(msg.type)}`}>{typeLabel(msg.type)}</span>
                  <span className={`text-xs ${msg.isActive ? "text-green-600" : "text-gray-400"}`}>
                    {msg.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <button onClick={() => toggleActive(msg)} className="flex items-center gap-1 text-sm">
                  {msg.isActive ? (
                    <ToggleRight className="h-6 w-6 text-green-500" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-gray-400" />
                  )}
                </button>
              </div>
              <div className="mb-2">
                <p className="text-xs text-gray-400 mb-1">Trigger: <span className="text-gray-600">{msg.trigger}</span></p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 mb-3">
                {msg.template}
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>Sent {msg.sentCount} times</span>
                {msg.lastSent && <span>Last sent: {formatDate(msg.lastSent)}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "logs" && (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Date</th>
                  <th className="table-header">Client</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Channel</th>
                  <th className="table-header">Message</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50">
                    <td className="table-cell text-gray-500 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                    <td className="table-cell font-medium text-gray-900 whitespace-nowrap">{log.clientName}</td>
                    <td className="table-cell"><span className={`badge ${typeColor(log.type)}`}>{typeLabel(log.type)}</span></td>
                    <td className="table-cell whitespace-nowrap">
                      <span className="flex items-center gap-1">{channelIcon(log.channel)} {log.channel}</span>
                    </td>
                    <td className="table-cell text-gray-500 max-w-xs truncate">{log.message}</td>
                    <td className="table-cell">
                      <span className="flex items-center gap-1">
                        {log.status === "sent" ? <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : log.status === "failed" ? <XCircle className="h-3.5 w-3.5 text-red-500" /> : <Clock className="h-3.5 w-3.5 text-yellow-500" />}
                        <span className={`text-xs font-medium ${log.status === "sent" ? "text-green-600" : log.status === "failed" ? "text-red-600" : "text-yellow-600"}`}>{log.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sortedLogs.length === 0 && <div className="text-center py-12"><p className="text-gray-400">No messages sent yet</p></div>}
        </div>
      )}
    </div>
  );
}
