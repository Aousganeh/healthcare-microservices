#!/bin/bash

# Script to create an admin account using curl
# Usage: ./create-admin.sh [email] [password] [firstName] [lastName]
# Example: ./create-admin.sh admin@healthcare.com Admin123! Admin User

set -e

# Configuration
API_GATEWAY_URL="${API_GATEWAY_URL:-http://localhost:8080}"
IDENTITY_SERVICE_URL="${IDENTITY_SERVICE_URL:-http://localhost:8001}"

# Default values
EMAIL="${1:-admin@healthcare.com}"
PASSWORD="${2:-Admin123!}"
FIRST_NAME="${3:-Admin}"
LAST_NAME="${4:-User}"

echo "🔐 Creating admin account..."
echo "   Email: $EMAIL"
echo "   Name: $FIRST_NAME $LAST_NAME"
echo ""

# Step 1: Register a new user
echo "📝 Step 1: Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_GATEWAY_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"firstName\": \"$FIRST_NAME\",
    \"lastName\": \"$LAST_NAME\"
  }")

if echo "$REGISTER_RESPONSE" | grep -q "already exists"; then
  echo "   ⚠️  User already exists, proceeding to login..."
else
  echo "   ✅ User registered successfully"
fi

# Step 2: Login to get JWT token
echo ""
echo "🔑 Step 2: Logging in to get authentication token..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_GATEWAY_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

# Extract token from response (assuming JSON response with "token" field)
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "   ❌ Failed to get token. Response: $LOGIN_RESPONSE"
  echo ""
  echo "💡 Trying direct identity service endpoint..."
  LOGIN_RESPONSE=$(curl -s -X POST "$IDENTITY_SERVICE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$EMAIL\",
      \"password\": \"$PASSWORD\"
    }")
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ]; then
  echo "   ❌ Failed to authenticate. Please check credentials."
  echo "   Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "   ✅ Authentication successful"
echo "   Token: ${TOKEN:0:50}..."

# Step 3: Add ROLE_ADMIN to the user
echo ""
echo "👑 Step 3: Adding ROLE_ADMIN to user..."

# Try API Gateway endpoint first
ADD_ROLE_RESPONSE=$(curl -s -X POST "$API_GATEWAY_URL/api/auth/users/$EMAIL/role" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"role\": \"ROLE_ADMIN\"
  }")

# Check if it worked
if echo "$ADD_ROLE_RESPONSE" | grep -q "ROLE_ADMIN"; then
  echo "   ✅ Admin role added successfully via API Gateway"
  echo "   Response: $ADD_ROLE_RESPONSE"
elif echo "$ADD_ROLE_RESPONSE" | grep -q "403\|Forbidden\|Unauthorized"; then
  echo "   ⚠️  API Gateway endpoint requires admin role (chicken-and-egg problem)"
  echo "   Trying direct identity service endpoint..."
  
  # Try direct identity service endpoint
  ADD_ROLE_RESPONSE=$(curl -s -X POST "$IDENTITY_SERVICE_URL/auth/users/$EMAIL/role" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"role\": \"ROLE_ADMIN\"
    }")
  
  if echo "$ADD_ROLE_RESPONSE" | grep -q "ROLE_ADMIN"; then
    echo "   ✅ Admin role added successfully via Identity Service"
    echo "   Response: $ADD_ROLE_RESPONSE"
  else
    echo "   ❌ Failed to add admin role via API"
    echo "   Response: $ADD_ROLE_RESPONSE"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "💡 Alternative: Add admin role directly to database"
    echo ""
    echo "Connect to PostgreSQL and run:"
    echo ""
    echo "  docker exec -it healthcare-postgres-identity psql -U postgres -d healthcare_identity"
    echo ""
    echo "Then execute:"
    echo ""
    echo "  -- First, ensure ROLE_ADMIN exists"
    echo "  INSERT INTO role (name) VALUES ('ROLE_ADMIN') ON CONFLICT (name) DO NOTHING;"
    echo ""
    echo "  -- Add admin role to user"
    echo "  INSERT INTO user_roles (user_id, role_id)"
    echo "  SELECT u.id, r.id"
    echo "  FROM \"user\" u, role r"
    echo "  WHERE u.email = '$EMAIL' AND r.name = 'ROLE_ADMIN'"
    echo "  ON CONFLICT DO NOTHING;"
    echo ""
    echo "  -- Verify"
    echo "  SELECT u.email, r.name"
    echo "  FROM \"user\" u"
    echo "  JOIN user_roles ur ON u.id = ur.user_id"
    echo "  JOIN role r ON ur.role_id = r.id"
    echo "  WHERE u.email = '$EMAIL';"
    echo ""
    exit 1
  fi
else
  echo "   ✅ Admin role added successfully"
  echo "   Response: $ADD_ROLE_RESPONSE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Admin account created successfully!"
echo ""
echo "📋 Account Details:"
echo "   Email: $EMAIL"
echo "   Password: $PASSWORD"
echo "   Name: $FIRST_NAME $LAST_NAME"
echo "   Role: ROLE_ADMIN"
echo ""
echo "🔐 You can now login with these credentials"
echo "   curl -X POST $API_GATEWAY_URL/api/auth/login \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}'"
echo ""

