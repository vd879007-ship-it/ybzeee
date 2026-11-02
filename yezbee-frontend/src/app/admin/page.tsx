'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  DollarSign, ShoppingBag, Users, TrendingUp, Package,
  Plus, Eye, BarChart3, ExternalLink, Clock, ChevronRight
} from 'lucide-react'
import StatCard from '@/components/admin/StatCard'
import Chart from '@/components/admin/Chart'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } },
}

const stats = [
  {
    icon: DollarSign,
    label: 'Total Revenue',
    value: '₹48,92,340',
    trend: 12.5,
    change: '+12.5% from last month',
    color: '#C9A84C',
    data: [30, 45, 38, 52, 48, 55, 62, 58, 65, 70, 68, 75, 72, 80, 85, 82, 78, 90, 88, 95, 92, 100, 98, 105, 110, 108, 115, 118, 120, 125],
  },
  {
    icon: ShoppingBag,
    label: 'Total Orders',
    value: '1,842',
    trend: 8.3,
    change: '+8.3% from last month',
    color: '#3B82F6',
    data: [20, 25, 22, 28, 30, 26, 32, 35, 30, 38, 36, 40, 38, 42, 45, 40, 42, 48, 44, 50, 46, 52, 48, 55, 50, 48, 56, 52, 58, 60],
  },
  {
    icon: Users,
    label: 'Total Customers',
    value: '8,456',
    trend: 5.2,
    change: '+5.2% from last month',
    color: '#10B981',
    data: [100, 105, 103, 108, 115, 112, 118, 120, 125, 122, 128, 130, 135, 132, 138, 140, 142, 148, 145, 150, 148, 155, 152, 158, 160, 162, 168, 165, 170, 175],
  },
  {
    icon: TrendingUp,
    label: 'Conversion Rate',
    value: '3.24%',
    trend: -0.8,
    change: '-0.8% from last month',
    color: '#F59E0B',
    data: [3.5, 3.4, 3.6, 3.5, 3.3, 3.4, 3.2, 3.1, 3.3, 3.0, 3.2, 3.1, 3.0, 2.9, 3.1, 3.0, 2.8, 3.0, 2.9, 2.7, 2.8, 2.6, 2.5, 2.7, 2.6, 2.4, 2.5, 2.3, 2.2, 2.1],
  },
]

const recentOrders = [
  { id: 'ORD-2026-0042', customer: 'Priya Sharma', items: 3, total: '₹42,500', status: 'Confirmed', payment: 'Paid', date: '2 hours ago' },
  { id: 'ORD-2026-0041', customer: 'Ananya Gupta', items: 1, total: '₹18,900', status: 'Shipped', payment: 'Paid', date: '5 hours ago' },
  { id: 'ORD-2026-0040', customer: 'Rahul Verma', items: 2, total: '₹35,200', status: 'Processing', payment: 'Paid', date: '8 hours ago' },
  { id: 'ORD-2026-0039', customer: 'Neha Patel', items: 4, total: '₹67,800', status: 'Delivered', payment: 'Paid', date: '1 day ago' },
  { id: 'ORD-2026-0038', customer: 'Vikram Singh', items: 1, total: '₹12,500', status: 'Pending', payment: 'Unpaid', date: '1 day ago' },
]

const topProducts = [
  { name: 'Silk Evening Gown', price: '₹42,500', sold: 128, revenue: '₹54,40,000', image: '' },
  { name: 'Velvet Blazer', price: '₹28,900', sold: 96, revenue: '₹27,74,400', image: '' },
  { name: 'Handcrafted Saree', price: '₹35,000', sold: 84, revenue: '₹29,40,000', image: '' },
  { name: 'Designer Lehenga', price: '₹85,000', sold: 62, revenue: '₹52,70,000', image: '' },
  { name: 'Cashmere Shawl', price: '₹15,500', sold: 55, revenue: '₹8,52,500', image: '' },
]

const statusColors: Record<string, string> = {
  Confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  Shipped: 'bg-purple-100 text-purple-700 border-purple-200',
  Processing: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Delivered: 'bg-green-100 text-green-700 border-green-200',
  Pending: 'bg-orange-100 text-orange-700 border-orange-200',
}

import { useEffect } from 'react'
import { api } from '@/lib/api'

const DATE_RANGES = [
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: '90d', label: '90 Days' },
  { id: '1y', label: '1 Year' },
];

export default function AdminDashboard() {
  const [selectedRange, setSelectedRange] = useState('7d')
  const [liveStats, setLiveStats] = useState<{
    total: number;
    published: number;
    draft: number;
    archived: number;
    lowStock: number;
    outOfStock: number;
    featured: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('yezbee_admin_date_range');
      if (saved) setSelectedRange(saved);
    }
  }, []);

  const handleRangeSelect = (rangeId: string) => {
    setSelectedRange(rangeId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('yezbee_admin_date_range', rangeId);
    }
  };

  useEffect(() => {
    api.getAdminStats()
      .then((res) => {
        if (res && res.data) {
          setLiveStats(res.data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A1A] tracking-tight">Good morning, Aarav</h1>
          <p className="text-gray-500 text-sm mt-1">Here&apos;s what&apos;s happening at YEZ BEE today.</p>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-gray-100 shadow-sm" suppressHydrationWarning>
          {DATE_RANGES.map((range) => (
            <button
              key={range.id}
              onClick={() => handleRangeSelect(range.id)}
              suppressHydrationWarning
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                selectedRange === range.id
                  ? 'bg-[#C9A84C] text-white shadow-md shadow-[#C9A84C]/20'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Revenue Overview</h3>
              <p className="text-xs text-gray-500 mt-0.5">Last 30 days</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C9A84C]" />
              <span className="text-xs text-gray-500">Revenue</span>
            </div>
          </div>
          <Chart
            variant="area"
            data={stats[0].data}
            color="#C9A84C"
            height={200}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Orders Overview</h3>
              <p className="text-xs text-gray-500 mt-0.5">Last 30 days</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-xs text-gray-500">Orders</span>
            </div>
          </div>
          <Chart
            variant="bar"
            data={stats[1].data}
            color="#3B82F6"
            height={200}
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Recent Orders</h3>
              <p className="text-xs text-gray-500 mt-0.5">Latest 5 orders</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs text-[#C9A84C] font-medium hover:underline flex items-center gap-1"
            >
              View All <ChevronRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-y border-gray-100">
                  {['Order', 'Customer', 'Items', 'Total', 'Status', 'Payment', 'Date'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, i) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-gray-50 hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3.5 text-sm font-medium text-[#C9A84C]">{order.id}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{order.customer}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">{order.items}</td>
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-900">{order.total}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-medium ${order.payment === 'Paid' ? 'text-green-600' : 'text-orange-600'}`}>
                        {order.payment}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-400">{order.date}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-100 text-center">
            <Link href="/admin/orders" className="text-xs text-[#C9A84C] font-medium hover:underline">
              View all orders
            </Link>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 pb-4">
            <h3 className="text-sm font-semibold text-gray-900">Top Selling Products</h3>
            <p className="text-xs text-gray-500 mt-0.5">By units sold</p>
          </div>
          <div className="space-y-1 px-4 pb-4">
            {topProducts.map((product, i) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#FAF7F2] transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 bg-[#F5E6C8]/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-[#C9A84C] font-semibold text-xs">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-400">{product.price} &middot; {product.sold} sold</p>
                </div>
                <span className="text-xs font-semibold text-gray-700">{product.revenue}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Plus, label: 'Add Product', href: '/admin/products/create', desc: 'Add new product to catalog' },
          { icon: Eye, label: 'View Orders', href: '/admin/orders', desc: 'Manage incoming orders' },
          { icon: BarChart3, label: 'View Analytics', href: '/admin/analytics', desc: 'See detailed reports' },
        ].map((action) => (
          <Link key={action.label} href={action.href}>
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-[#C9A84C]/20 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#C9A84C]/10 to-[#F5E6C8]/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <action.icon size={22} className="text-[#C9A84C]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                    {action.label}
                    <ExternalLink size={12} className="text-gray-300 group-hover:text-[#C9A84C] transition-colors" />
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{action.desc}</p>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </motion.div>
  )
}
