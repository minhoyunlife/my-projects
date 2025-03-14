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
FROM base AS build
ARG VITE_API_URL
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/fanarts-frontend/node_modules ./packages/fanarts-frontend/node_modules
COPY packages/fanarts-frontend ./packages/fanarts-frontend
WORKDIR /app/packages/fanarts-frontend
RUN pnpm run build

# 4. Runtime Stage
FROM base AS runtime
ARG GITHUB_TOKEN
ENV NODE_ENV=production
ENV PORT=${PORT:-5174}
COPY --from=build /app/packages/fanarts-frontend/build ./build
COPY --from=build /app/packages/fanarts-frontend/package.json ./
COPY /.npmrc ./
RUN pnpm install --prod
EXPOSE ${PORT}
CMD ["node", "build"]
