# Pencil Component Governance Plan

日期：2026-04-30  
状态：后续治理方案  
适用范围：`design/components/*.lib.pen`、未来 React 组件库、业务系统设计稿

## 目标

本计划描述当前 Pencil 组件库的后续治理路线。

短期目标不是继续追求所有 `.lib.pen` 文件立刻完全由 `design/tokens.lib.pen` 驱动，而是先把当前组件库作为可复用的业务设计契约冻结下来，让业务系统可以开始稳定交付。

中长期目标仍然是让组件库逐步回到 `design/tokens.lib.pen` 的治理体系中：

```text
tokens.lib.pen -> runtime token -> Pencil 组件库 / React 组件库 -> 业务系统
```

## 治理原则

1. 当前业务系统优先消费组件，不消费底层 token。
2. Pencil 组件库当前可以保留本地变量作为内部视觉契约。
3. 本地变量不是长期规范，后续要逐步分类治理。
4. 不用业务页面反向定义全局 token。
5. 不为单个偶然色值创建全局 Alias Token。
6. 多组件共享、语义明确、可复用的值，才有资格提升为 Alias Token。
7. 单组件私有但稳定的值，应沉淀为 Component Token。
8. 与 `tokens.lib.pen` 同名但值不同的变量必须人工决策，不能批量覆盖。

## 阶段 0：冻结当前组件库基线

行动时机：立即执行，业务系统设计前。

产物：

- `design/components/specs/component-governace-status.md`
- `design/components/specs/component-governace-plan.md`
- 删除废弃的旧 General 组件文件，统一使用 `design/components/general.lib.pen`

执行规则：

- 以当前 `.lib.pen` 组件视觉作为短期业务系统设计基线。
- 标记当前组件库不是完全 token-governed。
- 明确业务页面只 import 组件库，不直接拼装底层 token。

验收标准：

- 每个 `.lib.pen` 文件都有现状描述。
- 变量来源、同名差异、本地变量和硬编码风险被记录。
- 后续 AI 或开发者不会误以为组件库已经完全由 `tokens.lib.pen` 派生。

## 阶段 1：生成 runtime token

行动时机：React 组件治理和业务系统开发前。

产物：

- `frontend/src/styles/globals.css`
- `frontend/tailwind.config.ts`
- AntD theme 文件，例如 `frontend/src/theme/antd-theme.ts`

执行范围：

- CSS variables：覆盖 `tokens.lib.pen` 中公开 token。
- Tailwind：优先输出 colors、spacing、radius、typography、screens、shadow。
- AntD theme：区分 seed、map、alias、component token，映射到 AntD `token` 和 `components`。

执行规则：

- Runtime token 必须从 `design/tokens.lib.pen` 派生。
- Runtime 不反向定义设计 token。
- `$responsive-query-*`、shadow 引用、component token 引用等特殊规则必须遵守 `design/specs/token-special-case.md`。

验收标准：

- CSS variables、Tailwind、AntD theme 三者能解释同一套 token。
- React 组件不需要继续手写 hex、任意字号、任意圆角。

## 阶段 2：业务设计稿消费组件库

行动时机：业务页面设计开始时。

产物：

- `design/pages/*` 业务页面设计稿
- 页面级组件使用清单
- 缺失组件 / 缺失变体清单

执行规则：

- 页面优先 import `design/components/*.lib.pen`。
- 不在业务页面重新画 Button、Input、Table、Menu、Modal 等基础组件。
- 页面不直接 import `design/tokens.lib.pen` 来绕过组件库，除非是页面背景、布局容器、文本层级等经过确认的公开 token。
- 页面新增的局部样式必须记录为组件库缺口，而不是沉淀为业务页面私有规范。

验收标准：

- 页面主要 UI 均来自组件库。
- 业务设计稿没有新增散乱本地变量。
- 组件缺口被反馈到组件库治理计划。

## 阶段 3：React 组件轻量治理

行动时机：runtime token 生成后，业务功能开发前或并行早期。

产物：

- `frontend/src/components` 组件审计报告
- 必要的 token 替换 patch
- 组件 API 与 Pencil 组件变体对照表

执行规则：

- 不立即重写全部 React 组件。
- 先修正明显风险：hex 色值、任意字号、任意圆角、业务页面级覆盖。
- 组件实现优先消费 CSS variables、Tailwind token、AntD theme。
- 已存在且可工作的组件，可以在不破坏业务节奏的前提下逐步收敛。

验收标准：

- 高频组件不再依赖散乱硬编码。
- Button、Input、Select、Table、Menu、Modal 等核心组件有明确 token 消费路径。
- React 组件和 Pencil 组件的变体命名可追溯。

## 阶段 4：组件本地变量分类

行动时机：业务系统首轮稳定后，或某个组件需要跨系统复用前。

产物：

- 每个 `.lib.pen` 文件的本地变量分类表
- Component Token 候选清单
- Alias Token 候选清单
- 废弃变量清单

分类规则：

| 类型 | 处理方式 |
|---|---|
| 与 `tokens.lib.pen` 同名同值 | 后续可直接收敛为全局 token 引用 |
| 与 `tokens.lib.pen` 同名但值不同 | 必须人工决策，以组件视觉为准或以全局 token 为准 |
| 多组件共享且语义明确 | 候选 Alias Token |
| 单组件私有且稳定 | 候选 Component Token |
| 色板型组件所需颜色 | 候选 Palette / Component Token，按组件场景判断 |
| 展示画板或导入残留 | 不沉淀，后续清理 |
| `test-var` 等历史变量 | 确认无引用后删除 |

验收标准：

- 每个本地变量都有去向：保留、提升、替换、删除。
- 不再用“看起来一样”作为治理依据，必须有组件语义。

## 阶段 5：Pencil 组件 token 回填

行动时机：阶段 4 分类完成后，按组件逐个推进。

产物：

- 更新后的 `design/tokens.lib.pen` Component Token
- 更新后的 `design/components/*.lib.pen`
- 每个组件文件的治理前后视觉对比记录

执行顺序建议：

1. `general.lib.pen`：Button、Typography。
2. `data-entry.lib.pen`：Form、Input、Select、Switch、Upload。
3. `navigation.lib.pen`：Menu、Tabs、Pagination、Breadcrumb。
4. `layout.lib.pen`：Layout、Sider、Header、Footer。
5. `feedback.lib.pen`：Alert、Drawer、Modal、Notification、Result。
6. `data-display.lib.pen`：Table、Card、Tag、Badge、Empty。

执行规则：

- 逐组件治理，不跨文件批量替换。
- 每次只处理一个组件族，例如 Button 或 Input。
- 替换前先列出完全等价项、同名差异项、源文件缺失项。
- 完全等价项可以安全替换。
- 同名差异项必须先决策。
- 源文件缺失项必须先判断是否新增 Component Token。
- 修改 `.lib.pen` 后必须重新打开或截图验证，避免 Pencil 变量解析问题造成视觉异常。

验收标准：

- 组件视觉不发生非预期变化。
- `$token` 引用无缺失。
- 组件文件本地变量数量下降。
- 组件 token 与 React runtime token 可对应。

## 阶段 6：跨系统复用与版本化

行动时机：第二个业务系统开始复用组件库前。

产物：

- 组件库版本记录
- breaking changes 记录
- 业务系统组件依赖矩阵

执行规则：

- 组件库更新必须记录影响范围。
- 不允许为了单个业务系统直接修改共享组件视觉。
- 新组件变体应先在组件库中新增，再由业务系统引用。
- 如果业务系统需要临时差异，应通过局部业务组件封装，不污染基础组件库。

验收标准：

- 组件库可以被多个业务系统复用。
- 每次组件视觉变化都有原因、范围和迁移建议。

## 当前推荐路线

在时间紧张的情况下，推荐采用“方案二的改良版”：

1. 冻结当前 Pencil 组件库为短期组件视觉契约。
2. 业务页面设计只消费组件库。
3. 立即补齐 CSS variables、Tailwind、AntD theme runtime 输出。
4. 对 React 组件做轻量治理，优先消除明显 hardcode。
5. 业务系统研发先推进。
6. 后续按组件族逐步把本地变量反向治理为 Component Token。

这条路线的优势：

- 不阻塞业务系统研发。
- 保留当前设计稿视觉结果。
- 不破坏已经完成治理的 `tokens.lib.pen`。
- 为后续严肃设计系统治理留下可执行路径。

这条路线的代价：

- 短期内 Pencil 组件库不是纯粹的全局 token 派生物。
- React 组件和 Pencil 组件之间仍需要人工对照。
- 后续组件 token 治理不能省略，只是延后到业务节奏允许时执行。

## 不建议的做法

- 不建议继续要求所有 `.lib.pen` 立即完全替换为 `tokens.lib.pen` 引用，这会高概率改变视觉。
- 不建议让业务页面直接 import `tokens.lib.pen` 后自行绘制控件。
- 不建议为了匹配现有组件视觉，把所有本地变量无差别提升到全局 token。
- 不建议在 React 组件中继续新增 hex、`text-[13px]`、`rounded-[7px]` 等任意值。
- 不建议把展示画板、导入残留、测试变量视为设计规范。
