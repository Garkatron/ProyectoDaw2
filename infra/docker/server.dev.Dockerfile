FROM oven/bun:1
WORKDIR /usr/src/app

# Copiamos el package.json de la raíz PRIMERO
COPY package.json bun.lock ./

# Copiamos los package.json de los paquetes manteniendo la estructura exacta
# que definiste en tu campo "workspaces" (packages/* y apps/*)
COPY packages/common/package.json ./packages/common/
COPY apps/server/package.json ./apps/server/

# Verificamos que los archivos existan y ejecutamos la instalación
# Agregamos verbose para ver qué está intentando hacer Bun si falla
RUN bun install --filter 'server' --filter 'common'

# Copiamos el resto del código
COPY . .

EXPOSE 3000

WORKDIR /usr/src/app/apps/server
CMD ["bun", "--watch", "run", "src/index.ts"]
