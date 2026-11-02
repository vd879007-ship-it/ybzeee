'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Search, Star, ThumbsUp, ThumbsDown, Trash2,
  MessageSquare, Clock
} from 'lucide-react'
import DataTable from '@/components/admin/DataTable'

interface Review {
  id: string
  product: string
  productImage: string
  customer: string
  customerAvatar: string
  rating: number
  title: string
  content: string
  date: string
  status: 'approved' | 'pending' | 'rejected'
}

const allReviews: Review[] = [
  { id: 'rev-1', product: 'Silk Evening Gown', productImage: '', customer: 'Priya Sharma', customerAvatar: '', rating: 5, title: 'Absolutely stunning!', content: 'The craftsmanship is incredible. The silk feels luxurious and the fit is perfect. Worth every penny.', date: '2026-07-28', status: 'approved' },
  { id: 'rev-2', product: 'Velvet Blazer', productImage: '', customer: 'Ananya Gupta', customerAvatar: '', rating: 4, title: 'Beautiful blazer', content: 'Great quality and beautiful color. Slightly oversized but that\'s the style.', date: '2026-07-25', status: 'pending' },
  { id: 'rev-3', product: 'Handcrafted Saree', productImage: '', customer: 'Neha Patel', customerAvatar: '', rating: 5, title: 'Exquisite craftsmanship', content: 'Received so many compliments! The zari work is beautiful and the fabric is lightweight.', date: '2026-07-22', status: 'approved' },
  { id: 'rev-4', product: 'Designer Lehenga', productImage: '', customer: 'Kavita Reddy', customerAvatar: '', rating: 3, title: 'Good but could be better', content: 'Nice design but the color was slightly different from the photos. Still a good purchase.', date: '2026-07-20', status: 'pending' },
  { id: 'rev-5', product: 'Cashmere Shawl', productImage: '', customer: 'Meera Joshi', customerAvatar: '', rating: 5, title: 'Luxuriously soft', content: 'The softest cashmere I have ever owned. Perfect for winter evenings.', date: '2026-07-18', status: 'approved' },
  { id: 'rev-6', product: 'Embroidered Kurta Set', productImage: '', customer: 'Rohan Desai', customerAvatar: '', rating: 4, title: 'Elegant design', content: 'Beautiful embroidery work. The fabric is breathable and comfortable.', date: '2026-07-15', status: 'rejected' },
  { id: 'rev-7', product: 'Statement Necklace', productImage: '', customer: 'Divya Kapoor', customerAvatar: '', rating: 5, title: 'Showstopper piece', content: 'This necklace completes every outfit. The gold finish is stunning.', date: '2026-07-12', status: 'approved' },
  { id: 'rev-8', product: 'Leather Tote Bag', productImage: '', customer: 'Amit Thakur', customerAvatar: '', rating: 4, title: 'Premium quality', content: 'Excellent leather quality. Spacious and well-designed compartments.', date: '2026-07-10', status: 'pending' },
  { id: 'rev-9', product: 'Embellished Heels', productImage: '', customer: 'Isha Malhotra', customerAvatar: '', rating: 2, title: 'Uncomfortable fit', content: 'Beautiful shoes but very uncomfortable for extended wear. Size runs small.', date: '2026-07-08', status: 'pending' },
  { id: 'rev-10', product: 'Wide-Leg Silk Pants', productImage: '', customer: 'Arjun Nair', customerAvatar: '', rating: 5, title: 'Perfect for work', content: 'These pants are incredibly comfortable and look professional. Love the silk quality.', date: '2026-07-05', status: 'approved' },
]

const ratingTabs = ['All', '5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star']
const statusTabs = ['All', 'Approved', 'Pending', 'Rejected']

export default function ReviewsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [ratingFilter, setRatingFilter] = useState('All')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const filteredReviews = useMemo(() => {
    return allReviews.filter((r) => {
      const matchesSearch = !search || r.product.toLowerCase().includes(search.toLowerCase()) || r.customer.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter.toLowerCase()
      const matchesRating = ratingFilter === 'All' || r.rating === parseInt(ratingFilter)
      return matchesSearch && matchesStatus && matchesRating
    })
  }, [search, statusFilter, ratingFilter])

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={13}
            className={star <= rating ? 'text-[#C9A84C] fill-[#C9A84C]' : 'text-gray-200'}
          />
        ))}
      </div>
    )
  }

  const columns = [
    {
      key: 'product',
      header: 'Product',
      sortable: true,
      render: (row: Review) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#F5E6C8]/50 rounded-lg flex items-center justify-center flex-shrink-0">
            <MessageSquare size={16} className="text-[#C9A84C]" />
          </div>
          <span className="text-sm font-medium text-gray-900">{row.product}</span>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (row: Review) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-[#C9A84C] to-[#A8882E] rounded-full flex items-center justify-center text-white text-[10px] font-semibold">
            {row.customer.split(' ').map(n => n[0]).join('')}
          </div>
          <span className="text-sm text-gray-600">{row.customer}</span>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      sortable: true,
      render: (row: Review) => renderStars(row.rating),
    },
    {
      key: 'title',
      header: 'Review',
      render: (row: Review) => (
        <div className="max-w-xs">
          <p className="text-sm font-medium text-gray-900">{row.title}</p>
          <p className="text-xs text-gray-400 truncate">{row.content}</p>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (row: Review) => (
        <div className="flex items-center gap-1.5">
          <Clock size={12} className="text-gray-300" />
          <span className="text-xs text-gray-500">{new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row: Review) => {
        const colors: Record<string, string> = {
          approved: 'bg-green-100 text-green-700 border-green-200',
          pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          rejected: 'bg-red-100 text-red-700 border-red-200',
        }
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border capitalize ${colors[row.status] || ''}`}>
            {row.status}
          </span>
        )
      },
    },
  ]

  const bulkActions = [
    { label: 'Approve', icon: ThumbsUp, action: () => {} },
    { label: 'Reject', icon: ThumbsDown, action: () => {} },
    { label: 'Delete', icon: Trash2, action: () => {} },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A1A] tracking-tight">Reviews</h1>
          <p className="text-gray-500 text-sm mt-0.5">{filteredReviews.length} customer reviews</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-56">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white rounded-xl text-sm text-gray-700 placeholder-gray-400 border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-gray-100 shadow-sm">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                statusFilter === tab
                  ? 'bg-[#C9A84C] text-white shadow-md shadow-[#C9A84C]/20'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-gray-100 shadow-sm">
          {ratingTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setRatingFilter(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                ratingFilter === tab
                  ? 'bg-[#C9A84C] text-white shadow-md shadow-[#C9A84C]/20'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredReviews}
        keyExtractor={(row) => row.id}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        bulkActions={bulkActions}
        pageSize={10}
        actions={(row) => (
          <div className="flex items-center gap-1">
            {row.status !== 'approved' && (
              <button className="p-1.5 text-gray-400 hover:text-green-500 transition-colors rounded-lg hover:bg-green-50">
                <ThumbsUp size={14} />
              </button>
            )}
            {row.status !== 'rejected' && (
              <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                <ThumbsDown size={14} />
              </button>
            )}
            <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      />
    </motion.div>
  )
}
