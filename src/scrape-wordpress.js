const axios = require('axios');
const fs = require('fs');

const WP_API = 'https://api.wordpress.org/plugins/info/1.1';

async function searchPlugins(term, page = 1) {
  try {
    const response = await axios.get(WP_API, {
      params: {
        action: 'query_plugins',
        search: term,
        page: page,
        per_page: 20,
        fields: 'description,short_description,rating,num_ratings,installed_versions,last_updated,downloadlink'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

function parsePlugins(data) {
  if (!data || !data.plugins) return [];
  
  const plugins = data.plugins.map(p => ({
    name: p.name,
    slug: p.slug,
    version: p.version,
    rating: p.rating || 0,
    numRatings: p.num_ratings || 0,
    lastUpdated: p.last_updated,
    description: p.short_description || p.description || '',
    downloadLink: p.download_link,
    // Check if abandoned (no update in 12+ months)
    isAbandoned: isAbandoned(p.last_updated)
  }));
  
  return plugins;
}

function isAbandoned(lastUpdated) {
  if (!lastUpdated) return false;
  const updated = new Date(lastUpdated);
  const now = new Date();
  const monthsDiff = (now - updated) / (1000 * 60 * 60 * 24 * 30);
  return monthsDiff >= 12; // 12+ months old
}

async function main() {
  console.log('=== WordPress Plugin Scraper ===\n');
  
  const terms = ['seo', 'analytics', 'commerce', 'forms', 'security', 'backup', 'widget', 'slider', 'gallery', 'chat'];
  const allPlugins = [];
  
  for (const term of terms) {
    console.log(`Searching: ${term}`);
    const result = await searchPlugins(term);
    
    if (result && result.plugins) {
      const plugins = parsePlugins(result);
      console.log(`  Found ${plugins.length} plugins`);
      allPlugins.push(...plugins);
    }
    
    await new Promise(r => setTimeout(r, 500));
  }
  
  // Remove duplicates
  const unique = [];
  const slugs = new Set();
  for (const p of allPlugins) {
    if (!slugs.has(p.slug)) {
      slugs.add(p.slug);
      unique.push(p);
    }
  }
  
  console.log(`\n=== Total unique plugins: ${unique.length} ===`);
  
  // Show abandoned ones
  const abandoned = unique.filter(p => p.isAbandoned);
  console.log(`=== Abandoned plugins (12+ months): ${abandoned.length} ===\n`);
  
  // Show sample
  abandoned.slice(0, 10).forEach((p, i) => {
    console.log(`${i+1}. ${p.name}`);
    console.log(`   Last Updated: ${p.lastUpdated}`);
    console.log(`   Rating: ${p.rating}`);
    console.log('');
  });
  
  // Save
  fs.mkdirSync('/home/openclaw/.openclaw/workspace/sgr-scraper/data', { recursive: true });
  fs.writeFileSync('/home/openclaw/.openclaw/workspace/sgr-scraper/data/plugins.json', 
    JSON.stringify(unique, null, 2));
  console.log('Saved to data/plugins.json');
}

main();
