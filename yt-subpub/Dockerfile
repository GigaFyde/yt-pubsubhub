FROM node:18-alpine as ship

RUN apk --no-cache add curl ca-certificates \
    && addgroup -S app && adduser -S -g app app

# Turn down the verbosity to default level.
ENV NPM_CONFIG_LOGLEVEL warn

RUN chmod 777 /tmp

USER app

RUN mkdir -p /home/app/function

# Entrypoint
WORKDIR /home/app
COPY --chown=app:app . ./

# This ordering means the npm installation is cached for the outer function handler.
RUN npm ci --omit=dev

# Run any tests that may be available
RUN npm test

# Set correct permissions to use non root user
WORKDIR /home/app/

CMD [ "node", "server.js" ]
