#!/bin/bash

# Fix all API test files by replacing auth mock pattern

files=(
  "src/app/api/__tests__/export-backup.test.ts"
  "src/app/api/__tests__/import-backup.test.ts"
  "src/app/api/__tests__/import-csv.test.ts"
  "src/app/api/__tests__/import-markdown.test.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Replace the auth mock pattern
    sed -i '' 's/const mockAuth = vi\.fn();/import { auth } from '\''@\/lib\/auth'\'';/' "$file"
    sed -i '' 's/auth: () => mockAuth()/auth: vi.fn()/' "$file"
    sed -i '' 's/mockAuth\.mockResolvedValue/vi.mocked(auth).mockResolvedValue/g' "$file"
    echo "Fixed: $file"
  fi
done
