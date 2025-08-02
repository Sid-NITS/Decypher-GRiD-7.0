// Test the original Elasticsearch suggest endpoint
const http = require('http');

async function testSuggest(query) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: `/api/suggest?q=${encodeURIComponent(query)}`,
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const suggestions = JSON.parse(data);
                    resolve(suggestions);
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

async function runTests() {
    const queries = ['mob', 'mobile', 'phone', 'smartphone', 'mobiile', 'laptp', 'laptop', 'sam', 'samsung'];
    
    console.log('🧪 Testing Original Elasticsearch Suggest Endpoint');
    console.log('==================================================\n');
    
    for (const query of queries) {
        try {
            console.log(`🔍 Testing "${query}":`);
            const suggestions = await testSuggest(query);
            
            if (suggestions.length > 0) {
                console.log(`✅ Found ${suggestions.length} suggestions:`);
                suggestions.forEach((suggestion, index) => {
                    console.log(`   ${index + 1}. ${suggestion.title} - ${suggestion.brand} (${suggestion.category}) [Score: ${Math.round(suggestion.score)}]`);
                });
            } else {
                console.log('❌ No suggestions found');
            }
            console.log('');
        } catch (error) {
            console.log(`❌ Error testing "${query}":`, error.message);
            console.log('');
        }
    }
}

runTests().catch(console.error);
