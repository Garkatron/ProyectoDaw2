# https://bun.com/docs/guides/ecosystem/docker
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# ── Dependencias ──
FROM base AS install
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# ── Release ──
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY src/ src/
COPY package.json .

USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "src/index.ts" ]