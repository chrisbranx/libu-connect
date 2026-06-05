import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import useThemeStore from './store/themeStore';

const Login = React.lazy(() => import('./pages/auth/Login'));
const Register = React.lazy(() => import('./pages/auth/Register'));
const ForgotPassword = React.lazy(() => import('./pages/auth/ForgotPassword'));
const Dashboard = React.lazy(() => import('./pages/dashboard/Dashboard'));
const Scheduler = React.lazy(() => import('./pages/scheduler/Scheduler'));
const Notes = React.lazy(() => import('./pages/notes/Notes'));
const NoteDetail = React.lazy(() => import('./pages/notes/NoteDetail'));
const AcademicTracker = React.lazy(() => import('./pages/academic/AcademicTracker'));
const Activities = React.lazy(() => import('./pages/activities/Activities'));
const Directory = React.lazy(() => import('./pages/directory/Directory'));
const AIAdvisor = React.lazy(() => import('./pages/ai/AIAdvisor'));
const Settings = React.lazy(() => import('./pages/settings/Settings'));
const AdminPanel = React.lazy(() => import('./pages/admin/AdminPanel'));

import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-surface dark:bg-surface-dark">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-primary animate-pulse" />
      <span className="font-display text-lg text-primary dark:text-text-dark font-semibold">LIBU Connect</span>
    </div>
  </div>
);

export default function App() {
  const { darkMode, initTheme } = useThemeStore();
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => { initTheme(); }, []);
  useEffect(() => { document.documentElement.classList.toggle('dark', darkMode); }, [darkMode]);
  useEffect(() => { checkAuth(); }, []);

  if (isLoading) return <LoadingFallback />;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="scheduler" element={<Scheduler />} />
          <Route path="notes" element={<Notes />} />
          <Route path="notes/:id" element={<NoteDetail />} />
          <Route path="academic" element={<AcademicTracker />} />
          <Route path="activities" element={<Activities />} />
          <Route path="directory" element={<Directory />} />
          <Route path="ai-advisor" element={<AIAdvisor />} />
          <Route path="settings" element={<Settings />} />
          <Route path="admin" element={<ProtectedRoute requiredRole="ADMIN"><AdminPanel /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
