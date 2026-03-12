FROM oven/bun:1
WORKDIR /usr/src/app

COPY package.json bun.lock ./
COPY packages/common/package.json ./packages/common/
COPY apps/server/package.json ./apps/server/

RUN bun install --filter 'server'

COPY packages/common/ packages/common/
COPY apps/server/ apps/server/

EXPOSE 3000
CMD ["bun", "run", "apps/server/src/index.ts"]