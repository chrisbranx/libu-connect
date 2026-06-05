import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, GraduationCap, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { api } from '../../services/api'
import Button from '../../components/ui/Button'

const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
})

export default function ForgotPassword() {
  const { t } = useTranslation()
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(forgotSchema) })

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/forgot-password', { email: data.email })
      setSuccess(true)
    } catch (err) {
      toast.error(err.message || t('common.error'))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50 dark:bg-gray-900">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 dark:bg-primary-light/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/5 dark:bg-accent/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 sm:p-10 border border-gray-200 dark:border-gray-700">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary text-white mb-4">
              <GraduationCap size={28} />
            </div>
            <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100">
              {t('auth.forgotPassword')}
            </h1>
          </motion.div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 text-success mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  Check your email for reset link
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  We've sent instructions to reset your password.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 mt-6 text-sm text-primary hover:text-primary-light dark:text-accent dark:hover:text-accent-light font-medium transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </Link>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <p className="text-sm text-gray-500 text-center">
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1.5">
                    {t('auth.email')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <Mail size={16} />
                    </div>
                    <input
                      {...register('email')}
                      type="email"
                      autoComplete="email"
                      placeholder="you@university.edu"
                      className={`w-full rounded-md border ${errors.email ? 'border-danger' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors duration-200 pl-10 pr-3 py-2.5 text-sm`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  loading={isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  Send Reset Link
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
