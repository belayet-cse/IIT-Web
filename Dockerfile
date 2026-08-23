# Multi-stage build: compile with full devDependencies, then assemble a
# runtime image with production-only node_modules and `next start`. Not
# using Next's "standalone" output mode here — that mode is incompatible
# with Vercel's own build pipeline (breaks its build-trace file generation),
# and next.config.ts is shared between the Vercel deploy and this image.

FROM node:22-bookworm-slim AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN useradd --create-home appuser
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
RUN chown -R appuser:appuser /app
USER appuser
EXPOSE 3001
ENV PORT=3001
CMD ["npx", "next", "start"]
