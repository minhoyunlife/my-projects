FROM node:20.17.0-alpine AS base
WORKDIR /app
RUN npm install -g corepack@latest
RUN corepack enable && corepack use pnpm@9.10.0

# 의존성 설치 스테이지
FROM base AS deps
ARG GITHUB_TOKEN
COPY .npmrc package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/cms-frontend/package.json ./packages/cms-frontend/
RUN pnpm install --frozen-lockfile

# 최종 스테이지
FROM base AS frontend
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/cms-frontend/node_modules ./packages/cms-frontend/node_modules
COPY packages/cms-frontend/src ./packages/cms-frontend/src
COPY packages/cms-frontend/tsconfig.json ./packages/cms-frontend/tsconfig.json

WORKDIR /app/packages/cms-frontend
CMD ["pnpm", "run", "dev"]