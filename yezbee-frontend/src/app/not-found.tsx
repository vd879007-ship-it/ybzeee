'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-warmWhite">
      <motion.div
        className="text-center max-w-lg"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <motion.span
          className="block font-playfair text-[8rem] md:text-[12rem] leading-none text-gold/20"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          404
        </motion.span>
        <h1 className="font-playfair text-3xl md:text-4xl text-dark mt-[-2rem]">
          Page Not Found
        </h1>
        <p className="text-dark/60 mt-4 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <form onSubmit={handleSearch} suppressHydrationWarning className="mt-8 flex items-center border border-dark/20 rounded-lg overflow-hidden bg-white">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for something..."
            suppressHydrationWarning
            className="flex-1 px-5 py-3 text-sm outline-none bg-transparent"
          />
          <button type="submit" suppressHydrationWarning className="px-5 py-3 text-dark/40 hover:text-gold transition-colors">
            <Search size={18} />
          </button>
        </form>
        <Link
          href="/"
          className="inline-block mt-8 px-10 py-4 bg-gold text-dark font-medium text-sm tracking-wider uppercase hover:bg-gold/90 transition-colors rounded-lg"
        >
          Back to Home
        </Link>
      </motion.div>
    </div>
  )
}
