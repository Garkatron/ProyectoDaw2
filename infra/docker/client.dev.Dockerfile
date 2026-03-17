FROM oven/bun:1
WORKDIR /usr/src/app

COPY package.json bun.lock ./
COPY packages/common/package.json ./packages/common/
COPY apps/client/package.json ./apps/client/

RUN bun install --filter 'client'

COPY packages/common/ ./packages/common/
COPY apps/client/ ./apps/client/

EXPOSE 5173

CMD ["bun", "run", "--cwd", "apps/client", "dev", "--host"]