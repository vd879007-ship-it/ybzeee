'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ChevronRight, ChevronDown,
  Edit2, FolderTree, X, Save,
  ToggleLeft, ToggleRight, Sparkles
} from 'lucide-react'
import { YEZBEE_CATEGORIES } from '@/data/categories'
import { getAllProducts } from '@/data/products'

interface AdminCategory {
  id: string
  name: string
  slug: string
  description: string
  image: string
  productCount: number
  displayOrder: number
  status: 'active' | 'inactive'
  parentId: string | null
  hasFeedingSplit?: boolean
  children: AdminCategory[]
}

function CategoryRow({
  category,
  depth,
  onEdit,
  onDelete,
  onToggleStatus,
  expanded,
  onToggleExpand,
}: {
  category: AdminCategory
  depth: number
  onEdit: (c: AdminCategory) => void
  onDelete: (c: AdminCategory) => void
  onToggleStatus: (c: AdminCategory) => void
  expanded: boolean
  onToggleExpand: () => void
}) {
  const hasChildren = category.children.length > 0

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-3 px-4 py-3.5 hover:bg-[#FAF7F2] transition-colors border-b border-gray-100 group ${
          depth > 0 ? 'bg-amber-50/20' : ''
        }`}
        style={{ paddingLeft: `${16 + depth * 28}px` }}
      >
        <button
          onClick={onToggleExpand}
          className={`p-1 text-gray-400 hover:text-[#C9A84C] transition-colors rounded ${hasChildren ? 'visible' : 'invisible'}`}
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className="w-8 h-8 bg-[#F5E6C8]/60 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border border-[#C9A84C]/30">
          {category.image ? (
            <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
          ) : (
            <FolderTree size={16} className="text-[#C9A84C]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`text-sm font-bold ${depth === 0 ? 'text-gray-900 uppercase tracking-wide' : 'text-gray-800 font-semibold'}`}>
              {category.name}
            </p>
            <span className="text-xs text-gray-400 font-mono">/category/{category.slug}</span>
            {depth === 0 && category.hasFeedingSplit && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                Feeding Split
              </span>
            )}
          </div>
          {category.description && (
            <p className="text-xs text-gray-500 truncate mt-0.5">{category.description}</p>
          )}
        </div>

        <div className="text-right px-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
            {category.productCount} products
          </span>
        </div>

        <button
          onClick={() => onToggleStatus(category)}
          className="text-gray-400 hover:text-[#C9A84C] transition-colors p-1"
          title={category.status === 'active' ? 'Deactivate' : 'Activate'}
        >
          {category.status === 'active' ? <ToggleRight size={22} className="text-emerald-600" /> : <ToggleLeft size={22} className="text-gray-300" />}
        </button>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(category)} className="p-1.5 text-gray-400 hover:text-[#C9A84C] transition-colors rounded-lg hover:bg-[#F5E6C8]/40">
            <Edit2 size={14} />
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {category.children.map((child) => (
              <CategoryRow
                key={child.id}
                category={child}
                depth={depth + 1}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
                expanded={false}
                onToggleExpand={() => {}}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default function CategoriesPage() {
  const [search, setSearch] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(['casuals', 'party-wear', 'ethnic-wear', 'lounge-wear', 'peplum-tops', 'kids-wear'])
  )
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null)
  const [formData, setFormData] = useState<{
    name: string; slug: string; description: string; image: string; parentId: string; displayOrder: number; status: 'active' | 'inactive';
  }>({
    name: '', slug: '', description: '', image: '', parentId: '', displayOrder: 1, status: 'active',
  })

  const categoriesTree: AdminCategory[] = useMemo(() => {
    const products = getAllProducts()

    return YEZBEE_CATEGORIES.map((cat) => {
      const catProducts = products.filter((p) => p.category === cat.slug && p.status === 'published')

      const children: AdminCategory[] = cat.subcategories.map((sub, idx) => {
        const subProducts = catProducts.filter((p) => p.productType === sub.productType)
        return {
          id: sub.id,
          name: sub.name,
          slug: `${cat.slug}/${sub.slug}`,
          description: sub.description,
          image: cat.image,
          productCount: subProducts.length,
          displayOrder: idx + 1,
          status: 'active',
          parentId: cat.id,
          children: [],
        }
      })

      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        productCount: catProducts.length,
        displayOrder: cat.sortOrder,
        status: 'active',
        parentId: null,
        hasFeedingSplit: cat.hasFeedingSplit,
        children,
      }
    })
  }, [])

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categoriesTree
    const q = search.toLowerCase().trim()
    return categoriesTree.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        cat.slug.toLowerCase().includes(q) ||
        cat.children.some((c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q))
    )
  }, [categoriesTree, search])

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const openEdit = (cat: AdminCategory) => {
    setEditingCategory(cat)
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image,
      parentId: cat.parentId || '',
      displayOrder: cat.displayOrder,
      status: cat.status,
    })
    setShowModal(true)
  }

  const handleSave = () => {
    setShowModal(false)
    alert('Category details updated successfully!')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight font-display">Official Category Architecture</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Single Source of Truth taxonomy for YEZ BEE Fashion across Database, API, Admin & Customer Storefront
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white rounded-xl text-xs font-semibold text-gray-700 placeholder-gray-400 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs font-medium text-amber-900 shadow-sm">
        <Sparkles size={18} className="text-[#C9A84C] flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Official Category Structure Enforced</p>
          <p className="text-amber-800 mt-0.5">
            The catalog is locked to the 6 primary YEZ BEE categories: <strong>CASUALS, PARTY WEAR, ETHNIC WEAR, LOUNGE WEAR, PEPLUM TOPS, KIDS WEAR</strong>. 
            Feeding/Non-Feeding subcategories are automatically derived from product classifications.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-xs font-bold text-gray-600 uppercase tracking-wider">
          <span>Category Name / Slug</span>
          <span className="pr-12">Product Count</span>
        </div>
        <div className="divide-y divide-gray-100">
          {filteredCategories.map((cat) => (
            <CategoryRow
              key={cat.id}
              category={cat}
              depth={0}
              onEdit={openEdit}
              onDelete={() => {}}
              onToggleStatus={() => {}}
              expanded={expandedIds.has(cat.id)}
              onToggleExpand={() => toggleExpand(cat.id)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900 uppercase tracking-wider">
                  Category Display Settings
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    disabled
                    className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-xs font-bold text-gray-800 border border-gray-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    disabled
                    className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-xs font-mono text-gray-600 border border-gray-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-white rounded-xl text-xs font-medium text-gray-900 border border-gray-300 focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Display Image / Banner URL</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white rounded-xl text-xs font-medium text-gray-900 border border-gray-300 focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-5 py-2 bg-[var(--color-primary-gold)] text-[var(--color-dark)] text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <Save size={16} />
                  Save Category Metadata
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
