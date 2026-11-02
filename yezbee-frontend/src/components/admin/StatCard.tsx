'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { ElementType } from 'react'

interface StatCardProps {
  icon: ElementType
  label: string
  value: string
  trend: number
  change: string
  color: string
  data?: number[]
}

export default function StatCard({ icon: Icon, label, value, trend, change, color, data }: StatCardProps) {
  const isPositive = trend >= 0

  const Sparkline = ({ data: sparkData, lineColor }: { data: number[]; lineColor: string }) => {
    if (!sparkData || sparkData.length < 2) return null
    const width = 80
    const height = 32
    const min = Math.min(...sparkData)
    const max = Math.max(...sparkData)
    const range = max - min || 1
    const stepX = width / (sparkData.length - 1)

    const points = sparkData.map((d, i) => ({
      x: i * stepX,
      y: height - ((d - min) / range) * (height - 4) - 2,
    }))

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="flex-shrink-0">
        <path d={linePath} fill="none" stroke={lineColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d={`${linePath} L${width},${height} L0,${height} Z`}
          fill={`url(#grad-${label.replace(/\s/g, '')})`}
          opacity="0.1"
        />
        <defs>
          <linearGradient id={`grad-${label.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    )
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-[#C9A84C]/20 transition-all duration-300 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 translate-x-8 -translate-y-8">
        <div className="w-full h-full rounded-full opacity-[0.03]" style={{ backgroundColor: color }} />
      </div>

      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
            isPositive ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
          }`}
        >
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(trend)}%
        </motion.div>
      </div>

      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
      <div className="flex items-end justify-between mt-1">
        <p className="text-xl font-bold text-gray-900 tracking-tight">{value}</p>
        {data && <Sparkline data={data} lineColor={color} />}
      </div>
      <p className="text-[10px] text-gray-400 mt-1.5">{change}</p>
    </motion.div>
  )
}
