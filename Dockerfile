ARG REPO_LOCATION=docker-remote.artifacts.developer.gov.bc.ca/
FROM ${REPO_LOCATION}node:14

# Create app directory
WORKDIR /usr/src/app

COPY bin ./bin
COPY oclif.manifest.json ./
COPY package*.json ./
COPY README.md ./
COPY src ./src
COPY tsconfig.json ./

RUN npm ci

ENTRYPOINT ["./bin/run"]
