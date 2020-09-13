FROM node:14

MAINTAINER Abakus Webkom <webkom@abakus.no>

ENV NODE_ENV production

WORKDIR /app
COPY package.json ./
COPY yarn.lock ./

RUN set -e \
  && npm install

COPY bin lib scripts ./
ENTRYPOINT ["bin/hubot"]
