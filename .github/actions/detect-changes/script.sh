#!/bin/bash

# 코드 변경사항이 발생한 패키지 이름만을 따로 추출해서 배열화
function get_package_names_from_code_changes() {
  git diff --name-only $GITHUB_BASE_SHA..HEAD | \
  grep "^packages/" | \
  cut -d'/' -f2 | \
  sort -u | \
  jq -R -s 'split("\n")[:-1]'
}

# 의존성 변경사항이 발생한 패키지 이름만을 따로 추출해서 배열화
function get_package_names_from_deps_changes() {
  pnpm list --filter="...[$GITHUB_BASE_SHA]" --json | \
  jq '[.[] | select(.name != "my-projects") | .name | sub("^@my-projects/"; "")]'
}

# 코드, 의존성 변경사항이 있는 패키지 이름을 하나의 배열로 병합
function merge() {
  local code_changes="$1"
  local lock_changes="$2"
  echo "$code_changes" "$lock_changes" | jq -c -s "add | unique"
}

# 메인 로직
code_changes=$(get_package_names_from_code_changes)
lock_changes=$(get_package_names_from_deps_changes)
all_changes=$(merge "$code_changes" "$lock_changes")

echo "Changed packages are: $all_changes"
echo "packages=$all_changes" >> $GITHUB_OUTPUT
