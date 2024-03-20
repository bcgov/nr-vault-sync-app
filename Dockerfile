FROM node:20-alpine

# Create app directory
WORKDIR /app
COPY . ./
RUN npm ci && \
    npm run build

ENTRYPOINT ["./bin/run"]
