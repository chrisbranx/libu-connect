const variantStyles = {
  default: 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  info: 'bg-primary/10 text-primary dark:text-primary-light',
}

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full px-3 py-1 text-xs font-medium
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
