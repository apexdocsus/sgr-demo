// Update WordPress via XML-RPC (no Application Password needed)
// Uses the classic WordPress login

const fs = require('fs');
const https = require('https');

// === CONFIGURATION ===
const WP_CONFIG = {
  siteUrl: 'https://apexdocs.us/xmlrpc.php',
  username: 'YOUR_WORDPRESS_USERNAME',   // Your WP admin username
  password: 'YOUR_WORDPRESS_PASSWORD',   // Your WP admin password
  blogId: 1
};

// Read the generated blog post HTML
const blogPostHTML = fs.readFileSync('./blog-post-chrome-extensions.html', 'utf8');

// Build content - extract just the extension cards
const extensionsSection = blogPostHTML.split('<h2 style="color: #1a1a2e; font-size: 28px; margin: 40px 0 20px;">The Top 10 Abandoned Chrome Extensions</h2>')[1]
  .split('<div style="background: linear-gradient')[0]
  .trim();

const postContent = `
<p style="font-size: 18px; line-height: 1.8; color: #666;">
The Chrome Web Store is filled with powerful extensions that make our browsing experience better. But what happens when the developer stops maintaining them? Users are left with outdated code, security vulnerabilities, and no support.
</p>

<p style="font-size: 18px; line-height: 1.8; color: #666;">
We've analyzed over 1,400 abandoned GitHub repositories in the Software Ghost Registry, and today we're highlighting the most valuable abandoned Chrome extensions — the ones with 10,000+ stars that just need someone to step up and maintain them.
</p>

<h2 style="color: #1a1a2e; font-size: 28px; margin: 40px 0 20px;">Why Abandoned Extensions Matter</h2>

<p>Here's the thing: <strong>10,000 stars means at least 10,000 active users</strong> — usually many more. These aren't just vanity metrics. People depend on these extensions daily for productivity, developer tools, privacy, and more. When these extensions go unmaintained, users face security risks and compatibility issues.</p>

<h2 style="color: #1a1a2e; font-size: 28px; margin: 40px 0 20px;">The Top 10 Abandoned Chrome Extensions</h2>

${extensionsSection}

<div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 30px; border-radius: 16px; margin: 40px 0; text-align: center;">
<h3 style="color: #fff; font-size: 22px; margin-bottom: 15px;">Want to explore more abandoned extensions?</h3>
<p style="color: rgba(255,255,255,0.8); margin-bottom: 20px;">Browse the full registry to find Chrome extensions and other abandoned projects.</p>
<a href="https://apexdocsus.github.io/sgr-demo/" style="background: #ff6b6b; color: #fff; padding: 14px 30px; border-radius: 50px; font-weight: 700; text-decoration: none; display: inline-block;">View the Registry →</a>
</div>

<h2 style="color: #1a1a2e; font-size: 28px; margin: 40px 0 20px;">How to Take Over an Extension</h2>

<ol>
<li><strong>Fork the repository</strong> — Go to GitHub, click "Fork" to create your own copy</li>
<li><strong>Review the codebase</strong> — Understand the current implementation and any technical debt</li>
<li><strong>Fix critical issues</strong> — Start with security patches and compatibility fixes</li>
<li><strong>Publish under your account</strong> — Upload the fixed version to the Chrome Web Store</li>
<li><strong>Communicate with users</strong> — Update the listing and let users know about the takeover</li>
</ol>

<h2 style="color: #1a1a2e; font-size: 28px; margin: 40px 0 20px;">Final Thoughts</h2>

<p>Abandoned Chrome extensions represent a massive opportunity — for developers looking to build their portfolio, for businesses seeking quick product-market fit, and for the open source community at large. The best time to take over an abandoned project was years ago. The second best time is <strong>now</strong>.</p>
`;

// XML-RPC request builder
function buildXMLRPC(method, params) {
  const xml = `<?xml version="1.0"?>
<methodCall>
  <methodName>${method}</methodName>
  <params>
    ${params.map((p, i) => `<param><value>${typeof p === 'string' ? `<string><![CDATA[${p}]]></string>` : `<int>${p}</int>`}</value></param>`).join('')}
  </params>
</methodCall>`;
  return xml;
}

// Make XML-RPC request
function makeXMLRPCRequest(xml) {
  return new Promise((resolve, reject) => {
    const url = new URL(WP_CONFIG.siteUrl);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml',
        'Content-Length': Buffer.byteLength(xml)
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    
    req.on('error', reject);
    req.write(xml);
    req.end();
  });
}

// Find post by title
async function findPost(title) {
  const xml = buildXMLRPC('wp.getPosts', [
    WP_CONFIG.blogId,
    WP_CONFIG.username,
    WP_CONFIG.password,
    { number: 100 }
  ]);
  
  const response = await makeXMLRPCRequestRequest(xml);
  // Parse response to find post...
  return null; // Simplified - will create new post
}

// Create or update post
async function createPost(title, content) {
  const xml = buildXMLRPC('wp.newPost', [
    WP_CONFIG.blogId,
    WP_CONFIG.username,
    WP_CONFIG.password,
    {
      post_title: title,
      post_content: content,
      post_status: 'publish',
      post_slug: 'top-10-abandoned-chrome-extensions-with-10k-stars-sgr-blog'
    }
  ]);
  
  console.log('📝 Creating post...');
  const response = await makeXMLRPCRequest(xml);
  return response;
}

// Main
async function main() {
  try {
    console.log('🚀 Starting WordPress update via XML-RPC...\n');
    
    if (WP_CONFIG.username === 'YOUR_WORDPRESS_USERNAME') {
      console.log('❌ ERROR: Please configure WP_CONFIG in update-wordpress-simple.js');
      console.log('\nEdit these values:');
      console.log('  username: "your-admin-username"');
      console.log('  password: "your-admin-password"\n');
      process.exit(1);
    }
    
    const result = await createPost(
      'Top 10 Abandoned Chrome Extensions with 10K+ Stars',
      postContent
    );
    
    console.log('✅ Result:', result.status);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();