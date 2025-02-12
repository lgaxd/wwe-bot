require('dotenv').config();
const axios = require('axios');
const knex = require('./database/config');

const WIKI_API = 'https://en.wikipedia.org/w/api.php';
const ENTERPRISE_API = 'https://api.enterprise.wikimedia.com/v2/structured-contents';
const API_TOKEN = process.env.WIKI_ENTERPRISE_TOKEN;

async function getWrestlerList() {
    try {
        const response = await axios.get(WIKI_API, {
            params: {
                action: 'query',
                format: 'json',
                titles: 'Template:WWE_personnel',
                prop: 'transcludedin',
                tilimit: 'max',
                tinamespace: 0
            },
            headers: {
                'User-Agent': 'WWE-Bot/1.0'
            }
        });

        const page = response.data.query.pages[Object.keys(response.data.query.pages)[0]];
        return page.transcludedin || [];
        
    } catch (error) {
        console.error('Error fetching wrestler list:', error.message);
        return [];
    }
}

// Updated: Now takes `apiResponse` and the wrestler title as parameters
function extractWrestlerData(apiResponse, wrestlerTitle) {
    // Assuming that the API response is an array and we want the first result:
    const data = apiResponse[0];

    return {
        name: data.name,
        description: data.abstract,
        wiki_url: `https://en.wikipedia.org/wiki/${encodeURIComponent(wrestlerTitle)}`,
        image_url: data.image && data.image.content_url ? data.image.content_url : null
    };
}

async function processWrestlers() {
    try {
        const wrestlers = await getWrestlerList();
        console.log(`Found ${wrestlers.length} wrestlers to process`);

        for (const [index, wrestler] of wrestlers.entries()) {
            console.log(`Processing ${index + 1}/${wrestlers.length}: ${wrestler.title}`);
            
            try {
                const response = await axios.get(`${ENTERPRISE_API}/${encodeURIComponent(wrestler.title)}`, {
                    headers: {
                        Authorization: `Bearer ${API_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    params: {
                        filters: JSON.stringify({
                            field: "in_language.identifier",
                            value: "en"
                        })
                    }
                });

                // Pass wrestler.title along with the API response data
                const wrestlerData = extractWrestlerData(response.data, wrestler.title);
                
                await knex('wrestlers').insert(wrestlerData);

                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (error) {
                console.error(`Error processing ${wrestler.title}:`, error.message);
            }
        }

        console.log('Processing complete!');
        
    } catch (error) {
        console.error('Global error:', error);
    }
}

// Execute
(async () => {
    if (!API_TOKEN) {
        console.error('Missing WIKI_ENTERPRISE_TOKEN in environment variables');
        process.exit(1);
    }

    await processWrestlers();
    process.exit();
})();