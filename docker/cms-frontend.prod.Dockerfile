# 1. Base Stage
FROM node:20.17.0-alpine AS base
WORKDIR /app
RUN npm install -g corepack@latest
RUN corepack enable && corepack use pnpm@9.10.0

# 2. Dependencies Stage
FROM base AS deps
ARG GITHUB_TOKEN
COPY .npmrc package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/cms-frontend/package.json ./packages/cms-frontend/
RUN pnpm install --frozen-lockfile

# 3. Build Stage
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/cms-frontend/node_modules ./packages/cms-frontend/node_modules
COPY packages/cms-frontend ./packages/cms-frontend
WORKDIR /app/packages/cms-frontend
RUN pnpm run build

# 4. Runtime Stage
FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production
ARG GITHUB_TOKEN
COPY --from=build /app/packages/cms-frontend/.next ./.next
COPY /.npmrc ./
COPY packages/cms-frontend/package.json ./
RUN pnpm install --prod
ENV PORT=${PORT:-5173}
EXPOSE ${PORT}
CMD pnpm start -p $PORT
