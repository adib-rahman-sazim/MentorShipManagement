#!/bin/sh
set -e

pnpm db:migration:up:docker
pnpm db:seed:docker
pnpm start:dev:docker
