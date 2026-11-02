const fs = require('fs');
const path = require('path');
const https = require('https');

const TARGET_DIR = path.resolve(__dirname, '../../yezbee-frontend');
const GITHUB_TREE_URL = 'https://api.github.com/repos/skydigital34/YEZ-BEE/git/trees/5afb66ff7fac91c7e4745b789bfa4607d1939025?recursive=1';
const RAW_BASE_URL = 'https://raw.githubusercontent.com/skydigital34/YEZ-BEE/main/frontend/';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Node-Frontend-Puller' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchJson(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function downloadBinary(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Node-Frontend-Puller' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(downloadBinary(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function downloadWithRetry(url, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await downloadBinary(url);
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}

async function main() {
  console.log('=== YEZ-BEE FRONTEND CODE RETRIEVAL ===');
  console.log(`Target destination: ${TARGET_DIR}`);

  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  console.log('Fetching tree structure from GitHub API...');
  const treeData = await fetchJson(GITHUB_TREE_URL);
  
  // Filter out the 750MB raw product photoshoot JPGs in public/images/Yez bee/
  // Keep all code, styles, configs, types, components, and lightweight UI icons/banners
  const filesToDownload = treeData.tree.filter(item => {
    if (item.type !== 'blob') return false;
    if (item.path.startsWith('public/images/Yez bee/')) return false; // skip heavy raw photos
    return true;
  });

  console.log(`Found ${filesToDownload.length} frontend code & asset files to pull.`);

  let downloaded = 0;
  let failed = 0;
  const CONCURRENCY = 6;
  const queue = [...filesToDownload];

  async function worker(id) {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;
      const targetFilePath = path.join(TARGET_DIR, item.path);
      const targetDirPath = path.dirname(targetFilePath);

      try {
        if (!fs.existsSync(targetDirPath)) {
          fs.mkdirSync(targetDirPath, { recursive: true });
        }

        const rawUrl = `${RAW_BASE_URL}${encodeURI(item.path)}`;
        const buffer = await downloadWithRetry(rawUrl);
        fs.writeFileSync(targetFilePath, buffer);
        downloaded++;
        if (downloaded % 15 === 0 || downloaded === filesToDownload.length) {
          console.log(`[${downloaded}/${filesToDownload.length}] Downloaded ${item.path}`);
        }
      } catch (err) {
        console.error(`Error downloading ${item.path}:`, err.message);
        failed++;
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, (_, i) => worker(i + 1));
  await Promise.all(workers);

  console.log('\n=== DOWNLOAD COMPLETE ===');
  console.log(`Successfully pulled: ${downloaded} files`);
  console.log(`Failed: ${failed} files`);
  console.log(`Frontend code is saved in: ${TARGET_DIR}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
