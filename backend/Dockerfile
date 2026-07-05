FROM node:20-alpine
RUN apk add --no-cache python3 make g++
WORKDIR /usr/src/app
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --production
COPY backend/ .
EXPOSE 5000
ENV NODE_ENV=production
CMD ["npm", "start"]
