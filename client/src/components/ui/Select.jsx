import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

const Select = forwardRef(({ label, error, options, placeholder, className = '', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={`
            w-full rounded-md border border-gray-200 dark:border-gray-700
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-gray-100
            focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
            transition-colors duration-200 appearance-none
            pl-3 pr-10 py-2 text-sm
            ${error ? 'border-danger focus:ring-danger/30 focus:border-danger' : ''}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>{placeholder}</option>
          )}
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
          <ChevronDown size={16} />
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-danger">{error}</p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select
