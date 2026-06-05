import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, GraduationCap, BookOpen, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import Button from '../../components/ui/Button'

const registerSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: z.enum(['student', 'lecturer', 'admin']),
    department: z.string().min(1, 'Department is required'),
    level: z.string().optional(),
    matricule: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      if (data.role === 'student') return data.level && data.level.length > 0
      return true
    },
    { message: 'Level is required for students', path: ['level'] }
  )
  .refine(
    (data) => {
      if (data.role === 'student') return data.matricule && data.matricule.length > 0
      return true
    },
    { message: 'Matricule is required for students', path: ['matricule'] }
  )

const roles = [
  { value: 'student', label: 'Student' },
  { value: 'lecturer', label: 'Lecturer' },
]

export default function Register() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'student' },
  })

  const selectedRole = watch('role')

  const onSubmit = async (data) => {
    try {
      const { confirmPassword, ...payload } = data
      await useAuthStore.getState().register(payload)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || t('common.error'))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-surface dark:bg-primary-dark py-12">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 dark:bg-primary-light/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/5 dark:bg-accent/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg mx-4"
      >
        <div className="bg-white dark:bg-primary-dark rounded-xl shadow-lg p-8 sm:p-10 border border-border dark:border-border-dark">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-accent text-black mb-4">
              <GraduationCap size={28} />
            </div>
            <h1 className="text-3xl font-display font-bold text-text dark:text-text-dark">
              {t('auth.register')}
            </h1>
            <p className="text-sm text-muted mt-1">
              {t('auth.haveAccount')}{' '}
              <Link
                to="/login"
                className="text-primary hover:text-primary-light dark:text-accent dark:hover:text-accent-light font-medium transition-colors"
              >
                {t('auth.login')}
              </Link>
            </p>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">
                  {t('auth.firstName')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <User size={16} />
                  </div>
                  <input
                    {...register('firstName')}
                    placeholder={t('auth.firstName')}
                    className={`w-full rounded-md border ${errors.firstName ? 'border-danger' : 'border-border dark:border-border-dark'} bg-white dark:bg-primary-dark text-text dark:text-text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors duration-200 pl-10 pr-3 py-2.5 text-sm`}
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-xs text-danger">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">
                  {t('auth.lastName')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <User size={16} />
                  </div>
                  <input
                    {...register('lastName')}
                    placeholder={t('auth.lastName')}
                    className={`w-full rounded-md border ${errors.lastName ? 'border-danger' : 'border-border dark:border-border-dark'} bg-white dark:bg-primary-dark text-text dark:text-text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors duration-200 pl-10 pr-3 py-2.5 text-sm`}
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-xs text-danger">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">
                {t('auth.email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <Mail size={16} />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="you@university.edu"
                  className={`w-full rounded-md border ${errors.email ? 'border-danger' : 'border-border dark:border-border-dark'} bg-white dark:bg-primary-dark text-text dark:text-text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors duration-200 pl-10 pr-3 py-2.5 text-sm`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <Lock size={16} />
                  </div>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className={`w-full rounded-md border ${errors.password ? 'border-danger' : 'border-border dark:border-border-dark'} bg-white dark:bg-primary-dark text-text dark:text-text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors duration-200 pl-10 pr-10 py-2.5 text-sm`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-text dark:hover:text-text-dark transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">
                  {t('auth.confirmPassword') || 'Confirm Password'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <Lock size={16} />
                  </div>
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className={`w-full rounded-md border ${errors.confirmPassword ? 'border-danger' : 'border-border dark:border-border-dark'} bg-white dark:bg-primary-dark text-text dark:text-text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors duration-200 pl-10 pr-10 py-2.5 text-sm`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-text dark:hover:text-text-dark transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-danger">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">
                {t('auth.role')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((r) => (
                  <label
                    key={r.value}
                    className={`flex items-center justify-center gap-2 p-3 rounded-md border cursor-pointer transition-all duration-200 ${
                      selectedRole === r.value
                        ? 'border-primary bg-primary/5 dark:bg-primary-light/10 text-primary dark:text-accent font-medium'
                        : 'border-border dark:border-border-dark text-muted hover:border-primary/30 hover:text-text dark:hover:text-text-dark'
                    }`}
                  >
                    <input
                      {...register('role')}
                      type="radio"
                      value={r.value}
                      className="sr-only"
                    />
                    {r.value === 'student' ? <BookOpen size={18} /> : <Users size={18} />}
                    {r.label}
                  </label>
                ))}
              </div>
              {errors.role && (
                <p className="mt-1 text-xs text-danger">{errors.role.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">
                {t('auth.department')}
              </label>
              <input
                {...register('department')}
                placeholder="Computer Science"
                className={`w-full rounded-md border ${errors.department ? 'border-danger' : 'border-border dark:border-border-dark'} bg-white dark:bg-primary-dark text-text dark:text-text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors duration-200 px-3 py-2.5 text-sm`}
              />
              {errors.department && (
                <p className="mt-1 text-xs text-danger">{errors.department.message}</p>
              )}
            </div>

            {selectedRole === 'student' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-hidden"
              >
                <div>
                  <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">
                    {t('auth.level')}
                  </label>
                  <input
                    {...register('level')}
                    placeholder="Year 3"
                    className={`w-full rounded-md border ${errors.level ? 'border-danger' : 'border-border dark:border-border-dark'} bg-white dark:bg-primary-dark text-text dark:text-text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors duration-200 px-3 py-2.5 text-sm`}
                  />
                  {errors.level && (
                    <p className="mt-1 text-xs text-danger">{errors.level.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">
                    {t('auth.matricule')}
                  </label>
                  <input
                    {...register('matricule')}
                    placeholder="FE20XXX"
                    className={`w-full rounded-md border ${errors.matricule ? 'border-danger' : 'border-border dark:border-border-dark'} bg-white dark:bg-primary-dark text-text dark:text-text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors duration-200 px-3 py-2.5 text-sm`}
                  />
                  {errors.matricule && (
                    <p className="mt-1 text-xs text-danger">{errors.matricule.message}</p>
                  )}
                </div>
              </motion.div>
            )}

            <Button
              type="submit"
              loading={isSubmitting}
              className="w-full"
              size="lg"
              variant="secondary"
            >
              {t('auth.signUp')}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
