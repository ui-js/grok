#!/bin/bash

set -e  # exit immediately on error
set -o nounset   # abort on unbound variable
set -o pipefail  # don't hide errors within pipes
# set -x    # for debuging, trace what is being executed.

cd "$(dirname "$0")/.."

export BASENAME="\033[40m"Grok"\033[0m" # `basename "$0"`
export DOT="\033[32m ● \033[0m"
export CHECK="\033[32m ✔ \033[0m"
export LINECLEAR="\033[1G\033[2K" # position to column 1; erase whole line
export ERROR="\033[31m ERROR \033[0m"


# If no "node_modules" directory, do an install first
if [ ! -d "./node_modules" ]; then
    printf "$BASENAME$DOT Installing dependencies"
    npm install
    echo -e "$LINECLEAR$BASENAME$CHECK Dependencies installed"
fi

# Read the first argument, set it to "dev" if not set
export BUILD="${1-dev}"

echo -e "$BASENAME$DOT Making a build"
rm -rf ./bin
npx rollup --config ./config/rollup.config.js
echo -e "$LINECLEAR$BASENAME$CHECK Completed build"
