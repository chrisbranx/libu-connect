import { forwardRef } from 'react'

const Input = forwardRef(({ label, error, icon: Icon, className = '', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            <Icon size={16} />
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full rounded-md border border-gray-200 dark:border-gray-700
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-gray-100
            placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
            transition-colors duration-200
            ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2 text-sm
            ${error ? 'border-danger focus:ring-danger/30 focus:border-danger' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-danger">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
