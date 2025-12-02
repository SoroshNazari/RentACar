#!/bin/bash
# Fix import paths in test files

# Fix Page imports
sed -i '' 's|from "\.\./\([A-Za-z]*Page\)"|from "../../src/pages/\1"|g' tests/pages/*.test.tsx

# Fix Component imports  
sed -i '' 's|from "\.\./\(layout/[A-Za-z]*\)"|from "../../src/components/\1"|g' tests/components/*.test.tsx

# Fix Service imports
sed -i '' 's|from "\.\./api"|from "../../src/services/api"|g' tests/services/*.test.ts

# Fix types imports
sed -i '' 's|from "@/types"|from "../../src/types"|g' tests/services/*.test.ts

echo "Import paths fixed!"