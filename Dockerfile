FROM node:24-alpine
ARG ENVCONSUL_VERSION=0.13.3

ADD https://releases.hashicorp.com/envconsul/${ENVCONSUL_VERSION}/envconsul_${ENVCONSUL_VERSION}_linux_amd64.zip /tmp/envconsul.zip
RUN unzip /tmp/envconsul.zip && \
    rm /tmp/envconsul.zip && \
    mv envconsul /usr/local/bin/

# Create app directory
WORKDIR /app
COPY . ./
RUN npm ci && \
    npm run build

VOLUME /app/config/envconsul
VOLUME /app/config/templates
VOLUME /app/config

ENV NODE_ENV production

ENTRYPOINT ["envconsul", "-config", "/app/config/envconsul/env.hcl", "./bin/run", "monitor"]
