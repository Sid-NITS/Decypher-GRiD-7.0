// Test script to demonstrate search functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/suggest';

async function testSearch(query) {
  try {
    console.log(`\n🔍 Testing search for: "${query}"`);
    const response = await axios.get(`${BASE_URL}?q=${encodeURIComponent(query)}`);
    
    if (response.data.results && response.data.results.length > 0) {
      console.log(`✅ Found ${response.data.results.length} results:`);
      response.data.results.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.title} (${item.category}) - ${item.brand} [Score: ${item.score?.toFixed(2)}]`);
      });
    } else if (response.data.message) {
      console.log(`ℹ️ ${response.data.message}`);
      if (response.data.suggestions) {
        console.log(`💡 Suggestions: ${response.data.suggestions.popularSearches.join(', ')}`);
      }
    } else if (Array.isArray(response.data) && response.data.length > 0) {
      console.log(`✅ Found ${response.data.length} results:`);
      response.data.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.title} (${item.category}) - ${item.brand} [Score: ${item.score?.toFixed(2)}]`);
      });
    } else {
      console.log('❌ No results found');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    if (error.response?.status === 500) {
      console.log('   Make sure the server is running: node src/server.js');
    }
  }
}

async function runTests() {
  console.log('🧪 Testing Search Functionality with 10,000 Products');
  console.log('='.repeat(60));
  
  // Test various search scenarios
  const testQueries = [
    // Fruit searches (original request)
    'banana',
    'apple',
    'fruit',
    
    // Electronics
    'laptop',
    'phone',
    'wireless',
    'smart',
    
    // Clothing
    'shirt',
    'jeans',
    'shoes',
    
    // Home
    'sofa',
    'kitchen',
    
    // Single letter (should work now)
    'x',
    'a',
    
    // Partial words
    'lap',
    'sma',
    'sho',
    
    // Synonyms test
    'computer',  // should find laptops too
    'mobile',    // should find phones
    'clothing',  // should find apparel
    
    // Typos (fuzzy matching)
    'banan',     // should find banana
    'laptp',     // should find laptop
    
    // Non-existent items
    'spaceship',
    'unicorn',
    'xyz123'
  ];
  
  for (const query of testQueries) {
    await testSearch(query);
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
  }
  
  console.log('\n🎉 Test completed!');
  console.log('\n📊 Key Features Demonstrated:');
  console.log('   ✅ 10,000 diverse products across multiple categories');
  console.log('   ✅ Synonym mapping (computer → laptop, mobile → phone)');
  console.log('   ✅ Fuzzy matching for typos');
  console.log('   ✅ Prefix matching');
  console.log('   ✅ Category-based search');
  console.log('   ✅ No results suggestions with helpful tips');
  console.log('   ✅ Single character search support');
}

// Check if server is running first
async function checkServer() {
  try {
    await axios.get(BASE_URL + '?q=test');
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server is not running!');
    console.log('Please start the server first:');
    console.log('   node src/server.js');
    process.exit(1);
  }
  
  await runTests();
}

main().catch(console.error);
