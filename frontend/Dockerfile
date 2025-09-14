# --- build ---
    FROM node:20-alpine AS builder
    WORKDIR /app
    # 启用 pnpm（读取 package.json 的 packageManager 版本）
    RUN corepack enable
    # 先复制锁文件，确保可复现安装
    COPY package.json pnpm-lock.yaml ./
    # 如果有 .npmrc / .pnpmfile.cjs 可以额外 COPY
    # COPY .npmrc ./
    RUN pnpm install --frozen-lockfile
    COPY . .
    ENV NEXT_TELEMETRY_DISABLED=1
    RUN pnpm build
    
    # --- run ---
    FROM node:20-alpine AS runner
    WORKDIR /app
    ENV NODE_ENV=production
    ENV NEXT_TELEMETRY_DISABLED=1
    # standalone 产物包含运行所需最小 node_modules
    COPY --from=builder /app/.next/standalone ./
    COPY --from=builder /app/.next/static ./.next/static
    COPY --from=builder /app/public ./public
    EXPOSE 3000
    ENV PORT=3000
    ENV HOSTNAME=0.0.0.0
    CMD ["node", "server.js"]
    