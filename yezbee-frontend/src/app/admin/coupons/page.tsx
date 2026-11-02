'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Trash2, Edit2, Copy, Tag, X, Save,
  Percent, DollarSign, ToggleLeft, ToggleRight
} from 'lucide-react'
import DataTable from '@/components/admin/DataTable'
import FormField from '@/components/admin/FormField'

interface Coupon {
  id: string
  code: string
  description: string
  type: 'percentage' | 'fixed'
  value: number
  minOrder: number
  maxDiscount: number | null
  usageLimit: number
  perUserLimit: number
  usedCount: number
  startDate: string
  expiryDate: string
  applicableCategories: string[]
  applicableProducts: string[]
  minItems: number
  firstOrderOnly: boolean
  active: boolean
}

const allCoupons: Coupon[] = [
  { id: 'cpn-1', code: 'WELCOME20', description: 'Welcome discount for new customers', type: 'percentage', value: 20, minOrder: 5000, maxDiscount: 10000, usageLimit: 100, perUserLimit: 1, usedCount: 45, startDate: '2026-01-01', expiryDate: '2026-12-31', applicableCategories: [], applicableProducts: [], minItems: 1, firstOrderOnly: true, active: true },
  { id: 'cpn-2', code: 'BEE5000', description: 'Flat discount on luxury items', type: 'fixed', value: 5000, minOrder: 25000, maxDiscount: null, usageLimit: 50, perUserLimit: 1, usedCount: 12, startDate: '2026-06-01', expiryDate: '2026-09-30', applicableCategories: ['gowns', 'lehengas'], applicableProducts: [], minItems: 1, firstOrderOnly: false, active: true },
  { id: 'cpn-3', code: 'SAREESALE', description: 'Discount on saree collection', type: 'percentage', value: 15, minOrder: 10000, maxDiscount: 7500, usageLimit: 200, perUserLimit: 2, usedCount: 78, startDate: '2026-07-01', expiryDate: '2026-08-31', applicableCategories: ['sarees'], applicableProducts: [], minItems: 1, firstOrderOnly: false, active: true },
  { id: 'cpn-4', code: 'FREESHIP', description: 'Free shipping on all orders', type: 'fixed', value: 0, minOrder: 15000, maxDiscount: null, usageLimit: 500, perUserLimit: 5, usedCount: 312, startDate: '2026-01-01', expiryDate: '2026-12-31', applicableCategories: [], applicableProducts: [], minItems: 1, firstOrderOnly: false, active: true },
  { id: 'cpn-5', code: 'VIP25', description: 'VIP customer exclusive discount', type: 'percentage', value: 25, minOrder: 30000, maxDiscount: 25000, usageLimit: 20, perUserLimit: 1, usedCount: 8, startDate: '2026-07-15', expiryDate: '2026-10-15', applicableCategories: [], applicableProducts: ['PRD-001', 'PRD-004'], minItems: 1, firstOrderOnly: false, active: false },
  { id: 'cpn-6', code: 'FESTIVE10', description: 'Festive season discount', type: 'percentage', value: 10, minOrder: 8000, maxDiscount: 5000, usageLimit: 1000, perUserLimit: 3, usedCount: 234, startDate: '2026-10-01', expiryDate: '2026-11-15', applicableCategories: [], applicableProducts: [], minItems: 2, firstOrderOnly: false, active: false },
]

const emptyForm = {
  code: '', description: '', type: 'percentage' as 'percentage' | 'fixed',
  value: 0, minOrder: 0, maxDiscount: null as number | null,
  usageLimit: 0, perUserLimit: 1, startDate: '', expiryDate: '',
  applicableCategories: [] as string[], applicableProducts: [] as string[],
  minItems: 1, firstOrderOnly: false, active: true,
}

export default function CouponsPage() {
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState(emptyForm)

  const filteredCoupons = allCoupons.filter(c =>
    !search || c.code.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => {
    setEditingCoupon(null)
    setFormData(emptyForm)
    setShowModal(true)
  }

  const openEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      minOrder: coupon.minOrder,
      maxDiscount: coupon.maxDiscount,
      usageLimit: coupon.usageLimit,
      perUserLimit: coupon.perUserLimit,
      startDate: coupon.startDate,
      expiryDate: coupon.expiryDate,
      applicableCategories: coupon.applicableCategories,
      applicableProducts: coupon.applicableProducts,
      minItems: coupon.minItems,
      firstOrderOnly: coupon.firstOrderOnly,
      active: coupon.active,
    })
    setShowModal(true)
  }

  const columns = [
    {
      key: 'code',
      header: 'Code',
      render: (row: Coupon) => (
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-[#F5E6C8]/40 rounded-lg text-sm font-mono font-bold text-[#C9A84C] border border-[#C9A84C]/20">
            {row.code}
          </span>
          <button className="p-1 text-gray-300 hover:text-[#C9A84C] transition-colors">
            <Copy size={13} />
          </button>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (row: Coupon) => (
        <div className="flex items-center gap-1.5">
          {row.type === 'percentage' ? (
            <Percent size={14} className="text-blue-500" />
          ) : (
            <DollarSign size={14} className="text-green-500" />
          )}
          <span className="text-sm text-gray-600 capitalize">{row.type}</span>
        </div>
      ),
    },
    {
      key: 'value',
      header: 'Value',
      sortable: true,
      render: (row: Coupon) => (
        <span className="text-sm font-semibold text-gray-900">
          {row.type === 'percentage' ? `${row.value}%` : `₹${row.value.toLocaleString()}`}
        </span>
      ),
    },
    {
      key: 'minOrder',
      header: 'Min Order',
      sortable: true,
      render: (row: Coupon) => (
        <span className="text-sm text-gray-600">₹{row.minOrder.toLocaleString()}</span>
      ),
    },
    {
      key: 'usage',
      header: 'Usage',
      sortable: true,
      render: (row: Coupon) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-gray-100 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-[#C9A84C]"
              style={{ width: `${row.usageLimit > 0 ? (row.usedCount / row.usageLimit) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{row.usedCount}/{row.usageLimit}</span>
        </div>
      ),
    },
    {
      key: 'active',
      header: 'Status',
      render: (row: Coupon) => (
        <button className="text-gray-400 hover:text-[#C9A84C] transition-colors">
          {row.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
        </button>
      ),
    },
    {
      key: 'expiryDate',
      header: 'Expiry',
      sortable: true,
      render: (row: Coupon) => {
        const expired = new Date(row.expiryDate) < new Date()
        return (
          <span className={`text-xs ${expired ? 'text-red-500' : 'text-gray-500'}`}>
            {new Date(row.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        )
      },
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A1A] tracking-tight">Coupons</h1>
          <p className="text-gray-500 text-sm mt-0.5">{filteredCoupons.length} discount coupons</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-56">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search coupons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white rounded-xl text-sm text-gray-700 placeholder-gray-400 border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 transition-all"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#C9A84C] to-[#A8882E] text-white text-sm font-medium rounded-xl shadow-lg shadow-[#C9A84C]/20 hover:shadow-xl transition-all"
          >
            <Plus size={16} />
            Add Coupon
          </motion.button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredCoupons}
        keyExtractor={(row) => row.id}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={(row) => openEdit(row)}
        pageSize={10}
        actions={(row) => (
          <div className="flex items-center gap-1">
            <button onClick={(e) => { e.stopPropagation(); openEdit(row) }} className="p-1.5 text-gray-400 hover:text-[#C9A84C] transition-colors rounded-lg hover:bg-[#F5E6C8]/30">
              <Edit2 size={14} />
            </button>
            <button onClick={(e) => e.stopPropagation()} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      />

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Tag size={20} className="text-[#C9A84C]" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
                  </h3>
                </div>
                <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField label="Coupon Code" required>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="WELCOME20"
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 placeholder-gray-400 font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all"
                    />
                  </FormField>
                  <FormField label="Discount Type">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={formData.type === 'percentage'}
                          onChange={() => setFormData({ ...formData, type: 'percentage' })}
                          className="text-[#C9A84C] focus:ring-[#C9A84C]/30"
                        />
                        <span className="text-sm text-gray-700">Percentage</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={formData.type === 'fixed'}
                          onChange={() => setFormData({ ...formData, type: 'fixed' })}
                          className="text-[#C9A84C] focus:ring-[#C9A84C]/30"
                        />
                        <span className="text-sm text-gray-700">Fixed Amount</span>
                      </label>
                    </div>
                  </FormField>
                </div>

                <FormField label="Description">
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the coupon"
                    className="w-full px-4 py-2.5 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all"
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <FormField label={formData.type === 'percentage' ? 'Discount %' : 'Discount Amount'} required>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all"
                    />
                  </FormField>
                  <FormField label="Min Order (₹)">
                    <input
                      type="number"
                      value={formData.minOrder}
                      onChange={(e) => setFormData({ ...formData, minOrder: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all"
                    />
                  </FormField>
                  <FormField label="Max Discount (₹)">
                    <input
                      type="number"
                      value={formData.maxDiscount ?? ''}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value ? parseFloat(e.target.value) : null })}
                      placeholder="No limit"
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all"
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField label="Usage Limit">
                    <input
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })}
                      placeholder="0 = unlimited"
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all"
                    />
                  </FormField>
                  <FormField label="Per User Limit">
                    <input
                      type="number"
                      value={formData.perUserLimit}
                      onChange={(e) => setFormData({ ...formData, perUserLimit: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all"
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField label="Start Date">
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all"
                    />
                  </FormField>
                  <FormField label="Expiry Date">
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all"
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField label="Minimum Items">
                    <input
                      type="number"
                      value={formData.minItems}
                      onChange={(e) => setFormData({ ...formData, minItems: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all"
                    />
                  </FormField>
                  <div className="flex items-end pb-2.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.firstOrderOnly}
                        onChange={(e) => setFormData({ ...formData, firstOrderOnly: e.target.checked })}
                        className="w-4 h-4 rounded text-[#C9A84C] focus:ring-[#C9A84C]/30"
                      />
                      <span className="text-sm text-gray-700">First Order Only</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4 rounded text-[#C9A84C] focus:ring-[#C9A84C]/30"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-[#FAF7F2] rounded-xl hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowModal(false)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#C9A84C] to-[#A8882E] text-white text-sm font-medium rounded-xl shadow-lg shadow-[#C9A84C]/20 hover:shadow-xl transition-all"
                >
                  <Save size={16} />
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
