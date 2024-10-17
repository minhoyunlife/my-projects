FROM node:20-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/backend ./packages/backend

RUN pnpm --filter backend install --frozen-lockfile

CMD ["pnpm", "--filter", "backend", "run", "start:dev"]
