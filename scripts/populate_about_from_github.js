#!/usr/bin/env node
/*
 Simple scraper to extract basic profile details from GitHub public README/profile
 and save to data/about-scraped.json. This is conservative and avoids login.

 Usage:
   node scripts/populate_about_from_github.js

 It will fetch the public user README and profile page, then write a small JSON file
 that `pages/about.js` will require at runtime (server-side). Do not run this on CI
 without network access or rate limits.
*/

const fs = require('fs');
const path = require('path');
const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      })
      .on('error', reject);
  });
}

async function main() {
  const outPath = path.join(__dirname, '..', 'data', 'about-scraped.json');
  const githubUser = 'ghulam-mujtaba5';
  const profileUrl = `https://github.com/${githubUser}`;
  const readmeUrl = `https://raw.githubusercontent.com/${githubUser}/${githubUser}/main/README.md`;

  const result = { github: `https://github.com/${githubUser}`, linkedin: 'https://www.linkedin.com/in/ghulamujtabaofficial' };

  try {
    const profile = await fetchUrl(profileUrl);
    if (profile.status === 200 && profile.body) {
      // Try to grab location and summary from the profile HTML
      const locMatch = profile.body.match(/<span class="p-label">([^<]+)<\/span>/i) || profile.body.match(/class="p-country-name">([^<]+)<\/span>/i);
      if (locMatch) result.location = locMatch[1].trim();

      const nameMatch = profile.body.match(/<title>([^<]+)<\/title>/i);
      if (nameMatch) result.name = nameMatch[1].replace(' - GitHub', '').trim();

      // Avatar
      const avatarMatch = profile.body.match(/property="og:image" content="([^"]+)"/i);
      if (avatarMatch) result.image = avatarMatch[1];
    }

    // Try raw README for an About summary if present
    const readme = await fetchUrl(readmeUrl);
    if (readme.status === 200 && readme.body) {
      const firstPara = (readme.body.split('\n\n')[0] || '').replace(/\r/g, '');
      if (firstPara) result.summary = firstPara.replace(/#+/g, '').trim();
      // capture university mention
      const uniMatch = readme.body.match(/Comsats/i);
      if (uniMatch) result.university = 'Comsats University, Lahore (BSc Software Engineering)';
    }

    // Add resume path if public
    const resumePath = path.join(__dirname, '..', 'public', 'Resume.pdf');
    if (fs.existsSync(resumePath)) {
      result.resume = '/Resume.pdf';
    }

    // Save JSON
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
    console.log('Saved', outPath);
  } catch (err) {
    console.error('Error scraping GitHub profile:', err.message || err);
    process.exitCode = 2;
  }
}

if (require.main === module) main();
