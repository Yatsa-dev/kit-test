FROM node:18-slim AS builder
WORKDIR "/app"
COPY . .
RUN npm i
RUN npm run build 

FROM node:18-slim AS production
WORKDIR "/app"

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

ENTRYPOINT ["node", "dist/main"]

