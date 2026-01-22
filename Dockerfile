# ======== Stage 1: Install Dependencies ========
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

# ======== Stage 2: Build App ========
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Environment variables for build time
# ARG DATABASE_URL
# ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# ARG CLERK_SECRET_KEY
# ARG NEXT_PUBLIC_CLERK_SIGN_IN_URL
# ARG NEXT_PUBLIC_CLERK_SIGN_UP_URL
# ARG NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
# ARG NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
# ARG EDGE_STORE_ACCESS_KEY
# ARG EDGE_STORE_SECRET_KEY
RUN npx prisma generate
RUN npm run build

# ======== Stage 3: Production Image ========
FROM node:18-alpine AS runner
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

# The command to start the app will be in docker-compose.yml
# It will run migrations and then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
