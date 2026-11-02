'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'

interface ChartProps {
  variant: 'line' | 'bar' | 'area'
  data: number[]
  color?: string
  height?: number
  showGrid?: boolean
  showLabels?: boolean
  animate?: boolean
  className?: string
}

export default function Chart({
  variant = 'line',
  data,
  color = '#C9A84C',
  height = 200,
  showGrid = true,
  showLabels = true,
  animate = true,
  className = '',
}: ChartProps) {
  const width = 600

  const { points, path, areaPath, gridLines, yLabels, xLabels } = useMemo(() => {
    if (!data || data.length < 2) return { points: [], path: '', areaPath: '', gridLines: [], yLabels: [], xLabels: [] }

    const padding = { top: 20, right: 20, bottom: 30, left: 50 }
    const chartW = width - padding.left - padding.right
    const chartH = height - padding.top - padding.bottom

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    const pts = data.map((d, i) => ({
      x: padding.left + (i / (data.length - 1)) * chartW,
      y: padding.top + chartH - ((d - min) / range) * chartH,
      value: d,
    }))

    const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

    const area = `${linePath} L${pts[pts.length - 1].x},${padding.top + chartH} L${pts[0].x},${padding.top + chartH} Z`

    const grid = Array.from({ length: 5 }).map((_, i) => {
      const y = padding.top + (chartH / 4) * i
      const val = max - (range / 4) * i
      return { y, label: val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(0) }
    })

    const xLbls = data.map((_, i) => {
      if (data.length <= 7 || i % Math.ceil(data.length / 7) === 0 || i === data.length - 1) {
        return { x: pts[i].x, label: `Day ${i + 1}` }
      }
      return null
    }).filter(Boolean) as { x: number; label: string }[]

    return { points: pts, path: linePath, areaPath: area, gridLines: grid, yLabels: grid, xLabels: xLbls }
  }, [data, height])

  if (!data || data.length < 2) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-sm text-gray-400">Insufficient data</p>
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="xMidYMid meet"
      >
        {showGrid && gridLines.map((g, i) => (
          <g key={i}>
            <line
              x1="50" y1={g.y} x2={width - 20} y2={g.y}
              stroke="#F0F0F0" strokeWidth="1"
            />
            {showLabels && (
              <text
                x="45" y={g.y + 4}
                textAnchor="end"
                className="text-[10px]"
                fill="#9CA3AF"
              >
                {g.label}
              </text>
            )}
          </g>
        ))}

        {showLabels && xLabels.map((l, i) => (
          <text
            key={i}
            x={l.x}
            y={height - 5}
            textAnchor="middle"
            className="text-[9px]"
            fill="#9CA3AF"
          >
            {l.label}
          </text>
        ))}

        {(variant === 'area') && (
          <motion.path
            d={areaPath}
            fill={`url(#areaGrad)`}
            initial={animate ? { opacity: 0 } : undefined}
            animate={animate ? { opacity: 0.12 } : undefined}
            transition={{ duration: 0.8 }}
          />
        )}

        {variant === 'line' || variant === 'area' ? (
          <motion.path
            d={path}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={animate ? { pathLength: 0 } : undefined}
            animate={animate ? { pathLength: 1 } : undefined}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />
        ) : null}

        {(variant === 'line' || variant === 'area') && points.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill="white"
            stroke={color}
            strokeWidth="2"
            initial={animate ? { opacity: 0 } : undefined}
            animate={animate ? { opacity: 1 } : undefined}
            transition={{ delay: 0.8 + i * 0.02 }}
            className="hover:r-4 cursor-pointer"
          />
        ))}

        {variant === 'bar' && points.map((p, i) => {
          const barW = (width - 70) / data.length * 0.7
          const barH = height - 30 - p.y
          return (
            <motion.rect
              key={i}
              x={p.x - barW / 2}
              y={p.y}
              width={barW}
              height={barH}
              rx="3"
              fill={color}
              opacity="0.8"
              initial={animate ? { height: 0, y: height - 30 } : undefined}
              animate={animate ? { height: barH, y: p.y } : undefined}
              transition={{ duration: 0.5, delay: i * 0.03, ease: 'easeOut' }}
              className="hover:opacity-100 cursor-pointer"
            />
          )
        })}

        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
