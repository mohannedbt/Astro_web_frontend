# Build from the repository root:  docker build -f backend/Dockerfile .
FROM node:20-alpine
# better-sqlite3 compiles a native module on Alpine.
RUN apk add --no-cache python3 make g++
WORKDIR /usr/src/app
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev
COPY backend/ .
ENV NODE_ENV=production
EXPOSE 5000
# Don't run as root inside the container.
RUN chown -R node:node /usr/src/app
USER node
CMD ["node", "index.js"]
