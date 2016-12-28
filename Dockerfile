FROM node:7
MAINTAINER Abakus Webkom <webkom@abakus.no>

ENV NODE_ENV production

RUN mkdir -p /app
COPY . /app/
WORKDIR /app

RUN set -e \
  && npm install

ENTRYPOINT ["bin/hubot"]
