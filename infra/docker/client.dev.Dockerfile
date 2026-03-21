FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/client/package.json ./apps/client/
COPY apps/server/package.json ./apps/server/
COPY packages/common/package.json ./packages/common/

# Pre-install at build time to populate the bun cache layer.
# Do NOT remove the cache — it's reused at startup for a fast re-install.
RUN bun install --no-save

COPY apps/client ./apps/client
COPY packages/common ./packages/common

EXPOSE 5173

# Re-run bun install at startup so the workspace is resolved correctly
# AFTER the dev volumes (apps/client, packages/common) are mounted.
# The bun cache from the build layer makes this near-instant.
CMD ["/bin/sh", "-c", "bun install --no-save && cd /app/apps/client && bun run dev"]
