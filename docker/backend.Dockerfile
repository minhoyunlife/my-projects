FROM node:20-alpine

WORKDIR /app/packages/backend

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ../../
COPY packages/backend/package.json ./

RUN corepack enable
RUN pnpm --filter backend install --frozen-lockfile

COPY packages/backend ./

CMD ["pnpm", "--filter", "backend", "run", "start:dev"]
