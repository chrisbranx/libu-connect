import { motion } from 'framer-motion'

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-gray-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex items-center gap-2"
      >
        <motion.span
          className="text-5xl lg:text-6xl font-display font-bold text-primary"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          L
        </motion.span>
        <motion.span
          className="text-5xl lg:text-6xl font-display font-bold text-gray-900 dark:text-gray-100"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
        >
          I
        </motion.span>
        <motion.span
          className="text-5xl lg:text-6xl font-display font-bold text-gray-900 dark:text-gray-100"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        >
          B
        </motion.span>
        <motion.span
          className="text-5xl lg:text-6xl font-display font-bold text-gray-900 dark:text-gray-100"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        >
          U
        </motion.span>
        <motion.span
          className="w-3 h-3 rounded-full bg-accent mt-2"
          animate={{ y: [0, -6, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-4 text-sm text-gray-400 dark:text-gray-500 font-medium tracking-wider uppercase"
      >
        Connect
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-8"
      >
        <motion.div
          className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>
    </div>
  )
}
