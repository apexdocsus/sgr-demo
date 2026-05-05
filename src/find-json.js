const axios = require('axios');

const API_KEY = '47dc3610b60144ff86f1416f2c5ef32c';

async function main() {
  const url = 'https://chrome.google.com/webstore/search/_category=extensions?q=pdf';
  const response = await axios.get('https://api.scrapingant.com/v2/general', {
    params: { url: url, browser: true },
    headers: { 'x-api-key': API_KEY }
  });
  
  const html = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
  
  // Look for JSON data embedded in the page
  console.log('Looking for JSON data...\n');
  
  // Look for AF_initDataChunk or similar
  const jsonPatterns = [
    /AF_initDataChunk\([^,]+,\s*'([^']+)'/g,
    /"extensionId":"([a-z]{32})"/g,
    /"id":"([a-z]{32})"/g,
    /data-extension-id="([^"]+)"/g
  ];
  
  for (const pattern of jsonPatterns) {
    const matches = html.match(pattern);
    if (matches && matches.length > 0) {
      console.log(`Pattern ${pattern}: ${matches.length} matches`);
      console.log('Sample:', matches.slice(0, 3));
    }
  }
  
  // Look for actual extension links
  const extLinkPattern = /chrome\.google\.com\/webstore\/detail\/[^\/"/]+\/([a-z]{32})/g;
  const extLinks = html.match(extLinkPattern);
  console.log('\nExtension links:', extLinks ? extLinks.length : 0);
  if (extLinks) console.log('Sample:', extLinks.slice(0, 5));
}

main();