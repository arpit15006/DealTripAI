'use client'

import React, { useState, useEffect } from 'react'

import { motion, AnimatePresence } from 'motion/react'

import { cn } from '@/lib/utils'

const TextFlip = ({
  words = ['Solution', 'Strategies', 'Techniques', 'Ideas', 'Designs'],
  duration = 3000
}: {
  words?: string[]
  duration?: number
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % words.length)
    }, duration)

    return () => clearInterval(interval)
  }, [words, duration])

  return (
    <motion.span
      layout
      className='relative inline-flex w-fit overflow-hidden rounded-full border border-transparent px-0.5'
    >
      <AnimatePresence mode='popLayout'>
        <motion.span
          key={currentIndex}
          initial={{ y: -40 }}
          animate={{
            y: 0,
            filter: 'blur(0px)'
          }}
          exit={{ y: 50, opacity: 0 }}
          transition={{
            duration: 0.5
          }}
          className={cn('inline-block text-base font-medium whitespace-nowrap')}
        >
          {words[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  )
}

export default TextFlip
