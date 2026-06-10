#!/usr/bin/env bash
# TEA landing — full local check suite. Exits 0 only if everything passes.
set -e
cd "$(dirname "$0")"
node verify.mjs
