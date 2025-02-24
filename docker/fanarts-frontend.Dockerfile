FROM node:20.17.0-alpine AS base
WORKDIR /app
RUN npm install -g corepack@latest
RUN corepack enable && corepack use pnpm@9.10.0

# 의존성 설치 스테이지
FROM base AS deps
ARG GITHUB_TOKEN
COPY .npmrc package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/fanarts-frontend/package.json ./packages/fanarts-frontend/
RUN pnpm install --frozen-lockfile

# 최종 스테이지
FROM base AS frontend
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/fanarts-frontend/node_modules ./packages/fanarts-frontend/node_modules
COPY packages/fanarts-frontend/src ./packages/fanarts-frontend/src
COPY packages/fanarts-frontend/tsconfig.json ./packages/fanarts-frontend/tsconfig.json
COPY packages/fanarts-frontend/svelte.config.js ./packages/fanarts-frontend/
COPY packages/fanarts-frontend/vite.config.ts ./packages/fanarts-frontend/

WORKDIR /app/packages/fanarts-frontend
CMD ["pnpm", "run", "dev"]
