FROM oven/bun:1 AS builder
WORKDIR /usr/src/app

COPY package.json ./
COPY packages/common/package.json ./packages/common/
COPY apps/client/package.json ./apps/client/

RUN bun install --frozen-lockfile --filter 'client'

COPY packages/common/ packages/common/
COPY apps/client/ apps/client/

RUN bun --cwd apps/client run build

FROM oven/bun:1
WORKDIR /usr/src/app

COPY package.json ./
COPY apps/client/package.json ./apps/client/
RUN bun install --frozen-lockfile --filter 'client'

COPY --from=builder /usr/src/app/apps/client/dist ./apps/client/dist
COPY --from=builder /usr/src/app/apps/client/vite.config.ts ./apps/client/vite.config.ts

EXPOSE 5173
CMD ["bun", "--cwd", "apps/client", "run", "preview"]