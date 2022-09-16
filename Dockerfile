ARG REPO_LOCATION=artifacts.developer.gov.bc.ca/docker-remote/
FROM ${REPO_LOCATION}node:16

# Create app directory
WORKDIR /usr/src/app

COPY bin ./bin
COPY package*.json ./
COPY README.md ./
COPY src ./src
COPY tsconfig.json ./

RUN npm ci

ENTRYPOINT ["./bin/dev"]
