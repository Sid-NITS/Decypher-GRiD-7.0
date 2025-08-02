// src/search/suggest.js

const express = require('express');
const router = express.Router();
const { esClient, ES_INDEX } = require('../config/es');

router.get('/suggest', async (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  if (!q) return res.json([]);

  try {
    // Build a comprehensive query that handles different scenarios
    const searchQuery = {
      index: ES_INDEX,
      size: 5,
      query: {
        function_score: {
          query: {
            bool: {
              should: [
                // 1. Exact title prefix matches (highest priority) - case insensitive
                {
                  prefix: {
                    'title.lowercase': {
                      value: q,
                      boost: 25
                    }
                  }
                },
                // 2. Title starts with query (very high priority)
                {
                  prefix: {
                    'title': {
                      value: q,
                      boost: 20
                    }
                  }
                },
                // 3. Exact title matches
                {
                  term: {
                    'title.keyword': {
                      value: q,
                      boost: 18
                    }
                  }
                },
                // 3. Category prefix match (high priority)
                {
                  prefix: {
                    'category.keyword': {
                      value: q,
                      boost: 15
                    }
                  }
                },
                // 4. Brand prefix match
                {
                  prefix: {
                    'brand.keyword': {
                      value: q,
                      boost: 12
                    }
                  }
                },
                // 5. Title autocomplete with synonyms (using edge ngrams + synonyms)
                {
                  match: {
                    title: {
                      query: q,
                      operator: 'and',
                      boost: 10
                    }
                  }
                },
                // 6. Category autocomplete with synonyms
                {
                  match: {
                    category: {
                      query: q,
                      operator: 'and',
                      boost: 8
                    }
                  }
                },
                // 7. Brand autocomplete with synonyms
                {
                  match: {
                    brand: {
                      query: q,
                      operator: 'and',
                      boost: 6
                    }
                  }
                },
                // 8. Title partial match (OR operator for broader results) - lower priority
                {
                  match: {
                    title: {
                      query: q,
                      operator: 'or',
                      boost: 3
                    }
                  }
                },
                // 9. Category partial match for short queries - much lower priority
                {
                  wildcard: {
                    'category.keyword': {
                      value: `*${q}*`,
                      boost: 2
                    }
                  }
                },
                // 10. Brand partial match - lower priority
                {
                  wildcard: {
                    'brand.keyword': {
                      value: `*${q}*`,
                      boost: 1.5
                    }
                  }
                },
                // 11. Title wildcard for any character matches - lowest priority
                {
                  wildcard: {
                    'title': {
                      value: `*${q}*`,
                      boost: 1
                    }
                  }
                }
              ],
              minimum_should_match: 1
            }
          },
          field_value_factor: {
            field: 'popularity',
            factor: 0.01, // Reduced popularity factor so relevance matters more
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

    let response = await esClient.search(searchQuery);

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
    console.error('Search error:', err.message || err);
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;
