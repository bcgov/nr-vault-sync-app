FROM node:24-alpine

# Create app directory
WORKDIR /app
COPY . ./
RUN npm ci && \
    npm run build

VOLUME /app/config/templates
VOLUME /app/config

ENV NODE_ENV production

ENTRYPOINT ["./bin/run", "monitor"]
