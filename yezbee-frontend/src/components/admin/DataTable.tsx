'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, MoreVertical,
  Square, X, Search, ArrowUpDown
} from 'lucide-react'

export interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  hideOnMobile?: boolean
  render?: (row: T) => React.ReactNode
}

export interface BulkAction {
  label: string
  icon: React.ElementType
  action: () => void
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  selectable?: boolean
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  bulkActions?: BulkAction[]
  onRowClick?: (row: T) => void
  actions?: (row: T) => React.ReactNode
  pageSize?: number
  searchable?: boolean
  emptyState?: React.ReactNode
  loading?: boolean
}

function SkeletonRow({ columns }: { columns: number }) {
  return (
    <tr className="border-b border-gray-50">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${40 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  )
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  bulkActions,
  onRowClick,
  actions,
  pageSize = 10,
  searchable = false,
  emptyState,
  loading = false,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [openActionId, setOpenActionId] = useState<string | null>(null)

  const sortedData = useMemo(() => {
    let result = [...data]
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = a[sortKey]
        const bVal = b[sortKey]
        if (aVal == null) return 1
        if (bVal == null) return -1
        if (typeof aVal === 'string') {
          return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
        }
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal
      })
    }
    return result
  }, [data, sortKey, sortDir])

  const totalPages = Math.ceil(sortedData.length / pageSize)
  const paginatedData = sortedData.slice((page - 1) * pageSize, page * pageSize)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const toggleSelect = (id: string) => {
    if (!onSelectionChange) return
    const newSelected = selectedIds.includes(id)
      ? selectedIds.filter(s => s !== id)
      : [...selectedIds, id]
    onSelectionChange(newSelected)
  }

  const toggleSelectAll = () => {
    if (!onSelectionChange) return
    if (selectedIds.length === paginatedData.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(paginatedData.map(keyExtractor))
    }
  }

  const allSelected = paginatedData.length > 0 && selectedIds.length === paginatedData.length

  return (
    <div className="space-y-3">
      {(bulkActions && selectedIds.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-2.5 bg-[#C9A84C]/10 rounded-xl border border-[#C9A84C]/20"
        >
          <span className="text-sm font-medium text-[#C9A84C]">{selectedIds.length} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            {bulkActions.map((action) => (
              <button
                key={action.label}
                onClick={action.action}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white rounded-lg hover:bg-[#FAF7F2] border border-gray-100 shadow-sm transition-all"
              >
                <action.icon size={13} />
                {action.label}
              </button>
            ))}
            <button
              onClick={() => onSelectionChange?.([])}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {data.length === 0 && !loading ? (
          <div className="py-16 text-center">
            {emptyState || (
              <div>
                <div className="w-16 h-16 bg-[#FAF7F2] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search size={28} className="text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-500">No data found</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-[#FAF7F2]/50">
                    {selectable && (
                      <th className="px-4 py-3.5 w-10">
                        <button onClick={toggleSelectAll} className="text-gray-400 hover:text-[#C9A84C] transition-colors">
                          <Square size={16} className={allSelected ? 'fill-[#C9A84C] text-[#C9A84C]' : ''} />
                        </button>
                      </th>
                    )}
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className={`px-4 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider ${
                          col.hideOnMobile ? 'hidden md:table-cell' : ''
                        } ${col.sortable ? 'cursor-pointer select-none hover:text-gray-700' : ''}`}
                        onClick={() => col.sortable && handleSort(col.key)}
                      >
                        <div className="flex items-center gap-1.5">
                          {col.header}
                          {col.sortable && (
                            <ArrowUpDown size={12} className="text-gray-300" />
                          )}
                        </div>
                      </th>
                    ))}
                    {actions && (
                      <th className="px-4 py-3.5 w-16 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <SkeletonRow key={i} columns={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} />
                    ))
                  ) : (
                    <AnimatePresence>
                      {paginatedData.map((row, i) => {
                        const id = keyExtractor(row)
                        const isSelected = selectedIds.includes(id)
                        return (
                          <motion.tr
                            key={id}
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className={`border-b border-gray-50 transition-colors ${
                              onRowClick ? 'cursor-pointer' : ''
                            } ${isSelected ? 'bg-[#C9A84C]/5' : 'hover:bg-[#FAF7F2]'}`}
                            onClick={() => onRowClick?.(row)}
                          >
                            {selectable && (
                              <td className="px-4 py-3.5 w-10">
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleSelect(id) }}
                                  className="text-gray-400 hover:text-[#C9A84C] transition-colors"
                                >
                                  <Square size={16} className={isSelected ? 'fill-[#C9A84C] text-[#C9A84C]' : ''} />
                                </button>
                              </td>
                            )}
                            {columns.map((col) => (
                              <td
                                key={col.key}
                                className={`px-4 py-3.5 ${col.hideOnMobile ? 'hidden md:table-cell' : ''}`}
                              >
                                {col.render ? col.render(row) : (
                                  <span className="text-sm text-gray-700">{String(row[col.key] ?? '')}</span>
                                )}
                              </td>
                            ))}
                            {actions && (
                              <td className="px-4 py-3.5 text-right relative" onClick={(e) => e.stopPropagation()}>
                                <div className="relative">
                                  <button
                                    onClick={() => setOpenActionId(openActionId === id ? null : id)}
                                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-all"
                                  >
                                    <MoreVertical size={15} />
                                  </button>
                                  <AnimatePresence>
                                    {openActionId === id && (
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="absolute right-0 top-full mt-1 z-20"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {actions(row)}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </td>
                            )}
                          </motion.tr>
                        )
                      })}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-[#FAF7F2]/30">
                <p className="text-xs text-gray-500">
                  Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, sortedData.length)} of {sortedData.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="p-1.5 text-gray-400 hover:text-[#C9A84C] disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-[#FAF7F2]"
                  >
                    <ChevronsLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 text-gray-400 hover:text-[#C9A84C] disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-[#FAF7F2]"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                    if (pageNum > totalPages) return null
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-7 h-7 text-xs font-medium rounded-lg transition-all ${
                          page === pageNum
                            ? 'bg-[#C9A84C] text-white shadow-md shadow-[#C9A84C]/20'
                            : 'text-gray-500 hover:bg-[#FAF7F2]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 text-gray-400 hover:text-[#C9A84C] disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-[#FAF7F2]"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="p-1.5 text-gray-400 hover:text-[#C9A84C] disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-[#FAF7F2]"
                  >
                    <ChevronsRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
