FROM node:18-alpine

LABEL org.opencontainers.image.authors="Rafael Vaño <ravagaatz@gmail.com>"
LABEL org.opencontainers.image.documentation="https://github.com/ravaga/helm-chart-generator/blob/main/README.md"
LABEL org.opencontainers.image.source="https://github.com/ravaga/helm-chart-generator"

COPY . /chart-generator

WORKDIR /chart-generator

RUN npm install

CMD [ "node", "index.js" ]
