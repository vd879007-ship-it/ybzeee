'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Plus,
  Edit3,
  Trash2,
  ChevronRight,
  X,
  Check,
  Star,
} from 'lucide-react'

interface Address {
  id: number
  label: string
  fullName: string
  phone: string
  address1: string
  address2: string
  city: string
  state: string
  pincode: string
  country: string
  isDefault: boolean
}

const INITIAL_ADDRESSES: Address[] = [
  {
    id: 1,
    label: 'Home',
    fullName: 'Priya Sharma',
    phone: '+91 98765 43210',
    address1: '42, Designer Colony',
    address2: 'Andheri West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400053',
    country: 'India',
    isDefault: true,
  },
  {
    id: 2,
    label: 'Office',
    fullName: 'Priya Sharma',
    phone: '+91 98765 43210',
    address1: 'B-701, Tech Park',
    address2: 'Bandra Kurla Complex',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400051',
    country: 'India',
    isDefault: false,
  },
]

const EMPTY_FORM: Address = {
  id: 0,
  label: 'Home',
  fullName: '',
  phone: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
  isDefault: false,
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<Address>(EMPTY_FORM)

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (addr: Address) => {
    setForm(addr)
    setEditingId(addr.id)
    setShowForm(true)
  }

  const deleteAddress = (id: number) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id))
  }

  const setDefault = (id: number) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })))
  }

  const saveAddress = () => {
    if (editingId) {
      setAddresses((prev) => prev.map((a) => (a.id === editingId ? { ...form, id: editingId } : a)))
    } else {
      const newId = Math.max(...addresses.map((a) => a.id), 0) + 1
      setAddresses((prev) => [...prev, { ...form, id: newId, isDefault: prev.length === 0 }])
    }
    setShowForm(false)
  }

  const updateField = (field: keyof Address, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-warmWhite">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8">
        <Link href="/account" className="flex items-center gap-1 text-xs text-dark/40 hover:text-dark transition-colors mb-4">
          <ChevronRight size={12} className="rotate-180" /> Back to Account
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="font-playfair text-3xl md:text-4xl text-dark">My Addresses</h1>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-gold text-dark text-sm rounded-lg hover:bg-gold/90 transition-colors"
          >
            <Plus size={14} /> Add New
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <MapPin size={64} className="text-dark/10 mb-6" />
            <h2 className="font-playfair text-xl text-dark mb-2">No Addresses Saved</h2>
            <p className="text-dark/50 text-sm mb-6">Add a delivery address for faster checkout</p>
            <button onClick={openAdd} className="px-8 py-3 bg-gold text-dark text-sm rounded-lg hover:bg-gold/90 transition-colors">
              Add Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <motion.div
                key={addr.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-dark/5 p-6 relative"
              >
                {addr.isDefault && (
                  <span className="absolute top-4 right-4 flex items-center gap-1 px-2 py-0.5 bg-gold/10 text-gold text-[10px] rounded-full">
                    <Star size={8} className="fill-gold" /> Default
                  </span>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-dark/5 text-dark/50 text-[10px] rounded">{addr.label}</span>
                </div>
                <p className="text-sm font-medium">{addr.fullName}</p>
                <p className="text-xs text-dark/40">{addr.phone}</p>
                <p className="text-xs text-dark/60 mt-1">
                  {addr.address1}
                  {addr.address2 ? `, ${addr.address2}` : ''}
                </p>
                <p className="text-xs text-dark/60">
                  {addr.city}, {addr.state} - {addr.pincode}
                </p>
                <p className="text-xs text-dark/40 mt-1">{addr.country}</p>
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-dark/5">
                  <button onClick={() => openEdit(addr)} className="flex items-center gap-1 text-xs text-dark/40 hover:text-dark transition-colors">
                    <Edit3 size={12} /> Edit
                  </button>
                  {!addr.isDefault && (
                    <>
                      <button onClick={() => deleteAddress(addr.id)} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-500 transition-colors">
                        <Trash2 size={12} /> Delete
                      </button>
                      <button onClick={() => setDefault(addr.id)} className="flex items-center gap-1 text-xs text-dark/40 hover:text-gold transition-colors">
                        <Check size={12} /> Set as Default
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div className="fixed inset-0 bg-black/40 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} />
            <motion.div
              className="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[520px] bg-warmWhite md:rounded-2xl z-50 overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              <div className="flex items-center justify-between p-6 border-b border-dark/10">
                <h2 className="font-playfair text-xl">{editingId ? 'Edit Address' : 'Add New Address'}</h2>
                <button onClick={() => setShowForm(false)} className="p-1 hover:text-gold transition-colors"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs text-dark/40 mb-1.5">Address Label</label>
                    <div className="flex gap-2">
                      {['Home', 'Office', 'Other'].map((l) => (
                        <button
                          key={l}
                          onClick={() => updateField('label', l)}
                          className={`px-4 py-2 text-xs border rounded-lg transition-colors ${
                            form.label === l ? 'border-gold bg-gold/5 text-gold' : 'border-dark/10 text-dark/40 hover:border-dark/30'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-dark/40 mb-1.5">Full Name</label>
                    <input type="text" value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} className="w-full text-sm border border-dark/20 rounded-lg px-4 py-3 outline-none focus:border-gold" />
                  </div>
                  <div>
                    <label className="block text-xs text-dark/40 mb-1.5">Phone</label>
                    <input type="tel" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} className="w-full text-sm border border-dark/20 rounded-lg px-4 py-3 outline-none focus:border-gold" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-dark/40 mb-1.5">Address Line 1</label>
                    <input type="text" value={form.address1} onChange={(e) => updateField('address1', e.target.value)} className="w-full text-sm border border-dark/20 rounded-lg px-4 py-3 outline-none focus:border-gold" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-dark/40 mb-1.5">Address Line 2 (Optional)</label>
                    <input type="text" value={form.address2} onChange={(e) => updateField('address2', e.target.value)} className="w-full text-sm border border-dark/20 rounded-lg px-4 py-3 outline-none focus:border-gold" />
                  </div>
                  <div>
                    <label className="block text-xs text-dark/40 mb-1.5">City</label>
                    <input type="text" value={form.city} onChange={(e) => updateField('city', e.target.value)} className="w-full text-sm border border-dark/20 rounded-lg px-4 py-3 outline-none focus:border-gold" />
                  </div>
                  <div>
                    <label className="block text-xs text-dark/40 mb-1.5">State</label>
                    <input type="text" value={form.state} onChange={(e) => updateField('state', e.target.value)} className="w-full text-sm border border-dark/20 rounded-lg px-4 py-3 outline-none focus:border-gold" />
                  </div>
                  <div>
                    <label className="block text-xs text-dark/40 mb-1.5">Pincode</label>
                    <input type="text" value={form.pincode} onChange={(e) => updateField('pincode', e.target.value)} className="w-full text-sm border border-dark/20 rounded-lg px-4 py-3 outline-none focus:border-gold" />
                  </div>
                  <div>
                    <label className="block text-xs text-dark/40 mb-1.5">Country</label>
                    <input type="text" value={form.country} onChange={(e) => updateField('country', e.target.value)} className="w-full text-sm border border-dark/20 rounded-lg px-4 py-3 outline-none focus:border-gold" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-6 border-t border-dark/10">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 border border-dark/20 text-dark/60 text-sm rounded-lg hover:border-dark/40 transition-colors">
                  Cancel
                </button>
                <button onClick={saveAddress} className="flex-1 py-3 bg-gold text-dark text-sm rounded-lg hover:bg-gold/90 transition-colors">
                  Save Address
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
