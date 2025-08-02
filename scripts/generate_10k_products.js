const fs = require('fs');
const path = require('path');

// Load existing comprehensive products
const existingProducts = JSON.parse(fs.readFileSync('../data/comprehensive_products.json', 'utf8'));

// Categories and subcategories for realistic product generation
const categories = {
    "Electronics": {
        "Mobile Phones": ["iPhone", "Samsung Galaxy", "OnePlus", "Xiaomi", "Oppo", "Vivo", "Realme", "Nokia", "Google Pixel", "Motorola"],
        "Laptops": ["MacBook", "Dell XPS", "HP Pavilion", "Lenovo ThinkPad", "ASUS", "Acer", "MSI", "Surface"],
        "Tablets": ["iPad", "Samsung Tab", "Lenovo Tab", "Amazon Fire", "Surface Pro"],
        "Headphones": ["Sony", "Bose", "JBL", "Sennheiser", "Audio-Technica", "Beats", "Skullcandy"],
        "Cameras": ["Canon", "Nikon", "Sony", "Fujifilm", "Olympus", "Panasonic"],
        "Smart Watches": ["Apple Watch", "Samsung Watch", "Fitbit", "Garmin", "Amazfit"],
        "Gaming": ["PlayStation", "Xbox", "Nintendo", "Steam Deck", "Gaming Mouse", "Gaming Keyboard"],
        "TV & Audio": ["Samsung TV", "LG TV", "Sony TV", "TCL", "Soundbar", "Home Theater"]
    },
    "Fashion": {
        "Men's Clothing": ["T-Shirt", "Shirt", "Jeans", "Trousers", "Hoodie", "Jacket", "Shorts"],
        "Women's Clothing": ["Dress", "Top", "Jeans", "Skirt", "Kurti", "Saree", "Leggings"],
        "Footwear": ["Sneakers", "Formal Shoes", "Sandals", "Boots", "Heels", "Flats"],
        "Accessories": ["Watch", "Belt", "Wallet", "Bag", "Sunglasses", "Jewelry"],
        "Kids Wear": ["Kids T-Shirt", "Kids Dress", "Kids Shoes", "Kids Jacket"]
    },
    "Home & Kitchen": {
        "Furniture": ["Sofa", "Bed", "Dining Table", "Chair", "Wardrobe", "Bookshelf"],
        "Kitchen Appliances": ["Mixer", "Microwave", "Refrigerator", "Blender", "Rice Cooker"],
        "Home Decor": ["Wall Art", "Cushions", "Curtains", "Rugs", "Lamps"],
        "Storage": ["Storage Box", "Organizer", "Hangers", "Shoe Rack"]
    },
    "Books": {
        "Fiction": ["Novel", "Mystery", "Romance", "Sci-Fi", "Fantasy"],
        "Non-Fiction": ["Biography", "Self-Help", "Business", "History", "Science"],
        "Educational": ["Textbook", "Reference", "Study Guide", "Workbook"],
        "Children": ["Picture Book", "Story Book", "Educational Book"]
    },
    "Sports": {
        "Fitness": ["Dumbbell", "Yoga Mat", "Treadmill", "Exercise Bike", "Resistance Band"],
        "Outdoor": ["Football", "Cricket Bat", "Tennis Racket", "Badminton"],
        "Sportswear": ["Track Suit", "Sports Shoes", "Gym Wear", "Swimming Costume"]
    },
    "Beauty": {
        "Skincare": ["Face Cream", "Cleanser", "Moisturizer", "Sunscreen", "Face Mask"],
        "Makeup": ["Lipstick", "Foundation", "Mascara", "Eyeshadow", "Blush"],
        "Hair Care": ["Shampoo", "Conditioner", "Hair Oil", "Hair Dryer"],
        "Fragrance": ["Perfume", "Deodorant", "Body Spray"]
    }
};

const brands = {
    "Electronics": ["Apple", "Samsung", "Sony", "LG", "Dell", "HP", "Lenovo", "ASUS", "OnePlus", "Xiaomi", "Oppo", "Vivo", "Realme", "Nokia", "Google", "Microsoft"],
    "Fashion": ["Nike", "Adidas", "Puma", "Levis", "H&M", "Zara", "Uniqlo", "Gap", "Forever 21", "Mango", "Biba", "W", "AND"],
    "Home & Kitchen": ["IKEA", "Godrej", "Whirlpool", "LG", "Samsung", "Bosch", "Prestige", "Pigeon", "Butterfly"],
    "Books": ["Penguin", "Harper Collins", "Scholastic", "Oxford", "Cambridge", "McGraw Hill", "Pearson"],
    "Sports": ["Nike", "Adidas", "Puma", "Reebok", "Under Armour", "Decathlon", "Yonex", "Wilson"],
    "Beauty": ["Lakme", "Maybelline", "L'Oreal", "Revlon", "MAC", "Nykaa", "Biotique", "Himalaya"]
};

const adjectives = ["Premium", "Ultra", "Pro", "Max", "Plus", "Elite", "Advanced", "Smart", "Digital", "Wireless", "Bluetooth", "HD", "4K", "Professional", "Deluxe", "Superior", "Classic", "Modern", "Stylish", "Comfortable"];

const colors = ["Black", "White", "Blue", "Red", "Green", "Silver", "Gold", "Rose Gold", "Space Gray", "Midnight", "Purple", "Pink", "Orange", "Yellow", "Brown", "Gray"];

// Function to generate realistic product names
function generateProductName(category, subcategory, brand, product) {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const model = Math.random() > 0.7 ? ` ${Math.floor(Math.random() * 9000) + 1000}` : '';
    
    const variations = [
        `${brand} ${adj} ${product}${model}`,
        `${brand} ${product} ${adj}${model}`,
        `${adj} ${brand} ${product}${model}`,
        `${brand} ${product}${model} - ${color}`,
        `${brand} ${adj} ${product} ${color}${model}`
    ];
    
    return variations[Math.floor(Math.random() * variations.length)];
}

// Function to generate realistic prices
function generatePrice(category, subcategory) {
    const priceRanges = {
        "Electronics": {
            "Mobile Phones": [8000, 150000],
            "Laptops": [25000, 200000],
            "Tablets": [8000, 80000],
            "Headphones": [500, 50000],
            "Cameras": [15000, 300000],
            "Smart Watches": [2000, 80000],
            "Gaming": [1000, 100000],
            "TV & Audio": [10000, 200000]
        },
        "Fashion": {
            "Men's Clothing": [300, 5000],
            "Women's Clothing": [400, 8000],
            "Footwear": [500, 15000],
            "Accessories": [200, 10000],
            "Kids Wear": [200, 2000]
        },
        "Home & Kitchen": {
            "Furniture": [2000, 50000],
            "Kitchen Appliances": [1000, 80000],
            "Home Decor": [200, 10000],
            "Storage": [100, 5000]
        },
        "Books": {
            "Fiction": [150, 800],
            "Non-Fiction": [200, 1500],
            "Educational": [300, 2000],
            "Children": [100, 600]
        },
        "Sports": {
            "Fitness": [500, 50000],
            "Outdoor": [200, 10000],
            "Sportswear": [300, 5000]
        },
        "Beauty": {
            "Skincare": [100, 3000],
            "Makeup": [150, 5000],
            "Hair Care": [100, 2000],
            "Fragrance": [300, 8000]
        }
    };
    
    const range = priceRanges[category]?.[subcategory] || [100, 5000];
    const min = range[0];
    const max = range[1];
    return Math.floor(Math.random() * (max - min) + min);
}

// Function to generate features based on category
function generateFeatures(category, subcategory, product) {
    const featuresByCategory = {
        "Electronics": {
            "Mobile Phones": ["High-resolution camera", "Fast charging", "Large battery", "5G connectivity", "Water resistant", "Face unlock", "Fingerprint sensor"],
            "Laptops": ["Intel processor", "SSD storage", "Full HD display", "Backlit keyboard", "Long battery life", "Lightweight design", "Fast boot"],
            "Headphones": ["Noise cancellation", "Wireless connectivity", "Long battery life", "Superior sound quality", "Comfortable fit"],
            "default": ["High quality", "Durable build", "Modern design", "User-friendly", "Energy efficient"]
        },
        "Fashion": {
            "default": ["Comfortable fit", "Premium fabric", "Stylish design", "Easy care", "Durable material", "Trendy look"]
        },
        "Home & Kitchen": {
            "default": ["Easy to use", "Durable construction", "Space-saving design", "Easy maintenance", "High quality materials"]
        },
        "Books": {
            "default": ["Engaging content", "High-quality paper", "Easy to read", "Informative", "Well-researched"]
        },
        "Sports": {
            "default": ["High performance", "Durable construction", "Comfortable grip", "Professional quality", "Weather resistant"]
        },
        "Beauty": {
            "default": ["Natural ingredients", "Long-lasting", "Gentle formula", "Dermatologically tested", "Easy application"]
        }
    };
    
    const categoryFeatures = featuresByCategory[category] || featuresByCategory["default"];
    const subcategoryFeatures = categoryFeatures[subcategory] || categoryFeatures["default"];
    
    // Select 3-5 random features
    const numFeatures = Math.floor(Math.random() * 3) + 3;
    const selectedFeatures = [];
    const availableFeatures = [...subcategoryFeatures];
    
    for (let i = 0; i < numFeatures && availableFeatures.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availableFeatures.length);
        selectedFeatures.push(availableFeatures.splice(randomIndex, 1)[0]);
    }
    
    return selectedFeatures;
}

// Function to generate a single product
function generateProduct(id) {
    // Select random category and subcategory
    const categoryKeys = Object.keys(categories);
    const selectedCategory = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
    const subcategoryKeys = Object.keys(categories[selectedCategory]);
    const selectedSubcategory = subcategoryKeys[Math.floor(Math.random() * subcategoryKeys.length)];
    const products = categories[selectedCategory][selectedSubcategory];
    const selectedProduct = products[Math.floor(Math.random() * products.length)];
    
    // Select random brand
    const categoryBrands = brands[selectedCategory] || brands["Electronics"];
    const selectedBrand = categoryBrands[Math.floor(Math.random() * categoryBrands.length)];
    
    // Generate product details
    const title = generateProductName(selectedCategory, selectedSubcategory, selectedBrand, selectedProduct);
    const currentPrice = generatePrice(selectedCategory, selectedSubcategory);
    const originalPrice = Math.floor(currentPrice * (1 + Math.random() * 0.5 + 0.1)); // 10-60% markup
    const discount = Math.floor(((originalPrice - currentPrice) / originalPrice) * 100);
    const rating = Math.round((Math.random() * 2 + 3) * 10) / 10; // 3.0 - 5.0
    const reviewCount = Math.floor(Math.random() * 5000) + 50;
    const features = generateFeatures(selectedCategory, selectedSubcategory, selectedProduct);
    
    return {
        id: id.toString(),
        title: title,
        brand: selectedBrand,
        category: `${selectedCategory} > ${selectedSubcategory}`,
        currentPrice: currentPrice,
        originalPrice: originalPrice,
        discount: discount,
        rating: rating,
        reviewCount: reviewCount,
        image: `https://images.example.com/products/${selectedCategory.toLowerCase().replace(/\s+/g, '-')}/${selectedBrand.toLowerCase()}-${id}-main.jpg`,
        images: [
            `https://images.example.com/products/${selectedCategory.toLowerCase().replace(/\s+/g, '-')}/${selectedBrand.toLowerCase()}-${id}-main.jpg`,
            `https://images.example.com/products/${selectedCategory.toLowerCase().replace(/\s+/g, '-')}/${selectedBrand.toLowerCase()}-${id}-side.jpg`,
            `https://images.example.com/products/${selectedCategory.toLowerCase().replace(/\s+/g, '-')}/${selectedBrand.toLowerCase()}-${id}-back.jpg`,
            `https://images.example.com/products/${selectedCategory.toLowerCase().replace(/\s+/g, '-')}/${selectedBrand.toLowerCase()}-${id}-detail.jpg`
        ],
        description: `${title} designed for modern lifestyle. Combines functionality with style for the best user experience.`,
        specifications: {
            "Brand": selectedBrand,
            "Model": "Latest Model",
            "Color": "Multiple Colors Available",
            "Warranty": "1 Year Manufacturer Warranty"
        },
        features: features,
        offers: [
            "Bank Offer: 10% off with HDFC Bank Cards",
            "Exchange Offer: Up to ₹15,000 off"
        ],
        tags: [
            selectedBrand.toLowerCase(),
            selectedCategory.toLowerCase().replace(/\s+/g, ' '),
            selectedBrand.toLowerCase(),
            selectedProduct.toLowerCase(),
            selectedSubcategory.toLowerCase().replace(/\s+/g, ' '),
            "trending",
            "popular",
            "best-seller"
        ],
        sku: `${selectedBrand.toUpperCase()}-${id}-${selectedSubcategory.toUpperCase().replace(/\s+/g, '')}`,
        inStock: Math.random() > 0.1, // 90% in stock
        bestseller: Math.random() > 0.9, // 10% bestsellers
        newArrival: Math.random() > 0.95, // 5% new arrivals
        warranty: Math.random() > 0.5 ? "1 Year Warranty" : "6 Months Warranty",
        returnPolicy: "7 days return policy",
        seller: ["Flipkart Retail", "Appario Retail", "SuperComNet", "RetailNet"][Math.floor(Math.random() * 4)],
        variants: [
            { name: "Standard", priceModifier: 0 },
            { name: "Premium", priceModifier: 1000 }
        ],
        availability: Math.random() > 0.05 ? "In Stock" : "Out of Stock",
        deliveryTime: `${Math.floor(Math.random() * 7) + 1} days`,
        cod: Math.random() > 0.3, // 70% COD available
        freeDelivery: Math.random() > 0.2, // 80% free delivery
        localOffers: Math.random() > 0.5 ? ["Same day delivery available", "Local pickup available"] : ["Same day delivery available"]
    };
}

console.log('🚀 Starting 10K product generation...');
console.log(`📊 Current products: ${existingProducts.length}`);

// Generate products to reach 10,000 total
const targetCount = 10000;
const productsToGenerate = targetCount - existingProducts.length;
const allProducts = [...existingProducts];

console.log(`📝 Generating ${productsToGenerate} new products...`);

// Generate new products
for (let i = existingProducts.length + 1; i <= targetCount; i++) {
    const newProduct = generateProduct(i);
    allProducts.push(newProduct);
    
    // Progress indicator
    if (i % 1000 === 0) {
        console.log(`✅ Generated ${i} products...`);
    }
}

// Save the expanded dataset
const outputFile = '../data/comprehensive_products_10k.json';
fs.writeFileSync(outputFile, JSON.stringify(allProducts, null, 2));

console.log(`🎉 Successfully generated ${targetCount} products!`);
console.log(`💾 Saved to: ${outputFile}`);
console.log(`📈 Dataset expanded from ${existingProducts.length} to ${allProducts.length} products`);

// Also create a backup of original
const backupFile = '../data/comprehensive_products_412_backup.json';
fs.writeFileSync(backupFile, JSON.stringify(existingProducts, null, 2));
console.log(`🔄 Original 412 products backed up to: ${backupFile}`);

// Replace the main file
fs.writeFileSync('../data/comprehensive_products.json', JSON.stringify(allProducts, null, 2));
console.log(`🔄 Updated main comprehensive_products.json with 10K products`);

console.log('\n🎯 Next steps:');
console.log('1. Run: npm run reindex');
console.log('2. Start: npm start');
console.log('3. Search will now have 10,000 products indexed!');
