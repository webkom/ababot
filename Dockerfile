FROM getsentry/sentry-cli:1.48.0 as sentry

WORKDIR /app/

ARG SENTRY_AUTH_TOKEN
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ARG RELEASE

ENV SENTRY_AUTH_TOKEN ${SENTRY_AUTH_TOKEN}
ENV SENTRY_PROJECT ${SENTRY_PROJECT}
ENV SENTRY_ORG ${SENTRY_ORG}
ENV RELEASE ${RELEASE}

RUN sentry-cli releases new ${RELEASE}
RUN sentry-cli releases finalize ${RELEASE}

FROM node:10

MAINTAINER Abakus Webkom <webkom@abakus.no>

ARG RELEASE
ENV RELEASE {RELEASE}

ENV NODE_ENV production

RUN mkdir -p /app
COPY . /app/
WORKDIR /app

RUN set -e \
  && npm install

ENTRYPOINT ["bin/hubot"]
