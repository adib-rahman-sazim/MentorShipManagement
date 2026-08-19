#!/bin/sh

pnpm db:migration:up:prod
bun run start:bun
