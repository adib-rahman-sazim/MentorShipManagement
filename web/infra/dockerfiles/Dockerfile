ARG NODE_VERSION=22.21
FROM node:${NODE_VERSION}-alpine AS DEVELOPMENT

WORKDIR /usr/src/

RUN corepack enable && corepack prepare pnpm@10.29.3 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN apk add --no-cache git \
  && pnpm install --frozen-lockfile

COPY . .

CMD ["pnpm", "start:dev"]

FROM node:${NODE_VERSION}-alpine AS BASE

WORKDIR /usr/src/

RUN corepack enable && corepack prepare pnpm@10.29.3 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN apk add --no-cache git \
  && pnpm install --frozen-lockfile \
  && pnpm store prune

FROM node:${NODE_VERSION}-alpine AS BUILD

WORKDIR /usr/src/

RUN corepack enable && corepack prepare pnpm@10.29.3 --activate

COPY --from=BASE /usr/src/node_modules ./node_modules
COPY . .
RUN apk add --no-cache git curl \
  && pnpm build

FROM node:${NODE_VERSION}-alpine AS PRODUCTION

WORKDIR /usr/src/

RUN corepack enable && corepack prepare pnpm@10.29.3 --activate

RUN pnpm add next-runtime-env@1.7.4 --no-optional --prefer-offline

COPY --from=BUILD /usr/src/next.config.mjs ./
COPY --from=BUILD /usr/src/next-i18next.config.mjs ./
COPY --from=BUILD /usr/src/.next/standalone ./
COPY --from=BUILD /usr/src/server.prod.cjs ./
COPY --from=BUILD /usr/src/.next/static ./.next/static
COPY --from=BUILD /usr/src/public ./public

CMD ["node", "server.prod.cjs"]
