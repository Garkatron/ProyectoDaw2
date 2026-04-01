FROM docker.io/oven/bun:1
WORKDIR /usr/src/app

COPY package.json ./
COPY packages/common/package.json ./packages/common/
COPY apps/server/package.json ./apps/server/
COPY apps/client/package.json ./apps/client/

RUN bun install --filter 'server'

COPY packages/common/ packages/common/
COPY apps/server/ apps/server/

RUN mkdir -p /usr/src/app/data

EXPOSE 3000
CMD ["bun", "run", "apps/server/src/index.ts"]
