import type { TablePaginationConfig } from 'antd'
import Empty from '../../../components/data-display/empty'
import Table from '../../../components/data-display/table'
import Tag, { type TagColor } from '../../../components/data-display/tag'
import Button from '../../../components/feedback/button'
import type { QualityRule, RuleCategory } from '../../../types/rules'
import { ruleCategoryOptions } from '../../../types/rules'

interface AdminRulesTableProps {
  items: QualityRule[]
  loading: boolean
  pagination: TablePaginationConfig
  onEdit: (rule: QualityRule) => void
  onDelete: (rule: QualityRule) => void
}

const categoryColor: Record<RuleCategory, TagColor> = {
  admission_record: 'blue',
  first_course_record: 'green',
  superior_physician_round: 'purple',
  daily_course_record: 'cyan',
  discharge_record: 'gold'
}

function categoryLabel(category: RuleCategory) {
  return ruleCategoryOptions.find((item) => item.value === category)?.label ?? category
}

function formatDate(value: string) {
  return value.slice(0, 10)
}

export default function AdminRulesTable({ items, loading, pagination, onEdit, onDelete }: AdminRulesTableProps) {
  return (
    <Table<QualityRule>
      rowKey="id"
      size="middle"
      border="borderless"
      loading={loading}
      dataSource={items}
      locale={{
        emptyText: (
          <Empty
            imageVariant="blueSimple"
            description={
              <div className="flex flex-col gap-4">
                <span className="text-base font-medium text-[var(--color-text)]">暂无质控规则</span>
                <span className="text-base font-normal text-[var(--color-text-secondary)]">可通过新增规则或批量创建导入规则</span>
              </div>
            }
          />
        )
      }}
      scroll={{ x: 920 }}
      pagination={pagination}
      className="min-h-[520px] overflow-hidden border border-[var(--color-border-secondary)] text-base [&_.ant-pagination]:mb-24 [&_.ant-pagination]:mt-16 [&_.ant-pagination]:px-16 [&_.ant-pagination]:text-base [&_.ant-pagination-item-active]:border-[var(--color-primary)] [&_.ant-pagination-item-active]:font-normal [&_.ant-pagination-item-active_a]:font-normal [&_.ant-pagination-item-link]:font-normal [&_.ant-pagination-item]:rounded-md [&_.ant-pagination-item]:font-normal [&_.ant-pagination-item_a]:font-normal [&_.ant-pagination-total-text]:font-normal [&_.ant-pagination-total-text]:text-[var(--color-text)] [&_.ant-table-cell]:h-[52px] [&_.ant-table-cell]:text-base [&_.ant-table-cell]:font-normal [&_.ant-table-thead>tr>th]:h-[48px] [&_.ant-table-thead>tr>th]:bg-[var(--color-gray-2)] [&_.ant-table-thead>tr>th]:font-semibold"
      columns={[
        {
          title: '规则分类',
          dataIndex: 'category',
          width: 180,
          render: (category: RuleCategory) => (
            <Tag color={categoryColor[category]} appearance="filled">
              {categoryLabel(category)}
            </Tag>
          )
        },
        {
          title: '规则内容',
          dataIndex: 'content',
          render: (content: string) => <span className="text-[var(--color-text)]">{content}</span>
        },
        { title: '分值', dataIndex: 'score', width: 120 },
        { title: '更新时间', dataIndex: 'updated_at', width: 160, render: (value: string) => formatDate(value) },
        {
          title: '操作',
          key: 'actions',
          width: 128,
          render: (_, record) => (
            <div className="flex items-center gap-16">
              <Button variant="link" color="primary" className="p-0 text-base font-normal" onClick={() => onEdit(record)}>
                编辑
              </Button>
              <Button variant="link" color="danger" className="p-0 text-base font-normal" onClick={() => onDelete(record)}>
                删除
              </Button>
            </div>
          )
        }
      ]}
    />
  )
}
