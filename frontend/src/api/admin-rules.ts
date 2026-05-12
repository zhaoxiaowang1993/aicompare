import api from '../lib/api'
import type { RuleCreatePayload, RuleImportSummary, RuleListParams, RuleListResponse, RuleUpdatePayload, QualityRule } from '../types/rules'

export async function fetchRules(params: RuleListParams) {
  const response = await api.get<RuleListResponse>('/admin/rules', { params })
  return response.data
}

export async function createRule(payload: RuleCreatePayload) {
  const response = await api.post<QualityRule>('/admin/rules', payload)
  return response.data
}

export async function updateRule(ruleId: number, payload: RuleUpdatePayload) {
  const response = await api.patch<QualityRule>(`/admin/rules/${ruleId}`, payload)
  return response.data
}

export async function deleteRule(ruleId: number) {
  await api.delete(`/admin/rules/${ruleId}`)
}

export async function downloadRuleTemplate() {
  const response = await api.get<Blob>('/admin/rules/template.csv', { responseType: 'blob' })
  return response.data
}

export async function importRulesCsv(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post<RuleImportSummary>('/admin/rules/import-csv', formData)
  return response.data
}

export async function validateRulesCsv(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post<RuleImportSummary>('/admin/rules/validate-csv', formData)
  return response.data
}
