FROM node:20-alpine
ARG ENVCONSUL_VERSION=0.13.2

ADD https://releases.hashicorp.com/envconsul/${ENVCONSUL_VERSION}/envconsul_${ENVCONSUL_VERSION}_linux_amd64.zip /tmp/envconsul.zip
RUN unzip /tmp/envconsul.zip && \
    rm /tmp/envconsul.zip && \
    mv envconsul /usr/local/bin/

# Create app directory
WORKDIR /app
COPY . ./
RUN npm ci

VOLUME /config/envconsul
VOLUME /app/config

ENV NODE_ENV production

ENTRYPOINT ["envconsul", "-config", "/config/envconsul/env.hcl", "bin/run", "monitor"]
