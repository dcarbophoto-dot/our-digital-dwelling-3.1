#!/bin/bash
while [ 1 ]; do
  RES=$(curl -s -X POST "https://github.com/login/oauth/access_token" -d "client_id=178c6fc778ccc68e1d6a&device_code=641060d5ea9b1d82c6d25b16e91330663ad183c6&grant_type=urn:ietf:params:oauth:grant-type:device_code" -H "Accept: application/json")
  if echo "$RES" | grep -q "authorization_pending"; then
    sleep 5
  else
    TOKEN=$(echo "$RES" | grep -o "\"access_token\":\"[^\"]*" | cut -d":" -f2 | tr -d "\"")
    if [ -n "$TOKEN" ]; then
      git remote set-url origin "https://oauth2:${TOKEN}@github.com/dcarbophoto-dot/our-digital-dwelling-3.1.git"
      git push
      echo "SUCCESSFULLY PUSHED AND SET TOKEN"
      break
    else
      echo "FAILED: $RES"
      break
    fi
  fi
done
