# TODO: CD 실패를 우회하기 위한 임시 코드로, 배포 단계가 될 때 알맞게 수정할 것. 
# 1. Base Stage
FROM node:20.17.0-alpine AS base
WORKDIR /app
RUN npm install -g corepack@latest
RUN corepack enable && corepack use pnpm@9.10.0

# 2. Dependencies Stage
FROM base AS deps
ARG GITHUB_TOKEN
COPY .npmrc package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/fanarts-frontend/package.json ./packages/fanarts-frontend/
RUN pnpm install --frozen-lockfile

# 3. Build Stage
# FROM base AS build
# COPY --from=deps /app/node_modules ./node_modules
# COPY --from=deps /app/packages/fanarts-frontend/node_modules ./packages/fanarts-frontend/node_modules
# COPY packages/fanarts-frontend ./packages/fanarts-frontend
# WORKDIR /app/packages/fanarts-frontend
# RUN pnpm run build

# 4. Runtime Stage
FROM base AS runtime
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/fanarts-frontend/node_modules ./packages/fanarts-frontend/node_modules
COPY packages/fanarts-frontend/src ./packages/fanarts-frontend/src
COPY packages/fanarts-frontend/tsconfig.json ./packages/fanarts-frontend/tsconfig.json
COPY packages/fanarts-frontend/svelte.config.js ./packages/fanarts-frontend/
COPY packages/fanarts-frontend/vite.config.ts ./packages/fanarts-frontend/

WORKDIR /app/packages/fanarts-frontend
CMD ["pnpm", "run", "dev"]