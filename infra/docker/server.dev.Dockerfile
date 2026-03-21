FROM oven/bun:1 AS base
WORKDIR /app

# Copiar todos los package.json del workspace (bun install los necesita todos)
COPY package.json bun.lock ./
COPY apps/server/package.json ./apps/server/
COPY apps/client/package.json ./apps/client/
COPY packages/common/package.json ./packages/common/

# Pre-install at build time to populate the bun cache layer.
# Do NOT remove the cache — it's reused at startup for a fast re-install.
RUN bun install --no-save

# Copiar fuentes
COPY apps/server ./apps/server
COPY packages/common ./packages/common

EXPOSE 3000

# Re-run bun install at startup so the workspace is resolved correctly
# AFTER the dev volumes (apps/server, packages/common) are mounted.
# The bun cache from the build layer makes this near-instant.
CMD ["/bin/sh", "-c", "bun install --no-save && bun run --hot /app/apps/server/src/index.ts"]
