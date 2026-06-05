import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function PageWrapper({ children, title, subtitle, actions }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6 max-w-7xl mx-auto"
    >
      {(title || subtitle || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            {title && (
              <h1 className="text-xl lg:text-2xl font-display font-bold text-text dark:text-text-dark">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm text-text-muted dark:text-text-dark mt-1">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </motion.div>
  );
}
