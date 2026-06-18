#!/usr/bin/env bash
# Rebuild the TEA admission flyer end-to-end, then verify.
# Regenerates the recolored crest + site QR, renders the PNG, runs the check suite.
set -e
cd "$(dirname "$0")/.."
node flyer/gen-crest.mjs
node flyer/gen-qr.mjs
node flyer/render.mjs
node flyer/verify.mjs
