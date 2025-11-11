#!/bin/bash
set -euo pipefail

# macOS/BSD sed inline flag
SEDI=(sed -i '')

remove_comments_file() {
  local file="$1"
  case "$file" in
    *.java|*.js|*.ts|*.tsx)
      "${SEDI[@]}" -E \
        -e '/^[[:space:]]*\/\//d' \
        -e '/^[[:space:]]*\/\*/d' \
        -e '/^[[:space:]]*\*\//d' \
        -e '/^[[:space:]]*\*/d' "$file"
      ;;
    *.yml|*.yaml)
      "${SEDI[@]}" -E -e '/^[[:space:]]*\#/d' "$file"
      ;;
    *.sh|*.bash)
      awk 'NR==1 && $0 ~ /^#!/ {print; next} !($0 ~ /^[[:space:]]*#/) {print}' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
      ;;
    *.sql)
      "${SEDI[@]}" -E \
        -e '/^[[:space:]]*--/d' \
        -e '/^[[:space:]]*\/\*/d' \
        -e '/^[[:space:]]*\*\//d' \
        -e '/^[[:space:]]*\*/d' "$file"
      ;;
    Dockerfile|*Dockerfile*)
      "${SEDI[@]}" -E -e '/^[[:space:]]*\#/d' "$file"
      ;;
    *.properties|*.gradle)
      "${SEDI[@]}" -E -e '/^[[:space:]]*\#/d' "$file"
      ;;
    *)
      ;;
  esac
}

while IFS= read -r file; do
  [ -f "$file" ] || continue
  remove_comments_file "$file"
done < <(git ls-files)

echo "Comment line removal complete."
