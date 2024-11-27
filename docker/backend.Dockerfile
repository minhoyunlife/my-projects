FROM node:20.17.0-alpine

WORKDIR /app

RUN corepack enable
RUN corepack use pnpm@9.10.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/backend/package.json ./packages/backend/

RUN pnpm install --frozen-lockfile

COPY packages/backend/src ./packages/backend/src
COPY packages/backend/tsconfig.json ./packages/backend/tsconfig.json

WORKDIR /app/packages/backend

CMD ["pnpm", "run", "start:dev"]
