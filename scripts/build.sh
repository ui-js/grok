#!/bin/bash

set -e  # exit immediately on error
set -o nounset   # abort on unbound variable
set -o pipefail  # don't hide errors within pipes
# set -x    # for debuging, trace what is being executed.

cd "$(dirname "$0")/.."

export BASENAME="\033[40m Grok \033[0;0m " # `basename "$0"`
export DOT="\033[32m 羽 \033[0;0m" # Hourglass
export CHECK="\033[32m ✔ \033[0;0m"
export ERROR="\033[31;7m ERROR \033[0;0m"
export LINECLEAR="\033[1G\033[2K" # position to column 1; erase whole line
export DIM="\033[0;2m"
export RESET="\033[0;0m"


# If no "node_modules" directory, do an install first
if [ ! -d "./node_modules" ]; then
    printf "$BASENAME$DOT${RESET}Installing dependencies"
    npm install
    echo -e "$LINECLEAR${RESET}$BASENAME${CHECK}${DIM}Dependencies installed${RESET}"
fi

# Read the first argument, set it to "dev" if not set
export BUILD="${1-dev}"

echo -e "${RESET}$BASENAME$DOT${RESET}Build started"

rm -rf ./bin

node ./scripts/build.js

echo -e "$LINECLEAR${RESET}$BASENAME$CHECK${RESET}Build completed"
