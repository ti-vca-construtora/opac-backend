FROM node:18 as builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY . .
COPY ./.env ./.env

RUN npm install --quiet --no-optional --no-fund --loglevel=error

RUN npx prisma generate

RUN npm run build

FROM node:18

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env ./.env

CMD [  "npm", "run", "start:migrate:deploy" ]