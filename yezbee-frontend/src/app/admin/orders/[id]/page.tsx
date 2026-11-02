'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Printer, Send, XCircle, ChevronDown,
  Package, CreditCard, MapPin, User, Clock, AlertCircle,
  CheckCircle, Truck, ShoppingBag, FileText
} from 'lucide-react'

const orderData = {
  id: 'ORD-2026-0042',
  date: '2026-07-30T14:23:00',
  status: 'confirmed' as const,
  payment: 'paid' as const,
  paymentMethod: 'Credit Card (HDFC)',
  subtotal: 42500,
  shipping: 0,
  discount: 0,
  tax: 7650,
  total: 50150,
  notes: 'Customer requested gift wrapping. Please ensure premium packaging.',
  customer: {
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    phone: '+91 98765 43210',
    ordersCount: 5,
    joinedDate: '2025-03-15',
  },
  shippingAddress: {
    line1: '42, Rosewood Apartments',
    line2: 'Banjara Hills, Road No. 12',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500034',
    country: 'India',
  },
  billingAddress: {
    line1: '42, Rosewood Apartments',
    line2: 'Banjara Hills, Road No. 12',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500034',
    country: 'India',
  },
  items: [
    { id: 1, name: 'Silk Evening Gown - Gold', sku: 'YEB-SEG-001-GD-M', price: 42500, quantity: 1, image: '/images/maternity/slide3.jpg' },
    { id: 2, name: 'Statement Necklace - Pearl', sku: 'YEB-SN-010-PL', price: 12500, quantity: 1, image: '/images/haute_accessories.jpg' },
    { id: 3, name: 'Embellished Heels - Nude', sku: 'YEB-EH-012-ND-7', price: 18500, quantity: 1, image: '/images/western_chic.jpg' },
  ],
  timeline: [
    { action: 'Order Placed', timestamp: '2026-07-30T14:23:00', user: 'Priya Sharma', note: '' },
    { action: 'Payment Received', timestamp: '2026-07-30T14:25:00', user: 'System', note: '₹50,150 via Credit Card' },
    { action: 'Order Confirmed', timestamp: '2026-07-30T15:00:00', user: 'Aarav Mehta', note: 'Inventory verified' },
    { action: 'Processing Started', timestamp: '2026-07-30T16:30:00', user: 'System', note: 'Items sent to packaging' },
  ],
}

const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'] as const

const statusColors: Record<string, string> = {
  pending: 'bg-orange-100 text-orange-700 border-orange-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  processing: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  shipped: 'bg-purple-100 text-purple-700 border-purple-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  returned: 'bg-gray-100 text-gray-700 border-gray-200',
}

const timelineIcons: Record<string, React.ElementType> = {
  'Order Placed': ShoppingBag,
  'Payment Received': CreditCard,
  'Order Confirmed': CheckCircle,
  'Processing Started': Package,
  'Shipped': Truck,
  'Out for Delivery': Truck,
  'Delivered': CheckCircle,
  'Cancelled': XCircle,
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [status, setStatus] = useState<typeof statuses[number]>(orderData.status as typeof statuses[number])
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [showCancelModal, setShowCancelModal] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/orders')}
            className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm text-gray-500 hover:text-[#C9A84C] transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-[#1A1A1A] tracking-tight">{orderData.id}</h1>
              <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium border capitalize ${statusColors[status]}`}>
                {status}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-0.5">
              Placed on {new Date(orderData.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-600 bg-white rounded-xl border border-gray-100 shadow-sm hover:bg-[#FAF7F2] transition-all"
          >
            <Printer size={15} />
            Print Invoice
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-600 bg-white rounded-xl border border-gray-100 shadow-sm hover:bg-[#FAF7F2] transition-all"
          >
            <Send size={15} />
            Email Customer
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCancelModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-red-600 bg-white rounded-xl border border-red-100 shadow-sm hover:bg-red-50 transition-all"
          >
            <XCircle size={15} />
            Cancel
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 pb-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Package size={16} className="text-[#C9A84C]" />
                Order Items ({orderData.items.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-50">
              {orderData.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-[#FAF7F2] transition-colors">
                  <div className="w-14 h-14 bg-[#F5E6C8]/30 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={22} className="text-[#C9A84C]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-400">SKU: {item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">₹{item.price.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-[#FAF7F2] border-t border-gray-100">
              <div className="space-y-2 text-sm max-w-xs ml-auto">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="text-gray-900">₹{orderData.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">{orderData.shipping === 0 ? 'Free' : `₹${orderData.shipping.toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (18%)</span>
                  <span className="text-gray-900">₹{orderData.tax.toLocaleString()}</span>
                </div>
                {orderData.discount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Discount</span>
                    <span className="text-green-600">-₹{orderData.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>₹{orderData.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={16} className="text-[#C9A84C]" />
              Activity Timeline
            </h3>
            <div className="relative">
              <div className="absolute left-3.5 top-2 bottom-2 w-px bg-gray-100" />
              <div className="space-y-5">
                {orderData.timeline.map((event, i) => {
                  const Icon = timelineIcons[event.action] || Clock
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex gap-4 relative"
                    >
                      <div className="relative z-10">
                        <div className="w-7 h-7 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center">
                          <Icon size={12} className="text-[#C9A84C]" />
                        </div>
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{event.action}</p>
                          <span className="text-xs text-gray-400">
                            {new Date(event.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">by {event.user}</p>
                        {event.note && <p className="text-xs text-gray-400 mt-0.5 italic">{event.note}</p>}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={16} className="text-[#C9A84C]" />
              Customer
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#C9A84C] to-[#A8882E] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {orderData.customer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{orderData.customer.name}</p>
                  <p className="text-xs text-gray-400">{orderData.customer.ordersCount} orders</p>
                </div>
              </div>
              <div className="pt-2 space-y-1.5">
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <Send size={12} className="text-gray-300" />
                  {orderData.customer.email}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <FileText size={12} className="text-gray-300" />
                  {orderData.customer.phone}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <Clock size={12} className="text-gray-300" />
                  Customer since {new Date(orderData.customer.joinedDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-[#C9A84C]" />
              Shipping Address
            </h3>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p className="font-medium text-gray-900">{orderData.customer.name}</p>
              <p>{orderData.shippingAddress.line1}</p>
              <p>{orderData.shippingAddress.line2}</p>
              <p>{orderData.shippingAddress.city}, {orderData.shippingAddress.state}</p>
              <p>{orderData.shippingAddress.pincode}</p>
              <p>{orderData.shippingAddress.country}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard size={16} className="text-[#C9A84C]" />
              Payment
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-medium text-gray-900">{orderData.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`font-medium capitalize ${orderData.payment === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                  {orderData.payment}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="font-semibold text-gray-900">₹{orderData.total.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <div className="relative">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Status</h3>
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 hover:bg-[#F5E6C8]/30 transition-all"
              >
                <span className="capitalize">{status}</span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              {showStatusDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-100 shadow-xl z-10 overflow-hidden"
                >
                  {statuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setStatus(s); setShowStatusDropdown(false) }}
                      className={`w-full px-4 py-2.5 text-sm text-left capitalize hover:bg-[#FAF7F2] transition-colors ${
                        s === status ? 'text-[#C9A84C] font-medium bg-[#F5E6C8]/20' : 'text-gray-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
            {orderData.notes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 flex items-start gap-1.5">
                  <AlertCircle size={12} className="text-[#C9A84C] mt-0.5 flex-shrink-0" />
                  <span>{orderData.notes}</span>
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <XCircle size={28} className="text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Cancel Order</h3>
                <p className="text-sm text-gray-500 mt-1">Are you sure you want to cancel this order?</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason for cancellation</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 transition-all"
                >
                  <option value="">Select a reason</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="customer_request">Customer Request</option>
                  <option value="payment_issue">Payment Issue</option>
                  <option value="fraud_suspicion">Fraud Suspicion</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-[#FAF7F2] rounded-xl hover:bg-gray-100 transition-all"
                >
                  Keep Order
                </button>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Cancel Order
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
