# syntax=docker/dockerfile:1.7
FROM node:24.13.1-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
FROM base AS deps
ARG NPM_REGISTRY=http://registry:4873/
COPY package.json package-lock.json* ./
RUN --mount=type=cache,id=shared-idea-portfolio-npm,target=/root/.npm npm config set registry "$NPM_REGISTRY" && if [ -f package-lock.json ]; then npm ci; else npm install; fi
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
FROM node:24.13.1-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 3000
CMD ["node","server.js"]
