#!/bin/bash

# Script to set Netlify environment variables
# Run this after logging in with: netlify login

# Set admin credentials
netlify env:set ADMIN_USERNAME "yannpatrick.tongui@gmail.com" --context production --force
netlify env:set ADMIN_PASSWORD "Pat123456789" --context production --force --secret

# Set Convex and admin key
netlify env:set NEXT_PUBLIC_ADMIN_KEY "3c5d8188016287357c692c61b6a0367fdb5a7a4bf613c655" --context production --force
netlify env:set CONVEX_DEPLOYMENT "production:adventurous-salmon-154" --context production --force

# Verify the variables
echo ""
echo "=== Environment Variables Set ==="
netlify env:get --all --context production | grep -E "ADMIN|CONVEX"
