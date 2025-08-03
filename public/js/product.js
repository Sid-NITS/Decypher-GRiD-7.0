// DeCypher Product Page JavaScript

// Get product ID from URL
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    const productId = getUrlParameter('id');
    if (productId) {
        loadProduct(productId);
    } else {
        // Load demo product
        loadDemoProduct();
    }
});

// Load product data
async function loadProduct(productId) {
    try {
        console.log('Loading product with ID:', productId);
        const response = await fetch(`/api/product/${productId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const product = await response.json();
        console.log('Loaded product:', product);
        displayProduct(product);
    } catch (error) {
        console.error('Error loading product:', error);
        // Show error message instead of falling back to demo
        showProductError(productId, error.message);
    }
}

// Show error when product cannot be loaded
function showProductError(productId, errorMessage) {
    document.getElementById('productTitle').textContent = 'Product Not Found';
    document.getElementById('breadcrumbTitle').textContent = 'Product Not Found';
    document.getElementById('productCategory').textContent = 'Error';
    
    // Create error display
    const mainContent = document.querySelector('.product-content');
    if (mainContent) {
        mainContent.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; background: white; border-radius: 8px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ff6b6b; margin-bottom: 20px;"></i>
                <h2>Product Not Found</h2>
                <p style="color: #666; margin: 20px 0;">Sorry, we couldn't find the product with ID: <strong>${productId}</strong></p>
                <p style="color: #666; margin-bottom: 30px;">Error: ${errorMessage}</p>
                <a href="/" style="background: #2874f0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                    <i class="fas fa-home" style="margin-right: 8px;"></i>
                    Go to Homepage
                </a>
                <a href="search.html" style="background: #fb641b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-left: 10px;">
                    <i class="fas fa-search" style="margin-right: 8px;"></i>
                    Search Products
                </a>
            </div>
        `;
    }
}

// Load demo product for demonstration
function loadDemoProduct() {
    const demoProduct = {
        id: 'demo-1',
        title: 'Apple iPhone 13 (128GB) - Blue',
        brand: 'Apple',
        model: 'iPhone 13',
        category: 'Electronics',
        price: 12999,
        originalPrice: 16999,
        rating: 4.3,
        ratingCount: 2834,
        reviewCount: 312,
        images: [
            'https://via.placeholder.com/400x400/007acc/ffffff?text=iPhone+13',
            'https://via.placeholder.com/400x400/ff6b6b/ffffff?text=Back+View',
            'https://via.placeholder.com/400x400/4ecdc4/ffffff?text=Side+View'
        ],
        highlights: [
            '6.1-inch Super Retina XDR display',
            'Cinematic mode for recording videos with shallow depth of field',
            'Advanced dual-camera system with 12MP Wide and Ultra Wide cameras',
            '12MP TrueDepth front camera with Portrait mode',
            'A15 Bionic chip for lightning-fast performance'
        ],
        specifications: {
            brand: 'Apple',
            model: 'iPhone 13',
            storage: '128 GB',
            display: '6.1 inch',
            os: 'iOS 15',
            color: 'Blue',
            warranty: '1 Year'
        }
    };
    displayProduct(demoProduct);
}

// Display product information
function displayProduct(product) {
    // Update title and breadcrumb
    document.getElementById('productTitle').textContent = product.title;
    document.getElementById('breadcrumbTitle').textContent = product.title;
    document.getElementById('productCategory').textContent = product.category;
    document.title = `${product.title} - AutoSuggest`;

    // Handle different price field names from API
    const currentPrice = product.currentPrice || product.price;
    const originalPrice = product.originalPrice;
    
    // Update pricing
    const discount = Math.floor(((originalPrice - currentPrice) / originalPrice) * 100);
    const savings = originalPrice - currentPrice;
    
    document.getElementById('currentPrice').textContent = `₹${currentPrice.toLocaleString()}`;
    document.getElementById('originalPrice').textContent = `₹${originalPrice.toLocaleString()}`;
    document.getElementById('discount').textContent = `${discount}% off`;
    document.getElementById('savings').textContent = `You save ₹${savings.toLocaleString()}`;

    // Handle different rating count field names from API
    const ratingCount = product.ratingCount || product.reviewCount || 0;
    const reviewCount = product.reviewCount || product.ratingCount || 0;

    // Update rating
    document.getElementById('ratingValue').textContent = product.rating.toFixed(1);
    document.getElementById('ratingCount').textContent = `${ratingCount} ratings and ${reviewCount} reviews`;
    document.getElementById('overallRating').textContent = product.rating.toFixed(1);
    document.getElementById('totalReviews').textContent = `${ratingCount} ratings & ${reviewCount} reviews`;

    // Update images - handle both single image and images array
    const productImages = product.images || [product.image] || ['https://via.placeholder.com/400x400/f0f0f0/999999?text=No+Image'];
    updateProductImages(productImages);

    // Update highlights - handle both highlights and features
    const highlights = product.highlights || product.features || [];
    if (highlights.length > 0) {
        const highlightsList = document.getElementById('highlights');
        highlightsList.innerHTML = highlights.map(highlight => `<li>${highlight}</li>`).join('');
    }

    // Update specifications
    if (product.specifications) {
        updateSpecifications(product.specifications);
    } else {
        // Create basic specifications from product data
        const basicSpecs = {
            brand: product.brand,
            model: product.title,
            category: product.category,
            warranty: product.warranty || '1 Year',
            sku: product.sku || 'N/A'
        };
        updateSpecifications(basicSpecs);
    }
}

// Update product images
function updateProductImages(images) {
    const mainImage = document.getElementById('mainImage');
    const thumbnails = document.getElementById('thumbnails');

    if (images && images.length > 0) {
        // Set main image
        mainImage.innerHTML = `<img src="${images[0]}" alt="Product Image">`;

        // Set thumbnails
        thumbnails.innerHTML = images.map((image, index) => `
            <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="changeMainImage('${image}', ${index})">
                <img src="${image}" alt="Thumbnail ${index + 1}">
            </div>
        `).join('');
    }
}

// Change main image
function changeMainImage(imageSrc, index) {
    document.getElementById('mainImage').innerHTML = `<img src="${imageSrc}" alt="Product Image">`;
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
}

// Update specifications
function updateSpecifications(specs) {
    // Handle both object and key-value specifications
    if (typeof specs === 'object') {
        // Try to map common specification fields
        const specMap = {
            'specBrand': specs.brand || specs.Brand,
            'specModel': specs.model || specs.Model || specs.title,
            'specStorage': specs.storage || specs.Storage || specs['Storage Capacity'],
            'specDisplay': specs.display || specs.Display || specs['Screen Size'],
            'specOS': specs.os || specs.OS || specs['Operating System']
        };

        // Update each specification field if element exists
        Object.keys(specMap).forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element && specMap[elementId]) {
                element.textContent = specMap[elementId];
            }
        });

        // Also try to populate other fields if they exist
        Object.keys(specs).forEach(key => {
            const value = specs[key];
            if (value && typeof value === 'string') {
                // Try to find corresponding element
                const possibleIds = [
                    `spec${key}`,
                    `spec${key.charAt(0).toUpperCase() + key.slice(1)}`,
                    key.toLowerCase()
                ];
                
                possibleIds.forEach(id => {
                    const element = document.getElementById(id);
                    if (element) {
                        element.textContent = value;
                    }
                });
            }
        });
    }
}

// Check delivery
function checkDelivery() {
    const pincode = document.getElementById('pincodeInput').value;
    const deliveryInfo = document.getElementById('deliveryInfo');
    
    if (pincode.length === 6) {
        deliveryInfo.innerHTML = `
            <i class="fas fa-truck"></i> Free delivery by tomorrow to ${pincode}<br>
            <i class="fas fa-undo"></i> 7 days replacement policy<br>
            <i class="fas fa-dollar-sign"></i> Cash on delivery available
        `;
    } else {
        deliveryInfo.textContent = 'Please enter a valid 6-digit pincode';
    }
}

// Search functionality
document.getElementById('searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const query = document.getElementById('searchInput').value.trim();
    if (query) {
        window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
    }
});

// Add to cart
document.querySelector('.btn-primary').addEventListener('click', () => {
    // Add to cart logic here
    alert('Product added to cart!');
});

// Buy now
document.querySelector('.btn-secondary').addEventListener('click', () => {
    // Buy now logic here
    alert('Redirecting to checkout...');
});

// Wishlist
document.querySelector('.btn-wishlist').addEventListener('click', (e) => {
    const icon = e.currentTarget.querySelector('i');
    if (icon.classList.contains('far')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        e.currentTarget.style.color = '#ff6b6b';
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        e.currentTarget.style.color = '#878787';
    }
});
