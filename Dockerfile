FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

RUN apk add --no-cache postgresql-client

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

RUN npx tsc -p tsconfig.build.json

CMD ["node", "dist/main.api.js"]