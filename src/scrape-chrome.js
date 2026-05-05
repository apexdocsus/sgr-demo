const axios = require('axios');
const fs = require('fs');

const API_KEY = '47dc3610b60144ff86f1416f2c5ef32c';

async function scrapeUrl(url) {
  try {
    const response = await axios.get('https://api.scrapingant.com/v2/general', {
      params: {
        url: url,
        browser: true
      },
      headers: {
        'x-api-key': API_KEY
      }
    });
    // API returns HTML as string directly
    return typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

function parseExtensions(html) {
  const extensions = [];
  
  // Chrome Web Store uses data-extensionid attributes
  const idRegex = /data-extensionid="([a-z]{32})"/g;
  const nameRegex = /data-name="([^"]+)"/g;
  const userRegex = /([\d,]+)\s+users/g;
  
  const ids = [];
  const names = [];
  const usersList = [];
  
  let match;
  while ((match = idRegex.exec(html)) !== null) ids.push(match[1]);
  while ((match = nameRegex.exec(html)) !== null) names.push(match[1]);
  while ((match = userRegex.exec(html)) !== null) usersList.push(match[1]);
  
  console.log(`Found IDs: ${ids.length}, Names: ${names.length}, Users: ${usersList.length}`);
  
  for (let i = 0; i < Math.min(ids.length, names.length); i++) {
    extensions.push({
      name: names[i],
      id: ids[i],
      users: usersList[i] || 'Unknown',
      platform: 'Chrome Web Store'
    });
  }
  
  return extensions;
}

async function main() {
  console.log('=== Software Ghost Registry Scraper ===\n');
  
  const url = 'https://chrome.google.com/webstore/search/_category=extensions?q=pdf';
  console.log(`Scraping: ${url}`);
  
  const html = await scrapeUrl(url);
  if (!html) {
    console.log('Failed to get HTML');
    process.exit(1);
  }
  
  console.log(`HTML length: ${html.length}`);
  
  const extensions = parseExtensions(html);
  console.log(`\nFound ${extensions.length} extensions\n`);
  
  extensions.slice(0, 10).forEach((ext, i) => {
    console.log(`${i+1}. ${ext.name}`);
    console.log(`   ID: ${ext.id} | Users: ${ext.users}`);
  });
  
  fs.mkdirSync('/home/openclaw/.openclaw/workspace/sgr-scraper/data', { recursive: true });
  fs.writeFileSync('/home/openclaw/.openclaw/workspace/sgr-scraper/data/extensions.json', 
    JSON.stringify(extensions, null, 2));
  console.log('\nData saved to data/extensions.json');
}

main();