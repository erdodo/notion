# ======== Stage 1: Install Dependencies ========
# Use Node.js 20.x slim for better binary compatibility
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm install --frozen-lockfile

# ======== Stage 2: Build App ========
# Use Node.js 20.x slim
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Declare ARGs for build-time secrets
ARG DATABASE_URL
ARG CLERK_SECRET_KEY
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG EDGE_STORE_ACCESS_KEY
ARG EDGE_STORE_SECRET_KEY

# Expose ARGs as ENV for the build command
ENV DATABASE_URL=$DATABASE_URL
ENV CLERK_SECRET_KEY=$CLERK_SECRET_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV EDGE_STORE_ACCESS_KEY=$EDGE_STORE_ACCESS_KEY
ENV EDGE_STORE_SECRET_KEY=$EDGE_STORE_SECRET_KEY

# prisma generate is already run via postinstall, but running it again is safe
RUN npx prisma generate
RUN npm run build

# ======== Stage 3: Production Image ========
# Use Node.js 20.x slim
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user for security (Debian-based)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --disabled-password --no-create-home --uid 1001 --ingroup nodejs nextjs
USER nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

ENV PORT 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
