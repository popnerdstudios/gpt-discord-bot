const { google } = require('googleapis');

module.exports = {
    googleSearch: async function (query) {
        const customsearch = google.customsearch('v1');
    
        const res = await customsearch.cse.list({
            cx: process.env.GOOGLE_CSE_ID,
            q: query,
            auth: process.env.GOOGLE_API_KEY
        });
    
        const results = res.data.items;
        console.log("COMMAND: googleSearch");
        if (results && results.length > 0) {
            // Limit to top 10 results or all results if less than 10
            const topResults = results.slice(0, 10);
            // Join the snippets from the top results into a single string
            const resultSnippets = topResults.map(result => result.snippet).join('\n\n');
            return resultSnippets;
        } else {
            return 'No results found';
        }
    }
};
