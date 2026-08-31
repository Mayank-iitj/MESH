'use client'

import { AnimatePresence, motion } from "framer-motion"
import { ReactNode } from "react"

export function AnimatedList({ className = '', children }: { className?: string, children: ReactNode }) {
  return (
    <div className={className}>
      <AnimatePresence initial={false}>
        {children}
      </AnimatePresence>
    </div>
  )
}

export function AnimatedListItem({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0, scale: 0.9, marginBottom: 0 }}
      animate={{ opacity: 1, height: 'auto', scale: 1, marginBottom: 16 }}
      exit={{ opacity: 0, height: 0, scale: 0.9, marginBottom: 0 }}
      transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
      className={className}
      style={{ overflow: 'hidden' }}
    >
      {children}
    </motion.div>
  )
}
