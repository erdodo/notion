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


# prisma generate is already run via postinstall, but running it again is safe
RUN npx prisma generate

# Pass ARGs as environment variables directly to the build command
RUN npm run build

# ======== Stage 3: Production Image ========
# Use Node.js 20.x slim
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update && apt-get install -y openssl

# Create user first
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --disabled-password --no-create-home --uid 1001 --ingroup nodejs nextjs

# Copy package files, prisma schema, and source files for the custom server
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Install dependencies. `postinstall` will now work.
RUN npm install

# Copy the rest of the built app code and assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Change ownership of the entire app directory to the non-root user
RUN chown -R nextjs:nodejs /app

# Switch to the non-root user
USER nextjs

# Set a home directory for the user to avoid npm EACCES errors at runtime
ENV HOME /app

EXPOSE 3000

ENV PORT 3000

CMD ["npm", "run", "start:docker"]
