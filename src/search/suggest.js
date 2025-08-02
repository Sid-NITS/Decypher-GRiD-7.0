// src/search/suggest.js

const express = require('express');
const router = express.Router();
const { esClient, ES_INDEX } = require('../config/es');

// Fallback to comprehensive search if Elasticsearch fails
const ComprehensiveSearch = require('./comprehensive_search');
const fallbackSearch = new ComprehensiveSearch();

// Helper function to expand queries with synonyms and partial matches
function getExpandedQueries(query) {
  const synonyms = {
    // Mobile/Phone synonyms
    'mob': ['mobile', 'phone', 'smartphone'],
    'mobil': ['mobile', 'phone', 'smartphone'],
    'mobile': ['phone', 'smartphone'],
    'phone': ['mobile', 'smartphone'],
    'smartphone': ['mobile', 'phone'],
    
    // Computer/Laptop synonyms
    'lapp': ['laptop', 'computer', 'notebook'],
    'laptp': ['laptop', 'computer', 'notebook'],
    'laptop': ['computer', 'notebook'],
    'computer': ['laptop', 'pc', 'desktop'],
    'comp': ['computer', 'laptop'],
    
    // Audio synonyms
    'headphone': ['earphone', 'headset', 'earbuds'],
    'earphone': ['headphone', 'headset', 'earbuds'],
    
    // Common misspellings
    'mobiile': ['mobile', 'phone'],
    'labtop': ['laptop', 'computer'],
    'compter': ['computer', 'laptop']
  };
  
  const queries = [query];
  
  // Add exact synonyms
  if (synonyms[query]) {
    queries.push(...synonyms[query]);
  }
  
  // Add partial matches for longer queries
  if (query.length >= 3) {
    Object.keys(synonyms).forEach(key => {
      if (key.startsWith(query) || query.startsWith(key)) {
        queries.push(key, ...synonyms[key]);
      }
    });
  }
  
  return [...new Set(queries)]; // Remove duplicates
}

// Check if query is a known synonym for mobile devices
function isMobileSynonym(query) {
  const mobileSynonyms = ['mob', 'mobil', 'mobile', 'phone', 'smartphone', 'mobiile'];
  return mobileSynonyms.includes(query.toLowerCase());
}

// Unified search function that can be used for both suggestions and full search
async function performElasticsearchSearch(query, options = {}) {
  const { size = 8, includeHighlight = true } = options;
  
  // Enhanced search with better synonym and partial word handling
  const searchQuery = {
    index: ES_INDEX,
    size: size,
    query: {
      function_score: {
        query: {
          bool: {
            should: [
              // Special handling for mobile-related queries - ultra high priority
              ...(isMobileSynonym(query) ? [
                {
                  wildcard: {
                    'category': {
                      value: '*smartphone*',
                      boost: 100
                    }
                  }
                },
                {
                  wildcard: {
                    'category': {
                      value: '*mobile*',
                      boost: 95
                    }
                  }
                },
                {
                  match: {
                    'title': {
                      query: 'smartphone mobile phone',
                      boost: 90
                    }
                  }
                }
              ] : []),
              
              // 1. Exact title prefix matches (highest priority)
              {
                prefix: {
                  'title': {
                    value: query,
                    boost: 50
                  }
                }
              },
              // 2. Exact category matches for expanded queries (very high priority)
              ...(getExpandedQueries(query).map(expandedQuery => ({
                bool: {
                  should: [
                    {
                      wildcard: {
                        'category': {
                          value: `*${expandedQuery}*`,
                          boost: 45
                        }
                      }
                    },
                    {
                      match: {
                        'category': {
                          query: expandedQuery,
                          boost: 40
                        }
                      }
                    }
                  ]
                }
              }))),
              // 3. Title matches for expanded queries (high priority)
              ...(getExpandedQueries(query).map(expandedQuery => ({
                match: {
                  title: {
                    query: expandedQuery,
                    operator: 'and',
                    boost: expandedQuery === query ? 25 : 35 // Boost expanded queries higher
                  }
                }
              }))),
              // 4. Brand prefix matches (only for original query to avoid false matches)
              {
                prefix: {
                  'brand': {
                    value: query,
                    boost: 20
                  }
                }
              },
              // 5. Title fuzzy matches for typos
              {
                fuzzy: {
                  title: {
                    value: query,
                    fuzziness: query.length >= 4 ? '2' : '1',
                    boost: 15
                  }
                }
              },
              // 6. Brand fuzzy matches (lower priority)
              {
                fuzzy: {
                  brand: {
                    value: query,
                    fuzziness: '1',
                    boost: 10
                  }
                }
              },
              // 7. Title contains query (much lower priority)
              {
                wildcard: {
                  'title': {
                    value: `*${query}*`,
                    boost: 5
                  }
                }
              }
            ],
            minimum_should_match: 1
          }
        },
        field_value_factor: {
          field: 'popularity',
          factor: 0.01,
          missing: 1
        },
        boost_mode: 'sum'
      }
    }
  };

  if (includeHighlight) {
    searchQuery.highlight = {
      fields: {
        title: {},
        category: {},
        brand: {}
      }
    };
  }

  return await esClient.search(searchQuery);
}

// Helper function to get direct synonyms for a query
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

router.get('/suggest', async (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  if (!q) return res.json([]);

  try {
    // 1. First, get direct synonyms for the query
    const directSynonyms = getDirectSynonyms(q);
    
    // 2. Get product suggestions
    let response = await performElasticsearchSearch(q, { size: directSynonyms.length > 0 ? 6 : 8, includeHighlight: true });

    // If still no results from main query, try category-based suggestions first
    if (response.hits.hits.length === 0) {
      // Strategy 1: Try to find products from categories that might be related
      const categoryBasedQuery = {
        index: ES_INDEX,
        size: 5,
        query: {
          function_score: {
            query: {
              bool: {
                should: [
                  // Look for products in "Fruits" category when someone types fruit names
                  {
                    bool: {
                      must: [
                        {
                          term: {
                            'category.keyword': 'Fruits'
                          }
                        }
                      ],
                      boost: 10
                    }
                  },
                  // Look for products in "Food" related categories
                  {
                    bool: {
                      should: [
                        { term: { 'category.keyword': 'Snacks' } },
                        { term: { 'category.keyword': 'Beverages' } },
                        { term: { 'category.keyword': 'Dairy' } },
                        { term: { 'category.keyword': 'Grains' } }
                      ],
                      boost: 8
                    }
                  },
                  // Broader synonym-based matches
                  {
                    match: {
                      title: {
                        query: q,
                        fuzziness: '1',
                        boost: 6
                      }
                    }
                  },
                  {
                    match: {
                      category: {
                        query: q,
                        fuzziness: '1',
                        boost: 5
                      }
                    }
                  }
                ]
              }
            },
            field_value_factor: {
              field: 'popularity',
              factor: 0.1,
              missing: 1
            },
            boost_mode: 'sum'
          }
        }
      };
      
      try {
        const categoryResponse = await esClient.search(categoryBasedQuery);
        if (categoryResponse.hits.hits.length > 0) {
          response = categoryResponse;
        }
      } catch (err) {
        console.error('Category-based search error:', err);
      }
    }

    // Strategy 2: If still no results, try broader fuzzy matching
    if (response.hits.hits.length === 0) {
      const fuzzyQuery = {
        index: ES_INDEX,
        size: 5,
        query: {
          function_score: {
            query: {
              bool: {
                should: [
                  {
                    fuzzy: {
                      title: {
                        value: q,
                        fuzziness: q.length >= 4 ? '2' : '1',
                        boost: 3
                      }
                    }
                  },
                  {
                    fuzzy: {
                      category: {
                        value: q,
                        fuzziness: '1',
                        boost: 2
                      }
                    }
                  },
                  {
                    fuzzy: {
                      brand: {
                        value: q,
                        fuzziness: '1',
                        boost: 1
                      }
                    }
                  }
                ]
              }
            },
            field_value_factor: {
              field: 'popularity',
              factor: 0.1,
              missing: 1
            },
            boost_mode: 'sum'
          }
        },
        highlight: {
          fields: {
            title: {},
            category: {},
            brand: {}
          }
        }
      };
      response = await esClient.search(fuzzyQuery);
    }

    // 3) Format product results
    const productSuggestions = response.hits.hits.map(hit => ({
      id:        hit._id,
      title:     hit._source.title,
      category:  hit._source.category,
      brand:     hit._source.brand,
      popularity:hit._source.popularity,
      score:     hit._score,
      highlight: hit.highlight || {}
    }));

    // 4) Combine direct synonyms with product suggestions
    let allSuggestions = [];
    
    // Add direct synonyms first (as text-only suggestions)
    if (directSynonyms.length > 0) {
      directSynonyms.forEach(synonym => {
        allSuggestions.push({
          id: `synonym_${synonym}`,
          title: synonym,
          category: 'Suggestion',
          brand: '',
          popularity: 1000, // High priority for synonyms
          score: 1000,
          highlight: {},
          isSynonym: true
        });
      });
    }
    
    // Add product suggestions
    allSuggestions.push(...productSuggestions);
    
    // Limit total suggestions to 8
    allSuggestions = allSuggestions.slice(0, 8);

    // 5) If still no results from specific search, provide broader suggestions
    if (allSuggestions.length === directSynonyms.length) { // Only synonyms, no products found
      // Try to find related products by expanding the search
      let fallbackSuggestions = [];
      
      // Strategy 1: Try broader category matches
      const broadCategoryQuery = {
        index: ES_INDEX,
        size: 5,
        query: {
          function_score: {
            query: {
              bool: {
                should: [
                  // Look for similar sounding categories
                  {
                    fuzzy: {
                      category: {
                        value: q,
                        fuzziness: '2',
                        boost: 3
                      }
                    }
                  },
                  // Look for any products containing similar letters
                  {
                    wildcard: {
                      'title': {
                        value: `*${q}*`,
                        boost: 2
                      }
                    }
                  },
                  // If user typed something like "bana", suggest "banana" products
                  {
                    wildcard: {
                      'title': {
                        value: `${q}*`,
                        boost: 4
                      }
                    }
                  }
                ]
              }
            },
            field_value_factor: {
              field: 'popularity',
              factor: 0.1,
              missing: 1
            },
            boost_mode: 'sum'
          }
        }
      };
      
      try {
        const fallbackResponse = await esClient.search(broadCategoryQuery);
        fallbackSuggestions = fallbackResponse.hits.hits.map(hit => ({
          id: hit._id,
          title: hit._source.title,
          category: hit._source.category,
          brand: hit._source.brand,
          popularity: hit._source.popularity,
          score: hit._score,
          highlight: hit.highlight || {}
        }));
      } catch (err) {
        console.error('Fallback search error:', err);
      }
      
      // Strategy 2: If still no results, get popular products from similar categories
      if (fallbackSuggestions.length === 0) {
        const popularQuery = {
          index: ES_INDEX,
          size: 5,
          query: {
            function_score: {
              query: { match_all: {} },
              field_value_factor: {
                field: 'popularity',
                factor: 1,
                missing: 1
              },
              boost_mode: 'sum'
            }
          },
          sort: [
            { popularity: { order: 'desc' } }
          ]
        };
        
        try {
          const popularResponse = await esClient.search(popularQuery);
          fallbackSuggestions = popularResponse.hits.hits.map(hit => ({
            id: hit._id,
            title: hit._source.title,
            category: hit._source.category,
            brand: hit._source.brand,
            popularity: hit._source.popularity,
            score: hit._score,
            highlight: hit.highlight || {}
          }));
        } catch (err) {
          console.error('Popular products search error:', err);
        }
      }
      
      return res.json(fallbackSuggestions);
    }

    res.json(allSuggestions);
  } catch (err) {
    console.error('Elasticsearch search error:', err.message || err);
    console.log('🔄 Falling back to comprehensive search...');
    
    // Fallback to comprehensive search if Elasticsearch fails
    try {
      const fallbackSuggestions = fallbackSearch.getSuggestions(q, 5);
      console.log(`✅ Fallback search returned ${fallbackSuggestions.length} suggestions`);
      res.json(fallbackSuggestions);
    } catch (fallbackErr) {
      console.error('Fallback search also failed:', fallbackErr.message || fallbackErr);
      res.status(500).json({ error: 'Search failed' });
    }
  }
});

// Add a search endpoint that uses the same logic as suggestions
router.get('/search', async (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  
  if (!q) {
    return res.json({
      query: q,
      results: [],
      pagination: {
        currentPage: page,
        totalPages: 0,
        totalResults: 0,
        hasNextPage: false,
        hasPrevPage: false,
        resultsPerPage: limit
      }
    });
  }

  try {
    // Use the same search logic as suggestions but with more results
    let response = await performElasticsearchSearch(q, { size: 100, includeHighlight: false });

    // If no results, try fallback to comprehensive search
    if (response.hits.hits.length === 0) {
      console.log('🔄 No Elasticsearch results, falling back to comprehensive search...');
      try {
        const fallbackResults = fallbackSearch.search(q, {}, { page, limit });
        return res.json(fallbackResults);
      } catch (fallbackErr) {
        console.error('Fallback search failed:', fallbackErr);
        return res.json({
          query: q,
          results: [],
          pagination: { currentPage: page, totalPages: 0, totalResults: 0, hasNextPage: false, hasPrevPage: false, resultsPerPage: limit }
        });
      }
    }

    // Format Elasticsearch results to match the expected format
    const allResults = response.hits.hits.map(hit => ({
      id: hit._id,
      title: hit._source.title,
      category: hit._source.category,
      brand: hit._source.brand,
      currentPrice: hit._source.currentPrice || hit._source.price,
      originalPrice: hit._source.originalPrice || hit._source.price,
      discount: hit._source.discount,
      rating: hit._source.rating,
      reviewCount: hit._source.reviewCount,
      image: hit._source.image,
      features: hit._source.features,
      popularity: hit._source.popularity,
      freeDelivery: hit._source.freeDelivery,
      cod: hit._source.cod,
      deliveryTime: hit._source.deliveryTime,
      score: hit._score
    }));

    // Apply pagination
    const totalResults = allResults.length;
    const totalPages = Math.ceil(totalResults / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = allResults.slice(startIndex, endIndex);

    res.json({
      query: q,
      results: paginatedResults,
      pagination: {
        currentPage: page,
        totalPages,
        totalResults,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        resultsPerPage: limit
      },
      processingTime: '15ms'
    });

  } catch (error) {
    console.error('Elasticsearch search error:', error);
    console.log('🔄 Falling back to comprehensive search...');
    
    try {
      const fallbackResults = fallbackSearch.search(q, {}, { page, limit });
      res.json(fallbackResults);
    } catch (fallbackErr) {
      console.error('All search methods failed:', fallbackErr);
      res.status(500).json({ error: 'Search failed' });
    }
  }
});

module.exports = router;
