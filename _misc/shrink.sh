#!/bin/bash

main() {
    declare path="$1" target=${2:-"shrink"}

    mkdir -p "$target"

    find "$path" -type f -iname "*.png" -print0 | while IFS= read -r -d $'\0' image; do
        local name=$(basename "$image")
        printf "Shrinking \e[36m%s\e[0m... " "$image"

        local target_url=$(curl --user api:$TINYPNG_API_KEY --data-binary @"$image" -s https://api.tinify.com/shrink | jq -r .output.url)

        if [ -z "$target_url" ]; then
            echo -e '\e[91m[Error]\e[0m'
            continue;
        fi

        printf "And saving to \e[93m%s\e[0m... " "$target/$name"

        curl -Ss "$target_url" > "$target/$name"

        printf "\e[92m[Done]\e[0m\n"
    done
}

main "$@"
