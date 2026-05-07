import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import LoginPage from '../pages/auth/login-page'
import AdminPlansPage from '../pages/admin/admin-plans-page'
import AdminPlanDetailPage from '../pages/admin/admin-plan-detail-page'
import OperatorAnnotatePage from '../pages/operator-annotate-page'
import { getAccessToken, getStoredUser } from '../lib/api'

function ProtectedRoute({ role, children }: { role?: 'admin' | 'operator'; children: ReactNode }) {
  const user = getStoredUser()
  if (!getAccessToken() || !user) {
    return <Navigate to="/login" replace />
  }
  if (role && user.role !== role) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={<Navigate to="/admin/plans" replace />} />
      <Route path="/admin/plans" element={<ProtectedRoute role="admin"><AdminPlansPage /></ProtectedRoute>} />
      <Route path="/admin/plans/:id" element={<ProtectedRoute role="admin"><AdminPlanDetailPage /></ProtectedRoute>} />
      <Route path="/operator/plans/:id/annotate" element={<ProtectedRoute role="operator"><OperatorAnnotatePage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
