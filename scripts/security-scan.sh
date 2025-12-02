#!/bin/bash

###############################################################################
# Security Scan Script
#
# Runs comprehensive security checks on the application
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Exit codes
EXIT_SUCCESS=0
EXIT_VULNERABILITY_FOUND=1
EXIT_TOOL_NOT_FOUND=2

# Counters
TOTAL_ISSUES=0
CRITICAL_ISSUES=0
HIGH_ISSUES=0

echo "🔒 Starting security scan..."
echo

###############################################################################
# 1. NPM Audit
###############################################################################

echo "📦 Running npm audit..."

if npm audit --json > npm-audit.json 2>&1; then
  echo -e "${GREEN}✅ No npm vulnerabilities found${NC}"
else
  # Parse audit results
  CRITICAL=$(cat npm-audit.json | grep -o '"critical":[0-9]*' | grep -o '[0-9]*' || echo "0")
  HIGH=$(cat npm-audit.json | grep -o '"high":[0-9]*' | grep -o '[0-9]*' || echo "0")
  MODERATE=$(cat npm-audit.json | grep -o '"moderate":[0-9]*' | grep -o '[0-9]*' || echo "0")
  LOW=$(cat npm-audit.json | grep -o '"low":[0-9]*' | grep -o '[0-9]*' || echo "0")

  echo -e "${YELLOW}⚠️  NPM vulnerabilities found:${NC}"
  echo "   Critical: $CRITICAL"
  echo "   High: $HIGH"
  echo "   Moderate: $MODERATE"
  echo "   Low: $LOW"

  TOTAL_ISSUES=$((TOTAL_ISSUES + CRITICAL + HIGH + MODERATE + LOW))
  CRITICAL_ISSUES=$((CRITICAL_ISSUES + CRITICAL))
  HIGH_ISSUES=$((HIGH_ISSUES + HIGH))

  # Show detailed report
  npm audit --json | npx json -a 'vulnerabilities' > npm-audit-details.json || true
fi

echo

###############################################################################
# 2. Outdated Dependencies
###############################################################################

echo "📅 Checking for outdated dependencies..."

if npm outdated --json > npm-outdated.json 2>&1 || true; then
  OUTDATED_COUNT=$(cat npm-outdated.json | npx json -a 'package' | wc -l)

  if [ "$OUTDATED_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $OUTDATED_COUNT outdated packages${NC}"
    npm outdated || true
  else
    echo -e "${GREEN}✅ All dependencies are up to date${NC}"
  fi
fi

echo

###############################################################################
# 3. Snyk Security Scan (if available)
###############################################################################

echo "🔍 Running Snyk scan..."

if command -v snyk &> /dev/null; then
  if snyk test --json > snyk-results.json 2>&1 || true; then
    echo -e "${GREEN}✅ Snyk scan completed${NC}"

    # Parse Snyk results
    SNYK_CRITICAL=$(cat snyk-results.json | grep -o '"severity":"critical"' | wc -l || echo "0")
    SNYK_HIGH=$(cat snyk-results.json | grep -o '"severity":"high"' | wc -l || echo "0")

    if [ "$SNYK_CRITICAL" -gt 0 ] || [ "$SNYK_HIGH" -gt 0 ]; then
      echo -e "${YELLOW}⚠️  Snyk vulnerabilities found:${NC}"
      echo "   Critical: $SNYK_CRITICAL"
      echo "   High: $SNYK_HIGH"

      TOTAL_ISSUES=$((TOTAL_ISSUES + SNYK_CRITICAL + SNYK_HIGH))
      CRITICAL_ISSUES=$((CRITICAL_ISSUES + SNYK_CRITICAL))
      HIGH_ISSUES=$((HIGH_ISSUES + SNYK_HIGH))
    fi
  fi
else
  echo -e "${YELLOW}⚠️  Snyk not installed, skipping...${NC}"
  echo "   Install with: npm install -g snyk"
fi

echo

###############################################################################
# 4. TypeScript Strict Mode Check
###############################################################################

echo "🔧 Checking TypeScript configuration..."

if grep -q '"strict": true' tsconfig.base.json; then
  echo -e "${GREEN}✅ TypeScript strict mode enabled${NC}"
else
  echo -e "${RED}❌ TypeScript strict mode not enabled${NC}"
  TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
fi

echo

###############################################################################
# 5. Environment Variables Check
###############################################################################

echo "🔑 Checking for exposed secrets..."

# Check for hardcoded secrets in code
SECRET_PATTERNS=(
  "password\s*=\s*['\"][^'\"]+['\"]"
  "api[_-]?key\s*=\s*['\"][^'\"]+['\"]"
  "secret\s*=\s*['\"][^'\"]+['\"]"
  "token\s*=\s*['\"][^'\"]+['\"]"
)

SECRETS_FOUND=0

for pattern in "${SECRET_PATTERNS[@]}"; do
  if grep -rn -E "$pattern" apps/ libs/ --exclude-dir=node_modules --exclude-dir=dist 2>/dev/null; then
    SECRETS_FOUND=$((SECRETS_FOUND + 1))
  fi
done

if [ "$SECRETS_FOUND" -gt 0 ]; then
  echo -e "${RED}❌ Found $SECRETS_FOUND potential hardcoded secrets${NC}"
  CRITICAL_ISSUES=$((CRITICAL_ISSUES + SECRETS_FOUND))
  TOTAL_ISSUES=$((TOTAL_ISSUES + SECRETS_FOUND))
else
  echo -e "${GREEN}✅ No hardcoded secrets found${NC}"
fi

echo

###############################################################################
# 6. Security Headers Check
###############################################################################

echo "🛡️  Checking security headers configuration..."

REQUIRED_HEADERS=(
  "X-Content-Type-Options"
  "X-Frame-Options"
  "Strict-Transport-Security"
  "Content-Security-Policy"
)

MISSING_HEADERS=0

for header in "${REQUIRED_HEADERS[@]}"; do
  if ! grep -rq "$header" apps/api/src/ libs/utils/src/ 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Missing header: $header${NC}"
    MISSING_HEADERS=$((MISSING_HEADERS + 1))
  fi
done

if [ "$MISSING_HEADERS" -eq 0 ]; then
  echo -e "${GREEN}✅ All required security headers configured${NC}"
else
  TOTAL_ISSUES=$((TOTAL_ISSUES + MISSING_HEADERS))
fi

echo

###############################################################################
# 7. HTTPS Configuration Check
###############################################################################

echo "🔒 Checking HTTPS configuration..."

if grep -q "secure: true" apps/api/src/ apps/web/src/ 2>/dev/null; then
  echo -e "${GREEN}✅ HTTPS enforced in production${NC}"
else
  echo -e "${YELLOW}⚠️  HTTPS configuration not found${NC}"
fi

echo

###############################################################################
# 8. SQL Injection Protection
###############################################################################

echo "💉 Checking for SQL injection vulnerabilities..."

# Look for raw SQL queries without parameterization
if grep -rn "\\$queryRaw\|\\$executeRaw" apps/ libs/ --exclude-dir=node_modules 2>/dev/null | grep -v "\\$queryRaw\`" | grep -v "Unsafe" > /dev/null; then
  echo -e "${RED}❌ Potential SQL injection vulnerabilities found${NC}"
  echo "   Use parameterized queries or Prisma's type-safe queries"
  CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
  TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
else
  echo -e "${GREEN}✅ No SQL injection vulnerabilities detected${NC}"
fi

echo

###############################################################################
# Summary
###############################################################################

echo "═══════════════════════════════════════════════════════════════"
echo "📊 Security Scan Summary"
echo "═══════════════════════════════════════════════════════════════"
echo
echo "Total Issues: $TOTAL_ISSUES"
echo "  Critical: $CRITICAL_ISSUES"
echo "  High: $HIGH_ISSUES"
echo

if [ "$CRITICAL_ISSUES" -gt 0 ]; then
  echo -e "${RED}❌ CRITICAL vulnerabilities found! Fix immediately.${NC}"
  exit $EXIT_VULNERABILITY_FOUND
elif [ "$HIGH_ISSUES" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  HIGH severity vulnerabilities found. Please review.${NC}"
  exit $EXIT_VULNERABILITY_FOUND
elif [ "$TOTAL_ISSUES" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Some issues found. Review recommended.${NC}"
  exit $EXIT_SUCCESS
else
  echo -e "${GREEN}✅ No security issues found!${NC}"
  exit $EXIT_SUCCESS
fi
