import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import LoginPage from '../pages/auth/login-page'
import AdminPlansPage from '../pages/admin/admin-plans-page'
import AdminPlanDetailPage from '../pages/admin/admin-plan-detail-page'
import AdminManualAnnotationDetailPage from '../pages/admin/admin-manual-annotation-detail-page'
import AdminRulesPage from '../pages/admin/admin-rules-page'
import OperatorPlansPage from '../pages/operator/operator-plans-page'
import OperatorAnnotatePage from '../pages/operator/operator-annotate-page'
import { getAccessToken, getStoredUser } from '../lib/api'

function ProtectedRoute({ role, children }: { role?: 'admin' | 'operator'; children: ReactNode }) {
  const user = getStoredUser()
  const mockRoleEnabled =
    (role === 'admin' && import.meta.env.VITE_ADMIN_API_MODE === 'mock') ||
    (role === 'operator' && import.meta.env.VITE_OPERATOR_API_MODE === 'mock')
  if (!getAccessToken() || !user) {
    if (mockRoleEnabled) return children
    return <Navigate to="/login" replace />
  }
  if (role && user.role !== role && !mockRoleEnabled) {
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
      <Route path="/admin/plans/:id/annotations/:manualAnnotationId" element={<ProtectedRoute role="admin"><AdminManualAnnotationDetailPage /></ProtectedRoute>} />
      <Route path="/admin/rules" element={<ProtectedRoute role="admin"><AdminRulesPage /></ProtectedRoute>} />
      <Route path="/operator" element={<Navigate to="/operator/plans" replace />} />
      <Route path="/operator/plans" element={<ProtectedRoute role="operator"><OperatorPlansPage /></ProtectedRoute>} />
      <Route path="/operator/plans/:planId/annotate" element={<ProtectedRoute role="operator"><OperatorAnnotatePage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
