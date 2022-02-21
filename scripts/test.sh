#!/bin/bash

set -e  # exit immediately on error
set -o nounset   # abort on unbound variable
set -o pipefail  # don't hide errors within pipes
# set -x    # for debuging, trace what is being executed.

cd "$(dirname "$0")/.."

# Read the first argument, set it to "dev" if not set
VARIANT="${1-coverage}"

export BASENAME="\033[40m Grok Test \033[0;0m " # `basename "$0"`
export DOT="\033[32m 羽 \033[0;0m" # Hourglass
export CHECK="\033[32m ✔ \033[0;0m"
export ERROR="\033[31;7m ERROR \033[0;0m"
export LINECLEAR="\033[1G\033[2K" # position to column 1; erase whole line
export DIM="\033[0;2m"
export RESET="\033[0;0m"

for f in "accesor" "basic" "class" "enum" "function" "simple" "type"
do
  echo -e "$BASENAME${DIM}"${f}-test.d.ts"$RESET"
  
  node ./bin/grok-cli.js "test/${f}-test.d.ts" --outDir ./test/output/${f}  --verbose --ignore-errors

done


# if [ "$VARIANT" = "coverage" ]; then
#     npx jest --coverage
# elif [ "$VARIANT" = "snapshot" ]; then
#     npx jest -u
# else
#     npx jest
# fi