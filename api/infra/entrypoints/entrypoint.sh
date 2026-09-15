#!/bin/sh

set -eu

pnpm db:migration:up:prod
pnpm db:seed:prod:all
pnpm start:prod
