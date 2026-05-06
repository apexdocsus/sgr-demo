#!/bin/bash
# Push SGR data to GitHub
# Edit these values with your info:
GITHUB_USER="YOUR_GITHUB_USERNAME"
GITHUB_TOKEN="YOUR_GITHUB_PERSONAL_ACCESS_TOKEN"
REPO="apexdocsus/sgr-demo"

cd /home/openclaw/.openclaw/workspace/sgr-scraper

# Ensure data file is in root
cp data/github-abandoned.json ./github-abandoned.json 2>/dev/null

# Configure git
git config user.name "$GITHUB_USER"
git config user.email "contact@apexdocs.us"

# Add files
git add github-abandoned.json index.html
git commit -m "Update SGR data - $(date +%Y-%m-%d)"

# Push
git push https://$GITHUB_USER:$GITHUB_TOKEN@github.com/$REPO.git main --force

echo "✅ Done! Check https://apexdocsus.github.io/sgr-demo/"