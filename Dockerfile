# ======== Stage 1: Install Dependencies ========
# Use Node.js 20.x to match dependency requirements
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Copy prisma schema before installing, so `prisma generate` postinstall script works
COPY prisma ./prisma
RUN npm install --frozen-lockfile

# ======== Stage 2: Build App ========
# Use Node.js 20.x
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# prisma generate is already run via postinstall, but running it again is safe
RUN npx prisma generate
RUN npm run build

# ======== Stage 3: Production Image ========
# Use Node.js 20.x
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

ENV PORT 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]