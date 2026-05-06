#!/bin/bash
# Update WordPress blog post via REST API using cURL
# No plugins needed - uses basic auth

# === CONFIGURATION ===
WP_URL="https://apexdocs.us/wp-json/wp/v2"
WP_USER="YOUR_USERNAME"       # Your WordPress username
WP_PASS="YOUR_PASSWORD"       # Your WordPress password
POST_SLUG="top-10-abandoned-chrome-extensions-with-10k-stars-sgr-blog"

# Read the generated HTML
BLOG_HTML="./blog-post-chrome-extensions.html"

if [ ! -f "$BLOG_HTML" ]; then
    echo "❌ Blog HTML not found. Run generate-blog-post.js first."
    exit 1
fi

echo "🔍 Finding post by slug: $POST_SLUG..."

# Find the post ID
RESPONSE=$(curl -s -u "${WP_USER}:${WP_PASS}" "${WP_URL}/posts?slug=${POST_SLUG}")

# Check if post exists
if echo "$RESPONSE" | grep -q "\[{"; then
    POST_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
    
    if [ -z "$POST_ID" ]; then
        echo "📝 Post not found - will create new post"
        METHOD="POST"
        ENDPOINT="${WP_URL}/posts"
    else
        echo "✅ Found post ID: $POST_ID"
        METHOD="POST"
        ENDPOINT="${WP_URL}/posts/${POST_ID}"
    fi
else
    echo "📝 Post not found - will create new post"
    METHOD="POST"
    ENDPOINT="${WP_URL}/posts"
fi

# Read the HTML content
CONTENT=$(cat "$BLOG_HTML")

# Escape for JSON (basic)
CONTENT_ESCAPED=$(echo "$CONTENT" | jq -Rs .)

echo "📝 Updating WordPress..."

# Update/create the post
curl -s -X "$METHOD" \
    -u "${WP_USER}:${WP_PASS}" \
    -H "Content-Type: application/json" \
    -d "{
        \"title\": \"Top 10 Abandoned Chrome Extensions with 10K+ Stars\",
        \"slug\": \"${POST_SLUG}\",
        \"status\": \"publish\",
        \"content\": ${CONTENT_ESCAPED}
    }" \
    "$ENDPOINT" | jq -r '.link // .message // .'

echo ""
echo "✅ Done! Blog post updated."