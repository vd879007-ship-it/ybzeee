'use client'

import { createContext, useContext, useCallback, useEffect, useState } from 'react'

interface CompareContextType {
  items: string[]
  add: (productId: string) => void
  remove: (productId: string) => void
  clear: () => void
  isInCompare: (productId: string) => boolean
  count: number
}

const CompareContext = createContext<CompareContextType | undefined>(undefined)

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('yezbee-compare')
    if (stored) {
      try { setItems(JSON.parse(stored)) } catch { }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('yezbee-compare', JSON.stringify(items))
  }, [items])

  const add = useCallback((productId: string) => {
    setItems(prev => prev.length >= 4 ? prev : [...prev, productId])
  }, [])

  const remove = useCallback((productId: string) => {
    setItems(prev => prev.filter(id => id !== productId))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const isInCompare = useCallback((productId: string) => items.includes(productId), [items])

  return (
    <CompareContext.Provider value={{ items, add, remove, clear, isInCompare, count: items.length }}>
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const context = useContext(CompareContext)
  if (!context) throw new Error('useCompare must be used within CompareProvider')
  return context
}
