const axios = require('axios');
const fs = require('fs');

const WP_API = 'https://api.wordpress.org/plugins/info/1.1';

async function queryPlugins(page = 1, perPage = 30) {
  try {
    const response = await axios.get(WP_API, {
      params: {
        action: 'query_plugins',
        page: page,
        per_page: perPage,
        fields: 'short_description,rating,num_ratings,last_updated,downloadlink,added'
      },
      timeout: 15000
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

function calcMonthsOld(lastUpdated) {
  if (!lastUpdated) return 0;
  const updated = new Date(lastUpdated);
  if (isNaN(updated.getTime())) return 0;
  const now = new Date();
  return Math.floor((now - updated) / (1000 * 60 * 60 * 24 * 30));
}

async function main() {
  console.log('=== WordPress Plugin Scraper v5 - Full Pagination ===\n');
  
  // First, check how many pages
  const first = await queryPlugins(1, 1);
  if (!first || !first.info) {
    console.log('Failed to get plugin count');
    return;
  }
  
  const totalPages = first.info.pages;
  const totalResults = first.info.results;
  console.log(`Total plugins: ${totalResults.toLocaleString()}`);
  console.log(`Total pages: ${totalPages}`);
  
  // Sample pages: 1, 50, 100, 200, 500, 1000, 1500, 2000
  // This gives us a spread across popularity (pages are sorted by popularity)
  const pagesToFetch = [1, 50, 100, 200, 500, 750, 1000, 1250, 1500, 1750, 2000, 2250];
  
  const allPlugins = [];
  
  for (const page of pagesToFetch) {
    if (page > totalPages) continue;
    console.log(`Fetching page ${page}/${totalPages}...`);
    
    const result = await queryPlugins(page, 30);
    
    if (result && result.plugins) {
      const plugins = result.plugins.map(p => ({
        name: p.name.replace(/&#8211;/g, '—').replace(/&#038;/g, '&'),
        slug: p.slug,
        rating: p.rating || 0,
        numRatings: p.num_ratings || 0,
        lastUpdated: p.last_updated,
        monthsOld: calcMonthsOld(p.lastUpdated),
        added: p.added,
        page: page
      }));
      
      allPlugins.push(...plugins);
      console.log(`  Got ${plugins.length} plugins`);
    }
    
    await new Promise(r => setTimeout(r, 300));
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
  
  console.log(`\n=== Total unique collected: ${unique.length} ===`);
  
  // Sort by oldest first
  const sorted = unique.sort((a, b) => b.monthsOld - a.monthsOld);
  
  console.log('\n=== TOP 30 OLDEST PLUGINS ===');
  sorted.slice(0, 30).forEach((p, i) => {
    console.log(`${i+1}. ${p.name}`);
    console.log(`   Last Updated: ${p.lastUpdated} (${p.monthsOld} months)`);
    console.log(`   Rating: ${p.rating}/100 | Reviews: ${p.numRatings} | Page: ${p.page}`);
  });
  
  // Stats
  const oldPlugins = sorted.filter(p => p.monthsOld >= 12);
  const veryOld = sorted.filter(p => p.monthsOld >= 24);
  console.log(`\n=== Stats ===`);
  console.log(`12+ months old: ${oldPlugins.length}`);
  console.log(`24+ months old: ${veryOld.length}`);
  
  // Save
  fs.mkdirSync('/home/openclaw/.openclaw/workspace/sgr-scraper/data', { recursive: true });
  fs.writeFileSync('/home/openclaw/.openclaw/workspace/sgr-scraper/data/plugins-full.json', 
    JSON.stringify(sorted, null, 2));
  console.log(`\nSaved ${sorted.length} plugins to data/plugins-full.json`);
}

main();