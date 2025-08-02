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

router.get('/suggest', async (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  if (!q) return res.json([]);

  try {
    let response = await performElasticsearchSearch(q, { size: 8, includeHighlight: true });

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

    // 3) Format results
    const suggestions = response.hits.hits.map(hit => ({
      id:        hit._id,
      title:     hit._source.title,
      category:  hit._source.category,
      brand:     hit._source.brand,
      popularity:hit._source.popularity,
      score:     hit._score,
      highlight: hit.highlight || {}
    }));

    // 4) If still no results from specific search, provide broader suggestions
    if (suggestions.length === 0) {
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

    res.json(suggestions);
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
