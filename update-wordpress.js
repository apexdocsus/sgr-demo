// Update WordPress blog post via REST API
const fs = require('fs');
const https = require('https');
const http = require('http');

// === CONFIGURATION ===
const WP_CONFIG = {
  siteUrl: 'https://apexdocs.us/wp-json/wp/v2',
  username: 'YOUR_WORDPRESS_USERNAME',      // Replace with your username
  applicationPassword: 'YOUR_APP_PASSWORD',   // Generate in WordPress: User → Security → App Passwords
  blogPostId: null                            // Will be looked up automatically
};

// Read the generated blog post HTML
const blogPostHTML = fs.readFileSync('./blog-post-chrome-extensions.html', 'utf8');

// Build the full post content with WordPress formatting
const postContent = `
<!-- wp:paragraph -->
<p style="font-size: 18px; line-height: 1.8; color: #666;">
The Chrome Web Store is filled with powerful extensions that make our browsing experience better. But what happens when the developer stops maintaining them? Users are left with outdated code, security vulnerabilities, and no support.
</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p style="font-size: 18px; line-height: 1.8; color: #666;">
We've analyzed over 1,400 abandoned GitHub repositories in the Software Ghost Registry, and today we're highlighting the most valuable abandoned Chrome extensions — the ones with 10,000+ stars that just need someone to step up and maintain them.
</p>
<!-- /wp:paragraph -->

<h2 style="color: #1a1a2e; font-size: 28px; margin: 40px 0 20px;">Why Abandoned Extensions Matter</h2>

${blogPostHTML}

<h2 style="color: #1a1a2e; font-size: 28px; margin: 40px 0 20px;">How to Take Over an Extension</h2>

<ol>
<li><strong>Fork the repository</strong> — Go to GitHub, click "Fork" to create your own copy</li>
<li><strong>Review the codebase</strong> — Understand the current implementation and any technical debt</li>
<li><strong>Fix critical issues</strong> — Start with security patches and compatibility fixes</li>
<li><strong>Publish under your account</strong> — Upload the fixed version to the Chrome Web Store</li>
<li><strong>Communicate with users</strong> — Update the listing and let users know about the takeover</li>
</ol>

<h2 style="color: #1a1a2e; font-size: 28px; margin: 40px 0 20px;">Final Thoughts</h2>

<p style="color: #666; line-height: 1.8;">
Abandoned Chrome extensions represent a massive opportunity — for developers looking to build their portfolio, for businesses seeking quick product-market fit, and for the open source community at large. The best time to take over an abandoned project was years ago. The second best time is <strong>now</strong>.
</p>
`;

// Make HTTP request to WordPress REST API
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, WP_CONFIG.siteUrl);
    const client = url.protocol === 'https:' ? https : http;
    
    const credentials = Buffer.from(`${WP_CONFIG.username}:${WP_CONFIG.applicationPassword}`).toString('base64');
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    };
    
    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body: body });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Find the blog post by slug
async function findPostBySlug(slug) {
  console.log(`🔍 Looking for post with slug: ${slug}...`);
  const response = await makeRequest('GET', `/posts?slug=${slug}`);
  
  if (response.status === 200 && response.body.length > 0) {
    return response.body[0];
  }
  return null;
}

// Update the post
async function updatePost(postId, title, content) {
  console.log(`📝 Updating post #${postId}...`);
  
  const response = await makeRequest('POST', `/posts/${postId}`, {
    title: title,
    content: content,
    status: 'publish'
  });
  
  return response;
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting WordPress update...\n');
    
    // Check config
    if (WP_CONFIG.username === 'YOUR_WORDPRESS_USERNAME') {
      console.log('❌ ERROR: Please configure WP_CONFIG in update-wordpress.js');
      console.log('\nTo get Application Password:');
      console.log('1. Go to WordPress Admin → Users → Your Profile');
      console.log('2. Scroll to "Application Passwords"');
      console.log('3. Generate a new password');
      console.log('4. Update the config below with your username and password\n');
      process.exit(1);
    }
    
    // Find the post
    const post = await findPostBySlug('top-10-abandoned-chrome-extensions-with-10k-stars-sgr-blog');
    
    if (!post) {
      console.log('❌ Post not found! Creating new post instead...');
      
      const response = await makeRequest('POST', '/posts', {
        title: 'Top 10 Abandoned Chrome Extensions with 10K+ Stars',
        slug: 'top-10-abandoned-chrome-extensions-with-10k-stars-sgr-blog',
        content: postContent,
        status: 'publish'
      });
      
      if (response.status === 201) {
        console.log('✅ Post created successfully!');
      } else {
        console.log('❌ Failed to create post:', response.body);
      }
    } else {
      console.log(`✅ Found post: "${post.title.rendered}"`);
      
      // Update the post
      const response = await updatePost(post.id, 'Top 10 Abandoned Chrome Extensions with 10K+ Stars', postContent);
      
      if (response.status === 200) {
        console.log('✅ Blog post updated successfully!');
        console.log(`🔗 ${post.link}`);
      } else {
        console.log('❌ Failed to update post:', response.body);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();