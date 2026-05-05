const axios = require('axios');
const fs = require('fs');

const API_KEY = '47dc3610b60144ff86f1416f2c5ef32c';

async function scrapeUrl(url) {
  try {
    const response = await axios.get('https://api.scrapingant.com/v2/general', {
      params: { url: url, browser: true },
      headers: { 'x-api-key': API_KEY }
    });
    return typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

function parseShopifyApps(html) {
  const apps = [];
  
  // Look for app cards in Shopify
  const namePattern = /<h3[^>]*>([^<]+)<\/h3>/g;
  const devPattern = /<span[^>]*class="[^"]*author[^"]*"[^>]*>([^<]+)<\/span>/g;
  const idPattern = /\/apps\/([a-zA-Z0-9-]+)/g;
  
  const names = [];
  const devs = [];
  const ids = [];
  
  let match;
  while ((match = namePattern.exec(html)) !== null) names.push(match[1].trim());
  while ((match = devPattern.exec(html)) !== null) devs.push(match[1].trim());
  while ((match = idPattern.exec(html)) !== null && ids.length < 50) {
    if (!ids.includes(match[1])) ids.push(match[1]);
  }
  
  console.log(`Found: ${names.length} names, ${devs.length} devs, ${ids.length} IDs`);
  
  for (let i = 0; i < Math.min(20, names.length); i++) {
    apps.push({
      name: names[i] || 'Unknown',
      developer: devs[i] || 'Unknown',
      id: ids[i] || 'Unknown',
      platform: 'Shopify'
    });
  }
  
  return apps;
}

async function main() {
  console.log('=== Testing Shopify App Store ===\n');
  
  const url = 'https://apps.shopify.com/categories/marketing';
  console.log(`Scraping: ${url}`);
  
  const html = await scrapeUrl(url);
  if (!html) {
    console.log('Failed');
    return;
  }
  
  console.log(`HTML length: ${html.length}`);
  
  // Save for debugging
  fs.writeFileSync('/home/openclaw/.openclaw/workspace/sgr-scraper/data/shopify.html', html);
  console.log('Saved HTML\n');
  
  const apps = parseShopifyApps(html);
  console.log(`\nFound ${apps.length} apps`);
  
  apps.forEach((app, i) => {
    console.log(`${i+1}. ${app.name} - ${app.developer}`);
  });
}

main();