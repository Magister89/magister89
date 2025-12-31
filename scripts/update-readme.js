const https = require('https');
const fs = require('fs');
const path = require('path');

const GIST_URL = 'https://gist.githubusercontent.com/Magister89/a527b1f5ff47cf9971d782185fb248a4/raw/activities.json';
const README_PATH = path.join(__dirname, '..', 'README.md');

function fetchGist() {
    return new Promise((resolve, reject) => {
        https.get(GIST_URL, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error('Failed to parse Gist JSON'));
                }
            });
        }).on('error', reject);
    });
}

function generateSystemStatus(data) {
    return '```json\n' + JSON.stringify(data, null, 2) + '\n```';
}

async function updateReadme() {
    try {
        const gistData = await fetchGist();
        const newStatus = generateSystemStatus(gistData);

        let readme = fs.readFileSync(README_PATH, 'utf8');

        // Replace the SYSTEM.STATUS code block (JSON format)
        const pattern = /```json\n\{[\s\S]*?\}\n```/;

        if (pattern.test(readme)) {
            readme = readme.replace(pattern, newStatus);
            fs.writeFileSync(README_PATH, readme);
            console.log('✅ README updated successfully!');
        } else {
            console.log('⚠️ Could not find SYSTEM.STATUS block to update');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

updateReadme();
