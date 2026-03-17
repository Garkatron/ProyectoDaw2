FROM oven/bun:1 AS builder
WORKDIR /usr/src/app

COPY package.json bun.lock ./
COPY packages/common/package.json ./packages/common/
COPY apps/client/package.json ./apps/client/

RUN bun install --filter 'client'

COPY packages/common/ ./packages/common/
COPY apps/client/ ./apps/client/

RUN bun run --cwd apps/client build

FROM nginx:alpine
COPY --from=builder /usr/src/app/apps/client/dist /usr/share/nginx/html
EXPOSE 80