import { DatePicker, Modal } from 'antd'
import type { Dayjs } from 'dayjs'
import { useState } from 'react'
import Table from '../../../components/data-display/table'
import Empty from '../../../components/data-display/empty'
import Select from '../../../components/data-entry/select'
import Button from '../../../components/feedback/button'
import type { AnnotationDetail, Decision } from '../../../types/report'

export type AnnotationFilterValue = {
  operator_user_id?: number
  decision?: Decision
  range?: [Dayjs, Dayjs]
}

type AnnotationDetailSectionProps = {
  annotations: AnnotationDetail[]
  total: number
  page: number
  pageSize: number
  loading: boolean
  onFilter: (value: AnnotationFilterValue) => void
  onPageChange: (page: number, pageSize: number) => void
}

const decisionText: Record<Decision, string> = {
  A_BETTER: 'A 更好',
  B_BETTER: 'B 更好',
  BOTH_BAD: '都不好',
  BOTH_GOOD: '都好'
}

const reasonText: Record<string, string> = {
  NO_HIT_ERROR_RULE: '无命中错误规则',
  NO_MISSING_RULE: '无遗漏规则',
  NO_OVER_QC: '无过度质控',
  OTHER: '其他'
}

function formatTime(value: string) {
  return new Date(value).toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    hour12: false
  })
}

function reasonLabel(codes: string[]) {
  return codes.map((code) => reasonText[code] ?? code).join('、')
}

export default function AnnotationDetailSection({
  annotations,
  total,
  page,
  pageSize,
  loading,
  onFilter,
  onPageChange
}: AnnotationDetailSectionProps) {
  const [filter, setFilter] = useState<AnnotationFilterValue>({})
  const [activeRecord, setActiveRecord] = useState<AnnotationDetail | null>(null)

  return (
    <div className="flex flex-col gap-16">
      <div className="rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-container)] p-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[180px_180px_240px_72px_72px]">
          <Select<number>
            allowClear
            placeholder="全部操作员"
            value={filter.operator_user_id}
            className="[&_.ant-select-selection-placeholder]:!text-[var(--color-text-disabled)]"
            onChange={(operator_user_id) => setFilter((current) => ({ ...current, operator_user_id }))}
          />
          <Select<Decision>
            allowClear
            placeholder="全部结论"
            value={filter.decision}
            options={Object.entries(decisionText).map(([value, label]) => ({ value, label }))}
            className="[&_.ant-select-selection-placeholder]:!text-[var(--color-text-disabled)]"
            onChange={(decision) => setFilter((current) => ({ ...current, decision }))}
          />
          <DatePicker.RangePicker
            placeholder={['开始日期', '结束日期']}
            value={filter.range}
            onChange={(range) => setFilter((current) => ({ ...current, range: range as [Dayjs, Dayjs] | undefined }))}
          />
          <Button color="primary" variant="solid" onClick={() => onFilter(filter)}>
            查询
          </Button>
          <Button
            onClick={() => {
              setFilter({})
              onFilter({})
            }}
          >
            重置
          </Button>
        </div>
      </div>
      <Table<AnnotationDetail>
        rowKey="id"
        size="middle"
        border="borderless"
        loading={loading}
        dataSource={annotations}
        locale={{ emptyText: <Empty imageVariant="simple" description="暂无标注明细" /> }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: false,
          showTotal: (count) => `共 ${count} 条`,
          onChange: onPageChange
        }}
        className="overflow-hidden border border-[var(--color-border-secondary)] [&_.ant-pagination-item-active_a]:font-normal [&_.ant-pagination-item-link]:font-normal [&_.ant-pagination-item_a]:font-normal [&_.ant-pagination-total-text]:font-normal [&_.ant-pagination]:text-base [&_.ant-table-cell]:text-base [&_.ant-table-cell]:font-normal [&_.ant-table-thead>tr>th]:h-[48px] [&_.ant-table-thead>tr>th]:bg-[var(--color-bg-container)] [&_.ant-table-thead>tr>th]:text-caption [&_.ant-table-thead>tr>th]:font-normal"
        columns={[
          { title: '住院号', dataIndex: 'hospitalization_no', width: 160 },
          { title: '操作员', dataIndex: 'operator_username', width: 112, render: (value: string | null) => value ?? '-' },
          { title: '标注结论', dataIndex: 'decision', width: 120, render: (value: Decision) => decisionText[value] },
          { title: '标注原因', dataIndex: 'reason_codes', width: 240, render: (codes: string[]) => reasonLabel(codes) },
          { title: '备注', dataIndex: 'notes', ellipsis: true, render: (value: string | null) => value ?? '-' },
          { title: '标注时间', dataIndex: 'created_at', width: 184, render: formatTime },
          {
            title: '操作',
            width: 104,
            render: (_, record) => (
              <Button variant="link" color="primary" onClick={() => setActiveRecord(record)}>
                查看详情
              </Button>
            )
          }
        ]}
      />
      <Modal title="标注详情" open={Boolean(activeRecord)} onCancel={() => setActiveRecord(null)} footer={null} width={840}>
        {activeRecord ? (
          <div className="grid gap-16">
            <div className="grid grid-cols-2 gap-16 text-base">
              <div>
                <span className="text-[var(--color-text-secondary)]">住院号：</span>
                {activeRecord.hospitalization_no}
              </div>
              <div>
                <span className="text-[var(--color-text-secondary)]">操作员：</span>
                {activeRecord.operator_username ?? '-'}
              </div>
            </div>
            <div className="rounded-lg bg-[var(--color-bg-layout)] p-16">
              <div className="mb-8 font-normal">病历内容</div>
              <div className="whitespace-pre-wrap text-base text-[var(--color-text-secondary)]">{activeRecord.record_text}</div>
            </div>
            <div className="grid gap-16 lg:grid-cols-2">
              <div className="rounded-lg border border-[var(--color-border-secondary)] p-16">
                <div className="mb-8 font-normal">{activeRecord.display_a_source}</div>
                <div className="whitespace-pre-wrap text-base text-[var(--color-text-secondary)]">{activeRecord.agent_a_output}</div>
              </div>
              <div className="rounded-lg border border-[var(--color-border-secondary)] p-16">
                <div className="mb-8 font-normal">{activeRecord.display_b_source}</div>
                <div className="whitespace-pre-wrap text-base text-[var(--color-text-secondary)]">{activeRecord.agent_b_output}</div>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
