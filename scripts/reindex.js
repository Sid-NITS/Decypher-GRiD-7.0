// Simple script to reindex the data
const { exec } = require('child_process');

console.log('🔄 Starting reindex process...');

exec('node ../src/indexing/bulk_index.js', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error during reindexing:', error);
    return;
  }
  
  if (stderr) {
    console.error('⚠️ Stderr:', stderr);
  }
  
  console.log('✅ Reindex output:', stdout);
  console.log('🎉 Reindexing completed! You can now test the new features:');
  console.log('   - Try searching for "banana" or "fruit"');
  console.log('   - Try searching for "laptop" or "computer"');
  console.log('   - Try searching for non-existent items to see suggestions');
});
