# 베이스 스테이지 정의
FROM node:20.17.0-alpine AS base
WORKDIR /app
RUN corepack enable && corepack use pnpm@9.10.0

# 의존성 설치 스테이지
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/backend/package.json ./packages/backend/
RUN pnpm install --frozen-lockfile

# 최종 스테이지
FROM base AS backend
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/backend/node_modules ./packages/backend/node_modules
COPY packages/backend/src ./packages/backend/src
COPY packages/backend/tsconfig.json ./packages/backend/tsconfig.json
WORKDIR /app/packages/backend
CMD ["pnpm", "run", "start:dev"]
