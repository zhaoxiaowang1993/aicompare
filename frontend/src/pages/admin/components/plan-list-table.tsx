import { Link } from 'react-router-dom'
import type { TablePaginationConfig } from 'antd'
import Table from '../../../components/data-display/table'
import Button from '../../../components/feedback/button'
import Empty from '../../../components/data-display/empty'
import PlanStatusTag, { planDisplayStatus } from './plan-status-tag'
import type { PlanItem } from '../../../types/plan'

type PlanListTableProps = {
  items: PlanItem[]
  loading: boolean
  pagination: TablePaginationConfig
  onActivate: (plan: PlanItem) => void
  onClose: (plan: PlanItem) => void
}

function progressText(plan: PlanItem) {
  return `${plan.annotated_cases}/${plan.total_cases}`
}

export default function PlanListTable({ items, loading, pagination, onActivate, onClose }: PlanListTableProps) {
  return (
    <Table<PlanItem>
      rowKey="id"
      size="middle"
      border="borderless"
      loading={loading}
      dataSource={items}
      locale={{ emptyText: <Empty imageVariant="blueSimple" description="暂无标注计划" /> }}
      pagination={pagination}
      className="overflow-hidden border border-[var(--color-border-secondary)] text-base [&_.ant-pagination]:mb-24 [&_.ant-pagination]:mt-16 [&_.ant-pagination]:px-16 [&_.ant-pagination]:text-base [&_.ant-pagination-item-active]:border-[var(--color-primary)] [&_.ant-pagination-item-active]:font-normal [&_.ant-pagination-item-active_a]:font-normal [&_.ant-pagination-item-link]:font-normal [&_.ant-pagination-item]:rounded-md [&_.ant-pagination-item]:font-normal [&_.ant-pagination-item_a]:font-normal [&_.ant-pagination-total-text]:font-normal [&_.ant-pagination-total-text]:text-[var(--color-text)] [&_.ant-table-cell]:h-[52px] [&_.ant-table-cell]:text-base [&_.ant-table-cell]:font-normal [&_.ant-table-thead>tr>th]:h-[48px] [&_.ant-table-thead>tr>th]:bg-[var(--color-gray-2)] [&_.ant-table-thead>tr>th]:font-semibold"
      columns={[
        {
          title: '计划名称',
          dataIndex: 'name',
          render: (name: string, record) => (
            <Link to={`/admin/plans/${record.id}`} className="font-normal text-[var(--color-text)]">
              {name}
            </Link>
          )
        },
        { title: '负责人', dataIndex: 'owner_username', width: 160, render: (value: string | null) => value ?? '-' },
        { title: '标注进度', key: 'progress', width: 200, render: (_, record) => progressText(record) },
        { title: '状态', key: 'status', width: 120, render: (_, record) => <PlanStatusTag status={planDisplayStatus(record)} /> },
        {
          title: '操作',
          key: 'actions',
          width: 220,
          render: (_, record) => (
            <div className="flex items-center gap-16">
              <Link to={`/admin/plans/${record.id}`} className="text-base font-normal text-[var(--color-primary)]">
                详情
              </Link>
              {record.status === 'closed' ? (
                <Button variant="link" color="primary" className="p-0 text-base font-normal" onClick={() => onActivate(record)}>
                  重启
                </Button>
              ) : (
                <Button variant="link" color="primary" className="p-0 text-base font-normal" onClick={() => onClose(record)}>
                  关闭
                </Button>
              )}
            </div>
          )
        }
      ]}
    />
  )
}
