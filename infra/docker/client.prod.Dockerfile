FROM oven/bun:1 AS builder
WORKDIR /usr/src/app

COPY package.json bun.lock ./
COPY packages/common/package.json ./packages/common/
COPY apps/client/package.json ./apps/client/

RUN bun install --filter 'client'

COPY packages/common/ packages/common/
COPY apps/client/ apps/client/

RUN bun --cwd apps/client run build

FROM oven/bun:1
WORKDIR /usr/src/app
RUN bun add -g serve
COPY --from=builder /usr/src/app/apps/client/dist ./dist

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]