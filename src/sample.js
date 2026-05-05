const axios = require('axios');

const API_KEY = '47dc3610b60144ff86f1416f2c5ef32c';

async function main() {
  const url = 'https://chrome.google.com/webstore/search/_category=extensions?q=pdf';
  const response = await axios.get('https://api.scrapingant.com/v2/general', {
    params: { url: url, browser: true },
    headers: { 'x-api-key': API_KEY }
  });
  
  const html = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
  
  // Print sample of HTML to see structure
  console.log('=== HTML Sample (first 3000 chars) ===');
  console.log(html.substring(0, 3000));
  console.log('\n=== HTML Sample (chars 10000-13000) ===');
  console.log(html.substring(10000, 13000));
}

main();