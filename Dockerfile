ARG REPO_LOCATION=artifacts.developer.gov.bc.ca/docker-remote/
FROM ${REPO_LOCATION}node:20-alpine

# Create app directory
WORKDIR /app
COPY . ./
RUN npm ci && \
    npm run build

ENTRYPOINT ["./bin/run"]
