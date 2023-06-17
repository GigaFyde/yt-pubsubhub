FROM node:18-alpine as ship

RUN apk --no-cache add curl ca-certificates \
    && addgroup -S app && adduser -S -g app app

# Turn down the verbosity to default level.
ENV NPM_CONFIG_LOGLEVEL warn

WORKDIR /usr/src/app


COPY package*.json ./

RUN npm ci --omit=dev
COPY . .

RUN npx prisma generate

RUN npm test

EXPOSE 3000
CMD [ "node", "index.js" ]
