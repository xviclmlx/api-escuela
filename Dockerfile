# ---------- Etapa 1: dependencias de producción ----------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# --ignore-scripts evita hooks como husky "prepare" que fallan sin .git
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# ---------- Etapa 2: imagen final ligera ----------
FROM node:22-alpine
ENV NODE_ENV=production \
    PORT=3000
WORKDIR /app

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src

# Hash del commit inyectado desde el pipeline (se muestra en /api/version)
ARG GIT_SHA=local
ENV GIT_SHA=$GIT_SHA

# No correr como root
USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
