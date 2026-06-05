import Button from './Button'

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="mb-4 text-muted">
          <Icon size={48} strokeWidth={1.5} />
        </div>
      )}
      {title && (
        <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-muted max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <Button {...action}>{action.children}</Button>
      )}
    </div>
  )
}
