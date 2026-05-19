# 病例质控标注系统

病例质控标注系统项目骨架（长期迭代版）。

## 技术栈

- 前端：Vite + React + TypeScript + Tailwind CSS + Ant Design
- 后端：FastAPI + Pydantic v2 + SQLite
- 部署：Docker + docker-compose（生产含 Nginx 反代）

## 目录结构

```text
.
├── frontend/                   # 前端工程
├── backend/                    # 后端工程
├── design/                     # 页面设计稿 .pen
├── docker/                     # Dockerfile、compose、nginx 配置
├── openspec/                   # 规范文档与变更记录
├── tests/                      # 测试
├── .env.example
├── .gitignore
├── environment.yml
└── README.md
```

## Design 文件

- `design/pages/oauth-login.pen`
- `design/pages/admin-plan-list.pen`
- `design/pages/admin-plan-detail.pen`
- `design/pages/admin-users.pen`
- `design/pages/admin-rules.pen`
- `design/pages/operator.pen`
- `design/pages/images/generated-1775805662726.png`

## 本地开发启动顺序

1. 创建并激活 Conda 环境

```bash
conda env create -f environment.yml
conda activate aicompare
```

2. 启动后端（终端 A）

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

3. 启动前端（终端 B）

```bash
cd frontend
npm install
npm run dev
```

4. 访问

- 前端：`http://localhost:5173`
- 后端：`http://localhost:8000/api/health`

## 标注模式与 CSV 模板

创建计划时需要选择标注类型：

| 标注类型 | 用途 | CSV 表头 |
|---|---|---|
| 对比模式 `comparison` | 对比 AI 质控结果 A/B | `住院号,病历内容,智能体A输出,智能体B输出` |
| 手动模式 `manual` | 标注员直接基于病历原文圈选问题并填写建议 | `住院号,病历内容` |

手动模式与对比模式共用质控规则。手动标注提交后按病例级完成记录计入进度；有问题病例可包含多条问题条目，无问题病例通过 `no_issue` 状态完成。本期不支持手动标注提交后的编辑或重提。

## 测试与构建

```bash
# 后端测试（需先激活 conda 环境 aicompare）
/Users/zhaochengwang/anaconda3/envs/aicompare/bin/python -m pytest tests/backend backend/tests -q

# 前端契约测试与生产构建
cd frontend
npm run test
npm run build
```

## 生产部署

```bash
docker compose -f docker/docker-compose.prod.yml up --build -d
```

- 本机入口：`http://127.0.0.1:2657`
- 反向代理：`/api/* -> backend:8000`
- 线上说明：见 `docs/deployment.md`

## 规范入口

- `openspec/specs/SPEC.md`（唯一规范副本）
