# Software Ghost Registry 🏴‍☠️

Discover abandoned software with potential. Find your next acquisition.

## Quick Start

```bash
# Run the GitHub scraper
node src/scrape-github.js

# Results saved to data/github-abandoned.json
```

## Current Data

- **120 abandoned repos** found across GitHub
- Categories: Chrome extensions, Shopify apps, WordPress plugins, Firefox add-ons
- Sorted by Ghost Score (combination of stars + age + forks)

## MVP

Open `index.html` in a browser to view the interactive demo:
- Filter by category (Chrome/Shopify/WordPress/Firefox)
- Sort by Ghost Score, Stars, or Oldest
- Search by name or description
- Email signup for weekly updates

## Deploy to GitHub Pages

```bash
# 1. Create a new GitHub repo
gh repo create sgr-demo --public --source=. --description "Software Ghost Registry MVP"

# 2. Push to GitHub
git add .
git commit -m "Initial commit"
git push -u origin main

# 3. Enable GitHub Pages
# Go to repo Settings > Pages > Deploy from main branch
```

Or manually:
1. Create a GitHub repo
2. Push these files: `index.html`, `data/github-abandoned.json`, `README.md`
3. Enable GitHub Pages in Settings

## Ghost Score Formula

```
Ghost Score = Stars × (1 / months_since_push) × (1 + forks × 0.1) × 10
```

Higher = more valuable but abandoned

## Tech Stack

- **Data**: GitHub REST API
- **Frontend**: Vanilla HTML/CSS/JS (no framework needed)
- **Deployment**: GitHub Pages (free)

## Next Steps

- [ ] Scale scraper to collect more repos
- [ ] Add NPM packages, VS Code extensions
- [ ] Build email notification system
- [ ] Create "Hunting List" weekly digest