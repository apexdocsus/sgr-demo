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

async function main() {
  const url = 'https://chrome.google.com/webstore/search/_category=extensions?q=pdf';
  const html = await scrapeUrl(url);
  
  if (!html) {
    console.log('Failed');
    return;
  }
  
  // Look for patterns
  console.log('Looking for patterns in HTML...\n');
  
  // Find link patterns to extension detail pages
  const linkMatches = html.match(/\/webstore\/detail\/[^\/"]+\/([a-z]{32})/g);
  console.log('Extension detail links:', linkMatches ? linkMatches.length : 0);
  if (linkMatches) console.log('Sample:', linkMatches.slice(0, 3));
  
  // Find names near links
  const namePattern = /\/webstore\/detail\/[^>]*>([^<]+)<\/a>/g;
  let nameMatch;
  const names = [];
  while ((nameMatch = namePattern.exec(html)) !== null && names.length < 10) {
    names.push(nameMatch[1]);
  }
  console.log('\nNames found:', names.length);
  console.log('Sample:', names.slice(0, 5));
  
  // Find user counts
  const userPattern = /([\d,]+)\s+[Uu]sers/g;
  let userMatch;
  const users = [];
  while ((userMatch = userPattern.exec(html)) !== null && users.length < 10) {
    users.push(userMatch[1]);
  }
  console.log('\nUser counts:', users.length);
  console.log('Sample:', users.slice(0, 5));
}

main();