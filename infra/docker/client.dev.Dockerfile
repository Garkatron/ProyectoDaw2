FROM oven/bun:1
WORKDIR /usr/src/app

# 1. ¡FUNDAMENTAL! Copiar el package.json de la RAÍZ
# Aquí es donde se definen los "workspaces"
COPY package.json ./

# 2. Copiar los manifests de los paquetes
COPY packages/common/package.json ./packages/common/
COPY apps/client/package.json ./apps/client/

# 3. Instalar con filtro
# Al estar el package.json de la raíz, Bun ya sabe qué es 'client'
RUN bun install --filter 'client'

# 4. Copiar el resto del código
COPY packages/common/ ./packages/common/
COPY apps/client/ ./apps/client/

EXPOSE 5173

# Ejecutar
CMD ["bun", "run", "--cwd", "apps/client", "dev", "--host"]