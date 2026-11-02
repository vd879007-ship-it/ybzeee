'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  Search,
  Edit,
  Copy,
  Trash2,
  Eye,
  AlertTriangle,
  Package,
  Sparkles,
  RefreshCw,
  X,
  Star,
} from 'lucide-react';
import {
  updateProductStatus,
  duplicateProduct,
  deleteOrArchiveProduct,
  permanentDeleteProduct,
  getDeletedProductIds,
  CatalogProduct,
} from '@/data/products';
import { YEZBEE_CATEGORIES } from '@/data/categories';
import { api } from '@/lib/api';
import { getSafeImageUrl, extractErrorMessage } from '@/lib/utils';
import { ImageIcon } from 'lucide-react';

function AdminThumbnail({ src, alt }: { src: string; alt: string }) {
  const [imgError, setImgError] = useState(false);
  const safeSrc = getSafeImageUrl(src, '');
  const showImage = Boolean(safeSrc && !imgError);

  return (
    <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
      {showImage ? (
        <Image
          src={safeSrc}
          alt={alt || 'Product thumbnail'}
          fill
          className="object-cover"
          sizes="48px"
          unoptimized={safeSrc.startsWith('blob:') || safeSrc.startsWith('data:')}
          onError={() => setImgError(true)}
        />
      ) : (
        <ImageIcon size={18} className="opacity-40" />
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedInventory, setSelectedInventory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedFeatured, setSelectedFeatured] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deleteModalProduct, setDeleteModalProduct] = useState<CatalogProduct | null>(null);
  const [dbStats, setDbStats] = useState<{
    total: number;
    published: number;
    draft: number;
    archived: number;
    lowStock: number;
    outOfStock: number;
    featured: number;
  } | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setDbError(null);

    try {
      const response = await api.getAdminProducts({
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: debouncedSearch || undefined,
        sortBy,
      });

      if (response && response.data) {
        const mappedProducts = response.data.map((p: any) => {
          const mainVariant = p.variants?.[0] || {};
          const totalStock = (p.variants || []).reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
          const minPrice = p.price || (p.variants || []).reduce((min: number, v: any) => Math.min(min, v.price || Infinity), Infinity) || 0;
          const maxCompare = p.compareAtPrice || (p.variants || []).reduce((max: number, v: any) => Math.max(max, v.compareAtPrice || 0), 0);
          const discountPct = p.discount || (maxCompare > minPrice && maxCompare > 0 ? Math.round(((maxCompare - minPrice) / maxCompare) * 100) : 0);

          return {
            id: p._id || p.id,
            name: p.name,
            slug: p.slug,
            subcategory: p.subcategory || 'General',
            currency: 'INR',
            images: p.images?.map((img: any) => getSafeImageUrl(img)) || [],
            gender: 'Women',
            maternity: true,
            feedingFriendly: true,
            highlights: p.highlights || [],
            rating: 5.0,
            reviewCount: 0,
            description: p.description || '',
            shortDescription: p.shortDescription || '',
            price: minPrice,
            compareAtPrice: maxCompare > minPrice ? maxCompare : undefined,
            discountPercentage: discountPct,
            category: p.category?.slug || p.category || 'casuals',
            categoryName: p.category?.name || p.subcategory || 'CASUALS',
            productType: p.productType || (p.categorySlug === 'kids-wear' ? null : 'FEEDING'),
            fabric: p.fabric || 'Cotton',
            fit: p.fit || 'Regular Fit',
            pattern: p.pattern || 'Printed',
            occasion: p.occasion || 'Casual',
            careInstructions: p.careInstructions || [],
            status: (p.status || (p.isActive ? 'published' : 'draft')).toLowerCase() as 'published' | 'draft' | 'archived',
            stock: totalStock,
            lowStockThreshold: p.lowStockThreshold || 5,
            sku: mainVariant.sku || p._id,
            thumbnail: getSafeImageUrl(p.images?.[0] || p.thumbnail),
            galleryImages: p.images?.map((img: any) => getSafeImageUrl(img)) || [],
            colors: p.variants ? Array.from(new Set(p.variants.map((v: any) => v.color))) : ['Standard'],
            sizes: p.variants ? Array.from(new Set(p.variants.map((v: any) => v.size))) : ['S', 'M', 'L'],
            variants: p.variants || [],
            featured: Boolean(p.featured || p.isFeatured),
            bestseller: Boolean(p.bestSeller || p.isBestSeller),
            newArrival: Boolean(p.newArrival || p.isNewProduct),
            tags: p.tags || [],
            seo: p.seo || { title: p.name, description: p.shortDescription },
            createdAt: p.createdAt || new Date().toISOString(),
            updatedAt: p.updatedAt || new Date().toISOString(),
          } as unknown as CatalogProduct;
        });

        const deletedIds = getDeletedProductIds();
        const liveProducts = mappedProducts.filter((p: any) => !deletedIds.includes(p.id) && !deletedIds.includes(p.slug));
        setProducts(liveProducts);
      }

      const statsRes = await api.getAdminStats().catch(() => null);
      if (statsRes && statsRes.data) {
        setDbStats(statsRes.data);
      }
    } catch (err: any) {
      console.warn('Backend API sync offline:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, selectedCategory, debouncedSearch, sortBy]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const showToast = (msg: any) => {
    const cleanMsg = typeof msg === 'string'
      ? (msg.includes('[object Object]') ? extractErrorMessage(msg, 'Action completed.') : msg)
      : extractErrorMessage(msg, 'Action completed.');
    setToastMessage(cleanMsg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const stats = useMemo(() => {
    if (dbStats) return dbStats;
    const total = products.length;
    const published = products.filter((p) => p.status === 'published').length;
    const draft = products.filter((p) => p.status === 'draft').length;
    const archived = products.filter((p) => p.status === 'archived').length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= (p.lowStockThreshold || 5)).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    const featured = products.filter((p) => p.featured).length;

    return { total, published, draft, archived, lowStock, outOfStock, featured };
  }, [products, dbStats]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = p.variants.some((v) => v.sku.toLowerCase().includes(q)) || p.id.toLowerCase().includes(q);
        const matchesCat = p.categoryName.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
        const matchesTag = p.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesSku && !matchesCat && !matchesTag) return false;
      }

      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (selectedStatus !== 'all' && p.status !== selectedStatus) return false;

      if (selectedInventory === 'in_stock' && p.stock <= (p.lowStockThreshold || 5)) return false;
      if (selectedInventory === 'low_stock' && (p.stock <= 0 || p.stock > (p.lowStockThreshold || 5))) return false;
      if (selectedInventory === 'out_of_stock' && p.stock > 0) return false;

      if (selectedType !== 'all' && p.productType !== selectedType) return false;

      if (selectedFeatured === 'yes' && !p.featured) return false;
      if (selectedFeatured === 'no' && p.featured) return false;

      return true;
    });
  }, [products, debouncedSearch, selectedCategory, selectedStatus, selectedInventory, selectedType, selectedFeatured]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return (a.createdAt || '').localeCompare(b.createdAt || '');
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'stock-asc':
          return a.stock - b.stock;
        case 'stock-desc':
          return b.stock - a.stock;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'updated':
          return (b.updatedAt || '').localeCompare(a.updatedAt || '');
        default:
          return (b.createdAt || '').localeCompare(a.createdAt || '');
      }
    });
  }, [filteredProducts, sortBy]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(sortedProducts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleBulkStatusChange = async (status: 'published' | 'draft' | 'archived') => {
    const targetStatus = status.toUpperCase() as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    for (const id of selectedIds) {
      await api.updateProductStatus(id, targetStatus).catch(() => updateProductStatus(id, status));
    }
    showToast(`Bulk updated ${selectedIds.length} products to ${status}`);
    setSelectedIds([]);
    loadProducts();
  };

  const handleTogglePublish = async (p: CatalogProduct) => {
    const nextStatus = p.status === 'published' ? 'DRAFT' : 'PUBLISHED';
    try {
      await api.updateProductStatus(p.id, nextStatus);
    } catch (err) {
      console.warn('Backend API update status offline, updating local catalog:', err);
    }
    updateProductStatus(p.id, nextStatus.toLowerCase() as any);
    showToast(`Product "${p.name}" is now ${nextStatus}`);
    loadProducts();
  };

  const handleDuplicate = (id: string) => {
    const copy = duplicateProduct(id);
    if (copy) {
      showToast(`Duplicated as draft: "${copy.name}"`);
      loadProducts();
    }
  };

  const handleConfirmArchive = async (id: string) => {
    try {
      await api.archiveProduct(id);
    } catch (err) {
      console.warn('Backend API archive offline, updating local catalog:', err);
    }
    deleteOrArchiveProduct(id);
    showToast('Product archived successfully');
    setDeleteModalProduct(null);
    loadProducts();
  };

  const handleConfirmPermanentDelete = async (id: string) => {
    try {
      await api.deleteProduct(id);
    } catch (err) {
      console.warn('Backend API delete offline, updating local catalog:', err);
    }
    permanentDeleteProduct(id);
    showToast('Product permanently deleted');
    setDeleteModalProduct(null);
    loadProducts();
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6" suppressHydrationWarning>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-[var(--color-dark)] text-white px-5 py-3 rounded-2xl shadow-dark-lg text-xs font-bold flex items-center gap-2 border border-[var(--color-primary-gold)]"
          >
            <Sparkles size={16} className="text-[var(--color-primary-gold)]" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {dbError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <span>{dbError}</span>
          </div>
          <button
            onClick={loadProducts}
            className="px-3.5 py-1.5 bg-amber-700 text-white rounded-xl hover:bg-amber-800 text-[11px] font-bold transition-all shadow-xs"
          >
            Retry Connection
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display tracking-tight">Product Catalog Management</h1>
          <p className="text-xs text-gray-500 font-sans">
            Manage YEZ BEE Fashion products, inventory variants, categories, and published visibility
          </p>
        </div>

        <Link
          href="/admin/products/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[var(--color-dark)] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[var(--color-primary-gold)] hover:text-[var(--color-dark)] transition-all shadow-md"
        >
          <Plus size={16} /> Add New Product
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Products</span>
          <span className="text-xl font-bold text-gray-900 font-sans">{stats.total}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Published</span>
          <span className="text-xl font-bold text-emerald-700 font-sans">{stats.published}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Drafts</span>
          <span className="text-xl font-bold text-amber-700 font-sans">{stats.draft}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">Low Stock</span>
          <span className="text-xl font-bold text-rose-700 font-sans">{stats.lowStock}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">Out of Stock</span>
          <span className="text-xl font-bold text-red-700 font-sans">{stats.outOfStock}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Archived</span>
          <span className="text-xl font-bold text-gray-600 font-sans">{stats.archived}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-[var(--color-primary-gold)] uppercase tracking-wider block">Featured</span>
          <span className="text-xl font-bold text-[var(--color-dark)] font-sans">{stats.featured}</span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:w-96">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search product name, SKU, tag, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)] bg-gray-50 focus:bg-white"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-semibold border border-gray-300 rounded-xl px-3 py-2.5 bg-white outline-none focus:border-[var(--color-primary-gold)]"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="price-asc">Sort: Price Low → High</option>
              <option value="price-desc">Sort: Price High → Low</option>
              <option value="stock-asc">Sort: Stock Low → High</option>
              <option value="stock-desc">Sort: Stock High → Low</option>
              <option value="name-asc">Sort: Name A → Z</option>
              <option value="name-desc">Sort: Name Z → A</option>
              <option value="updated">Sort: Recently Updated</option>
            </select>

            <button
              onClick={loadProducts}
              className="p-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-black transition-colors"
              title="Refresh Catalog"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-3 border-t border-gray-100">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs font-semibold border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-[var(--color-primary-gold)]"
            >
              <option value="all">All 6 Categories</option>
              {YEZBEE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs font-semibold border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-[var(--color-primary-gold)]"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Stock</label>
            <select
              value={selectedInventory}
              onChange={(e) => setSelectedInventory(e.target.value)}
              className="w-full text-xs font-semibold border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-[var(--color-primary-gold)]"
            >
              <option value="all">All Stock Levels</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock (1-5)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Product Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full text-xs font-semibold border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-[var(--color-primary-gold)] cursor-pointer"
            >
              <option value="all">All Product Types</option>
              <option value="FEEDING">FEEDING</option>
              <option value="NON-FEEDING">NON-FEEDING</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Featured</label>
            <select
              value={selectedFeatured}
              onChange={(e) => setSelectedFeatured(e.target.value)}
              className="w-full text-xs font-semibold border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:border-[var(--color-primary-gold)]"
            >
              <option value="all">Featured & Regular</option>
              <option value="yes">Featured Only</option>
              <option value="no">Non-Featured</option>
            </select>
          </div>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="bg-[var(--color-dark)] text-white p-4 rounded-2xl flex items-center justify-between shadow-dark-md border border-[var(--color-primary-gold)]">
          <span className="text-xs font-bold">
            Selected {selectedIds.length} {selectedIds.length === 1 ? 'product' : 'products'}
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleBulkStatusChange('published')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Publish Selected
            </button>
            <button
              onClick={() => handleBulkStatusChange('draft')}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Move to Draft
            </button>
            <button
              onClick={() => handleBulkStatusChange('archived')}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Archive Selected
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-gray-400 hover:text-white underline ml-2"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 font-bold text-gray-600 uppercase tracking-wider text-[10px]">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === sortedProducts.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-[var(--color-primary-gold)] focus:ring-[var(--color-primary-gold)]"
                  />
                </th>
                <th className="p-4">Image</th>
                <th className="p-4">Product Name & SKU</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4">Featured</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans">
              {sortedProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-gray-400">
                    <Package size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="font-bold text-sm text-gray-600">No products found</p>
                    <p className="text-xs text-gray-400">Try adjusting search or active filters.</p>
                  </td>
                </tr>
              ) : (
                sortedProducts.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  const isOut = p.stock === 0;
                  const isLow = p.stock > 0 && p.stock <= (p.lowStockThreshold || 5);

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-gray-50/80 transition-colors ${
                        isSelected ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(p.id)}
                          className="rounded border-gray-300 text-[var(--color-primary-gold)] focus:ring-[var(--color-primary-gold)]"
                        />
                      </td>

                      <td className="p-4">
                        <AdminThumbnail src={p.thumbnail} alt={p.name} />
                      </td>

                      <td className="p-4 max-w-xs">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="font-bold text-gray-900 hover:text-[var(--color-primary-gold)] transition-colors block text-xs line-clamp-1"
                        >
                          {p.name}
                        </Link>
                        <span className="text-[10px] font-mono text-gray-400 block mt-0.5">
                          SKU: {p.variants[0]?.sku || p.id} · {p.variants.length} Variants
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-[11px] font-semibold">
                          {p.categoryName}
                        </span>
                        {p.productType && (
                          <span className={`block mt-1 text-[10px] font-bold uppercase tracking-wider ${
                            p.productType === 'FEEDING' ? 'text-amber-700' : 'text-gray-500'
                          }`}>
                            ↳ {p.productType}
                          </span>
                        )}
                      </td>

                      <td className="p-4 font-bold text-gray-900">
                        ₹{p.price.toLocaleString('en-IN')}
                        {p.compareAtPrice && (
                          <span className="text-[10px] text-gray-400 line-through block font-normal">
                            ₹{p.compareAtPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        {p.discountPercentage > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[10px]">
                            {p.discountPercentage}% OFF
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[10px]">—</span>
                        )}
                      </td>

                      <td className="p-4">
                        {isOut ? (
                          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                            Out of Stock (0)
                          </span>
                        ) : isLow ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            Low Stock ({p.stock})
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            In Stock ({p.stock})
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => handleTogglePublish(p)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-pointer transition-colors ${
                            p.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : p.status === 'draft'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                              : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                          }`}
                          title="Click to toggle status"
                        >
                          {p.status.toUpperCase()}
                        </button>
                      </td>

                      <td className="p-4">
                        {p.featured ? (
                          <span className="text-[var(--color-primary-gold)] font-bold flex items-center gap-1">
                            <Star size={13} className="fill-[var(--color-primary-gold)]" /> Yes
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit size={15} />
                          </Link>

                          <Link
                            href={`/admin/products/${p.id}/preview`}
                            className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                            title="Preview Customer Page"
                          >
                            <Eye size={15} />
                          </Link>

                          <button
                            onClick={() => handleDuplicate(p.id)}
                            className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                            title="Duplicate Product"
                          >
                            <Copy size={15} />
                          </button>

                          <button
                            onClick={() => setDeleteModalProduct(p)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete / Archive Product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {deleteModalProduct && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModalProduct(null)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-white rounded-3xl z-50 p-6 shadow-dark-lg"
            >
              <h3 className="font-display font-bold text-lg text-gray-900 mb-2">
                Delete or Archive Product?
              </h3>
              <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                You are modifying <strong className="text-black">&quot;{deleteModalProduct.name}&quot;</strong>.
                Archiving removes it from customer views while preserving order history. Permanent deletion removes all records.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleConfirmArchive(deleteModalProduct.id)}
                  className="w-full py-3 bg-[var(--color-dark)] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-black"
                >
                  Archive Product (Recommended)
                </button>
                <button
                  onClick={() => handleConfirmPermanentDelete(deleteModalProduct.id)}
                  className="w-full py-3 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-rose-100"
                >
                  Permanently Delete
                </button>
                <button
                  onClick={() => setDeleteModalProduct(null)}
                  className="w-full py-2.5 text-gray-500 text-xs font-bold uppercase tracking-wider hover:text-black"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
