const path = require('path');
const ComprehensiveSearch = require('../src/search/comprehensive_search');

// Initialize search engine
const searchEngine = new ComprehensiveSearch();

// Load comprehensive product data
console.log('🔄 Loading comprehensive product data...');
searchEngine.loadProducts(path.join(__dirname, '..', 'data', 'comprehensive_products.json'));
console.log(`✅ Loaded ${searchEngine.products.length} products\n`);

// Test suggestion queries including the problematic ones
const testQueries = ['m', 'mo', 'mob', 'mobile', 'mobiile', 'phone', 'smartphone', 'sam', 'sams', 'samsung', 'laptp', 'laptop'];

console.log('🧪 Testing Original Suggestion Functionality (Reverted)');
console.log('======================================================\n');

testQueries.forEach(query => {
    console.log(`🔍 Testing suggestions for: "${query}"`);
    const suggestions = searchEngine.getSuggestions(query, 5);
    
    if (suggestions.length > 0) {
        console.log(`✅ Found ${suggestions.length} product suggestions:`);
        suggestions.forEach((suggestion, index) => {
            const price = suggestion.currentPrice || suggestion.price || 0;
            console.log(`   ${index + 1}. ${suggestion.title} - ${suggestion.brand} (₹${price}) [${suggestion.suggestion_type}]`);
        });
    } else {
        console.log('❌ No suggestions found');
    }
    console.log('');
});

console.log('🎉 Original suggestion test completed!');
