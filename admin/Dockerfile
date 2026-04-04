FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV PORT=3002
ENV NODE_ENV=production
EXPOSE 3002

CMD ["npm", "start"]
