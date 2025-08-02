const fs = require('fs');

// Enhanced product generation with complete Flipkart-like data
function generateComprehensiveProducts() {
    const categories = {
        'Electronics': {
            'Smartphones': ['Samsung', 'Apple', 'OnePlus', 'Xiaomi', 'Oppo', 'Vivo', 'Realme', 'Google'],
            'Laptops': ['Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'Apple', 'MSI', 'Samsung'],
            'Tablets': ['Apple', 'Samsung', 'Lenovo', 'Amazon', 'Microsoft'],
            'Headphones': ['Sony', 'Bose', 'JBL', 'Sennheiser', 'Audio-Technica', 'Beats'],
            'Cameras': ['Canon', 'Nikon', 'Sony', 'Fujifilm', 'Panasonic'],
            'Smart TVs': ['Samsung', 'LG', 'Sony', 'TCL', 'Hisense', 'OnePlus']
        },
        'Fashion': {
            'Men Clothing': ['Nike', 'Adidas', 'Puma', 'Levi\'s', 'H&M', 'Zara', 'Calvin Klein'],
            'Women Clothing': ['Zara', 'H&M', 'Forever 21', 'Vero Moda', 'Only', 'AND'],
            'Footwear': ['Nike', 'Adidas', 'Puma', 'Reebok', 'Converse', 'Vans'],
            'Watches': ['Casio', 'Titan', 'Fastrack', 'Apple', 'Samsung', 'Fossil']
        },
        'Home & Kitchen': {
            'Furniture': ['IKEA', 'Godrej', 'Durian', 'Urban Ladder', 'Pepperfry'],
            'Kitchen Appliances': ['LG', 'Samsung', 'Whirlpool', 'IFB', 'Bosch'],
            'Home Decor': ['HomeTown', 'Fabindia', 'Chumbak', 'Saaj'],
            'Bedding': ['Bombay Dyeing', 'Portico', 'Spaces', 'D\'Decor']
        },
        'Books': {
            'Fiction': ['Penguin', 'HarperCollins', 'Random House', 'Scholastic'],
            'Non-Fiction': ['Penguin', 'HarperCollins', 'Bloomsbury', 'Rupa'],
            'Educational': ['NCERT', 'Arihant', 'Pearson', 'McGraw Hill']
        },
        'Sports': {
            'Cricket': ['MRF', 'SG', 'Kookaburra', 'Gray-Nicolls'],
            'Football': ['Nike', 'Adidas', 'Puma', 'Umbro'],
            'Fitness': ['Decathlon', 'Cosco', 'Nivia', 'Vector X']
        }
    };

    const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];
    
    const products = [];
    let productId = 1;

    Object.entries(categories).forEach(([mainCategory, subCategories]) => {
        Object.entries(subCategories).forEach(([subCategory, brands]) => {
            brands.forEach(brand => {
                // Generate 3-5 products per brand per subcategory
                const numProducts = Math.floor(Math.random() * 3) + 3;
                
                for (let i = 0; i < numProducts; i++) {
                    const product = generateProduct(productId++, mainCategory, subCategory, brand, locations);
                    products.push(product);
                }
            });
        });
    });

    return products;
}

function generateProduct(id, mainCategory, subCategory, brand, locations) {
    const productNames = {
        'Smartphones': ['Pro Max', 'Ultra', 'Plus', 'Note', 'Edge', 'Prime', 'Lite', 'Mini'],
        'Laptops': ['Inspiron', 'ThinkPad', 'MacBook', 'Pavilion', 'VivoBook', 'IdeaPad'],
        'Tablets': ['iPad', 'Tab', 'Surface', 'Fire', 'MatePad'],
        'Headphones': ['WH-1000XM', 'QuietComfort', 'Studio', 'Solo', 'Free'],
        'Cameras': ['EOS', 'Alpha', 'Lumix', 'X-T', 'D7500'],
        'Smart TVs': ['QLED', 'OLED', 'Crystal UHD', 'NanoCell', 'Bravia'],
        'Men Clothing': ['T-Shirt', 'Shirt', 'Jeans', 'Jacket', 'Hoodie', 'Polo'],
        'Women Clothing': ['Dress', 'Top', 'Kurti', 'Jeans', 'Saree', 'Leggings'],
        'Footwear': ['Running Shoes', 'Sneakers', 'Formal Shoes', 'Sandals', 'Boots'],
        'Watches': ['Smart Watch', 'Digital Watch', 'Analog Watch', 'Chronograph'],
        'Furniture': ['Sofa', 'Bed', 'Wardrobe', 'Dining Table', 'Chair', 'Bookshelf'],
        'Kitchen Appliances': ['Refrigerator', 'Washing Machine', 'Microwave', 'Mixer', 'Air Fryer'],
        'Home Decor': ['Wall Art', 'Vase', 'Cushions', 'Curtains', 'Lamp', 'Mirror'],
        'Bedding': ['Bedsheet', 'Comforter', 'Pillow', 'Blanket', 'Mattress'],
        'Fiction': ['Novel', 'Mystery', 'Romance', 'Thriller', 'Fantasy'],
        'Non-Fiction': ['Biography', 'Self-Help', 'History', 'Science', 'Business'],
        'Educational': ['Textbook', 'Guide', 'Question Bank', 'Reference'],
        'Cricket': ['Bat', 'Ball', 'Pads', 'Helmet', 'Gloves'],
        'Football': ['Football', 'Boots', 'Jersey', 'Shin Guards'],
        'Fitness': ['Dumbbells', 'Treadmill', 'Yoga Mat', 'Resistance Bands']
    };

    const names = productNames[subCategory] || ['Product'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    
    const title = `${brand} ${randomName} ${generateModelNumber()}`;
    
    // Generate realistic pricing based on category
    const basePrice = getPriceRange(subCategory);
    const originalPrice = Math.floor(Math.random() * (basePrice.max - basePrice.min) + basePrice.min);
    const discount = Math.floor(Math.random() * 40) + 5; // 5-45% discount
    const currentPrice = Math.floor(originalPrice * (1 - discount / 100));

    // Generate location-specific data
    const locationData = {};
    locations.forEach(location => {
        locationData[location] = {
            availability: Math.random() > 0.1 ? 'In Stock' : 'Out of Stock',
            deliveryTime: `${Math.floor(Math.random() * 7) + 1} days`,
            cod: Math.random() > 0.2,
            freeDelivery: Math.random() > 0.3,
            localOffers: generateLocalOffers()
        };
    });

    return {
        id: id.toString(),
        title,
        category: `${mainCategory} > ${subCategory}`,
        brand,
        originalPrice,
        currentPrice,
        discount,
        rating: +(Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
        reviewCount: Math.floor(Math.random() * 10000) + 100,
        popularity: Math.floor(Math.random() * 100) + 1,
        image: generateImageUrl(subCategory, brand, id),
        images: generateMultipleImages(subCategory, brand, id),
        description: generateDescription(title, subCategory),
        specifications: generateSpecifications(subCategory),
        features: generateFeatures(subCategory),
        offers: generateOffers(),
        locationData,
        tags: generateTags(title, brand, subCategory),
        sku: `${brand.toUpperCase()}-${id}-${subCategory.replace(/\s+/g, '').toUpperCase()}`,
        inStock: Math.random() > 0.1,
        fastDelivery: Math.random() > 0.3,
        bestseller: Math.random() > 0.8,
        newArrival: Math.random() > 0.9,
        warranty: generateWarranty(subCategory),
        returnPolicy: '7 days return policy',
        seller: generateSeller(),
        variants: generateVariants(subCategory),
        relatedProducts: [], // Will be populated later
        searchKeywords: generateSearchKeywords(title, brand, subCategory)
    };
}

function generateModelNumber() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function getPriceRange(subCategory) {
    const ranges = {
        'Smartphones': { min: 8000, max: 80000 },
        'Laptops': { min: 25000, max: 150000 },
        'Tablets': { min: 10000, max: 60000 },
        'Headphones': { min: 1000, max: 25000 },
        'Cameras': { min: 15000, max: 200000 },
        'Smart TVs': { min: 20000, max: 200000 },
        'Men Clothing': { min: 300, max: 3000 },
        'Women Clothing': { min: 400, max: 4000 },
        'Footwear': { min: 800, max: 8000 },
        'Watches': { min: 500, max: 50000 },
        'Furniture': { min: 2000, max: 50000 },
        'Kitchen Appliances': { min: 3000, max: 80000 },
        'Home Decor': { min: 200, max: 5000 },
        'Bedding': { min: 300, max: 3000 },
        'Fiction': { min: 100, max: 800 },
        'Non-Fiction': { min: 150, max: 1200 },
        'Educational': { min: 200, max: 2000 },
        'Cricket': { min: 500, max: 15000 },
        'Football': { min: 300, max: 5000 },
        'Fitness': { min: 500, max: 50000 }
    };
    return ranges[subCategory] || { min: 500, max: 5000 };
}

function generateImageUrl(subCategory, brand, id) {
    // Simulated image URLs (in real implementation, these would be actual product images)
    const baseUrl = `https://images.example.com/products/${subCategory.toLowerCase().replace(/\s+/g, '-')}`;
    return `${baseUrl}/${brand.toLowerCase()}-${id}-main.jpg`;
}

function generateMultipleImages(subCategory, brand, id) {
    const baseUrl = `https://images.example.com/products/${subCategory.toLowerCase().replace(/\s+/g, '-')}`;
    return [
        `${baseUrl}/${brand.toLowerCase()}-${id}-main.jpg`,
        `${baseUrl}/${brand.toLowerCase()}-${id}-side.jpg`,
        `${baseUrl}/${brand.toLowerCase()}-${id}-back.jpg`,
        `${baseUrl}/${brand.toLowerCase()}-${id}-detail.jpg`
    ];
}

function generateDescription(title, subCategory) {
    const descriptions = {
        'Smartphones': `Experience the ${title} with cutting-edge technology, stunning display, and powerful performance. Perfect for photography, gaming, and productivity.`,
        'Laptops': `The ${title} delivers exceptional performance for work and entertainment. Features latest processor, ample storage, and premium build quality.`,
        'Headphones': `Immerse yourself in superior sound quality with the ${title}. Features noise cancellation and comfortable design for extended use.`,
        default: `Premium quality ${title} designed for modern lifestyle. Combines functionality with style for the best user experience.`
    };
    return descriptions[subCategory] || descriptions.default;
}

function generateSpecifications(subCategory) {
    const specs = {
        'Smartphones': {
            'Display': '6.1" Super Retina XDR',
            'Processor': 'A15 Bionic chip',
            'RAM': '6GB',
            'Storage': '128GB',
            'Camera': '48MP + 12MP',
            'Battery': '3279mAh',
            'OS': 'iOS 15'
        },
        'Laptops': {
            'Processor': 'Intel Core i5 11th Gen',
            'RAM': '8GB DDR4',
            'Storage': '512GB SSD',
            'Display': '15.6" FHD',
            'Graphics': 'Intel Iris Xe',
            'OS': 'Windows 11',
            'Battery': 'Up to 8 hours'
        },
        default: {
            'Brand': 'Premium Brand',
            'Model': 'Latest Model',
            'Color': 'Multiple Colors Available',
            'Warranty': '1 Year Manufacturer Warranty'
        }
    };
    return specs[subCategory] || specs.default;
}

function generateFeatures(subCategory) {
    const features = {
        'Smartphones': ['Face ID', 'Wireless Charging', 'Water Resistant', '5G Ready', 'Dual SIM'],
        'Laptops': ['Backlit Keyboard', 'Fingerprint Scanner', 'Fast Charging', 'Type-C Port', 'HD Webcam'],
        'Headphones': ['Noise Cancellation', 'Wireless', 'Long Battery Life', 'Quick Charge', 'Voice Assistant'],
        default: ['Premium Quality', 'Durable Build', 'Easy to Use', 'Value for Money', 'Trusted Brand']
    };
    return features[subCategory] || features.default;
}

function generateOffers() {
    const offers = [
        'Bank Offer: 10% off with HDFC Bank Cards',
        'Exchange Offer: Up to ₹15,000 off',
        'No Cost EMI available',
        'Special Price for first 100 customers',
        'Buy 2 Get 1 Free on accessories'
    ];
    return offers.slice(0, Math.floor(Math.random() * 3) + 2);
}

function generateLocalOffers() {
    const localOffers = [
        'Same day delivery available',
        'Local pickup available',
        'Regional festival discount',
        'City-specific cashback offer'
    ];
    return localOffers.slice(0, Math.floor(Math.random() * 2) + 1);
}

function generateTags(title, brand, subCategory) {
    const commonTags = [brand.toLowerCase(), subCategory.toLowerCase()];
    const titleWords = title.toLowerCase().split(' ');
    return [...commonTags, ...titleWords, 'trending', 'popular', 'best-seller'];
}

function generateWarranty(subCategory) {
    const warranties = {
        'Smartphones': '1 Year Manufacturer Warranty',
        'Laptops': '1 Year International Warranty',
        'Headphones': '6 Months Warranty',
        'Kitchen Appliances': '2 Years Comprehensive Warranty',
        default: '1 Year Warranty'
    };
    return warranties[subCategory] || warranties.default;
}

function generateSeller() {
    const sellers = [
        'Flipkart Retail',
        'Cloudtail India',
        'Appario Retail',
        'SuperComNet',
        'TechnoWorld',
        'RetailNet',
        'Omnitech Retail'
    ];
    return sellers[Math.floor(Math.random() * sellers.length)];
}

function generateVariants(subCategory) {
    const variants = {
        'Smartphones': [
            { name: '128GB', priceModifier: 0 },
            { name: '256GB', priceModifier: 10000 },
            { name: '512GB', priceModifier: 20000 }
        ],
        'Clothing': [
            { name: 'S', priceModifier: 0 },
            { name: 'M', priceModifier: 0 },
            { name: 'L', priceModifier: 0 },
            { name: 'XL', priceModifier: 100 }
        ],
        default: [
            { name: 'Standard', priceModifier: 0 },
            { name: 'Premium', priceModifier: 1000 }
        ]
    };
    return variants[subCategory] || variants.default;
}

function generateSearchKeywords(title, brand, subCategory) {
    const keywords = [
        title.toLowerCase(),
        brand.toLowerCase(),
        subCategory.toLowerCase(),
        ...title.toLowerCase().split(' '),
        'best', 'cheap', 'discount', 'offer', 'sale', 'new', 'latest'
    ];
    return [...new Set(keywords)]; // Remove duplicates
}

// Generate the products
console.log('Generating comprehensive product catalog...');
const products = generateComprehensiveProducts();

console.log(`Generated ${products.length} products across multiple categories`);

// Save to file
fs.writeFileSync('data/comprehensive_products.json', JSON.stringify(products, null, 2));
console.log('✅ Comprehensive product catalog saved to data/comprehensive_products.json');

// Generate some statistics
const categoryStats = {};
products.forEach(product => {
    const category = product.category.split(' > ')[0];
    categoryStats[category] = (categoryStats[category] || 0) + 1;
});

console.log('\n📊 Product Distribution:');
Object.entries(categoryStats).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} products`);
});

console.log(`\n💰 Price Range: ₹${Math.min(...products.map(p => p.currentPrice))} - ₹${Math.max(...products.map(p => p.currentPrice))}`);
console.log(`⭐ Average Rating: ${(products.reduce((sum, p) => sum + p.rating, 0) / products.length).toFixed(1)}`);
