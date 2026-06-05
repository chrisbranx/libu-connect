const variantStyles = {
  text: 'h-4 w-full rounded',
  card: 'h-32 w-full rounded-md',
  avatar: 'h-10 w-10 rounded-full',
  chart: 'h-48 w-full rounded-md',
}

export default function Skeleton({ variant = 'text', width, height, className = '', count = 1 }) {
  const elements = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`animate-pulse bg-border dark:bg-border-dark ${variantStyles[variant]} ${className}`}
      style={{ width, height }}
    />
  ))

  if (count === 1) return elements[0]

  return (
    <div className="flex flex-col gap-3">
      {elements}
    </div>
  )
}
