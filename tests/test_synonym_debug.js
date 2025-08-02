// Test file to debug synonym functionality
const express = require('express');
const app = express();

// Copy the enhanced getDirectSynonyms function
function getDirectSynonyms(query) {
  // Define common words and their related terms
  const commonWords = {
    // Technology terms
    'mobile': ['phone', 'smartphone'],
    'phone': ['mobile', 'smartphone'],
    'smartphone': ['mobile', 'phone'],
    'laptop': ['computer', 'notebook'],
    'computer': ['laptop', 'pc', 'desktop'],
    'headphone': ['earphone', 'headset', 'earbuds'],
    'earphone': ['headphone', 'headset', 'earbuds'],
    
    // Fashion terms
    'shirt': ['t-shirt', 'top', 'blouse'],
    'shoe': ['footwear', 'sneaker', 'boot'],
    'watch': ['timepiece', 'smartwatch'],
    
    // Home terms
    'chair': ['seat', 'furniture'],
    'table': ['desk', 'furniture'],
    
    // Sports terms
    'ball': ['football', 'basketball', 'tennis ball'],
    'gym': ['fitness', 'workout', 'exercise']
  };
  
  const suggestions = [];
  
  // Check for exact matches first - if user types exact word, include it
  if (commonWords[query]) {
    suggestions.push(query); // Add the exact word first
    suggestions.push(...commonWords[query]); // Then add synonyms
    return [...new Set(suggestions)]; // Remove duplicates and return
  }
  
  // Check for prefix matches (dynamic matching)
  // Find words that start with the query (minimum 2 characters)
  if (query.length >= 2) {
    Object.keys(commonWords).forEach(word => {
      if (word.startsWith(query) && word !== query) {
        // Add the complete word as first suggestion
        suggestions.push(word);
        // Add related terms
        suggestions.push(...commonWords[word]);
      }
    });
  }
  
  // Check for partial matches within words (for cases like "mobl" -> "mobile")
  if (query.length >= 3) {
    Object.keys(commonWords).forEach(word => {
      // Check if the word contains the query as a substring
      if (word.includes(query) && word !== query) {
        suggestions.push(word);
        suggestions.push(...commonWords[word]);
      }
      
      // Check if query is similar to word using edit distance (simple check)
      if (isCloseMatch(query, word)) {
        suggestions.push(word);
        suggestions.push(...commonWords[word]);
      }
    });
  }
  
  // For very short queries (2-3 characters), check common abbreviations
  if (query.length >= 2 && query.length <= 3) {
    const abbreviations = {
      'mob': 'mobile',
      'mobl': 'mobile', // Added for "mobl" -> "mobile"
      'lap': 'laptop', 
      'lapt': 'laptop', // Added for "lapt" -> "laptop"
      'com': 'computer',
      'comp': 'computer', // Added for "comp" -> "computer"
      'pho': 'phone',
      'phon': 'phone', // Added for "phon" -> "phone"
      'sho': 'shoe',
      'shoe': 'shoe', // Include full word
      'wat': 'watch',
      'watc': 'watch', // Added for "watc" -> "watch"
      'cha': 'chair',
      'chai': 'chair', // Added for "chai" -> "chair"
      'tab': 'table',
      'tabl': 'table', // Added for "tabl" -> "table"
      'bal': 'ball',
      'gym': 'gym'
    };
    
    if (abbreviations[query]) {
      const fullWord = abbreviations[query];
      suggestions.push(fullWord);
      if (commonWords[fullWord]) {
        suggestions.push(...commonWords[fullWord]);
      }
    }
  }
  
  // Remove duplicates and return unique suggestions
  return [...new Set(suggestions)];
}

// Helper function to check if two strings are close matches (simple similarity check)
function isCloseMatch(query, word) {
  // Simple check: if query is missing 1-2 characters from word
  if (Math.abs(query.length - word.length) <= 2) {
    let matches = 0;
    let queryIndex = 0;
    
    for (let i = 0; i < word.length && queryIndex < query.length; i++) {
      if (word[i] === query[queryIndex]) {
        matches++;
        queryIndex++;
      }
    }
    
    // If most characters match in order, consider it a close match
    return matches >= Math.min(query.length - 1, query.length * 0.8);
  }
  return false;
}

// Test cases
console.log('Testing synonym functionality:');
console.log('mob:', getDirectSynonyms('mob'));
console.log('mobl:', getDirectSynonyms('mobl'));
console.log('mobile:', getDirectSynonyms('mobile'));
console.log('lap:', getDirectSynonyms('lap'));
console.log('lapt:', getDirectSynonyms('lapt'));
console.log('laptop:', getDirectSynonyms('laptop'));
