FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

RUN apk add --no-cache postgresql-client

COPY . .

RUN npx tsc -p tsconfig.build.json

CMD ["node", "dist/main.api.js"]