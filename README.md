# Social Media Content Generation Workflow

这是一个基于 Next.js 和 n8n 的社交媒体内容生成工作流系统。该系统允许用户上传配置文件，生成创意主题，并基于这些主题生成完整的社交媒体内容。

## 🚀 项目概述

本项目提供了一个完整的内容生成工作流，包括：

- 配置文件上传和管理
- 创意主题生成
- 基于主题的内容生成
- 错误处理

## 🏗️ 架构设计

### 技术栈

- **前端**: Next.js 15.5.3, React 19.1.0, TypeScript
- **样式**: Tailwind CSS 4
- **包管理**: pnpm 10.11.0
- **工作流引擎**: n8n
- **容器化**: Docker & Docker Compose
- **运行环境**: Node.js 20 (Alpine Linux)

### 项目结构

```
e:\production/
├── backend/                 # 后端目录（当前为空，使用 n8n 作为后端）
├── frontend/               # Next.js 前端应用
│   ├── src/
│   │   └── app/
│   │       ├── layout.tsx  # 应用布局
│   │       ├── page.tsx    # 主页面组件
│   │       └── globals.css # 全局样式
│   ├── public/             # 静态资源
│   ├── package.json        # 前端依赖配置
│   ├── next.config.ts      # Next.js 配置
│   └── Dockerfile          # 前端容器配置
├── docker-compose.yaml     # Docker Compose 配置
├── .env                    # 环境变量配置
├── .env.example           # 环境变量示例
└── README.md              # 项目说明文档
```

## 📦 功能特性

### 1. 配置文件管理

- 支持 JSON 格式的配置文件上传
- 实时文件验证和错误提示
- 配置数据解析和预处理

### 2. 创意主题生成

- 基于上传的配置文件生成多个创意主题
- 每个主题包含：
  - 标题 (Title)
  - 论点 (Thesis)
  - 时效性分析 (Why Now)
  - 目标受众 (Audience)
  - 目标 (Goal)
  - 关键信息 (Key Messages)
  - 内容大纲 (Outline)
  - SEO 关键词 (SEO Keywords)
  - 语气风格 (Tone)
  - 行动号召 (CTA)

### 3. 内容生成

- 基于选定的创意主题生成完整内容
- 支持自定义篇幅，文章特色，口吻
- 支持 Markdown 格式的内容渲染
- 自动处理图片和多媒体内容

### 4. 用户界面

- 响应式设计，支持多种设备
- 直观的卡片式布局展示创意主题
- 实时状态反馈和错误处理
- 模态对话框提示操作结果

## 🛠️ 安装和部署

### 环境要求

- Docker
- Docker Compose
- Node.js 20+ (本地开发)

### 快速开始

1. **克隆项目**

   ```bash
   git clone https://github.com/ChasePassion/production.git
   cd production
   ```

2. **配置环境变量**

   ```bash
   cp .env.example .env
   ```

   编辑 `.env` 文件，设置必要的环境变量：

   ```env
   # ===== Common =====
   PROJECT_NAME=prod-stack
   TZ=Asia/Shanghai

   # ===== Frontend =====
   NEXT_PUBLIC_N8N_BASE=http://<你的服务器IP>:5678
   PORT_FRONTEND=3000

   # ===== n8n =====
   N8N_PROTOCOL=http
   N8N_HOST=<你的服务器IP>
   N8N_PORT_INTERNAL=5678
   N8N_SECURE_COOKIE=false
   GENERIC_TIMEZONE=Asia/Shanghai
   N8N_RUNNERS_ENABLED=true
   N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true
   ```

3. **启动服务**

   ```bash
   docker-compose up -d
   ```

4. **访问应用**

   - 前端应用: http://localhost:3000
   - n8n 工作流: http://localhost:5678

5. **配置 n8n 工作流**

   在使用应用之前，需要先配置 n8n 工作流和相关的 API 服务。

   **导入工作流**

   工作流的 JSON 文件位于 `backend/` 目录中，需要导入到 n8n 中：

   - `up.json`: 选题生成工作流
   - `down.json`: 文章生成工作流

   **导入步骤**：

   1. 访问 n8n 管理界面: http://localhost:5678
   2. 点击 "Import from file" 或 "从文件导入" 按钮
   3. 分别选择 `backend/up.json` 和 `backend/down.json` 文件进行导入
   4. 导入完成后，点击工作流右上角的 "Activate" 或 "激活" 按钮来激活工作流

   **配置 API 服务**

   工作流依赖以下外部 API 服务，需要在 n8n 中进行配置：

   - **JinaAI**: 用于文本处理和嵌入生成
   - **SerpAPI**: 用于搜索引擎结果获取
   - **OpenRouter**: 用于大语言模型调用

   **配置步骤**：

   1. 在 n8n 界面中，点击左侧菜单的 "Credentials" 或 "凭据"
   2. 点击 "Add credential" 或 "添加凭据"
   3. 分别搜索并添加以下凭据：

      **JinaAI 配置**:

      - 选择 "Jina API" 凭据类型
      - 填入您的 JinaAI API Key
      - 命名凭据（例如：JinaAI）

      **OpenRouter 配置**:

      - 选择 "OpenRouter" 凭据类型
      - 填入您的 OpenRouter API Key
      - 命名凭据（例如：OpenRouter）

   4. 凭据配置完成后，在 first_task_up 工作流中使用到 SerpAPI 的节点的参数中输入 SerpAPI
   5. 保存凭据配置

   **验证配置**

   完成配置后，您可以通过以下方式验证工作流是否正常工作：

   1. 在前端应用中上传一个测试用的 JSON 配置文件
   2. 检查是否能正常生成创意主题
   3. 选择一个主题并尝试生成内容
   4. 观察 n8n 工作流的执行日志，确认没有错误

   **注意事项**

   - 确保所有 API Key 都是有效的，并且有足够的配额
   - 工作流必须处于激活状态才能接收和处理请求
   - 如果遇到 API 调用失败，请检查凭据配置和网络连接
   - 建议先在 n8n 中手动测试工作流，确保各个节点都能正常执行

### 本地开发

1. **安装依赖**

   ```bash
   cd frontend
   pnpm install
   ```

2. **启动开发服务器**

   ```bash
   pnpm dev
   ```

3. **构建生产版本**

   ```bash
   pnpm build
   pnpm start
   ```

4. **使用 PM2 持久化部署**

   PM2 是一个 Node.js 应用程序的进程管理器，可以帮助您在生产环境中保持应用程序的持久运行。

   **安装 PM2**

   ```bash
   npm install -g pm2
   ```

   **创建 PM2 配置文件**

   在项目根目录创建 `ecosystem.config.js` 文件：

   ```javascript
   module.exports = {
     apps: [
       {
         name: "social-media-content-app",
         script: "frontend/.next/standalone/server.js",
         cwd: "./frontend",
         instances: "max",
         exec_mode: "cluster",
         env: {
           NODE_ENV: "production",
           PORT: 3000,
           HOSTNAME: "0.0.0.0",
         },
         error_file: "./logs/err.log",
         out_file: "./logs/out.log",
         log_file: "./logs/combined.log",
         time: true,
       },
     ],
   };
   ```

   **启动应用**

   ```bash
   # 首次启动
   pm2 start ecosystem.config.js

   # 或者直接启动
   pm2 start frontend/.next/standalone/server.js --name "social-media-content-app"
   ```

   **PM2 常用命令**

   ```bash
   # 查看所有进程状态
   pm2 list

   # 查看应用日志
   pm2 logs social-media-content-app

   # 重启应用
   pm2 restart social-media-content-app

   # 停止应用
   pm2 stop social-media-content-app

   # 删除应用
   pm2 delete social-media-content-app

   # 监控应用状态
   pm2 monit

   # 保存 PM2 进程列表（开机自启）
   pm2 save

   # 设置开机自启
   pm2 startup
   ```

   **注意事项**

   - 确保在运行 PM2 之前已经执行了 `pnpm build` 构建了生产版本
   - PM2 会自动管理进程重启，当应用崩溃时会自动重启
   - 使用集群模式 (`cluster`) 可以充分利用多核 CPU
   - 日志文件会自动创建并轮转，便于问题排查
   - 建议在生产环境中配置 Nginx 反向代理来处理 HTTPS 和负载均衡

## 🔧 配置说明

### Docker Compose 配置

项目使用 Docker Compose 管理多个服务：

- **frontend**: Next.js 前端应用

  - 端口: 3000
  - 环境: production
  - 依赖: n8n 服务

- **n8n**: 工作流引擎
  - 端口: 5678
  - 数据持久化: 使用 Docker volumes
  - 健康检查: 自动监控服务状态

### 环境变量详解

| 变量名                 | 描述             | 默认值                  |
| ---------------------- | ---------------- | ----------------------- |
| `PROJECT_NAME`         | 项目名称         | prod-stack              |
| `TZ`                   | 时区设置         | Asia/Shanghai           |
| `NEXT_PUBLIC_N8N_BASE` | n8n 服务地址     | http://<服务器 IP>:5678 |
| `PORT_FRONTEND`        | 前端服务端口     | 3000                    |
| `N8N_PROTOCOL`         | n8n 协议         | http                    |
| `N8N_HOST`             | n8n 主机地址     | <服务器 IP>             |
| `N8N_SECURE_COOKIE`    | 安全 Cookie 设置 | false                   |
| `GENERIC_TIMEZONE`     | n8n 通用时区     | Asia/Shanghai           |
| `N8N_RUNNERS_ENABLED`  | 启用 n8n runners | true                    |

## 📖 使用指南

### 1. 上传配置文件

1. 点击 "Select Configuration File" 按钮
2. 选择 JSON 格式的配置文件
3. 点击 "Upload and Send to Backend" 上传并处理

### 2. 查看生成的创意主题

- 系统会自动显示生成的创意主题卡片
- 每个卡片包含完整的主题信息
- 可以查看主题的各个组成部分

### 3. 生成内容

1. 在创意主题卡片中点击 "Generate" 按钮
2. 系统会基于选定的主题生成内容
3. 生成完成后可以在下方查看完整内容

### 4. 错误处理

- 系统提供详细的错误提示
- 支持重试失败的生成操作
- 模态对话框显示操作结果

## 🔌 API 集成

### Webhook 端点

- **配置设置**: `POST /webhook/set`
- **内容生成**: `POST /webhook/content1`

### 数据格式

```typescript
interface Idea {
  title: string;
  thesis: string;
  why_now: string;
  audience: string;
  goal: string;
  key_messages?: string[];
  outline?: string[];
  seo?: {
    primary: string;
    secondary?: string[];
  };
  tone: string;
  cta: string;
  status?: "pending" | "generating" | "completed" | "error";
}
```

## 🐳 Docker 部署

### 前端容器配置

- **基础镜像**: node:20-alpine
- **构建阶段**: 多阶段构建优化镜像大小
- **输出模式**: standalone (独立部署)
- **暴露端口**: 3000

### 数据持久化

- `n8n_data`: n8n 配置和数据
- `n8n_local_files`: 本地文件存储

## 📝 开发说明

### 代码结构

- **组件化设计**: 使用 React 函数组件
- **TypeScript**: 完整的类型定义
- **状态管理**: 使用 React useState
- **样式**: 模块化 CSS + Tailwind

### 主要组件

- **Home**: 主页面组件
- **IdeaCard**: 创意主题卡片
- **Modal**: 模态对话框
- **StatusMessage**: 状态消息显示

### 关键功能

- 文件上传和验证
- API 请求处理
- Markdown 内容渲染
- 错误处理和重试机制

## 🔄 工作流程

1. **初始化**: 用户上传配置文件
2. **主题生成**: 系统调用 n8n 工作流生成创意主题
3. **主题展示**: 前端展示生成的主题卡片
4. **内容生成**: 用户选择主题后生成完整内容
5. **结果展示**: 显示生成的内容和操作结果

## 🚨 故障排除

### 常见问题

1. **容器启动失败**

   - 检查 Docker 和 Docker Compose 是否正确安装
   - 确认端口没有被占用
   - 查看容器日志: `docker-compose logs`

2. **n8n 连接失败**

   - 检查 n8n 服务是否正常运行
   - 确认网络连接和防火墙设置
   - 验证环境变量配置

3. **前端无法访问**
   - 检查前端服务状态
   - 确认端口映射配置
   - 查看浏览器控制台错误

### 日志查看

```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs frontend
docker-compose logs n8n

# 实时查看日志
docker-compose logs -f
```
