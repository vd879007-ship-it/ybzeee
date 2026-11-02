'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Heart,
  ShoppingBag,
  Trash2,
  Star,
  ChevronRight,
} from 'lucide-react'

const INITIAL_WISHLIST = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  name: `Luxe ${['Gown', 'Dress', 'Top', 'Blazer', 'Jumpsuit', 'Saree'][i]}`,
  price: 2499 + i * 500,
  comparePrice: i % 3 === 0 ? 3999 + i * 500 : null,
  rating: (3.5 + (i % 15) * 0.1).toFixed(1),
  reviews: Math.floor(Math.random() * 200) + 10,
  inStock: i !== 4,
  image: '',
}))

export default function AccountWishlistPage() {
  const [items, setItems] = useState(INITIAL_WISHLIST)

  const removeItem = (id: number) => setItems((prev) => prev.filter((item) => item.id !== id))
  const moveToCart = (id: number) => removeItem(id)

  return (
    <div className="min-h-screen bg-warmWhite">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8">
        <Link href="/account" className="flex items-center gap-1 text-xs text-dark/40 hover:text-dark transition-colors mb-4">
          <ChevronRight size={12} className="rotate-180" /> Back to Account
        </Link>

        <h1 className="font-playfair text-3xl md:text-4xl text-dark mb-2">My Wishlist</h1>
        <p className="text-sm text-dark/40 mb-8">{items.length} {items.length === 1 ? 'item' : 'items'}</p>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Heart size={64} className="text-dark/10 mb-6" />
            <h2 className="font-playfair text-xl text-dark mb-2">Your Wishlist is Empty</h2>
            <Link href="/category/all" className="px-8 py-3 bg-gold text-dark text-sm rounded-lg hover:bg-gold/90 transition-colors mt-4">
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <div className="relative aspect-[3/4] bg-dark/5 rounded-lg overflow-hidden">
                  {!item.inStock && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
                      <span className="text-xs text-red-500 font-medium">Out of Stock</span>
                    </div>
                  )}
                  <button onClick={() => removeItem(item.id)} className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all z-20">
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="mt-3">
                  <Link href={`/product/${item.id}`} className="text-sm font-medium hover:text-gold transition-colors">{item.name}</Link>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={10} className={star <= Math.round(+item.rating) ? 'text-gold fill-gold' : 'text-dark/10'} />
                      ))}
                    </div>
                    <span className="text-[10px] text-dark/40">({item.reviews})</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-sm font-medium">₹{item.price.toLocaleString()}</span>
                    {item.comparePrice && <span className="text-xs text-dark/40 line-through">₹{item.comparePrice.toLocaleString()}</span>}
                  </div>
                  <button
                    onClick={() => item.inStock && moveToCart(item.id)}
                    disabled={!item.inStock}
                    className={`mt-3 w-full py-2.5 text-xs rounded-lg flex items-center justify-center gap-2 transition-colors ${
                      item.inStock ? 'bg-gold text-dark hover:bg-gold/90' : 'bg-dark/10 text-dark/30 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingBag size={12} /> {item.inStock ? 'Move to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
