#!/bin/sh

pnpm db:migration:up:prod
pnpm start:prod
