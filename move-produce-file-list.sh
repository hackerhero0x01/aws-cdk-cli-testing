#!/bin/bash
# Parameters: <repo_root> <subdir>
set -eu

cd "$1"
rsync -ah \
    --exclude ".git" \
    --exclude .projenrc.ts \
    --exclude node_modules \
    --exclude yarn.lock \
    --exclude /package.json \
    --exclude jest.config.js \
    --exclude tsconfig.\* \
    --exclude .gitignore \
    --exclude \*.d.ts \
    --exclude \*.js \
    --exclude .eslintrc.js \
    --out-format="%f" \
    --dry-run \
    "$2" "/tmp"

# Also include .js files tracked by git
git ls-files '**/*.js'