'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  renderLabel?: (progress: number) => React.ReactNode
  size?: number
  strokeWidth?: number
  circleStrokeWidth?: number
  progressStrokeWidth?: number
  shape?: 'square' | 'round'
  progressClassName?: string
  progressBgClassName?: string
  labelClassName?: string
  showLabel?: boolean
  gaugePrimaryColor?: string
  gaugeSecondaryColor?: string
}

const CircularProgress = ({
  value,
  renderLabel,
  className,
  progressClassName,
  progressBgClassName,
  labelClassName,
  showLabel,
  shape = 'round',
  size = 100,
  strokeWidth,
  circleStrokeWidth = 10,
  progressStrokeWidth = 10,
  gaugePrimaryColor = 'currentColor',
  gaugeSecondaryColor = 'currentColor',
  ...props
}: CircularProgressProps) => {
  const effectiveCircleWidth = strokeWidth ?? circleStrokeWidth
  const effectiveProgressWidth = strokeWidth ?? progressStrokeWidth
  const maxStroke = Math.max(effectiveCircleWidth, effectiveProgressWidth)

  const radius = (size - maxStroke) / 2
  const currentPercent = Math.min(Math.max(value, 0), 100)
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (currentPercent / 100) * circumference

  return (
    <div
      className={cn('relative flex shrink-0 items-center justify-center', className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg viewBox={`0 0 ${size} ${size}`} className='size-full -rotate-90 overflow-visible'>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke={gaugeSecondaryColor !== 'currentColor' ? gaugeSecondaryColor : 'currentColor'}
          strokeWidth={effectiveCircleWidth}
          strokeLinecap={shape}
          className={cn('text-primary/20', progressBgClassName)}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke={gaugePrimaryColor !== 'currentColor' ? gaugePrimaryColor : 'currentColor'}
          strokeWidth={effectiveProgressWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap={shape}
          className={cn('transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]', progressClassName)}
        />
      </svg>
      {showLabel && (
        <div className={cn('absolute inset-0 flex items-center justify-center text-base font-medium', labelClassName)}>
          {renderLabel ? renderLabel(value) : `${value}%`}
        </div>
      )}
    </div>
  )
}

export { CircularProgress }
