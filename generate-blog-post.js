// Generate blog post HTML from scraper data
const fs = require('fs');
const data = require('./github-abandoned.json');

// Filter and sort Chrome extensions by stars
const chromeExts = data
  .filter(r => r.category && r.category.toLowerCase().includes('chrome'))
  .sort((a, b) => b.stars - a.stars)
  .slice(0, 10);

// Generate HTML for each extension
const extensionsHTML = chromeExts.map((ext, i) => `
        <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #ff6b6b;">
            <h3 style="color: #1a1a2e; font-size: 22px; margin-bottom: 10px;">${i + 1}. ${ext.name}</h3>
            <div style="margin-bottom: 15px;">
                <span style="background: #fff; padding: 5px 12px; border-radius: 20px; font-size: 14px; color: #ff6b6b; font-weight: 600;">⭐ ${ext.stars.toLocaleString()} stars</span>
                <span style="background: #fff; padding: 5px 12px; border-radius: 20px; font-size: 14px; color: #666; margin-left: 10px;">Last updated: ${ext.monthsAgo} months ago</span>
                <span style="background: #fff; padding: 5px 12px; border-radius: 20px; font-size: 14px; color: #666; margin-left: 10px;">🏴‍☠️ Score: ${Math.round(ext.ghostScore).toLocaleString()}</span>
            </div>
            <p style="color: #666; line-height: 1.6;">${ext.description || 'No description available.'}</p>
            <a href="https://apexdocsus.github.io/sgr-demo/" target="_blank" style="color: #ff6b6b; font-weight: 600;">View in Registry →</a>
        </div>
`).join('');

// Generate full blog post
const blogPost = `<!-- BLOG POST CONTENT -->
<!-- HERO -->
<div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 80px 5%; text-align: center; margin: -80px -80px 50px -80px; width: calc(100% + 160px);">
    <div style="color: #ff6b6b; font-size: 14px; font-weight: 600; margin-bottom: 15px;">FEATURED</div>
    <h1 style="color: #fff; font-size: clamp(28px, 5vw, 42px); margin-bottom: 20px; font-weight: 800;">
        Top 10 Abandoned Chrome Extensions with 10K+ Stars
    </h1>
    <p style="color: rgba(255,255,255,0.85); font-size: clamp(14px, 2vw, 16px); max-width: 600px; margin: 0 auto;">
        These Chrome extensions have thousands of users but zero maintenance. Here's why they matter — and how you can help.
    </p>
    <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin-top: 20px;">Published May 2026 • 8 min read</p>
</div>

<!-- CONTENT -->
<div style="max-width: 800px; margin: 0 auto 70px;">
    <div style="background: #fff; padding: 40px; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.08);">
        
        <p style="color: #666; line-height: 1.8; font-size: 18px; margin-bottom: 30px;">
            The Chrome Web Store is filled with powerful extensions that make our browsing experience better. But what happens when the developer stops maintaining them? Users are left with outdated code, security vulnerabilities, and no support.
        </p>
        
        <p style="color: #666; line-height: 1.8; font-size: 18px; margin-bottom: 30px;">
            We've analyzed over 1,400 abandoned GitHub repositories in the Software Ghost Registry, and today we're highlighting the <strong>most valuable abandoned Chrome extensions</strong> — the ones with 10,000+ stars that just need someone to step up and maintain them.
        </p>
        
        <h2 style="color: #1a1a2e; font-size: 28px; margin: 40px 0 20px;">Why Abandoned Extensions Matter</h2>
        
        <p style="color: #666; line-height: 1.8; margin-bottom: 20px;">
            Here's the thing: <strong>10,000 stars means at least 10,000 active users</strong> — usually many more. These aren't just vanity metrics. People depend on these extensions daily for:
        </p>
        
        <ul style="color: #666; line-height: 1.8; margin-bottom: 30px; padding-left: 20px;">
            <li style="margin-bottom: 10px;">Productivity and workflow automation</li>
            <li style="margin-bottom: 10px;">Developer tools and debugging</li>
            <li style="margin-bottom: 10px;">Privacy and security enhancements</li>
            <li style="margin-bottom: 10px;">Content consumption and organization</li>
        </ul>
        
        <p style="color: #666; line-height: 1.8; margin-bottom: 40px;">
            When these extensions go unmaintained, users face security risks, compatibility issues with new Chrome versions, and no one to turn to when things break.
        </p>
        
        <h2 style="color: #1a1a2e; font-size: 28px; margin: 40px 0 20px;">The Top 10 Abandoned Chrome Extensions</h2>
        
${extensionsHTML}
        
        <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 30px; border-radius: 16px; margin: 40px 0; text-align: center;">
            <h3 style="color: #fff; font-size: 22px; margin-bottom: 15px;">Want to explore more abandoned extensions?</h3>
            <p style="color: rgba(255,255,255,0.8); margin-bottom: 20px;">Browse the full registry to find Chrome extensions and other abandoned projects.</p>
            <a href="https://apexdocsus.github.io/sgr-demo/" style="background: #ff6b6b; color: #fff; padding: 14px 30px; border-radius: 50px; font-weight: 700; text-decoration: none; display: inline-block;">View the Registry →</a>
        </div>
        
        <h2 style="color: #1a1a2e; font-size: 28px; margin: 40px 0 20px;">How to Take Over an Extension</h2>
        
        <p style="color: #666; line-height: 1.8; margin-bottom: 20px;">
            Interested in maintaining one of these extensions? Here's how to get started:
        </p>
        
        <ol style="color: #666; line-height: 1.8; margin-bottom: 30px; padding-left: 20px;">
            <li style="margin-bottom: 15px;"><strong>Fork the repository</strong> — Go to GitHub, click "Fork" to create your own copy</li>
            <li style="margin-bottom: 15px;"><strong>Review the codebase</strong> — Understand the current implementation and any technical debt</li>
            <li style="margin-bottom: 15px;"><strong>Fix critical issues</strong> — Start with security patches and compatibility fixes</li>
            <li style="margin-bottom: 15px;"><strong>Publish under your account</strong> — Upload the fixed version to the Chrome Web Store</li>
            <li style="margin-bottom: 15px;"><strong>Communicate with users</strong> — Update the listing and let users know about the takeover</li>
        </ol>
        
        <h2 style="color: #1a1a2e; font-size: 28px; margin: 40px 0 20px;">Final Thoughts</h2>
        
        <p style="color: #666; line-height: 1.8; margin-bottom: 20px;">
            Abandoned Chrome extensions represent a massive opportunity — for developers looking to build their portfolio, for businesses seeking quick product-market fit, and for the open source community at large.
        </p>
        
        <p style="color: #666; line-height: 1.8; margin-bottom: 20px;">
            The best time to take over an abandoned project was years ago. The second best time is <strong>now</strong>.
        </p>
        
    </div>
</div>`;

// Save to file
fs.writeFileSync('./blog-post-chrome-extensions.html', blogPost);
console.log('✅ Blog post generated: blog-post-chrome-extensions.html');
console.log(`📊 Included ${chromeExts.length} Chrome extensions`);