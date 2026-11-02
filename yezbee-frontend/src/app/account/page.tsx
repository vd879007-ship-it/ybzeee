'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  MapPin,
  Gift,
  RotateCcw,
  Star,
  Bell,
  Share2,
  Wallet,
  LogOut,
  ChevronRight,
  Package,
  CreditCard,
  User as UserIcon,
  LogIn,
  UserPlus,
} from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/account', active: true },
  { icon: ShoppingBag, label: 'Orders', href: '/account/orders', active: false },
  { icon: Heart, label: 'Wishlist', href: '/account/wishlist', active: false },
  { icon: MapPin, label: 'Addresses', href: '/account/addresses', active: false },
  { icon: Gift, label: 'Coupons', href: '/account/coupons', active: false },
  { icon: RotateCcw, label: 'Returns', href: '/account/returns', active: false },
  { icon: Star, label: 'Reviews', href: '/account/reviews', active: false },
  { icon: Bell, label: 'Notifications', href: '/account/notifications', active: false },
  { icon: Share2, label: 'Referral', href: '/account/referral', active: false },
  { icon: Wallet, label: 'Wallet', href: '/account/wallet', active: false },
]

const RECENT_ORDERS = [
  { id: 'ORD-2026-001', date: '28 Jul 2026', status: 'Delivered', items: 3, total: 10497 },
  { id: 'ORD-2026-002', date: '15 Jul 2026', status: 'Shipped', items: 1, total: 3999 },
]

const STATUS_COLORS: Record<string, string> = {
  Delivered: 'text-green-600 bg-green-50',
  Shipped: 'text-blue-600 bg-blue-50',
  Processing: 'text-gold bg-gold/10',
  Cancelled: 'text-red-500 bg-red-50',
}

export default function AccountDashboard() {
  const [activeNav, setActiveNav] = useState('Dashboard')
  const { user, isAuthenticated, logout, openAuthModal, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[70vh] bg-[var(--color-warm-white)] py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-dark/10 shadow-lg text-center">
          <div className="w-16 h-16 rounded-2xl bg-gold/10 text-gold flex items-center justify-center mx-auto mb-4">
            <UserIcon size={32} />
          </div>
          <h2 className="font-playfair text-2xl text-dark font-medium">My Account</h2>
          <p className="text-xs text-dark/60 mt-2 mb-6">
            Sign in to view your orders, track deliveries, manage addresses, and access your privilege wishlist.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => openAuthModal('login')}
              className="w-full py-3 px-6 bg-dark text-white hover:bg-gold hover:text-dark rounded-xl font-medium text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <LogIn size={18} />
              <span>Sign In to Account</span>
            </button>

            <button
              onClick={() => openAuthModal('register')}
              className="w-full py-3 px-6 bg-white border border-dark/20 text-dark hover:border-gold hover:bg-gold/5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2"
            >
              <UserPlus size={18} />
              <span>Create New Account</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-warm-white)] py-8">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-playfair text-3xl md:text-4xl text-dark">My Account</h1>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-[240px] flex-shrink-0">
            <nav className="sticky top-28 space-y-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setActiveNav(item.label)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                    activeNav === item.label
                      ? 'bg-gold/10 text-gold font-medium'
                      : 'text-dark/60 hover:text-dark hover:bg-dark/5'
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              ))}
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut size={16} />
                Logout
              </button>
            </nav>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="lg:hidden overflow-x-auto pb-4 mb-6">
              <div className="flex gap-2 min-w-max">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs whitespace-nowrap transition-colors ${
                      activeNav === item.label
                        ? 'bg-gold/10 text-gold font-medium'
                        : 'bg-white text-dark/60 border border-dark/10'
                    }`}
                  >
                    <item.icon size={14} />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="bg-white rounded-xl border border-dark/5 p-6 md:p-8 mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-playfair text-dark">Welcome back, {user.name}! ✨</h2>
                  <p className="text-sm text-dark/40 mt-1">{user.email} {user.phone && `• ${user.phone}`}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gold/20 text-gold flex items-center justify-center font-bold text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: Package, label: 'Total Orders', value: '2', color: 'text-blue-600 bg-blue-50' },
                  { icon: Heart, label: 'Wishlist', value: '3', color: 'text-red-500 bg-red-50' },
                  { icon: Gift, label: 'Coupons Available', value: '1', color: 'text-gold bg-gold/10' },
                  { icon: CreditCard, label: 'Wallet Balance', value: '₹500', color: 'text-green-600 bg-green-50' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-xl border border-dark/5 p-4 md:p-6">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                      <stat.icon size={18} />
                    </div>
                    <p className="text-2xl font-medium mt-3">{stat.value}</p>
                    <p className="text-xs text-dark/40">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl border border-dark/5 p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm uppercase tracking-wider font-medium">Recent Orders</h3>
                  <Link href="/account/orders" className="text-xs text-gold hover:underline flex items-center gap-1">
                    View All <ChevronRight size={12} />
                  </Link>
                </div>
                <div className="space-y-4">
                  {RECENT_ORDERS.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 rounded-lg bg-dark/5">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{order.id}</p>
                        <p className="text-xs text-dark/40">{order.date} • {order.items} {order.items === 1 ? 'item' : 'items'}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-2.5 py-1 text-[10px] rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
                          {order.status}
                        </span>
                        <span className="text-sm font-medium">₹{order.total.toLocaleString()}</span>
                        <ChevronRight size={14} className="text-dark/20" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-dark/5 p-6">
                <h3 className="text-sm uppercase tracking-wider font-medium mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: ShoppingBag, label: 'Shop New Arrivals', href: '/category/casuals' },
                    { icon: MapPin, label: 'Manage Addresses', href: '/account/addresses' },
                    { icon: Heart, label: 'View Wishlist', href: '/wishlist' },
                    { icon: Star, label: 'Write a Review', href: '/account/reviews' },
                  ].map((action) => (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="flex flex-col items-center gap-2 p-4 rounded-lg border border-dark/10 hover:border-gold hover:bg-gold/5 transition-all text-center"
                    >
                      <action.icon size={20} className="text-dark/40" />
                      <span className="text-xs text-dark/60">{action.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
