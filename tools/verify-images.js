#!/usr/bin/env node

// Image verification script
const fs = require('fs');
const path = require('path');

console.log('🖼️  DeCypher Image Verification\n');

// Paths
const dataDir = path.join(__dirname, 'data');
const imagesDir = path.join(__dirname, 'public', 'images');

// Load data files
const demoProducts = require('./data/demo_products.json');
const featuredProducts = require('./data/featured_products.json');
const categoryImages = require('./data/category_images.json');

let totalImages = 0;
let foundImages = 0;
let missingImages = [];

function checkImageExists(imagePath) {
  const fullPath = path.join(__dirname, 'public', imagePath);
  const exists = fs.existsSync(fullPath);
  totalImages++;
  
  if (exists) {
    foundImages++;
    console.log(`✅ ${imagePath}`);
  } else {
    missingImages.push(imagePath);
    console.log(`❌ ${imagePath} - FILE NOT FOUND`);
  }
  
  return exists;
}

console.log('📦 Checking Demo Products Images:');
demoProducts.forEach(product => {
  checkImageExists(product.image);
});

console.log('\n⭐ Checking Featured Products Images:');
featuredProducts.forEach(product => {
  checkImageExists(product.image);
});

console.log('\n📂 Checking Category Images:');
Object.values(categoryImages.categoryImages).flat().forEach(imagePath => {
  checkImageExists(imagePath);
});

Object.values(categoryImages.defaultFallbacks).forEach(imagePath => {
  checkImageExists(imagePath);
});

console.log('\n📊 Summary:');
console.log(`Total Images: ${totalImages}`);
console.log(`Found: ${foundImages}`);
console.log(`Missing: ${missingImages.length}`);

if (missingImages.length > 0) {
  console.log('\n⚠️  Missing Images:');
  missingImages.forEach(img => console.log(`   - ${img}`));
  process.exit(1);
} else {
  console.log('\n🎉 All images found! Ready for production.');
  process.exit(0);
}
