#!/bin/bash
# Auto-refresh SGR blog post data
# Run this script to regenerate blog HTML with latest scraper data

cd /home/openclaw/.openclaw/workspace/sgr-scraper

# Step 1: Run the scraper to get fresh data
echo "🔄 Running scraper..."
node src/scrape.js

# Step 2: Generate blog post HTML
echo "📝 Generating blog post..."
node generate-blog-post.js

# Step 3: Copy to workspace for easy access
cp blog-post-chrome-extensions.html ../sgr-blog-post-latest.html

echo "✅ Done! Latest blog post saved to sgr-blog-post-latest.html"
echo "📅 Last updated: $(date)"