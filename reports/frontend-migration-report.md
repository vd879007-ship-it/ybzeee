# YEZ-BEE Frontend Code Extraction & Shopify Migration Plan

## 1. Executive Summary

The complete frontend codebase from [`skydigital34/YEZ-BEE`](https://github.com/skydigital34/YEZ-BEE) has been successfully extracted and saved locally into the project workspace:
- **Location**: `yezbee-frontend/` (`C:\Users\dines\Desktop\yezbee-shopify-migration\yezbee-frontend`)
- **Total Code Files Pulled**: **173 files** (0 failures)
- **Omitted Bloat**: Excluded 281 raw local photoshoot JPGs (~750MB in `public/images/Yez bee/`) because all 332 product images have already been migrated to Cloudinary and Shopify.

---

## 2. Frontend Stack & Architecture

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router) | TypeScript, Server & Client Components |
| **Styling** | Tailwind CSS + CSS Variables | Luxury gold & champagne palette, custom animations |
| **UI & Icons** | Lucide React, Framer Motion, GSAP | Smooth luxury animations, micro-interactions |
| **State Management** | Zustand (persistent storage) | `cart-store`, `wishlist-store`, `filter-store`, `ui-store` |
| **Data Fetching** | Axios + TanStack React Query | Centralized API client (`src/lib/api.ts`) |
| **E-Commerce Logic** | Custom E-Commerce Engine | Feeding / Non-Feeding split, size/color variant selectors, pincode delivery checker |

---

## 3. Design System & Theme Specs

### Color Palette
- **Primary Gold**: `#D4AF37`
- **Gold Light**: `#E8C86A`
- **Gold Dark**: `#A37E2C`
- **Champagne Accent**: `#F3E5AB`
- **Warm White (Canvas)**: `#FAF7F2`
- **Dark Neutral**: `#1A1A1A` / `#0D0D0D`
- **Emerald Accent**: `#2D6A4F`

### Typography
- **Headings / Display**: `Playfair Display` (Serif luxury)
- **Body / Interface**: `Inter` (Sans-serif readability)

---

## 4. Key Components & Pages Inventory

```
yezbee-frontend/src/
├── app/
│   ├── page.tsx                       # Homepage (Hero, Trending, New Arrivals, Brand Story)
│   ├── product/[slug]/page.tsx        # Product Detail Page (Size/Color picker, WhatsApp order, Pincode)
│   ├── category/[slug]/page.tsx       # Category Collection (Casuals, Party Wear, Peplum Tops, etc.)
│   ├── category/[slug]/[sub]/page.tsx # Subcategory Collection (Feeding vs. Non-Feeding toggle)
│   ├── cart/page.tsx                  # Cart Page with coupon discounts & price summary
│   ├── checkout/page.tsx              # Checkout flow & address selection
│   ├── search/page.tsx                # Product Search & instant filtering
│   ├── sale/page.tsx                  # Flash Sale & discounted items
│   ├── track-order/page.tsx           # Order Tracking page
│   └── wishlist/page.tsx              # Wishlist page
├── components/
│   ├── layout/                        # Header, MegaMenu, MobileBottomNav, AnnouncementBar, Footer
│   ├── home/                          # Hero slider, BestSellers, FlashSale, Trending, TrustBadges
│   └── ui/                            # ProductCard, ProductImage, QuantitySelector, WhatsAppButton
└── store/
    ├── cart-store.ts                  # Cart items, variant IDs, quantities, pricing
    └── filter-store.ts                # Category, feeding split, size, color, price range filters
```

---

## 5. Shopify Storefront Migration Paths

### Option 1: Headless Next.js Storefront (Fastest & 100% Design Fidelity)
- **How it works**: Connect this exact Next.js frontend to Shopify using the **Shopify Storefront GraphQL API**.
- **Advantages**:
  1. Keeps 100% of the existing animations (Framer Motion), luxury layout, and component styling without rewriting HTML/Liquid.
  2. Directly connects to the 63 migrated Shopify products using handles (`/product/sbf-014`, etc.).
  3. Replaces `src/lib/api.ts` calls with Shopify Storefront API queries (`@shopify/hydrogen-react` or standard GraphQL fetch).
  4. Checkout redirects securely to Shopify's native checkout (`cart.checkoutUrl`).

### Option 2: Shopify Online Store 2.0 Liquid Theme (Dawn customization)
- **How it works**: Port the Next.js components into Shopify Liquid sections & templates.
- **Components to convert**:
  - `announcement-bar.liquid`
  - `hero-slider.liquid` (matching Playfair Display + Gold theme)
  - `collection-grid.liquid` (with Feeding / Non-Feeding metafield filters)
  - `main-product.liquid` (variant buttons, Cloudinary gallery, size chart modal)
- **Advantages**:
  - Managed 100% inside Shopify Admin without external Vercel hosting.
