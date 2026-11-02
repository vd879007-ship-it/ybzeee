'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronRight,
  Package,
  Truck,
  MapPin,
  CreditCard,
  CheckCircle2,
} from 'lucide-react'

const ORDER_STATUSES = [
  { label: 'Confirmed', date: '28 Jul 2026', completed: true, icon: CheckCircle2 },
  { label: 'Shipped', date: '30 Jul 2026', completed: true, icon: Truck },
  { label: 'Out for Delivery', date: 'Expected 01 Aug', completed: false, icon: Package },
  { label: 'Delivered', date: 'Pending', completed: false, icon: CheckCircle2 },
]

const ORDER_ITEMS = [
  { id: 1, name: 'Luxe Crepe Silk Gown', qty: 1, price: 3999, color: 'Gold', size: 'M', image: '' },
  { id: 2, name: 'Champagne Evening Top', qty: 2, price: 2499, color: 'Champagne', size: 'S', image: '' },
]

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string

  return (
    <div className="min-h-screen bg-warmWhite">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8">
        <nav className="flex items-center gap-2 text-xs text-dark/40 mb-6">
          <Link href="/account" className="hover:text-gold">Account</Link>
          <ChevronRight size={12} />
          <Link href="/account/orders" className="hover:text-gold">Orders</Link>
          <ChevronRight size={12} />
          <span className="text-dark/60">{orderId}</span>
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-playfair text-3xl text-dark">Order {orderId}</h1>
            <p className="text-sm text-dark/40 mt-1">Placed on 28 Jul 2026</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 text-xs rounded-full font-medium text-blue-600 bg-blue-50">Shipped</span>
            <button className="px-4 py-2 border border-red-400 text-red-500 text-xs rounded-lg hover:bg-red-50 transition-colors">
              Cancel Order
            </button>
            <button className="px-4 py-2 bg-gold text-dark text-xs rounded-lg hover:bg-gold/90 transition-colors">
              Return Request
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-dark/5 p-6 mb-6">
          <h3 className="text-sm uppercase tracking-wider font-medium mb-6">Order Progress</h3>
          <div className="flex flex-col md:flex-row gap-0 md:gap-4">
            {ORDER_STATUSES.map((status, i) => (
              <div key={status.label} className="flex md:flex-col items-start md:items-center gap-4 md:gap-3 flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      status.completed ? 'bg-green-500 text-white' : 'bg-dark/10 text-dark/30'
                    }`}
                  >
                    <status.icon size={16} />
                  </div>
                  {i < ORDER_STATUSES.length - 1 && (
                    <div className={`hidden md:block flex-1 h-px w-full ${status.completed ? 'bg-green-500' : 'bg-dark/10'}`} />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${status.completed ? 'text-dark' : 'text-dark/30'}`}>{status.label}</p>
                  <p className="text-xs text-dark/30">{status.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-dark/5 p-6">
              <h3 className="text-sm uppercase tracking-wider font-medium mb-4">Items</h3>
              <div className="space-y-4">
                {ORDER_ITEMS.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-dark/5">
                    <div className="w-16 h-20 bg-dark/10 rounded-lg flex items-center justify-center text-[8px] text-dark/10 flex-shrink-0">Image</div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${item.id}`} className="text-sm font-medium hover:text-gold transition-colors">{item.name}</Link>
                      <p className="text-xs text-dark/40">Color: {item.color} | Size: {item.size}</p>
                      <p className="text-xs text-dark/40">Qty: {item.qty}</p>
                    </div>
                    <p className="text-sm font-medium">₹{(item.price * item.qty).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-dark/5 p-6">
              <h3 className="text-sm uppercase tracking-wider font-medium mb-4">Shipping Address</h3>
              <div className="flex items-start gap-3">
                <MapPin size={14} className="text-dark/30 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Priya Sharma</p>
                  <p className="text-dark/60">42, Designer Colony, Andheri West</p>
                  <p className="text-dark/60">Mumbai, Maharashtra - 400053</p>
                  <p className="text-dark/60">+91 98765 43210</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-dark/5 p-6">
              <h3 className="text-sm uppercase tracking-wider font-medium mb-4">Payment Details</h3>
              <div className="flex items-start gap-3">
                <CreditCard size={14} className="text-dark/30 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Credit Card</p>
                  <p className="text-dark/60">Visa ending in 4242</p>
                  <p className="text-dark/60">Paid on 28 Jul 2026</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-dark/5 p-6">
              <h3 className="text-sm uppercase tracking-wider font-medium mb-4">Price Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark/50">Subtotal</span>
                  <span>₹8,997</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark/50">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark/50">Discount</span>
                  <span className="text-green-600">-₹1,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark/50">Tax</span>
                  <span>₹500</span>
                </div>
                <div className="border-t border-dark/10 pt-2 flex justify-between font-medium">
                  <span>Total</span>
                  <span className="text-lg text-gold">₹8,497</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/account/orders" className="flex items-center gap-1 text-dark/40 hover:text-dark transition-colors">
            <ChevronRight size={14} className="rotate-180" /> Back to Orders
          </Link>
        </div>
      </div>
    </div>
  )
}
