import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from '../pages/login-page'
import AdminPlansPage from '../pages/admin-plans-page'
import AdminPlanDetailPage from '../pages/admin-plan-detail-page'
import AdminUsersPage from '../pages/admin-users-page'
import AdminRulesPage from '../pages/admin-rules-page'
import OperatorAnnotatePage from '../pages/operator-annotate-page'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/plans" element={<AdminPlansPage />} />
      <Route path="/admin/plans/:id" element={<AdminPlanDetailPage />} />
      <Route path="/admin/users" element={<AdminUsersPage />} />
      <Route path="/admin/rules" element={<AdminRulesPage />} />
      <Route path="/operator/plans/:id/annotate" element={<OperatorAnnotatePage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
