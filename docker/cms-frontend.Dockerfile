FROM node:20.17.0-alpine

ARG GITHUB_TOKEN
WORKDIR /app

RUN corepack enable
RUN corepack use pnpm@9.10.0

COPY .npmrc package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/cms-frontend/package.json ./packages/cms-frontend/

RUN pnpm install --frozen-lockfile

COPY packages/cms-frontend/src ./packages/cms-frontend/src
COPY packages/cms-frontend/tsconfig.json ./packages/cms-frontend/tsconfig.json

WORKDIR /app/packages/cms-frontend

CMD ["pnpm", "run", "dev"]
