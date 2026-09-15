ARG NODE_VERSION=22.21
FROM node:${NODE_VERSION}-alpine AS DEVELOPMENT

WORKDIR /usr/src/

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN corepack prepare --activate \
  && apk add --no-cache git python3 make g++ \
  && pnpm install --frozen-lockfile

COPY . .

ENTRYPOINT [ "/bin/sh", "./infra/entrypoints/entrypoint.dev.sh" ]

FROM node:${NODE_VERSION}-alpine as BASE

WORKDIR /usr/src/

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN corepack prepare --activate \
  && apk add --no-cache git \
  && pnpm install --frozen-lockfile \
  && pnpm store prune

FROM node:${NODE_VERSION}-alpine AS BUILD

WORKDIR /usr/src/

RUN corepack enable

COPY --from=BASE /usr/src/node_modules ./node_modules
COPY . .
RUN corepack prepare --activate \
  && apk add --no-cache git curl python3 alpine-sdk\
  && npm install -g @mapbox/node-pre-gyp \
  && pnpm build

RUN node-pre-gyp rebuild -C /usr/src/node_modules/argon2

FROM node:${NODE_VERSION}-alpine AS PRODUCTION

WORKDIR /usr/src/

RUN corepack enable

COPY --from=BUILD /usr/src/package.json /usr/src/pnpm-lock.yaml /usr/src/pnpm-workspace.yaml /usr/src/.npmrc ./

RUN corepack prepare --activate \
  && pnpm install --prod --frozen-lockfile --ignore-scripts \
  && pnpm store prune

COPY --from=BUILD /usr/src/dist ./dist
COPY --from=BUILD /usr/src/infra ./infra
COPY --from=BUILD /usr/src/node_modules/argon2/lib ./node_modules/argon2/lib

ENTRYPOINT [ "/bin/sh", "./infra/entrypoints/entrypoint.sh" ]
