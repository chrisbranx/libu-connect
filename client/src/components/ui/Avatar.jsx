import { useState } from 'react'

const sizeMap = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
}

const avatarColors = [
  'bg-primary',
  'bg-accent',
  'bg-success',
  'bg-danger',
  'bg-warning',
]

function hashName(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

function getInitials(name) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return (parts[0]?.[0] || '?').toUpperCase()
}

export default function Avatar({ src, name = '', size = 'md', className = '' }) {
  const px = sizeMap[size]
  const [imgError, setImgError] = useState(false)

  if (src === undefined || src === null) {
    return (
      <div
        className={`rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse ${className}`}
        style={{ width: px, height: px, minWidth: px }}
      />
    )
  }

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImgError(true)}
        className={`rounded-full object-cover ${className}`}
        style={{ width: px, height: px, minWidth: px }}
      />
    )
  }

  const colorIndex = name ? hashName(name) % avatarColors.length : 0

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white text-sm font-medium ${avatarColors[colorIndex]} ${className}`}
      style={{ width: px, height: px, minWidth: px, fontSize: px * 0.4 }}
    >
      {name ? getInitials(name) : '?'}
    </div>
  )
}
