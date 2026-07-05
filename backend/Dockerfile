FROM node:20-alpine
RUN apk add --no-cache python3 make g++
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci --production
COPY . .
EXPOSE 5000
ENV NODE_ENV=production
CMD ["npm", "start"]
