import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, GraduationCap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import Button from '../../components/ui/Button'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
})

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { rememberMe: false } })

  const onSubmit = async (data) => {
    try {
      await useAuthStore.getState().login(data.email, data.password)
      navigate('/dashboard')
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
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100">
              LIBU
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium tracking-wide uppercase">
              Connect
            </p>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1.5">
                {t('auth.password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Lock size={16} />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`w-full rounded-md border ${errors.password ? 'border-danger' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors duration-200 pl-10 pr-10 py-2.5 text-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  {...register('rememberMe')}
                  type="checkbox"
                  className="rounded border-gray-200 dark:border-gray-700 text-primary focus:ring-primary/30 cursor-pointer"
                />
                <span className="text-sm text-gray-900 dark:text-gray-100">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:text-primary-light dark:text-accent dark:hover:text-accent-light transition-colors"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>

            <Button
              type="submit"
              loading={isSubmitting}
              className="w-full"
              size="lg"
            >
              {t('auth.signIn')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            {t('auth.noAccount')}{' '}
            <Link
              to="/register"
              className="text-primary hover:text-primary-light dark:text-accent dark:hover:text-accent-light font-medium transition-colors"
            >
              {t('auth.register')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
