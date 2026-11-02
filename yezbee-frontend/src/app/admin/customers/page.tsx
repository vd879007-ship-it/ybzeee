'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, X, Mail, Phone, MapPin, ShoppingBag,
  Heart, Activity,
} from 'lucide-react'
import DataTable from '@/components/admin/DataTable'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  ordersCount: number
  totalSpent: number
  joinedDate: string
  status: 'active' | 'inactive' | 'blocked'
  avatar: string
}

const allCustomers: Customer[] = [
  { id: 'CUS-001', name: 'Priya Sharma', email: 'priya.sharma@email.com', phone: '+91 98765 43210', ordersCount: 12, totalSpent: 425000, joinedDate: '2025-03-15', status: 'active', avatar: '' },
  { id: 'CUS-002', name: 'Ananya Gupta', email: 'ananya.gupta@email.com', phone: '+91 98765 43211', ordersCount: 8, totalSpent: 215000, joinedDate: '2025-04-20', status: 'active', avatar: '' },
  { id: 'CUS-003', name: 'Rahul Verma', email: 'rahul.verma@email.com', phone: '+91 98765 43212', ordersCount: 5, totalSpent: 98000, joinedDate: '2025-06-01', status: 'active', avatar: '' },
  { id: 'CUS-004', name: 'Neha Patel', email: 'neha.patel@email.com', phone: '+91 98765 43213', ordersCount: 15, totalSpent: 589000, joinedDate: '2025-01-10', status: 'active', avatar: '' },
  { id: 'CUS-005', name: 'Vikram Singh', email: 'vikram.singh@email.com', phone: '+91 98765 43214', ordersCount: 2, totalSpent: 25000, joinedDate: '2026-07-15', status: 'active', avatar: '' },
  { id: 'CUS-006', name: 'Kavita Reddy', email: 'kavita.reddy@email.com', phone: '+91 98765 43215', ordersCount: 7, totalSpent: 182000, joinedDate: '2025-08-22', status: 'inactive', avatar: '' },
  { id: 'CUS-007', name: 'Arjun Nair', email: 'arjun.nair@email.com', phone: '+91 98765 43216', ordersCount: 10, totalSpent: 345000, joinedDate: '2025-02-14', status: 'active', avatar: '' },
  { id: 'CUS-008', name: 'Meera Joshi', email: 'meera.joshi@email.com', phone: '+91 98765 43217', ordersCount: 4, totalSpent: 89000, joinedDate: '2026-01-30', status: 'blocked', avatar: '' },
  { id: 'CUS-009', name: 'Divya Kapoor', email: 'divya.kapoor@email.com', phone: '+91 98765 43218', ordersCount: 20, totalSpent: 785000, joinedDate: '2024-11-05', status: 'active', avatar: '' },
  { id: 'CUS-010', name: 'Rohan Desai', email: 'rohan.desai@email.com', phone: '+91 98765 43219', ordersCount: 3, totalSpent: 45000, joinedDate: '2026-04-18', status: 'active', avatar: '' },
  { id: 'CUS-011', name: 'Isha Malhotra', email: 'isha.malhotra@email.com', phone: '+91 98765 43220', ordersCount: 9, totalSpent: 298000, joinedDate: '2025-09-12', status: 'active', avatar: '' },
  { id: 'CUS-012', name: 'Amit Thakur', email: 'amit.thakur@email.com', phone: '+91 98765 43221', ordersCount: 6, totalSpent: 156000, joinedDate: '2025-12-01', status: 'inactive', avatar: '' },
]

const customerOrders = [
  { id: 'ORD-2026-0042', date: '2026-07-30', total: 50150, status: 'confirmed' },
  { id: 'ORD-2026-0036', date: '2026-07-20', total: 28900, status: 'delivered' },
  { id: 'ORD-2026-0028', date: '2026-07-10', total: 42500, status: 'delivered' },
  { id: 'ORD-2026-0015', date: '2026-06-25', total: 67800, status: 'delivered' },
  { id: 'ORD-2026-0003', date: '2026-06-05', total: 35500, status: 'delivered' },
]

const customerWishlist = [
  { name: 'Velvet Blazer', price: 28900 },
  { name: 'Designer Lehenga', price: 85000 },
  { name: 'Statement Necklace', price: 12500 },
]

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  inactive: 'bg-gray-100 text-gray-700 border-gray-200',
  blocked: 'bg-red-100 text-red-700 border-red-200',
}

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [detailTab, setDetailTab] = useState<'orders' | 'wishlist' | 'addresses' | 'activity'>('orders')

  const filteredCustomers = useMemo(() => {
    if (!search) return allCustomers
    const q = search.toLowerCase()
    return allCustomers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q)
    )
  }, [search])

  const columns = [
    {
      key: 'name',
      header: 'Customer',
      sortable: true,
      render: (row: Customer) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-[#C9A84C] to-[#A8882E] rounded-full flex items-center justify-center text-white text-xs font-semibold">
            {row.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{row.name}</p>
            <p className="text-xs text-gray-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (row: Customer) => (
        <span className="text-sm text-gray-600">{row.phone}</span>
      ),
    },
    {
      key: 'ordersCount',
      header: 'Orders',
      sortable: true,
      render: (row: Customer) => (
        <span className="text-sm font-medium text-gray-900">{row.ordersCount}</span>
      ),
    },
    {
      key: 'totalSpent',
      header: 'Total Spent',
      sortable: true,
      render: (row: Customer) => (
        <span className="text-sm font-semibold text-gray-900">₹{row.totalSpent.toLocaleString()}</span>
      ),
    },
    {
      key: 'joinedDate',
      header: 'Joined',
      sortable: true,
      render: (row: Customer) => (
        <span className="text-sm text-gray-500">{new Date(row.joinedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row: Customer) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border capitalize ${statusColors[row.status] || ''}`}>
          {row.status}
        </span>
      ),
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
          <h1 className="text-2xl font-semibold text-[#1A1A1A] tracking-tight">Customers</h1>
          <p className="text-gray-500 text-sm mt-0.5">{filteredCustomers.length} registered customers</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white rounded-xl text-sm text-gray-700 placeholder-gray-400 border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-transparent transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredCustomers}
        keyExtractor={(row) => row.id}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={(row) => setSelectedCustomer(row)}
        pageSize={10}
      />

      <AnimatePresence>
        {selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex justify-end"
            onClick={() => setSelectedCustomer(null)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 z-10 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedCustomer(null)} className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={20} />
                  </button>
                  <h3 className="text-lg font-semibold text-gray-900">Customer Details</h3>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#C9A84C] to-[#A8882E] rounded-2xl flex items-center justify-center text-white text-xl font-bold">
                    {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedCustomer.name}</h2>
                    <p className="text-sm text-gray-500">Customer since {new Date(selectedCustomer.joinedDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border capitalize mt-1 ${statusColors[selectedCustomer.status]}`}>
                      {selectedCustomer.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#F5E6C8]/30">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Orders</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{selectedCustomer.ordersCount}</p>
                  </div>
                  <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#F5E6C8]/30">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">₹{selectedCustomer.totalSpent.toLocaleString()}</p>
                  </div>
                  <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#F5E6C8]/30">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Avg. Order</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      ₹{selectedCustomer.ordersCount > 0 ? Math.round(selectedCustomer.totalSpent / selectedCustomer.ordersCount).toLocaleString() : 0}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Mail size={16} className="text-gray-300" />
                    {selectedCustomer.email}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Phone size={16} className="text-gray-300" />
                    {selectedCustomer.phone}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <MapPin size={16} className="text-gray-300" />
                    Mumbai, Maharashtra, India
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-gray-100 shadow-sm mb-6">
                  {(['orders', 'wishlist', 'addresses', 'activity'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setDetailTab(tab)}
                      className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg capitalize transition-all ${
                        detailTab === tab
                          ? 'bg-[#C9A84C] text-white shadow-md shadow-[#C9A84C]/20'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab === 'orders' && <ShoppingBag size={14} />}
                      {tab === 'wishlist' && <Heart size={14} />}
                      {tab === 'addresses' && <MapPin size={14} />}
                      {tab === 'activity' && <Activity size={14} />}
                      {tab}
                    </button>
                  ))}
                </div>

                {detailTab === 'orders' && (
                  <div className="space-y-3">
                    {customerOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-[#FAF7F2] rounded-xl hover:bg-[#F5E6C8]/20 transition-colors cursor-pointer border border-gray-50">
                        <div>
                          <p className="text-sm font-medium text-[#C9A84C]">{order.id}</p>
                          <p className="text-xs text-gray-400">{new Date(order.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">₹{order.total.toLocaleString()}</p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border bg-green-100 text-green-700 border-green-200 capitalize">
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {detailTab === 'wishlist' && (
                  <div className="space-y-3">
                    {customerWishlist.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-[#FAF7F2] rounded-xl border border-gray-50">
                        <div className="flex items-center gap-3">
                          <Heart size={16} className="text-red-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-400">₹{item.price.toLocaleString()}</p>
                          </div>
                        </div>
                        <button className="text-xs text-[#C9A84C] font-medium hover:underline">Add to Cart</button>
                      </div>
                    ))}
                    {customerWishlist.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-8">No items in wishlist</p>
                    )}
                  </div>
                )}

                {detailTab === 'addresses' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-[#FAF7F2] rounded-xl border border-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900">Home</p>
                        <span className="text-[10px] font-medium bg-[#C9A84C]/10 text-[#C9A84C] px-2 py-0.5 rounded-full border border-[#C9A84C]/20">Default</span>
                      </div>
                      <p className="text-sm text-gray-600">42, Rosewood Apartments, Banjara Hills, Hyderabad - 500034</p>
                    </div>
                    <div className="p-4 bg-[#FAF7F2] rounded-xl border border-gray-50">
                      <p className="text-sm font-medium text-gray-900 mb-2">Office</p>
                      <p className="text-sm text-gray-600">15, Tech Park, Hitech City, Hyderabad - 500081</p>
                    </div>
                  </div>
                )}

                {detailTab === 'activity' && (
                  <div className="space-y-3">
                    {[
                      { action: 'Placed order ORD-2026-0042', time: '2 hours ago' },
                      { action: 'Viewed product "Silk Evening Gown"', time: '1 day ago' },
                      { action: 'Added "Velvet Blazer" to wishlist', time: '3 days ago' },
                      { action: 'Left a review on "Handcrafted Saree"', time: '5 days ago' },
                      { action: 'Updated profile picture', time: '1 week ago' },
                    ].map((event, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-[#FAF7F2] rounded-xl border border-gray-50">
                        <Activity size={14} className="text-gray-300 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-700">{event.action}</p>
                          <p className="text-xs text-gray-400">{event.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
