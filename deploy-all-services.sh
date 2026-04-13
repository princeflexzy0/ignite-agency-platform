#!/bin/bash

# Array of services with their ports
declare -A services=(
  ["job-acquisition"]=6000
  ["proposal-engine"]=7000
  ["stripe-payments"]=8000
  ["email-automation"]=9000
  ["social-media"]=10000
  ["analytics"]=11000
)

echo "🚀 Deploying all 6 services to Railway..."
echo ""

for service in "${!services[@]}"; do
  port="${services[$service]}"
  echo "📦 Deploying $service on port $port..."
  
  # Set environment variables
  railway variables set SERVICE_NAME="$service" PORT="$port"
  
  # Deploy
  railway up
  
  # Get domain
  railway domain
  
  echo "✅ $service deployed!"
  echo ""
done

echo "🎉 All services deployed!"
