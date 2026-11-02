'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users,
  Download, FileText, Activity
} from 'lucide-react'
import Chart from '@/components/admin/Chart'

const revenueData = [30, 45, 38, 52, 48, 55, 62, 58, 65, 70, 68, 75, 72, 80, 85, 82, 78, 90, 88, 95, 92, 100, 98, 105, 110, 108, 115, 118, 120, 125]
const ordersData = [20, 25, 22, 28, 30, 26, 32, 35, 30, 38, 36, 40, 38, 42, 45, 40, 42, 48, 44, 50, 46, 52, 48, 55, 50, 48, 56, 52, 58, 60]

const topProducts = [
  { name: 'Silk Evening Gown', category: 'Gowns', revenue: 5440000, units: 128, growth: 12.5 },
  { name: 'Velvet Blazer', category: 'Blazers', revenue: 2774400, units: 96, growth: 8.3 },
  { name: 'Handcrafted Saree', category: 'Sarees', revenue: 2940000, units: 84, growth: 15.2 },
  { name: 'Designer Lehenga', category: 'Lehengas', revenue: 5270000, units: 62, growth: -2.1 },
  { name: 'Cashmere Shawl', category: 'Accessories', revenue: 852500, units: 55, growth: 5.8 },
]

const topCategories = [
  { name: 'Gowns', revenue: 5440000, percentage: 28 },
  { name: 'Lehengas', revenue: 5270000, percentage: 27 },
  { name: 'Sarees', revenue: 2940000, percentage: 15 },
  { name: 'Blazers', revenue: 2774400, percentage: 14 },
  { name: 'Accessories', revenue: 1852500, percentage: 10 },
  { name: 'Others', revenue: 1163100, percentage: 6 },
]

const acquisitionData = [40, 45, 38, 52, 48, 55, 62, 58, 65, 70, 68, 75]

const salesByChannel = [
  { channel: 'Direct Website', percentage: 45, revenue: 8945000 },
  { channel: 'Instagram Shop', percentage: 25, revenue: 4975000 },
  { channel: 'WhatsApp Order', percentage: 15, revenue: 2985000 },
  { channel: 'Phone Order', percentage: 10, revenue: 1990000 },
  { channel: 'In-Store', percentage: 5, revenue: 995000 },
]

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A1A] tracking-tight">Analytics</h1>
          <p className="text-gray-500 text-sm mt-0.5">Track your business performance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-gray-100 shadow-sm">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  dateRange === range
                    ? 'bg-[#C9A84C] text-white shadow-md shadow-[#C9A84C]/20'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-600 bg-white rounded-xl border border-gray-100 shadow-sm hover:bg-[#FAF7F2] transition-all"
            >
              <FileText size={15} />
              PDF
            </button>
            <button
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-600 bg-white rounded-xl border border-gray-100 shadow-sm hover:bg-[#FAF7F2] transition-all"
            >
              <Download size={15} />
              CSV
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[
          { icon: DollarSign, label: 'Total Revenue', value: '₹1,98,90,000', trend: 12.5, color: '#C9A84C' },
          { icon: ShoppingBag, label: 'Total Orders', value: '1,842', trend: 8.3, color: '#3B82F6' },
          { icon: Users, label: 'New Customers', value: '456', trend: 5.2, color: '#10B981' },
          { icon: Activity, label: 'Conversion Rate', value: '3.24%', trend: -0.8, color: '#F59E0B' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${stat.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stat.trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(stat.trend)}%
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Revenue Trend</h3>
              <p className="text-xs text-gray-500 mt-0.5">Daily revenue for selected period</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C9A84C]" />
              <span className="text-xs text-gray-500">Revenue (₹)</span>
            </div>
          </div>
          <Chart variant="line" data={revenueData} color="#C9A84C" height={240} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Orders Trend</h3>
              <p className="text-xs text-gray-500 mt-0.5">Daily orders for selected period</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-xs text-gray-500">Orders</span>
            </div>
          </div>
          <Chart variant="bar" data={ordersData} color="#3B82F6" height={240} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="p-6 pb-4">
            <h3 className="text-sm font-semibold text-gray-900">Top Selling Products</h3>
            <p className="text-xs text-gray-500 mt-0.5">Ranked by revenue</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-y border-gray-100">
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase">Product</th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase">Category</th>
                  <th className="text-right px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase">Units</th>
                  <th className="text-right px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase">Revenue</th>
                  <th className="text-right px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase">Growth</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, i) => (
                  <motion.tr
                    key={product.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-gray-50 hover:bg-[#FAF7F2] transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-300 w-5">{i + 1}</span>
                        <span className="text-sm font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-gray-500">{product.category}</td>
                    <td className="px-6 py-3.5 text-sm text-gray-900 text-right">{product.units}</td>
                    <td className="px-6 py-3.5 text-sm font-semibold text-gray-900 text-right">₹{product.revenue.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-right">
                      <span className={`text-xs font-medium ${product.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.growth >= 0 ? '+' : ''}{product.growth}%
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Revenue by Category</h3>
          <div className="space-y-4">
            <div className="relative w-40 h-40 mx-auto mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {topCategories.map((cat, i) => {
                  const total = topCategories.reduce((s, c) => s + c.percentage, 0)
                  const prevTotal = topCategories.slice(0, i).reduce((s, c) => s + c.percentage, 0)
                  const percentage = (cat.percentage / total) * 100
                  const colors = ['#C9A84C', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']
                  const circumference = 2 * Math.PI * 40
                  const offset = circumference - (percentage / 100) * circumference
                  return (
                    <circle
                      key={cat.name}
                      cx="50" cy="50" r="40"
                      fill="none"
                      stroke={colors[i % colors.length]}
                      strokeWidth="12"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      style={{ transform: `rotate(${(prevTotal / total) * 360}deg)`, transformOrigin: 'center' }}
                    />
                  )
                })}
              </svg>
            </div>
            <div className="space-y-2">
              {topCategories.map((cat, i) => {
                const colors = ['#C9A84C', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']
                return (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[i] }} />
                      <span className="text-gray-600">{cat.name}</span>
                    </div>
                    <span className="font-medium text-gray-900">{cat.percentage}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Customer Acquisition</h3>
          <Chart variant="area" data={acquisitionData} color="#10B981" height={200} />
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">456</p>
              <p className="text-xs text-gray-500">New Customers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">₹2,850</p>
              <p className="text-xs text-gray-500">Avg. Customer Value</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">12.5%</p>
              <p className="text-xs text-gray-500">Growth Rate</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Sales by Channel</h3>
          <div className="space-y-4">
            {salesByChannel.map((channel) => (
              <div key={channel.channel}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-600">{channel.channel}</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900">{channel.percentage}%</span>
                    <span className="text-xs text-gray-400 ml-2">₹{channel.revenue.toLocaleString()}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${channel.percentage}%` }}
                    transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                    className="h-2 rounded-full bg-gradient-to-r from-[#C9A84C] to-[#A8882E]"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
      >
        <h3 className="text-sm font-semibold text-gray-900 mb-6">Conversion Funnel</h3>
        <div className="flex items-end justify-center gap-2 sm:gap-4">
          {[
            { label: 'Visitors', value: 125000, percentage: 100 },
            { label: 'Product Views', value: 87500, percentage: 70 },
            { label: 'Add to Cart', value: 35000, percentage: 28 },
            { label: 'Checkout', value: 12500, percentage: 10 },
            { label: 'Purchase', value: 4050, percentage: 3.24 },
          ].map((step, i) => (
            <div key={step.label} className="flex-1 text-center">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(step.percentage / 100) * 200}px` }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                className="bg-gradient-to-t from-[#C9A84C] to-[#F5E6C8] rounded-t-xl mx-auto transition-all"
                style={{ maxHeight: '200px', height: `${(step.percentage / 100) * 200}px` }}
              />
              <p className="text-xs text-gray-500 mt-2">{step.label}</p>
              <p className="text-sm font-semibold text-gray-900">{step.value.toLocaleString()}</p>
              <p className="text-[10px] text-gray-400">{step.percentage}%</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
