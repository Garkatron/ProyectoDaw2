FROM docker.io/oven/bun:1 AS builder
WORKDIR /usr/src/app
COPY package.json ./
COPY packages/common/package.json ./packages/common/
COPY apps/client/package.json ./apps/client/
COPY apps/server/package.json ./apps/server/
RUN bun install --no-save
COPY packages/common/ ./packages/common/
COPY apps/client/ ./apps/client/
RUN bun run --cwd apps/client build

FROM nginx:alpine
COPY --from=builder /usr/src/app/apps/client/dist /usr/share/nginx/html
COPY infra/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
