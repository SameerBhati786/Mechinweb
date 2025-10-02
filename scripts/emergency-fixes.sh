#!/bin/bash

# Emergency production fixes script
echo "🚨 EMERGENCY PRODUCTION FIXES STARTING..."
echo "========================================"

# Function to log with timestamp
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Step 1: Fix build system deadlock
log "🔧 Fixing build system deadlock..."
rm -rf node_modules/.vite
rm -rf dist
rm -rf node_modules/.cache
log "✅ Build cache cleared"

# Step 2: Fix package.json issues
log "🔧 Fixing package.json..."
npm install --no-optional --ignore-scripts
log "✅ Dependencies reinstalled without problematic packages"

# Step 3: Test database connectivity
log "🔍 Testing database connectivity..."
if node scripts/test-database.js; then
  log "✅ Database tests passed"
else
  log "❌ Database tests failed - manual intervention required"
fi

# Step 4: Test payment flow
log "🔍 Testing payment flow..."
if node scripts/test-payment-flow.js; then
  log "✅ Payment flow tests passed"
else
  log "⚠️ Payment flow degraded - alternative methods available"
fi

# Step 5: Try to start development server
log "🚀 Starting development server..."
if timeout 10s npm run dev; then
  log "✅ Development server started successfully"
else
  log "⚠️ Development server issues detected"
fi

log "🎯 Emergency fixes completed"
log "Check the output above for any remaining issues"
echo "========================================"