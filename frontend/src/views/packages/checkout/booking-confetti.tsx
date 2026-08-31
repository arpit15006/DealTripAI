'use client'

// React Imports
import { useEffect } from 'react'

// Third-party Imports
import confetti from 'canvas-confetti'

const SIDE_CANNON_DURATION_MS = 3 * 1000
const SIDE_CANNON_COLORS = ['#a786ff', '#fd8bbc', '#eca184', '#f8deb1']

const BookingConfetti = () => {
  useEffect(() => {
    const end = Date.now() + SIDE_CANNON_DURATION_MS

    const frame = () => {
      if (Date.now() > end) return

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: SIDE_CANNON_COLORS
      })
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: SIDE_CANNON_COLORS
      })

      requestAnimationFrame(frame)
    }

    frame()
  }, [])

  return null
}

export default BookingConfetti
