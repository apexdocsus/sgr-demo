const axios = require('axios');
const fs = require('fs');

const API_KEY = '47dc3610b60144ff86f1416f2c5ef32c';

async function scrapeUrl(url) {
  try {
    console.log('Calling ScrapingAnt API...');
    const response = await axios.get('https://api.scrapingant.com/v2/general', {
      params: {
        url: url,
        browser: true
      },
      headers: {
        'x-api-key': API_KEY
      }
    });
    console.log('Response status:', response.status);
    console.log('Response keys:', Object.keys(response.data || {}));
    return response.data;
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data));
    }
    return null;
  }
}

async function main() {
  console.log('=== Software Ghost Registry Scraper ===\n');
  
  const url = 'https://chrome.google.com/webstore/search/_category=extensions?q=pdf';
  console.log(`Scraping: ${url}`);
  
  const result = await scrapeUrl(url);
  
  if (result) {
    console.log('Result:', JSON.stringify(result).substring(0, 500));
  }
}

main();