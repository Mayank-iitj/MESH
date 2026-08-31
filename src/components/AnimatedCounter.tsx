'use client'

import { animate } from "framer-motion"
import { useEffect, useRef } from "react"

export default function AnimatedCounter({ 
  value, 
  prefix = '', 
  suffix = '',
  className = ''
}: { 
  value: number
  prefix?: string
  suffix?: string
  className?: string
}) {
  const nodeRef = useRef<HTMLSpanElement>(null)
  
  useEffect(() => {
    const node = nodeRef.current
    if (!node) return
    
    // Start animation from whatever is currently displayed, or 0
    const startValue = parseInt(node.textContent?.replace(/\D/g, '') || '0')
    
    const controls = animate(startValue, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate(currentValue) {
        node.textContent = `${prefix}${Math.floor(currentValue).toLocaleString()}${suffix}`
      },
    })
    
    return () => controls.stop()
  }, [value, prefix, suffix])

  return (
    <span ref={nodeRef} className={className}>
      {prefix}{value.toLocaleString()}{suffix}
    </span>
  )
}
