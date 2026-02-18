"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2, Phone, Mail, MapPin, Tag } from "lucide-react";
import Modal from "@/components/Modal";
import { getClients, addClient, updateClient, deleteClient } from "@/lib/store";
import { formatCurrency, formatDate, generateId } from "@/lib/utils";
import type { Client } from "@/types";

const emptyClient: Omit<Client, "id" | "createdAt"> = {
  name: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
  totalSpent: 0,
  lastPurchase: null,
  tags: [],
};

export default function ClientsPage() {
  const [mounted, setMounted] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState(emptyClient);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    setMounted(true);
    setClients(getClients());
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const openAdd = () => {
    setEditing(null);
    setForm(emptyClient);
    setTagInput("");
    setShowModal(true);
  };

  const openEdit = (client: Client) => {
    setEditing(client);
    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      notes: client.notes,
      totalSpent: client.totalSpent,
      lastPurchase: client.lastPurchase,
      tags: client.tags,
    });
    setTagInput("");
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;

    if (editing) {
      const updated = { ...editing, ...form };
      updateClient(updated);
    } else {
      const newClient: Client = {
        ...form,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      addClient(newClient);
    }
    setClients(getClients());
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this client?")) {
      deleteClient(id);
      setClients(getClients());
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  };

  return (
    <div className="p-4 pt-16 lg:p-8 lg:pt-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">{clients.length} total clients</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Client
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, phone, or tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Client Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((client) => (
          <div key={client.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{client.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">Since {formatDate(client.createdAt)}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(client)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand-600 transition-colors">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(client.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-gray-400" />
                <span className="truncate">{client.email || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-gray-400" />
                <span>{client.phone || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                <span className="truncate">{client.address || "—"}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <div>
                <p className="text-xs text-gray-400">Total Spent</p>
                <p className="text-sm font-semibold text-gray-900">{formatCurrency(client.totalSpent)}</p>
              </div>
              {client.lastPurchase && (
                <div className="text-right">
                  <p className="text-xs text-gray-400">Last Purchase</p>
                  <p className="text-sm text-gray-600">{formatDate(client.lastPurchase)}</p>
                </div>
              )}
            </div>

            {client.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {client.tags.map((tag) => (
                  <span key={tag} className="badge bg-brand-50 text-brand-700">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {client.notes && (
              <p className="mt-2 text-xs text-gray-400 italic truncate">{client.notes}</p>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No clients found</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Client" : "Add New Client"} size="lg">
        <div className="space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input type="text" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Thandi Mokoena" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.co.za" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input type="tel" className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="072 345 6789" />
            </div>
          </div>
          <div>
            <label className="label">Address</label>
            <input type="text" className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, City" />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any special notes about this client..." />
          </div>
          <div>
            <label className="label">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="input flex-1"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Add a tag and press Enter"
              />
              <button type="button" onClick={addTag} className="btn-secondary">Add</button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {form.tags.map((tag) => (
                  <span key={tag} className="badge bg-brand-50 text-brand-700 cursor-pointer hover:bg-brand-100" onClick={() => removeTag(tag)}>
                    {tag} ×
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary">{editing ? "Update Client" : "Add Client"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
