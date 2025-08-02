require('dotenv').config();
const { esClient, ES_INDEX } = require('../config/es');
const fs = require('fs');
const path = require('path');

const products = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../data/comprehensive_products.json'), 'utf-8')
);

async function bulkIndex() {
  try {
    const exists = await esClient.indices.exists({ index: ES_INDEX });
    if (exists) {
      await esClient.indices.delete({ index: ES_INDEX });
      console.log(`🗑️ Deleted existing index "${ES_INDEX}"`);
    }

    await esClient.indices.create({
      index: ES_INDEX,
      body: {
        settings: {
          analysis: {
            normalizer: {
              lowercase: {
                type: 'custom',
                filter: ['lowercase']
              }
            },
            filter: {
              autocomplete_filter: {
                type: 'edge_ngram',
                min_gram: 2,
                max_gram: 20
              },
              synonym_filter: {
                type: 'synonym',
                synonyms: [
                  // Fruit synonyms - bidirectional for better matching
                  "banana,fruit,yellow fruit,tropical fruit",
                  "apple,fruit,red fruit,healthy snack",
                  "orange,fruit,citrus,vitamin c",
                  "mango,fruit,tropical fruit,sweet fruit",
                  "strawberry,fruit,berry,red berry",
                  "grape,fruit,cluster,wine fruit",
                  "pineapple,fruit,tropical fruit,sweet",
                  
                  // Electronics synonyms
                  "laptop => computer,pc,notebook,portable computer",
                  "mobile => phone,smartphone,cell phone,handset",
                  "wireless => bluetooth,cordless,cable-free",
                  "smart => intelligent,connected,iot",
                  "watch => timepiece,wearable",
                  "tv => television,display,screen",
                  "earbuds => headphones,earphones,audio",
                  "monitor => display,screen,lcd",
                  "tablet => ipad,slate,touchscreen",
                  
                  // Clothing synonyms
                  "shirt => top,blouse,clothing",
                  "pants => trousers,jeans,bottoms",
                  "shoes => footwear,sneakers,boots",
                  "jacket => coat,outerwear,blazer",
                  "dress => gown,outfit,clothing",
                  
                  // Home synonyms
                  "sofa => couch,furniture,seating",
                  "bed => mattress,furniture,bedroom",
                  "table => desk,furniture,surface",
                  "chair => seat,furniture,seating",
                  "lamp => light,lighting,illumination",
                  
                  // Food synonyms - bidirectional
                  "snack,food,treat,munch",
                  "drink,beverage,liquid,refreshment",
                  "dairy,milk,cheese,yogurt",
                  "vegetable,veggie,produce,healthy",
                  "bread,bakery,carbs,food",
                  
                  // Sports synonyms
                  "fitness => exercise,workout,health",
                  "ball => sports,game,round",
                  "bike => bicycle,cycling,transport",
                  "gym => fitness,exercise,workout",
                  
                  // Beauty synonyms
                  "makeup => cosmetics,beauty,face",
                  "skincare => beauty,face,skin",
                  "perfume => fragrance,scent,smell",
                  "hair => hairstyle,locks,beauty",
                  
                  // Category synonyms
                  "computer => laptop,pc,desktop,technology",
                  "phone => mobile,smartphone,cellular,communication",
                  "audio => sound,music,speaker,headphone",
                  "clothing => apparel,fashion,wear,dress",
                  "food => eat,nutrition,meal,cuisine",
                  "home => house,domestic,living,furniture",
                  "health => medical,wellness,care,fitness",
                  "book => reading,literature,text,novel",
                  "toy => play,game,fun,children",
                  "car => auto,vehicle,transport,automotive"
                ]
              }
            },
            analyzer: {
              autocomplete: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'autocomplete_filter']
              },
              autocomplete_with_synonyms: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'synonym_filter', 'autocomplete_filter']
              }
            }
          }
        },
        mappings: {
          properties: {
            title: {
              type: 'text',
              analyzer: 'autocomplete_with_synonyms',
              search_analyzer: 'standard',
              fields: {
                raw: {
                  type: 'text',
                  analyzer: 'autocomplete'
                },
                keyword: {
                  type: 'keyword'
                },
                lowercase: {
                  type: 'keyword',
                  normalizer: 'lowercase'
                }
              }
            },
            category: { 
              type: 'text',
              analyzer: 'autocomplete_with_synonyms',
              search_analyzer: 'standard',
              fields: {
                keyword: {
                  type: 'keyword'
                }
              }
            },
            brand: { 
              type: 'text',
              analyzer: 'autocomplete_with_synonyms',
              search_analyzer: 'standard',
              fields: {
                keyword: {
                  type: 'keyword'
                }
              }
            },
            popularity: { type: 'integer' }
          }
        }
      }
    });

    console.log(`✅ Created index "${ES_INDEX}" with autocomplete analyzer`);

    const body = products.flatMap((doc) => [
      { index: { _index: ES_INDEX, _id: doc.id } },
      doc
    ]);

    const { errors, items } = await esClient.bulk({ refresh: true, body });

    if (errors) {
      console.error('❌ Bulk indexing errors:', items);
    } else {
      console.log(`✅ Indexed ${items.length} products`);
    }
  } catch (err) {
    console.error('❌ Bulk indexing failed:', err.message || err);
  }
}

bulkIndex();
