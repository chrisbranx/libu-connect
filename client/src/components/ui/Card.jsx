import { motion } from 'framer-motion'

export default function Card({ children, className = '', hover = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.3 }}
      className={`
        bg-white dark:bg-primary-dark rounded-md shadow-sm p-6
        ${hover ? 'hover:shadow-md transition-shadow' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}
