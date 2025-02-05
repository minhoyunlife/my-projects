# 베이스 스테이지 정의
FROM node:20.17.0-alpine AS base
WORKDIR /app
# 최신 corepack 을 설치하여 pnpm 의 서명 검증을 가능하도록 함
RUN npm install -g corepack@latest
RUN corepack enable && corepack prepare pnpm@9.10.0 --activate

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
