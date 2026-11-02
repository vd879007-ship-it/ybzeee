'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Eye,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Sparkles,
  Upload,
  Layers,
  Tag,
  Shield,
  HelpCircle,
  X,
  Check,
  Grid,
  Link as LinkIcon,
  RefreshCw,
  FileText,
  DollarSign,
  Image as ImageIcon,
  Search,
  ChevronRight,
  Sliders,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { YEZBEE_CATEGORIES, CATEGORY_CONFIG } from '@/data/categories';
import { slugify, saveOrUpdateProduct } from '@/data/products';
import { api } from '@/lib/api';
import { getSafeImageUrl, extractErrorMessage } from '@/lib/utils';
import ProductPreviewModal, { ProductPreviewData } from './ProductPreviewModal';
import ProductMediaSortable from './ProductMediaSortable';

const PRESET_COLORS = [
  { name: 'Peach Floral', hex: '#FFDAB9' },
  { name: 'Navy Blue', hex: '#1B2A4A' },
  { name: 'Sage Green', hex: '#8FBC8F' },
  { name: 'Blush Pink', hex: '#FFB6C1' },
  { name: 'Wine Red', hex: '#800000' },
  { name: 'Teal Blue', hex: '#008080' },
  { name: 'Lavender', hex: '#E6E6FA' },
  { name: 'Indigo Blue', hex: '#3F51B5' },
  { name: 'Mustard Yellow', hex: '#FFC107' },
  { name: 'Coral Pink', hex: '#FF6F61' },
  { name: 'Emerald Green', hex: '#046307' },
  { name: 'Midnight Black', hex: '#1A1A1A' },
];

const ADULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
const KIDS_SIZES = ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y', '12-13Y'];

export interface FormVariant {
  id: string;
  sku: string;
  color: string;
  colorHex: string;
  size: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
}

export interface FormImage {
  id: string;
  url: string;
  publicId?: string;
  alt?: string;
  isPrimary: boolean;
  order: number;
  sortOrder?: number;
  colorAssigned?: string;
  uploading?: boolean;
}

interface ProductFormProps {
  mode: 'create' | 'edit';
  productId?: string;
  initialData?: any;
}

export default function ProductForm({ mode, productId, initialData }: ProductFormProps) {
  const router = useRouter();

  const [categoriesList, setCategoriesList] = useState<any[]>(YEZBEE_CATEGORIES);
  const [fetchingProduct, setFetchingProduct] = useState(mode === 'edit');
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isCustomSlug, setIsCustomSlug] = useState(false);
  const [brand, setBrand] = useState('YEZ BEE');
  const [tagsInput, setTagsInput] = useState('casuals, feeding, cotton');

  const [selectedCategory, setSelectedCategory] = useState('casuals');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [productType, setProductType] = useState<'FEEDING' | 'NON-FEEDING' | null>('FEEDING');
  const [subcategory, setSubcategory] = useState<'Feeding' | 'Non-Feeding' | '' | null>('Feeding');

  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [fabric, setFabric] = useState('100% Pure Cotton');
  const [fit, setFit] = useState('Relaxed Fit');
  const [pattern, setPattern] = useState('Printed');
  const [occasion, setOccasion] = useState('Casual Wear');
  const [careInstructions, setCareInstructions] = useState('Hand wash cold with gentle detergent');
  const [highlights, setHighlights] = useState<string[]>([
    'Dual vertical concealed feeding zips for discrete nursing',
    'Breathable soft pure cotton fabric for max comfort',
  ]);
  const [newHighlight, setNewHighlight] = useState('');

  const [price, setPrice] = useState<number | ''>(1899);
  const [compareAtPrice, setCompareAtPrice] = useState<number | ''>(2499);
  const [costPrice, setCostPrice] = useState<number | ''>(950);

  const [selectedColors, setSelectedColors] = useState<{ name: string; hex: string }[]>([
    PRESET_COLORS[0],
    PRESET_COLORS[1],
  ]);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#C9A84C');

  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);

  const [variants, setVariants] = useState<FormVariant[]>([
    {
      id: 'v1',
      sku: 'YZB-CAS-PCH-S',
      color: 'Peach Floral',
      colorHex: '#FFDAB9',
      size: 'S',
      price: 1899,
      compareAtPrice: 2499,
      stock: 10,
      lowStockThreshold: 5,
      isActive: true,
    },
    {
      id: 'v2',
      sku: 'YZB-CAS-PCH-M',
      color: 'Peach Floral',
      colorHex: '#FFDAB9',
      size: 'M',
      price: 1899,
      compareAtPrice: 2499,
      stock: 15,
      lowStockThreshold: 5,
      isActive: true,
    },
  ]);

  const [images, setImages] = useState<FormImage[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('PUBLISHED');
  const [featured, setFeatured] = useState(false);
  const [bestSeller, setBestSeller] = useState(false);
  const [newArrival, setNewArrival] = useState(true);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: any, type: 'success' | 'error' = 'success') => {
    const cleanMsg = typeof message === 'string'
      ? (message.includes('[object Object]') ? extractErrorMessage(message, 'Operation completed.') : message)
      : extractErrorMessage(message, 'Operation completed.');
    setFeedbackToast({ message: cleanMsg, type });
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const normalizeProductForForm = useCallback((p: any) => {
    if (!p) return;

    setName(p.name || '');
    setSlug(p.slug || slugify(p.name || ''));
    setIsCustomSlug(Boolean(p.slug));
    setBrand(p.brand || 'YEZ BEE');

    if (p.tags) {
      setTagsInput(Array.isArray(p.tags) ? p.tags.join(', ') : String(p.tags));
    }

    let catSlug = 'casuals';
    let catId = '';
    if (p.category) {
      if (typeof p.category === 'object') {
        catSlug = p.category.slug || 'casuals';
        catId = p.category._id || p.category.id || '';
      } else {
        catSlug = String(p.category);
        if (p.category.match(/^[0-9a-fA-F]{24}$/)) {
          catId = p.category;
          const matched = YEZBEE_CATEGORIES.find((c) => c.id === catSlug || c.slug === catSlug);
          if (matched) catSlug = matched.slug;
        }
      }
    }
    setSelectedCategory(catSlug);
    setSelectedCategoryId(catId);

    const hasFeeding = catSlug === 'casuals' || catSlug === 'party-wear' || catSlug === 'ethnic-wear' || catSlug === 'peplum-tops';
    if (hasFeeding) {
      const pType = (p.productType || (p.subcategory === 'Non-Feeding' ? 'NON-FEEDING' : 'FEEDING')).toUpperCase() as 'FEEDING' | 'NON-FEEDING';
      setProductType(pType);
      setSubcategory(pType === 'NON-FEEDING' ? 'Non-Feeding' : 'Feeding');
    } else {
      setProductType(null);
      setSubcategory(null);
    }

    setShortDescription(p.shortDescription || '');
    setDescription(p.description || '');
    setFabric(p.fabric || 'Pure Cotton');
    setFit(p.fit || 'Regular Fit');
    setPattern(p.pattern || 'Printed');
    setOccasion(p.occasion || 'Casual Wear');

    if (p.careInstructions) {
      setCareInstructions(
        Array.isArray(p.careInstructions) ? p.careInstructions.join(', ') : String(p.careInstructions)
      );
    }

    if (p.highlights && Array.isArray(p.highlights) && p.highlights.length > 0) {
      setHighlights(p.highlights);
    }

    setPrice(p.price !== undefined ? p.price : 0);
    setCompareAtPrice(p.compareAtPrice || '');
    setCostPrice(p.costPrice || '');

    const normalizedStatus = (p.status || (p.isActive ? 'PUBLISHED' : 'DRAFT')).toUpperCase() as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    setStatus(normalizedStatus);
    setFeatured(Boolean(p.featured || p.isFeatured));
    setBestSeller(Boolean(p.bestSeller || p.isBestSeller));
    setNewArrival(Boolean(p.newArrival || p.isNewProduct));

    const rawImages = p.images || [];
    if (Array.isArray(rawImages) && rawImages.length > 0) {
      const sortedRaw = [...rawImages].sort((a: any, b: any) => {
        const orderA = typeof a?.order === 'number' ? a.order : (typeof a?.sortOrder === 'number' ? a.sortOrder : 9999);
        const orderB = typeof b?.order === 'number' ? b.order : (typeof b?.sortOrder === 'number' ? b.sortOrder : 9999);
        return orderA - orderB;
      });

      const cleanImages: FormImage[] = sortedRaw
        .map((img: any, idx: number) => {
          const urlStr = typeof img === 'string' ? img : img?.url || img?.secure_url || '';
          if (!urlStr || !urlStr.trim()) return null;
          return {
            id: img?.publicId || img?.public_id || `img-${idx}-${Date.now()}`,
            url: urlStr,
            publicId: img?.publicId || img?.public_id,
            alt: img?.alt || p.name || '',
            isPrimary: Boolean(img?.isPrimary || idx === 0),
            order: idx,
            sortOrder: idx + 1,
            colorAssigned: img?.color || img?.colorAssigned,
          };
        })
        .filter(Boolean) as FormImage[];

      if (cleanImages.length > 0 && !cleanImages.some((i) => i.isPrimary)) {
        cleanImages[0].isPrimary = true;
      }
      setImages(cleanImages);
    } else if (p.thumbnail && typeof p.thumbnail === 'string' && p.thumbnail.trim()) {
      setImages([
        {
          id: `thumb-${Date.now()}`,
          url: p.thumbnail,
          alt: p.name || '',
          isPrimary: true,
          order: 0,
          sortOrder: 1,
        },
      ]);
    } else {
      setImages([]);
    }

    if (p.variants && Array.isArray(p.variants) && p.variants.length > 0) {
      const mappedVariants: FormVariant[] = p.variants.map((v: any, idx: number) => ({
        id: v._id || v.id || `v-${idx}-${Date.now()}`,
        sku: v.sku || `YZB-SKU-${idx + 1}`,
        color: v.color || 'Standard',
        colorHex: v.colorHex || '#000000',
        size: v.size || 'M',
        price: Number(v.price) || Number(p.price) || 0,
        compareAtPrice: v.compareAtPrice,
        stock: Number(v.stock) || 0,
        lowStockThreshold: v.lowStockThreshold || 5,
        isActive: v.isActive !== false,
      }));
      setVariants(mappedVariants);

      const colorMap = new Map<string, string>();
      mappedVariants.forEach((v) => {
        if (v.color && !colorMap.has(v.color)) {
          colorMap.set(v.color, v.colorHex || '#000000');
        }
      });
      setSelectedColors(Array.from(colorMap.entries()).map(([name, hex]) => ({ name, hex })));

      const sizeSet = new Set<string>();
      mappedVariants.forEach((v) => {
        if (v.size) sizeSet.add(v.size);
      });
      setSelectedSizes(Array.from(sizeSet));
    }

    if (p.seo) {
      setSeoTitle(p.seo.title || '');
      setSeoDescription(p.seo.description || '');
    }
  }, []);

  useEffect(() => {
    if (mode === 'edit' && productId) {
      setFetchingProduct(true);
      setFetchError(null);

      api.getProduct(productId)
        .then((res) => {
          if (res && res.data) {
            normalizeProductForForm(res.data);
          } else {
            if (initialData) normalizeProductForForm(initialData);
          }
        })
        .catch((err) => {
          console.warn('Could not fetch product from backend API, attempting direct ID lookup:', err);
          api.getProductById(productId)
            .then((res) => {
              if (res && res.data) normalizeProductForForm(res.data);
              else if (initialData) normalizeProductForForm(initialData);
            })
            .catch((idErr) => {
              console.error('Failed to load product for editing:', idErr);
              if (initialData) {
                normalizeProductForForm(initialData);
              } else {
                setFetchError('Failed to load product from database. Please verify product ID or try again.');
              }
            });
        })
        .finally(() => {
          setFetchingProduct(false);
        });
    } else if (initialData) {
      normalizeProductForForm(initialData);
      setFetchingProduct(false);
    }
  }, [mode, productId, initialData, normalizeProductForForm]);

  useEffect(() => {
    api.getCategories()
      .then((res) => {
        if (res && res.data && res.data.length > 0) {
          setCategoriesList(res.data);
        }
      })
      .catch(() => {
        setCategoriesList(YEZBEE_CATEGORIES);
      });
  }, []);

  const currentCategoryConfig = useMemo(() => {
    const direct = categoriesList.find((c) => c.slug === selectedCategory);
    if (direct) return direct;
    const staticMatched = YEZBEE_CATEGORIES.find((c) => c.slug === selectedCategory);
    return staticMatched || categoriesList[0];
  }, [categoriesList, selectedCategory]);

  const hasFeedingSplit = useMemo(() => {
    return (
      selectedCategory === 'casuals' ||
      selectedCategory === 'party-wear' ||
      selectedCategory === 'ethnic-wear' ||
      selectedCategory === 'peplum-tops' ||
      Boolean(currentCategoryConfig?.hasFeedingSplit)
    );
  }, [selectedCategory, currentCategoryConfig]);

  const handleCategoryChange = (catSlug: string) => {
    setSelectedCategory(catSlug);
    const matched = categoriesList.find((c) => c.slug === catSlug);
    if (matched) {
      setSelectedCategoryId(matched._id || matched.id || '');
    }

    const split = catSlug === 'casuals' || catSlug === 'party-wear' || catSlug === 'ethnic-wear' || catSlug === 'peplum-tops' || Boolean(matched?.hasFeedingSplit);
    if (split) {
      setProductType('FEEDING');
      setSubcategory('Feeding');
    } else {
      setProductType(null);
      setSubcategory(null);
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isCustomSlug) {
      setSlug(slugify(val));
    }
  };

  const handleGenerateVariantMatrix = () => {
    if (selectedColors.length === 0 || selectedSizes.length === 0) {
      alert('Please select at least one color and one size to generate variants.');
      return;
    }

    const baseCode = (slug || 'PROD').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    const newVariants: FormVariant[] = [];

    selectedColors.forEach((colorObj) => {
      const colorShort = colorObj.name.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'COL';
      selectedSizes.forEach((sz) => {
        const sku = `YZB-${baseCode}-${colorShort}-${sz}`;
        newVariants.push({
          id: `v-${Date.now()}-${Math.random().toString(36).slice(-4)}`,
          sku,
          color: colorObj.name,
          colorHex: colorObj.hex,
          size: sz,
          price: Number(price) || 0,
          compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
          stock: 10,
          lowStockThreshold: 5,
          isActive: true,
        });
      });
    });

    setVariants(newVariants);
    showToast(`Generated ${newVariants.length} variants based on active colors and sizes.`);
  };

  const handleAddCustomColor = () => {
    if (!customColorName.trim()) return;
    const newCol = { name: customColorName.trim(), hex: customColorHex };
    if (!selectedColors.some((c) => c.name.toLowerCase() === newCol.name.toLowerCase())) {
      setSelectedColors((prev) => [...prev, newCol]);
    }
    setCustomColorName('');
  };

  const compressImageFile = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.82): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        if (!src) return resolve('');

        const img = new window.Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(src);

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl || src);
        };
        img.onerror = () => resolve(src);
        img.src = src;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setUploadProgress(10);
    const fileArray = Array.from(files);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert(`Unsupported format for "${file.name}". Please upload JPG, PNG, or WEBP.`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds 10MB limit.`);
        continue;
      }

      const tempId = `temp-${Date.now()}-${i}`;
      const dataUrl = await compressImageFile(file);

      if (!dataUrl) continue;

      setImages((prev) => [
        ...prev,
        {
          id: tempId,
          url: dataUrl,
          alt: name || 'YEZ BEE Product',
          isPrimary: prev.length === 0,
          order: prev.length,
          sortOrder: prev.length + 1,
          uploading: true,
        },
      ]);

      try {
        setUploadProgress(40 + i * 20);
        const res = await api.uploadProductImage(file, selectedCategory);
        if (res && res.data) {
          const cloudUrl = res.data.secure_url || res.data.url;
          const cloudPublicId = res.data.public_id || res.data.publicId;

          setImages((prev) =>
            prev.map((img) =>
              img.id === tempId
                ? {
                    ...img,
                    url: cloudUrl,
                    publicId: cloudPublicId,
                    uploading: false,
                  }
                : img
            )
          );
        }
      } catch (err: any) {
        console.warn('Cloudinary upload fallback to data URI:', err);
        setImages((prev) =>
          prev.map((img) => (img.id === tempId ? { ...img, uploading: false } : img))
        );
      }
    }

    setUploadProgress(100);
    setTimeout(() => setUploadProgress(null), 600);
  };

  const handleDeleteImage = async (id: string) => {
    const target = images.find((i) => i.id === id);
    if (target?.publicId) {
      try {
        await api.deleteProductImage(target.publicId);
      } catch (err) {
        console.warn('Cloudinary asset delete warning:', err);
      }
    }
    setImages((prev) => {
      const filtered = prev.filter((i) => i.id !== id);
      const reindexed = filtered.map((img, index) => ({
        ...img,
        order: index,
        sortOrder: index + 1,
      }));
      if (reindexed.length > 0 && !reindexed.some((i) => i.isPrimary)) {
        reindexed[0].isPrimary = true;
      }
      return reindexed;
    });
  };

  const handleSetPrimaryImage = (id: string) => {
    setImages((prev) => prev.map((img) => ({ ...img, isPrimary: img.id === id })));
  };

  const totalStock = useMemo(() => {
    return variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  }, [variants]);

  const calcDiscountPercent = useMemo(() => {
    if (compareAtPrice && price && Number(compareAtPrice) > Number(price)) {
      return Math.round(((Number(compareAtPrice) - Number(price)) / Number(compareAtPrice)) * 100);
    }
    return 0;
  }, [price, compareAtPrice]);

  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = 'Product name is required';
    if (!selectedCategory) errs.category = 'Category is required';
    if (hasFeedingSplit && (!productType || (productType !== 'FEEDING' && productType !== 'NON-FEEDING'))) {
      errs.productType = 'Feeding or Non-Feeding selection is required for this category';
    }
    if (!price || Number(price) <= 0) errs.price = 'Selling price must be greater than 0';
    if (compareAtPrice && Number(compareAtPrice) < Number(price)) {
      errs.compareAtPrice = 'Compare-at price cannot be lower than selling price';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (targetStatus: 'PUBLISHED' | 'DRAFT') => {
    if (loading || uploadProgress !== null) return;

    if (targetStatus === 'PUBLISHED' && !validateForm()) {
      showToast('Please fix the validation errors before publishing.', 'error');
      return;
    }

    setLoading(true);

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const formattedVariants = variants.map((v) => ({
      sku: v.sku,
      color: v.color,
      colorHex: v.colorHex,
      size: v.size,
      price: Number(v.price) || Number(price) || 0,
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : (compareAtPrice ? Number(compareAtPrice) : undefined),
      stock: Number(v.stock) || 0,
      lowStockThreshold: v.lowStockThreshold || 5,
      isActive: v.isActive,
    }));

    const formattedImages = images
      .filter((img) => img.url && img.url.trim())
      .map((img, idx) => ({
        url: img.url,
        publicId: img.publicId || '',
        alt: img.alt || name,
        isPrimary: Boolean(img.isPrimary),
        order: typeof img.order === 'number' ? img.order : idx,
        sortOrder: typeof img.sortOrder === 'number' ? img.sortOrder : idx + 1,
        color: img.colorAssigned,
      }));

    const apiPayload: any = {
      name,
      slug: slug || slugify(name),
      category: selectedCategoryId || selectedCategory,
      categorySlug: selectedCategory,
      categoryName: currentCategoryConfig?.name || selectedCategory.toUpperCase(),
      productType: hasFeedingSplit ? productType : null,
      subcategory: hasFeedingSplit ? (productType === 'FEEDING' ? 'Feeding' : 'Non-Feeding') : null,
      shortDescription,
      description: description || shortDescription,
      brand,
      price: Number(price) || 0,
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      discount: calcDiscountPercent,
      status: targetStatus,
      featured,
      bestSeller,
      newArrival,
      tags: tagsArray,
      fabric,
      fit,
      pattern,
      occasion,
      careInstructions: careInstructions.split(',').map((c) => c.trim()).filter(Boolean),
      images: formattedImages,
      variants: formattedVariants,
      seo: {
        title: seoTitle || `${name} | YEZ BEE Fashion`,
        description: seoDescription || shortDescription || name,
        ogImage: formattedImages[0]?.url || '',
      },
      isActive: targetStatus === 'PUBLISHED',
    };

    try {
      if (mode === 'edit' && productId) {
        const updateRes = await api.updateProduct(productId, apiPayload);
        saveOrUpdateProduct({
          id: productId,
          ...apiPayload,
          categoryName: currentCategoryConfig?.name || selectedCategory.toUpperCase(),
          status: targetStatus.toLowerCase(),
          stock: totalStock,
          thumbnail: formattedImages[0]?.url || '',
        } as any);

        showToast('Product updated successfully in Firebase Firestore!', 'success');
      } else {
        const createRes = await api.createProduct(apiPayload);
        const createdId = createRes?.data?._id || createRes?.data?.id || `PRD-${Date.now()}`;
        saveOrUpdateProduct({
          id: createdId,
          ...apiPayload,
          categoryName: currentCategoryConfig?.name || selectedCategory.toUpperCase(),
          status: targetStatus.toLowerCase(),
          stock: totalStock,
          thumbnail: formattedImages[0]?.url || '',
        } as any);

        showToast('Product published successfully to Firebase Firestore & Cloudinary!', 'success');
      }

      setLoading(false);
      setTimeout(() => {
        router.push('/admin/products');
      }, 700);
    } catch (err: any) {
      console.error('Product save error:', err);
      const errorMsg = extractErrorMessage(err, 'Product could not be saved. Please try again.');
      showToast(`Error: ${errorMsg}`, 'error');
      setLoading(false);
    }
  };

  const previewProductData: ProductPreviewData = {
    name: name || 'Untitled YEZ BEE Product',
    categoryName: currentCategoryConfig?.name || 'CASUALS',
    price: Number(price) || 0,
    compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
    discount: calcDiscountPercent,
    images: images.map((i) => ({ url: i.url, alt: i.alt, color: i.colorAssigned })),
    colors: selectedColors,
    sizes: selectedSizes,
    description: description || shortDescription || 'No description provided.',
    shortDescription,
    highlights,
    fabric,
    fit,
    pattern,
    occasion,
    careInstructions,
    status,
    totalStock,
  };

  if (fetchingProduct) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-4">
        <Loader2 size={36} className="animate-spin text-[var(--color-primary-gold)]" />
        <h3 className="font-display font-bold text-lg text-gray-900">Loading product details...</h3>
        <p className="text-xs text-gray-500 font-sans">Fetching product data from Firebase Firestore</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-28 font-sans">
      <AnimatePresence>
        {feedbackToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-2xl border ${
              feedbackToast.type === 'success'
                ? 'bg-[var(--color-dark)] text-white border-[var(--color-primary-gold)]'
                : 'bg-rose-900 text-white border-rose-400'
            }`}
          >
            <Sparkles size={16} className={feedbackToast.type === 'success' ? 'text-[var(--color-primary-gold)]' : 'text-rose-300'} />
            {feedbackToast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {fetchError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <span>{fetchError}</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-3.5 py-1.5 bg-amber-700 text-white rounded-xl hover:bg-amber-800 text-[11px] font-bold"
          >
            Retry Loading
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 font-display">
                {mode === 'edit' ? 'Edit Product' : 'Add New Product'}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  status === 'PUBLISHED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : status === 'DRAFT'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {status}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-sans">
              Complete product configuration synchronized with Firebase Firestore and Cloudinary media
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="px-4 py-2.5 bg-white border border-gray-300 text-gray-800 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 shadow-xs"
          >
            <Eye size={16} /> Preview Product
          </button>

          <button
            type="button"
            disabled={loading || uploadProgress !== null}
            onClick={() => handleSubmit('DRAFT')}
            className="px-4 py-2.5 bg-gray-100 text-gray-800 text-xs font-bold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50"
          >
            Save as Draft
          </button>

          <button
            type="button"
            disabled={loading || uploadProgress !== null}
            onClick={() => handleSubmit('PUBLISHED')}
            className="px-6 py-2.5 bg-[var(--color-primary-gold)] text-[var(--color-dark)] text-xs font-bold uppercase tracking-wider rounded-xl hover:shadow-gold-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {uploadProgress !== null
              ? 'Uploading Media...'
              : loading
              ? (mode === 'edit' ? 'Saving Changes...' : 'Publishing...')
              : (mode === 'edit' ? 'Save Changes' : 'Publish Product')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <FileText size={16} className="text-[var(--color-primary-gold)]" />
                1. Product Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Floral Cotton Anarkali Nursing Kurti"
                  className={`w-full px-4 py-2.5 text-xs font-semibold rounded-xl border outline-none ${
                    errors.name ? 'border-rose-500 bg-rose-50' : 'border-gray-300 focus:border-[var(--color-primary-gold)]'
                  }`}
                />
                {errors.name && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">URL Canonical Slug</label>
                <div className="relative">
                  <LinkIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(slugify(e.target.value));
                      setIsCustomSlug(true);
                    }}
                    placeholder="floral-cotton-anarkali-nursing-kurti"
                    className="w-full pl-9 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)] bg-gray-50 font-mono"
                  />
                </div>
                <span className="text-[10px] text-gray-400 block mt-1">Live Store Route: /product/{slug || 'product-slug'}</span>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Brand Name</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="YEZ BEE"
                  className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-700 block mb-1">Search Tags (Comma separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="casuals, feeding, cotton, anarkali, maternity"
                  className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)]"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Layers size={16} className="text-[var(--color-primary-gold)]" />
                2. Category Taxonomy
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Primary Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)] bg-white cursor-pointer"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat.slug || cat._id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {hasFeedingSplit ? (
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Subcategory (Feeding Classification) <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-3 pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setProductType('FEEDING');
                        setSubcategory('Feeding');
                      }}
                      className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl border transition-all ${
                        productType === 'FEEDING'
                          ? 'bg-[var(--color-dark)] text-white border-[var(--color-dark)] shadow-sm'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                      }`}
                    >
                      FEEDING
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProductType('NON-FEEDING');
                        setSubcategory('Non-Feeding');
                      }}
                      className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl border transition-all ${
                        productType === 'NON-FEEDING'
                          ? 'bg-[var(--color-dark)] text-white border-[var(--color-dark)] shadow-sm'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                      }`}
                    >
                      NON-FEEDING
                    </button>
                  </div>
                  {errors.productType && (
                    <p className="text-[10px] text-rose-600 font-semibold mt-1">{errors.productType}</p>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center text-xs text-gray-500 font-medium">
                  Subcategory not required for {currentCategoryConfig?.name || selectedCategory.toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <DollarSign size={16} className="text-[var(--color-primary-gold)]" />
                3. Pricing & Discounts
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Selling Price (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-2.5 text-xs font-bold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)]"
                />
                {errors.price && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Compare-at Price (MRP ₹)</label>
                <input
                  type="number"
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-2.5 text-xs font-bold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)]"
                />
                {errors.compareAtPrice && (
                  <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.compareAtPrice}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Internal Cost Price (₹)</label>
                <input
                  type="number"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-2.5 text-xs font-bold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)] bg-gray-50"
                />
              </div>
            </div>

            {calcDiscountPercent > 0 && (
              <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-200">
                <Sparkles size={16} /> Automated Customer Discount: {calcDiscountPercent}% OFF (Savings: ₹
                {(Number(compareAtPrice) - Number(price)).toLocaleString('en-IN')})
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Grid size={16} className="text-[var(--color-primary-gold)]" />
                  4. Colors, Sizes & Variant Matrix
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configure swatches and matrix inventory ({variants.length} active variants)
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateVariantMatrix}
                className="px-4 py-2 bg-[var(--color-primary-gold)] text-[var(--color-dark)] text-xs font-bold uppercase tracking-wider rounded-xl hover:shadow-gold-sm transition-all flex items-center gap-1.5"
              >
                <RefreshCw size={13} /> Regenerate Matrix
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">Select Active Colors</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((col) => {
                  const isSelected = selectedColors.some((c) => c.name === col.name);
                  return (
                    <button
                      key={col.name}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedColors((prev) => prev.filter((c) => c.name !== col.name));
                        } else {
                          setSelectedColors((prev) => [...prev, col]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-[var(--color-dark)] text-white border-[var(--color-dark)] shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-black'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" style={{ backgroundColor: col.hex }} />
                      {col.name}
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 flex items-center gap-3 max-w-md">
                <input
                  type="text"
                  placeholder="Add custom color name"
                  value={customColorName}
                  onChange={(e) => setCustomColorName(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs border rounded-xl outline-none"
                />
                <input
                  type="color"
                  value={customColorHex}
                  onChange={(e) => setCustomColorHex(e.target.value)}
                  className="h-8 w-10 rounded border p-0.5 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={handleAddCustomColor}
                  className="px-3 py-1.5 bg-gray-800 text-white text-xs font-bold rounded-xl hover:bg-black"
                >
                  + Add
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">
                Select Active Sizes ({selectedCategory === 'kids-wear' ? 'Kids' : 'Adult'})
              </label>
              <div className="flex flex-wrap gap-2">
                {(selectedCategory === 'kids-wear' ? KIDS_SIZES : ADULT_SIZES).map((sz) => {
                  const isSelected = selectedSizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedSizes((prev) => prev.filter((s) => s !== sz));
                        } else {
                          setSelectedSizes((prev) => [...prev, sz]);
                        }
                      }}
                      className={`min-w-[42px] h-9 px-3 rounded-xl border text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[var(--color-dark)] text-white border-[var(--color-dark)] shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-black'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {variants.length > 0 && (
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto max-h-80">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-gray-100 z-10 font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">Color</th>
                        <th className="p-3">Size</th>
                        <th className="p-3">SKU</th>
                        <th className="p-3">Price (₹)</th>
                        <th className="p-3">Stock</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-sans">
                      {variants.map((v, idx) => (
                        <tr key={v.id || idx} className="hover:bg-gray-50">
                          <td className="p-3 font-bold flex items-center gap-2">
                            <span className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" style={{ backgroundColor: v.colorHex }} />
                            {v.color}
                          </td>
                          <td className="p-3 font-bold text-[var(--color-primary-gold)]">{v.size}</td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={v.sku}
                              onChange={(e) => {
                                const updated = [...variants];
                                updated[idx].sku = e.target.value;
                                setVariants(updated);
                              }}
                              className="px-2 py-1 text-xs border rounded font-mono w-36"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={v.price}
                              onChange={(e) => {
                                const updated = [...variants];
                                updated[idx].price = Number(e.target.value) || 0;
                                setVariants(updated);
                              }}
                              className="px-2 py-1 text-xs border rounded font-bold w-20"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={v.stock}
                              onChange={(e) => {
                                const updated = [...variants];
                                updated[idx].stock = Number(e.target.value) || 0;
                                setVariants(updated);
                              }}
                              className="px-2 py-1 text-xs border rounded font-bold w-16"
                            />
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                v.stock > 5
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : v.stock > 0
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {v.stock > 5 ? 'In Stock' : v.stock > 0 ? 'Low Stock' : 'Out'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Sliders size={16} className="text-[var(--color-primary-gold)]" />
                5. Description & Garment Specifications
              </h2>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Short Summary Description</label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Brief 1-line summary for product card hover previews"
                className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Full Detailed Product Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description covering silhouette, drape, nursing access mechanism, and styling recommendations..."
                className="w-full p-4 text-xs font-semibold rounded-xl border border-gray-300 outline-none focus:border-[var(--color-primary-gold)]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Fabric</label>
                <input
                  type="text"
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Fit Type</label>
                <input
                  type="text"
                  value={fit}
                  onChange={(e) => setFit(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Pattern</label>
                <input
                  type="text"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Occasion</label>
                <input
                  type="text"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Wash & Care Instructions</label>
              <input
                type="text"
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
                placeholder="Hand wash cold with gentle detergent"
                className="w-full px-4 py-2 text-xs border rounded-xl"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
              <Search size={16} className="text-[var(--color-primary-gold)]" />
              6. Search Engine Optimization (SEO)
            </h2>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Meta Title</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={`${name || 'Product'} | YEZ BEE Fashion`}
                className="w-full px-4 py-2 text-xs font-semibold rounded-xl border border-gray-300 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Meta Description</label>
              <textarea
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Shop luxury women's clothing online at YEZ BEE Fashion..."
                className="w-full p-3 text-xs font-semibold rounded-xl border border-gray-300 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon size={16} className="text-[var(--color-primary-gold)]" />
                Product Media & Ordering
              </h2>
              <span className="text-[10px] text-gray-400 font-mono">
                {images.length} {images.length === 1 ? 'image' : 'images'}
              </span>
            </div>

            <ProductMediaSortable
              images={images}
              onImagesChange={setImages}
              onSetPrimary={handleSetPrimaryImage}
              onDelete={handleDeleteImage}
              onUpload={handleFileUpload}
              uploadProgress={uploadProgress}
            />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">
              Visibility & Flags
            </h2>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Product Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-gray-300 outline-none bg-white cursor-pointer"
              >
                <option value="PUBLISHED">PUBLISHED (Visible to Customers)</option>
                <option value="DRAFT">DRAFT (Admin Only)</option>
                <option value="ARCHIVED">ARCHIVED (Discontinued)</option>
              </select>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-gray-700">Featured on Homepage</span>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded text-[var(--color-primary-gold)] focus:ring-[var(--color-primary-gold)] h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-gray-700">Bestseller Badge</span>
                <input
                  type="checkbox"
                  checked={bestSeller}
                  onChange={(e) => setBestSeller(e.target.checked)}
                  className="rounded text-[var(--color-primary-gold)] focus:ring-[var(--color-primary-gold)] h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-gray-700">New Arrival Tag</span>
                <input
                  type="checkbox"
                  checked={newArrival}
                  onChange={(e) => setNewArrival(e.target.checked)}
                  className="rounded text-[var(--color-primary-gold)] focus:ring-[var(--color-primary-gold)] h-4 w-4"
                />
              </label>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <button
              type="button"
              disabled={loading || uploadProgress !== null}
              onClick={() => handleSubmit('PUBLISHED')}
              className="w-full py-3 bg-[var(--color-primary-gold)] text-[var(--color-dark)] text-xs font-bold uppercase tracking-wider rounded-xl hover:shadow-gold-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {mode === 'edit' ? 'Save Changes' : 'Publish Product'}
            </button>

            <button
              type="button"
              disabled={loading || uploadProgress !== null}
              onClick={() => handleSubmit('DRAFT')}
              className="w-full py-2.5 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50"
            >
              Save as Draft
            </button>

            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="w-full py-2.5 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
            >
              <Eye size={14} /> Preview Storefront Page
            </button>
          </div>
        </div>
      </div>

      <ProductPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        product={previewProductData}
      />
    </div>
  );
}
