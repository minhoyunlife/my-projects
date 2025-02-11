# 1. Base Stage
FROM node:20.17.0-alpine AS base
WORKDIR /app
RUN npm install -g corepack@latest
RUN corepack enable && corepack prepare pnpm@9.10.0 --activate

# 2. Dependencies Stage
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/backend/package.json ./packages/backend/
RUN pnpm install --frozen-lockfile

# 3. Build Stage
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/backend/node_modules ./packages/backend/node_modules
COPY packages/backend ./packages/backend
WORKDIR /app/packages/backend
RUN pnpm run build

# 4. Runtime Stage
FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV TZ=Asia/Seoul
COPY --from=build /app/packages/backend/dist ./packages/backend/dist
COPY packages/backend/package.json ./packages/backend/
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod
WORKDIR /app/packages/backend
CMD ["pnpm", "run", "start:prod"]
