// Script to generate 10,000 diverse products
const fs = require('fs');
const path = require('path');

// Define comprehensive categories and their product types
const categories = {
  "Electronics": {
    subcategories: ["Computers", "Mobiles", "Accessories", "Audio", "Gaming", "Cameras"],
    brands: ["Apple", "Samsung", "Sony", "Dell", "HP", "Lenovo", "Microsoft", "Google", "Xiaomi", "OnePlus"],
    products: [
      "Laptop", "Desktop", "Tablet", "Smartphone", "iPhone", "Android Phone", "Wireless Charger",
      "Power Bank", "USB Cable", "Bluetooth Speaker", "Headphones", "Earbuds", "Gaming Console",
      "Gaming Keyboard", "Gaming Mouse", "Monitor", "Webcam", "Router", "Smart TV", "Soundbar"
    ]
  },
  "Clothing": {
    subcategories: ["Men", "Women", "Kids", "Shoes", "Accessories"],
    brands: ["Nike", "Adidas", "Zara", "H&M", "Levi's", "Puma", "Reebok", "Calvin Klein", "Tommy Hilfiger", "Gap"],
    products: [
      "T-Shirt", "Jeans", "Shirt", "Dress", "Sweater", "Jacket", "Hoodie", "Pants", "Shorts",
      "Skirt", "Sneakers", "Boots", "Sandals", "Hat", "Cap", "Belt", "Bag", "Backpack", "Wallet"
    ]
  },
  "Food": {
    subcategories: ["Fruits", "Vegetables", "Snacks", "Beverages", "Dairy", "Grains"],
    brands: ["Organic Farm", "Fresh Market", "Healthy Choice", "Natural Foods", "Farm Fresh", "Pure Harvest"],
    products: [
      "Banana", "Apple", "Orange", "Mango", "Grapes", "Strawberry", "Pineapple", "Watermelon",
      "Carrot", "Tomato", "Potato", "Onion", "Broccoli", "Spinach", "Milk", "Cheese", "Yogurt",
      "Bread", "Rice", "Pasta", "Cereal", "Chips", "Cookies", "Juice", "Coffee", "Tea"
    ]
  },
  "Home": {
    subcategories: ["Furniture", "Kitchen", "Bathroom", "Bedroom", "Living Room", "Garden"],
    brands: ["IKEA", "Ashley", "Wayfair", "West Elm", "CB2", "Pottery Barn", "Home Depot", "Lowes"],
    products: [
      "Sofa", "Chair", "Table", "Bed", "Mattress", "Pillow", "Blanket", "Curtains", "Lamp",
      "Mirror", "Refrigerator", "Microwave", "Dishwasher", "Blender", "Toaster", "Coffee Maker",
      "Vacuum Cleaner", "Air Purifier", "Fan", "Heater", "Plants", "Vase", "Clock"
    ]
  },
  "Sports": {
    subcategories: ["Fitness", "Outdoor", "Team Sports", "Water Sports", "Winter Sports"],
    brands: ["Nike", "Adidas", "Under Armour", "Puma", "Reebok", "Wilson", "Spalding", "Coleman"],
    products: [
      "Treadmill", "Dumbbells", "Yoga Mat", "Basketball", "Football", "Soccer Ball", "Tennis Racket",
      "Golf Clubs", "Bicycle", "Skateboard", "Swimming Goggles", "Life Jacket", "Tent", "Sleeping Bag",
      "Hiking Boots", "Backpack", "Water Bottle", "Protein Powder", "Fitness Tracker"
    ]
  },
  "Beauty": {
    subcategories: ["Skincare", "Makeup", "Hair Care", "Fragrance", "Personal Care"],
    brands: ["L'Oreal", "Maybelline", "Revlon", "MAC", "Clinique", "Estee Lauder", "Nivea", "Dove"],
    products: [
      "Foundation", "Lipstick", "Mascara", "Eyeliner", "Blush", "Concealer", "Moisturizer",
      "Cleanser", "Serum", "Sunscreen", "Shampoo", "Conditioner", "Hair Oil", "Perfume",
      "Deodorant", "Toothpaste", "Toothbrush", "Body Wash", "Lotion", "Face Mask"
    ]
  },
  "Books": {
    subcategories: ["Fiction", "Non-Fiction", "Educational", "Children", "Comics", "Reference"],
    brands: ["Penguin", "Random House", "Harper Collins", "Simon & Schuster", "Macmillan", "Scholastic"],
    products: [
      "Novel", "Biography", "History Book", "Science Book", "Cookbook", "Travel Guide",
      "Dictionary", "Encyclopedia", "Textbook", "Children's Book", "Comic Book", "Magazine",
      "Poetry Book", "Self-Help Book", "Business Book", "Health Book", "Art Book"
    ]
  },
  "Toys": {
    subcategories: ["Educational", "Action Figures", "Dolls", "Games", "Outdoor", "Electronic"],
    brands: ["LEGO", "Mattel", "Hasbro", "Fisher-Price", "Barbie", "Hot Wheels", "Nerf", "VTech"],
    products: [
      "Building Blocks", "Action Figure", "Doll", "Board Game", "Puzzle", "Remote Control Car",
      "Drone", "Video Game", "Educational Toy", "Musical Toy", "Stuffed Animal", "Ball",
      "Bike", "Scooter", "Art Supplies", "Coloring Book", "Play Kitchen", "Tool Set"
    ]
  },
  "Automotive": {
    subcategories: ["Parts", "Accessories", "Tools", "Care", "Electronics"],
    brands: ["Bosch", "Michelin", "Goodyear", "Castrol", "Mobil", "AC Delco", "Champion", "NGK"],
    products: [
      "Tire", "Battery", "Oil Filter", "Air Filter", "Brake Pad", "Spark Plug", "Car Cover",
      "Floor Mat", "Seat Cover", "Dash Cam", "GPS", "Car Charger", "Jump Starter", "Tool Kit",
      "Car Wash", "Wax", "Air Freshener", "Phone Mount", "Sunshade", "Emergency Kit"
    ]
  },
  "Health": {
    subcategories: ["Vitamins", "Supplements", "Medical", "Fitness", "Personal Care"],
    brands: ["Nature Made", "Centrum", "One A Day", "Optimum Nutrition", "GNC", "CVS", "Walgreens"],
    products: [
      "Vitamin C", "Vitamin D", "Multivitamin", "Protein Powder", "Fish Oil", "Calcium",
      "Iron Supplement", "Probiotic", "First Aid Kit", "Thermometer", "Blood Pressure Monitor",
      "Pain Relief", "Allergy Medicine", "Cough Syrup", "Band Aid", "Hand Sanitizer", "Face Mask"
    ]
  }
};

// Color and size variations
const colors = ["Red", "Blue", "Green", "Black", "White", "Silver", "Gold", "Pink", "Purple", "Orange", "Yellow", "Gray", "Brown"];
const sizes = ["Small", "Medium", "Large", "XL", "XXL", "Mini", "Compact", "Pro", "Max", "Ultra", "Plus", "Lite"];
const descriptors = ["Premium", "Deluxe", "Professional", "Advanced", "Smart", "Digital", "Wireless", "Portable", "Eco-Friendly", "Organic", "Natural", "High-Quality"];

function generateProducts() {
  const products = [];
  let id = 1;

  // Generate products for each category
  Object.entries(categories).forEach(([mainCategory, data]) => {
    const { subcategories, brands, products: productTypes } = data;

    // Generate multiple variations for each product type
    productTypes.forEach(productType => {
      brands.forEach(brand => {
        subcategories.forEach(subcategory => {
          // Generate 3-5 variations per combination
          const variations = Math.floor(Math.random() * 3) + 3;
          
          for (let i = 0; i < variations; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = sizes[Math.floor(Math.random() * sizes.length)];
            const descriptor = descriptors[Math.floor(Math.random() * descriptors.length)];
            
            // Create varied product titles
            const titleVariations = [
              `${descriptor} ${productType}`,
              `${color} ${productType}`,
              `${productType} ${size}`,
              `${descriptor} ${color} ${productType}`,
              `${productType} ${size} ${color}`,
              `${brand} ${productType}`,
              `${brand} ${descriptor} ${productType}`,
              `${brand} ${productType} ${size}`
            ];

            const title = titleVariations[Math.floor(Math.random() * titleVariations.length)];
            const popularity = Math.floor(Math.random() * 200) + 10;

            products.push({
              id: id.toString(),
              title,
              category: subcategory,
              brand,
              popularity
            });

            id++;

            // Stop when we reach 10,000 products
            if (id > 10000) return;
          }
          if (id > 10000) return;
        });
        if (id > 10000) return;
      });
      if (id > 10000) return;
    });
    if (id > 10000) return;
  });

  return products.slice(0, 10000);
}

// Generate and save products
console.log('🏭 Generating 10,000 diverse products...');
const generatedProducts = generateProducts();

// Save to file
const outputPath = path.join(__dirname, 'data', 'products.json');
fs.writeFileSync(outputPath, JSON.stringify(generatedProducts, null, 2));

console.log(`✅ Generated ${generatedProducts.length} products and saved to ${outputPath}`);
console.log('📊 Product distribution:');

// Show category distribution
const categoryCount = {};
generatedProducts.forEach(product => {
  categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
});

Object.entries(categoryCount)
  .sort(([,a], [,b]) => b - a)
  .forEach(([category, count]) => {
    console.log(`   ${category}: ${count} products`);
  });

console.log('\n🎉 Ready to reindex! Run: node src/indexing/bulk_index.js');
