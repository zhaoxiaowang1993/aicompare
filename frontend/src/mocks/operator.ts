import type {
  OperatorAnnotationPayload,
  OperatorAnnotationResult,
  OperatorDocumentType,
  OperatorPlanListItem,
  OperatorPlanListParams,
  OperatorPlanListResponse,
  OperatorTask,
  OperatorTaskResponse
} from '../types/operator'

const mockPlans: OperatorPlanListItem[] = [
  {
    id: 101,
    name: '病历质控对比评审-内科批次',
    description: '住院病历质控输出对比标注',
    status: 'active',
    total_cases: 10,
    annotated_cases: 6,
    pending_cases: 4,
    completion_rate: 60,
    updated_at: '2026-05-10 16:20'
  },
  {
    id: 102,
    name: '外科出院记录专项评审',
    description: '出院记录与首次病程质量规则对比',
    status: 'not_started',
    total_cases: 8,
    annotated_cases: 0,
    pending_cases: 8,
    completion_rate: 0,
    updated_at: '2026-05-09 11:30'
  },
  {
    id: 103,
    name: '五月第一批完成样本复核',
    description: '已完成计划不可再次进入标注面板',
    status: 'completed',
    total_cases: 12,
    annotated_cases: 12,
    pending_cases: 0,
    completion_rate: 100,
    updated_at: '2026-05-08 09:45'
  },
  {
    id: 104,
    name: '关闭计划示例',
    description: '关闭后按钮直接置灰显示已关闭',
    status: 'closed',
    total_cases: 6,
    annotated_cases: 2,
    pending_cases: 4,
    completion_rate: 33,
    updated_at: '2026-05-07 18:10'
  }
]

const qualityRules: OperatorTask['quality_rules'] = {
  admission: [
    {
      id: 'admission-1',
      code: 'A-01',
      title: '主诉与现病史一致性',
      description: '入院记录需描述主诉、现病史演变及主要阳性体征，且前后表达一致。',
      score: '10'
    },
    {
      id: 'admission-2',
      code: 'A-02',
      title: '入院诊断依据完整',
      description: '诊断依据需覆盖症状、体征、辅助检查及鉴别诊断要点。',
      score: '8'
    },
    {
      id: 'admission-3',
      code: 'A-03',
      title: '既往史记录规范',
      description: '既往史、药敏史、手术史、输血史等项目应完整记录。',
      score: '6'
    }
  ],
  first_course: [
    {
      id: 'first-course-1',
      code: 'F-01',
      title: '首次病程诊疗计划明确',
      description: '首次病程需包含诊断依据、鉴别诊断、后续检查和治疗计划。',
      score: '12'
    },
    {
      id: 'first-course-2',
      code: 'F-02',
      title: '上级医师意见记录',
      description: '应记录上级医师查房意见及医嘱调整依据。',
      score: '8'
    }
  ],
  superior_round: [],
  daily_course: [],
  discharge: [
    {
      id: 'discharge-1',
      code: 'D-01',
      title: '出院诊断与病程一致',
      description: '出院诊断应与住院期间诊疗过程、检查结果和转归一致。',
      score: '10'
    },
    {
      id: 'discharge-2',
      code: 'D-02',
      title: '出院医嘱完整',
      description: '出院医嘱需包含用药、复诊、生活方式及异常情况处理建议。',
      score: '8'
    }
  ]
}

const markdownAcceptanceMedicalRecord = `<font size="4"><strong>入院记录</strong></font>
表格<病人信息表>内容:
姓名：王璞
性别：女
年龄：52岁
民族：汉族
婚姻：已婚
籍贯：河南南阳
职业：不详
身份证号：（已脱敏）
住址：南阳卧龙区金冠小区
工作单位：中国工商银行股份有限公司南阳分行
联系电话：（已脱敏）
入院情况：一般
入院时间：2026-02-18 10:22
病史采集时间：2026-02-18 15:56
病史陈述者：患者本人
病史可靠性：可靠
过敏史：否认

第3次入院记录
主  诉：腹胀伴反酸1年余，加重1月余
现病史：1年余前患者无明显诱因出现腹胀伴反酸，餐后显著，无恶心、呕吐，无呕血及便血，无呃逆，无腹痛、腹泻，无胸闷、胸痛。1月余前上述症状加重，门诊以“胃炎”收入院。右耳不适1年余，间断发作，未诊治。心悸2年余，间断发作，未规律诊治。
既往史：无高血压病史，无糖尿病、脑血管疾病病史。7年前因子宫肌瘤行手术治疗。
个人史：生于河南南阳，久居本地，无吸烟、饮酒史，否认冶游史。
家族史：父已故，母健在，1姐1妹，1女健康状况良好，无与患者类似疾病，无家族性遗传病史。

体  格  检  查
体温36.7℃；脉搏82次/分；呼吸20次/分；血压116/74mmHg。
腹平坦，无腹壁静脉曲张，无胃肠型，无蠕动波，腹部无压痛、反跳痛，腹部柔软、无包块。肝脏肋缘下未触及，脾脏肋缘下未触及，Murphy氏征阴性。

辅  助  检  查
无

表格<诊断>内容:
初步诊断：
1.胃炎

<font size="4"><strong>首次病程记录</strong></font>
2026-02-18 13:55 首次病程记录
根据入院病史、体检及辅助检查归纳，本病例特点如下：①患者以“腹胀伴反酸1年余，加重1月余”为主诉入院。②1年余前患者无明显诱因出现腹胀伴反酸，餐后显著。③查体：体温36.7℃，脉搏82次/分，呼吸20次/分，血压116/74mmHg。④辅助检查无。
初步诊断：1.胃炎。
鉴别诊断：1.胃癌；2.功能性消化不良；3.肾上腺皮质功能减退。
诊疗计划：完善血尿便常规、肝肾功、电解质、肿瘤标志物等检查；给予抑酸护胃、维持水电解质平衡、营养支持等对症治疗；请示上级医师指导诊疗。

<font size="4"><strong>上级医师查房记录</strong></font>
2026年2月19日 09:55 王权副主任医师查房记录
患者诉肠道清洁可，腹胀减轻，无恶心、呕吐等，小便可。查房后示：中年女性患者，因腹胀伴反酸就诊，入院后完善血常规未见贫血，凝血功能可，拟今日行胃镜检查。

<font size="4"><strong>出院记录</strong></font>
姓名：王璞 年龄：52岁 性别：女
入院日期：2026-02-18 出院日期：2026-02-26 住院天数：8天
入院诊断：1.胃炎
出院诊断：1.胃炎 2.胃息肉 3.胃窦肿物：黏膜下囊肿？4.结肠息肉 5.胃潴留 7.甲状腺结节 8.乳腺结节 9.子宫肌瘤 10.高脂血症 11.宫颈囊肿 12.耳大神经痛 13.神经性耳鸣
出院医嘱：嘱院外继续规律药物治疗，清淡饮食，适当运动，保持心态良好，1月后复查肝功能及血脂等，1年后复查胃肠镜等，如有不适及时就诊。`

const markdownAcceptanceAgentAResult = `<font size="4" ><strong>入院记录检查结果</strong></font>
| 质控规则                      | 违规内容                        | 建议修改内容                             | 扣分值 |
| ----------------------------- | ------------------------------- | ---------------------------------------- | ------ |
| 缺个人史、或遗漏诊治相关的个人史 | 吸烟史、饮酒史未明确记录        | 明确补充吸烟史（如“无吸烟史”）和饮酒史 | 0.5    |
| 缺遗传史                      | 家族史中未详细记录父母情况      | 补充父母健康状况及是否有遗传病史        | 0.5    |
| 现病史无既往诊疗经过          | 无“右耳不适”、“心悸”的诊疗记录| 补充右耳不适及心悸的既往诊疗经过       | 1.0    |
| 主诉描述欠规范                | “腹胀伴反酸1年余，加重1月余”   | 更改为具体症状描述，避免模糊时间点     | 1.0    |
| 体格检查无特定专科检查细节    | 专科检查中未特指耳科及心血管检查 | 加入耳科和心脏专科详细检查记录         | 2.0    |
| 现病史与主诉部分细节欠缺      | 右耳不适、心悸无详细症状描述    | 在现病史中详细描述右耳及心悸的症状进展 | 1.0    |
| 辅助检查描述不规范            | 无辅助检查记录                  | 记录入院前或入院时相关辅助检查结果     | 1.0    |
| 缺初步诊断                    | 初步诊断合理但未全面（仅胃炎）   | 增加可能相关的初步诊断（如耳部、心脏问题）| 0.5   |

**总扣分：** 7.0

注意：虽然主要诊断合理，但未涵盖所有提及的症状，需补充潜在相关诊断。其余建议修改内容应严格依照医疗文书标准补充完善。
- - -
<font size="4" ><strong>首次病程记录检查结果</strong></font>
| 违反规则项     | 违反原因                             | 原文内容                                                                                                                                 | 扣分值 |
|----------------|--------------------------------------|-----------------------------------------------------------------------------|--------|
| 时间限制       | 首次病程记录未在8小时内完成           | 首次病程记录时间：2026-02-18 13:55 (入院时间：2026-02-18 10:22)              | 单项否决 |
| 病例特点归纳   | 未充分提炼，照搬入院记录内容         | “患者以‘腹胀伴反酸1年余，加重1月余’为主诉入院...”（长段重复入院信息）    | 2      |
| 拟诊讨论       | 缺乏诊断分析思考过程及鉴别诊断阐述   | 初步诊断直接给出，缺乏分析过程与详细鉴别诊断                               | 4      |
| 诊疗计划       | 使用套话，不够具体                   | “完善血尿便常规…请示上级医师指导诊疗…”缺乏具体个性化诊疗措施               | 2      |

扣分总值： 8 分
- - -
<font size="4" ><strong>上级医师首次查房记录检查结果</strong></font>
| 违反规则项                | 违反原因                        | 原文内容                                     | 扣分值 |
|---------------------------|--------------------------------|---------------------------------------------|--------|
| 规定时间内完成            | 上级医师首次查房超过48小时      | 第一次查房记录时间为2026年2月19日09:55，入院时间为2026-02-18 10:22:00 | 单项否决 |
| 记录补充病史与查体新发现 | 未记录补充病史及新查体发现      | 查房记录中仅描述了基本状况，未补充病史或新发现              | 1分    |
| 分析讨论与诊疗计划        | 缺乏疾病分析讨论与鉴别诊断      | 记录中缺乏对疾病的详细分析讨论及鉴别诊断内容                  | 4分    |

**扣分总值：** 5分
- - -
<font size="4" ><strong>日常病程记录检查结果</strong></font>
| 违反规则项           | 违反原因                     | 原文内容                                                                 | 扣分值 |
|----------------------|------------------------------|--------------------------------------------------------------------|-------|
| 记录异常的辅助检查结果及临床意义 | 缺乏对辅助检查结果的分析和处理意见 | 动态心电图及心脏CTA结果未详细分析其临床意义及后续处理意见（如心律失常的处理计划）                      | 1     |
| 重要诊疗措施及效果记录 | 未记录重要诊疗措施的更改理由及效果 | 对心悸给予抗心律失常药物的必要性未详细说明及后续处理计划                                                | 1     |

扣分总值：2 分
- - -
<font size="4" ><strong>出院（死亡）记录检查结果</strong></font>
| 违反规则项       | 违反原因                         | 原文内容                                   | 扣分值 |
|------------------|----------------------------------|------------------------------------------|-------|
| 出院情况详细性   | 缺乏详细的出院时具体症状变化描述   | 出院情况仅简单描述腹胀减轻，未详述反酸等症状改善情况 | 2    |
| 出院诊断完整性   | 出院诊断中第7条“甲状腺结节”和第8条“乳腺结节”重复且未明确分类 | 同上诊断条目重复及不精简                     | 1    |
| 出院医嘱细节     | 出院医嘱缺乏具体用药指导          | 嘱院外继续规律药物治疗，但未提及具体药物名称和剂量      | 1    |

扣分总值： **4 分**`

const taskTemplates: OperatorTask[] = [
  {
    id: 528056,
    sequence_no: 7,
    total_tasks: 10,
    case_data: {
      id: 528056,
      hospitalization_no: '00528056',
      patient_name: '王璞',
      gender: '女',
      age: 52,
      department: '消化内科',
      admission_time: '2026-02-18 10:22',
      discharge_time: '2026-02-26',
      documents: [
        {
          id: 'acceptance-medical-record',
          type: 'admission',
          title: 'Markdown 验收病历',
          content: markdownAcceptanceMedicalRecord
        }
      ]
    },
    outputs: [
      {
        side: 'A',
        name: '智能体 A 结果',
        conclusion: markdownAcceptanceAgentAResult,
        summary: 'Markdown 表格、HTML 标题、加粗总分和分隔线验收样例。',
        rules: []
      },
      {
        side: 'B',
        name: '智能体 B 结果',
        conclusion: '略',
        summary: '用户提供的 B 结果为“略”。',
        rules: []
      }
    ],
    quality_rules: qualityRules
  },
  {
    id: 9001,
    sequence_no: 7,
    total_tasks: 10,
    case_data: {
      id: 6001,
      hospitalization_no: 'ZY202605130018',
      patient_name: '王某',
      gender: '女',
      age: 67,
      department: '呼吸与危重症医学科',
      admission_time: '2026-05-03 09:30',
      discharge_time: null,
      documents: [
        {
          id: 'doc-admission',
          type: 'admission',
          title: '入院记录',
          content:
            '主诉：反复咳嗽、咳痰 10 年，加重伴气促 3 天。\n\n现病史：患者 10 年前开始反复咳嗽咳痰，冬春季明显。3 天前受凉后症状加重，出现活动后气促，无胸痛、咯血。\n\n既往史：高血压病史 8 年，规律服用氨氯地平。否认药物过敏史。\n\n入院诊断：慢性阻塞性肺疾病急性加重；高血压病 2 级。'
        },
        {
          id: 'doc-first-course',
          type: 'first_course',
          title: '首次病程记录',
          content:
            '初步诊断：慢性阻塞性肺疾病急性加重。\n\n诊断依据：长期咳嗽咳痰史，本次受凉后加重，查体双肺可闻及散在哮鸣音，血气提示轻度低氧血症。\n\n诊疗计划：完善血常规、CRP、胸部 CT、肺功能评估；予吸氧、支气管扩张剂、抗感染及祛痰治疗。'
        },
        {
          id: 'doc-discharge',
          type: 'discharge',
          title: '出院记录',
          content:
            '出院情况：咳嗽咳痰较前明显缓解，活动耐量改善。\n\n出院诊断：慢性阻塞性肺疾病急性加重；高血压病。\n\n出院医嘱：继续吸入治疗，规律监测血压，2 周后呼吸专科门诊复诊，如出现发热、气促加重及时就诊。'
        }
      ]
    },
    outputs: [
      {
        side: 'A',
        name: '模型输出 A',
        conclusion: '识别到入院记录中主诉、现病史、既往史记录完整，首次病程诊疗计划较清晰。',
        summary: 'A 输出覆盖入院记录和首次病程主要质控点，但对出院医嘱的完整性提示偏弱。',
        rules: [
          {
            id: 'a-1',
            title: '入院诊断依据完整',
            evidence: '诊断依据包含病史、查体与血气检查，符合规则要求。',
            score: 8,
            severity: 'low'
          },
          {
            id: 'a-2',
            title: '出院医嘱完整',
            evidence: '出院医嘱缺少吸入药物剂量及疗程说明。',
            score: 8,
            severity: 'medium'
          }
        ]
      },
      {
        side: 'B',
        name: '模型输出 B',
        conclusion: '识别到出院记录医嘱完整，并提示首次病程需补充鉴别诊断。',
        summary: 'B 输出覆盖出院记录较完整，但将已记录的上级医师意见误判为缺失。',
        rules: [
          {
            id: 'b-1',
            title: '首次病程诊疗计划明确',
            evidence: '已列出检查和治疗计划，但鉴别诊断展开不足。',
            score: 12,
            severity: 'medium'
          },
          {
            id: 'b-2',
            title: '上级医师意见记录',
            evidence: '系统提示缺失，但病程后续记录已包含上级医师意见。',
            score: 8,
            severity: 'high'
          }
        ]
      }
    ],
    quality_rules: qualityRules
  }
]

const submittedTaskIds = new Set<number>()
const delayMs = 240

function clone<T>(value: T): T {
  return structuredClone(value)
}

function wait() {
  return new Promise((resolve) => window.setTimeout(resolve, delayMs))
}

function getPlan(planId: number) {
  const base = mockPlans.find((plan) => plan.id === planId) ?? mockPlans[0]
  const submitted = Array.from(submittedTaskIds).length
  if (base.id !== 101) return clone(base)
  const annotatedCases = Math.min(base.total_cases, base.annotated_cases + submitted)
  const pendingCases = Math.max(0, base.total_cases - annotatedCases)
  return {
    ...base,
    annotated_cases: annotatedCases,
    pending_cases: pendingCases,
    status: pendingCases === 0 ? 'completed' : base.status,
    completion_rate: Math.round((annotatedCases / base.total_cases) * 100)
  } satisfies OperatorPlanListItem
}

function nextTaskForPlan(planId: number): OperatorTask | null {
  const plan = getPlan(planId)
  if (plan.status === 'closed' || plan.status === 'completed') return null
  const task = taskTemplates.find((item) => !submittedTaskIds.has(item.id))
  return task ? clone(task) : null
}

export function documentTypeLabel(type: OperatorDocumentType) {
  const labels: Record<OperatorDocumentType, string> = {
    admission: '入院病历',
    first_course: '首次病程',
    superior_round: '上级查房',
    daily_course: '日常病程',
    discharge: '出院记录'
  }
  return labels[type]
}

export function resetOperatorMockState() {
  submittedTaskIds.clear()
}

export async function mockFetchOperatorPlans(params: OperatorPlanListParams = {}): Promise<OperatorPlanListResponse> {
  await wait()
  const page = params.page ?? 1
  const pageSize = params.page_size ?? mockPlans.length
  const items = mockPlans.map((plan) => getPlan(plan.id))
  return {
    items: clone(items.slice((page - 1) * pageSize, page * pageSize)),
    total: items.length,
    page,
    page_size: pageSize
  }
}

export async function mockFetchOperatorNextTask(planId: number): Promise<OperatorTaskResponse> {
  await wait()
  const plan = getPlan(planId)
  return {
    plan,
    task: nextTaskForPlan(planId)
  }
}

export async function mockSubmitOperatorAnnotation(planId: number, taskId: number, payload: OperatorAnnotationPayload): Promise<OperatorAnnotationResult> {
  void payload
  await wait()
  submittedTaskIds.add(taskId)
  const plan = getPlan(planId)
  const nextTask = nextTaskForPlan(planId)
  return {
    completed: !nextTask,
    next_task: nextTask,
    plan
  }
}
