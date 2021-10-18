FROM node:14

# Create app directory
WORKDIR /usr/src/app

COPY bin ./bin
COPY oclif.manifest.json ./
COPY package*.json ./
COPY README.md ./
COPY src ./src
COPY tsconfig.json ./

RUN npm ci
RUN npm run build

ENTRYPOINT ["./bin/run"]
