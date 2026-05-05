const axios = require('axios');
const fs = require('fs');

const GITHUB_API = 'https://api.github.com';

// Expanded search queries - more categories, lower star threshold
const QUERIES = [
  // Original 4 - lower threshold
  { query: 'chrome extension pushed:<2023-06-01 stars:>1', name: 'chrome' },
  { query: 'shopify app pushed:<2023-06-01 stars:>1', name: 'shopify' },
  { query: 'wordpress plugin pushed:<2023-06-01 stars:>1', name: 'wordpress' },
  { query: 'firefox addon pushed:<2023-06-01 stars:>1', name: 'firefox' },
  // New categories
  { query: 'npm package pushed:<2023-06-01 stars:>1', name: 'npm' },
  { query: 'vscode extension pushed:<2023-06-01 stars:>1', name: 'vscode' },
  { query: 'browser extension pushed:<2023-06-01 stars:>1', name: 'browser-ext' },
  { query: 'electron app pushed:<2023-06-01 stars:>1', name: 'electron' },
  { query: 'safari extension pushed:<2023-06-01 stars:>1', name: 'safari' },
  // Older abandoned
  { query: 'chrome extension pushed:<2022-06-01 stars:>10', name: 'chrome-old' },
  { query: 'wordpress plugin pushed:<2022-06-01 stars:>10', name: 'wordpress-old' },
];

const MAX_PAGES = 5; // Get up to 150 repos per category

async function searchRepos(query, page = 1) {
  try {
    const response = await axios.get(`${GITHUB_API}/search/repositories`, {
      params: {
        q: query,
        sort: 'pushed',
        order: 'asc',
        per_page: 30,
        page: page
      },
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      },
      timeout: 15000
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      console.log('Rate limited, waiting 60s...');
      await new Promise(r => setTimeout(r, 60000));
      return searchRepos(query, page);
    }
    console.error('Error:', error.message);
    return null;
  }
}

function calcMonthsOld(dateStr) {
  if (!dateStr) return 0;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 0;
  const now = new Date();
  return Math.floor((now - date) / (1000 * 60 * 60 * 24 * 30));
}

function calcGhostScore(repo) {
  const monthsOld = calcMonthsOld(repo.pushed_at);
  const monthsFactor = monthsOld > 0 ? 1 / monthsOld : 0;
  const forkFactor = 1 + (repo.forks_count * 0.1);
  const score = (repo.stargazers_count * monthsFactor * forkFactor * 10).toFixed(2);
  return parseFloat(score);
}

function detectCategory(fullName, topics) {
  const name = fullName.toLowerCase();
  const topicStr = (topics || []).join(' ');
  
  if (name.includes('shopify') || topicStr.includes('shopify')) return 'shopify';
  if (name.includes('wordpress') || topicStr.includes('wordpress')) return 'wordpress';
  if (name.includes('firefox') || topicStr.includes('firefox-addon')) return 'firefox';
  if (name.includes('vscode') || name.includes('visual-studio-code') || topicStr.includes('vscode')) return 'vscode';
  if (name.includes('npm') || topicStr.includes('npm')) return 'npm';
  if (name.includes('electron')) return 'electron';
  if (name.includes('chrome') || name.includes('extension') || topicStr.includes('chrome-extension')) return 'chrome';
  return 'other';
}

async function main() {
  console.log('=== GitHub Abandoned Software Scraper - SCALED ===\n');
  
  const allRepos = [];
  
  for (const { query, name } of QUERIES) {
    console.log(`\n--- Searching: ${name} ---`);
    
    for (let page = 1; page <= MAX_PAGES; page++) {
      console.log(`  Page ${page}...`);
      const result = await searchRepos(query, page);
      
      if (result && result.items && result.items.length > 0) {
        const repos = result.items.map(r => ({
          name: r.name,
          fullName: r.full_name,
          description: r.description,
          stars: r.stargazers_count,
          forks: r.forks_count,
          language: r.language,
          pushedAt: r.pushed_at,
          monthsAgo: calcMonthsOld(r.pushed_at),
          htmlUrl: r.html_url,
          ghostScore: calcGhostScore(r),
          topics: r.topics || [],
          category: detectCategory(r.full_name, r.topics)
        }));
        
        allRepos.push(...repos);
        console.log(`    Found ${repos.length} repos`);
      } else {
        console.log(`    No more results`);
        break;
      }
      
      await new Promise(r => setTimeout(r, 1500));
    }
  }
  
  // Remove duplicates
  const unique = [];
  const names = new Set();
  for (const r of allRepos) {
    if (!names.has(r.fullName)) {
      names.add(r.fullName);
      unique.push(r);
    }
  }
  
  console.log(`\n=== Total unique repos: ${unique.length} ===`);
  
  // Sort by ghost score
  const sorted = unique.sort((a, b) => b.ghostScore - a.ghostScore);
  
  console.log('\n=== TOP 30 HIGHEST GHOST SCORE ===');
  sorted.slice(0, 30).forEach((r, i) => {
    console.log(`${i+1}. ${r.fullName} [${r.category}]`);
    console.log(`   ⭐ ${r.stars} | 🍴 ${r.forks} | 📅 ${r.monthsAgo}mo ago | Ghost: ${r.ghostScore}`);
  });
  
  // Stats by category
  console.log('\n=== BY CATEGORY ===');
  const byCategory = {};
  for (const r of sorted) {
    byCategory[r.category] = (byCategory[r.category] || 0) + 1;
  }
  for (const [cat, count] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }
  
  // Save
  fs.mkdirSync('/home/openclaw/.openclaw/workspace/sgr-scraper/data', { recursive: true });
  fs.writeFileSync('/home/openclaw/.openclaw/workspace/sgr-scraper/data/github-abandoned.json', 
    JSON.stringify(sorted, null, 2));
  console.log(`\n✅ Saved ${sorted.length} repos to data/github-abandoned.json`);
}

main();