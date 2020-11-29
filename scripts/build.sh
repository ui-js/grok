#!/bin/bash

set -e  # exit immediately on error
set -o nounset   # abort on unbound variable
set -o pipefail  # don't hide errors within pipes
# set -x    # for debuging, trace what is being executed.

cd "$(dirname "$0")/.."

# If no "node_modules" directory, do an install first
if [ ! -d "./node_modules" ]; then
    printf "\033[32m\033[1K ● \033[0Installing dependencies"
    npm install
    echo -e "\033[32m\033[1K ✔ \033[0Dependencies installed"
fi

# Read the first argument, set it to "dev" if not set
export BUILD="${1-dev}"

rm -rf ./bin
npx rollup --config ./config/rollup.config.js
