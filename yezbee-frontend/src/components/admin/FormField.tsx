'use client'

import { motion } from 'framer-motion'
import { AlertCircle, Info } from 'lucide-react'

interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  helperText?: string
  children: React.ReactNode
  className?: string
}

export default function FormField({
  label,
  required = false,
  error,
  helperText,
  children,
  className = '',
}: FormFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 text-red-500 text-xs mt-1"
        >
          <AlertCircle size={12} />
          {error}
        </motion.p>
      )}
      {helperText && !error && (
        <p className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
          <Info size={11} />
          {helperText}
        </p>
      )}
    </div>
  )
}
