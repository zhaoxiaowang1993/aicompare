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
├── specs/                      # 规范文档
├── tests/                      # 测试
├── .env.example
├── .gitignore
├── environment.yml
├── AGENTS.md
└── README.md
```

## Design 文件

- `design/pages/oauth-login.pen`
- `design/pages/admin-plan-list.pen`
- `design/pages/admin-plan-detail.pen`
- `design/admin-users.pen`
- `design/admin-rules.pen`
- `design/operator-plans.pen`
- `design/operator-annotate.pen`
- `design/images/generated-1775805662726.png`

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

## 生产部署

```bash
docker compose -f docker/docker-compose.prod.yml up --build -d
```

- 本机入口：`http://127.0.0.1:2657`
- 反向代理：`/api/* -> backend:8000`
- 线上说明：见 `docs/deployment.md`

## 规范入口

- `specs/SPEC.md`（唯一规范副本）
