# Multi-stage build using Next.js standalone output — the runtime image only
# needs the standalone server bundle plus static assets, not the full
# node_modules tree.

FROM node:22-bookworm-slim AS builder
WORKDIR /app
# NEXT_PUBLIC_* vars are inlined into the client bundle at build time, so
# this has to be a build arg — it can't just be a runtime env var like
# AUTH_SECRET below, which next start reads fresh on every container start.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN useradd --create-home appuser
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
RUN chown -R appuser:appuser /app
USER appuser
EXPOSE 3001
ENV PORT=3001
# Docker auto-sets HOSTNAME to the container ID, and Next's standalone
# server.js binds to process.env.HOSTNAME — without this override it tries
# to listen on that container-ID string instead of all interfaces.
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
