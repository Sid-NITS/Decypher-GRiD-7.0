// DeCypher Search Page JavaScript

// Global data variables
let demoProducts = [];
let demoSuggestions = [];
let categoryImagesData = {};

// Load data from API
async function loadDataFromAPI() {
    try {
        console.log('Loading data from API...');
        
        // Load demo products
        const productsResponse = await fetch('/api/data/demo-products');
        if (productsResponse.ok) {
            demoProducts = await productsResponse.json();
            console.log('Loaded demo products:', demoProducts.length);
        } else {
            console.error('Failed to load demo products');
        }

        // Load demo suggestions
        const suggestionsResponse = await fetch('/api/data/demo-suggestions');
        if (suggestionsResponse.ok) {
            demoSuggestions = await suggestionsResponse.json();
            console.log('Loaded demo suggestions:', demoSuggestions.length);
        } else {
            console.error('Failed to load demo suggestions');
        }

        // Load category images
        const categoryResponse = await fetch('/api/data/category-images');
        if (categoryResponse.ok) {
            categoryImagesData = await categoryResponse.json();
            console.log('Loaded category images data');
        } else {
            console.error('Failed to load category images');
        }

    } catch (error) {
        console.error('Error loading data from API:', error);
        // Fallback to empty arrays/objects if API fails
        demoProducts = [];
        demoSuggestions = [];
        categoryImagesData = { categoryImages: {}, defaultFallbacks: {} };
    }
}

// Get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    // Load data from API first
    await loadDataFromAPI();
    
    const query = getUrlParameter('q');
    const category = getUrlParameter('category');
    
    // Initialize filter functionality
    initializeFilters();
    
    if (query) {
        document.getElementById('searchInput').value = query;
        document.getElementById('searchQuery').textContent = query;
        performSearch(query);
    } else if (category) {
        document.getElementById('searchQuery').textContent = category;
        performCategorySearch(category);
    } else {
        // Show all products by default immediately
        document.getElementById('searchQuery').textContent = 'All Products';
        displayResults(demoProducts);
        updateResultsInfo(demoProducts.length, 'All Products');
    }
});

// Search functionality
let searchTimeout;
const searchInput = document.getElementById('searchInput');
const suggestions = document.getElementById('suggestions');
let activeSuggestionIndex = -1;
let isSearchFocused = false;

// Perform search
async function performSearch(query) {
    if (!query.trim()) {
        try {
            // If empty query, get all products from API
            const response = await fetch('/api/search?q=&limit=50');
            if (response.ok) {
                const data = await response.json();
                const results = data.results || data; // Handle both structured and direct response
                const transformedResults = transformApiResults(results);
                displayResults(transformedResults);
                updateResultsInfo(transformedResults.length, 'All Products');
                return;
            }
        } catch (error) {
            console.error('Error fetching all products:', error);
        }
        // Fallback to demo data
        displayResults(demoProducts);
        updateResultsInfo(demoProducts.length, 'All Products');
        return;
    }

    showLoading();
    
    try {
        // Use actual API for search
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=50`);
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        const results = data.results || data; // Handle both structured and direct response
        const transformedResults = transformApiResults(results);
        
        hideLoading();
        
        if (transformedResults.length > 0) {
            displayResults(transformedResults);
            updateResultsInfo(transformedResults.length, query);
        } else {
            showNoResults();
        }
    } catch (error) {
        console.error('Search API error:', error);
        hideLoading();
        
        // Fallback to demo data search with local images
        const results = demoProducts.filter(product => 
            product.title.toLowerCase().includes(query.toLowerCase()) ||
            (Array.isArray(product.features) ? product.features.join(' ').toLowerCase().includes(query.toLowerCase()) : product.features.toLowerCase().includes(query.toLowerCase())) ||
            product.category.toLowerCase().includes(query.toLowerCase())
        );
        
        if (results.length > 0) {
            displayResults(results);
            updateResultsInfo(results.length, query);
        } else {
            showNoResults();
        }
    }
}

// Transform API results to match our display format
function transformApiResults(apiResults) {
    if (!Array.isArray(apiResults)) {
        console.error('API results is not an array:', apiResults);
        return [];
    }
    
    return apiResults.map((item, index) => {
        // Get local image for better display (but keep real product ID)
        const localImage = getLocalImageForProduct(item.title || item.name, item.category, index);
        
        // ALWAYS use the real API product ID - never replace with demo IDs
        return {
            id: item.id || item._id, // Keep the real product ID from API
            title: item.title || item.name,
            price: item.currentPrice || item.price || Math.floor(Math.random() * 50000) + 5000,
            originalPrice: item.originalPrice || (item.currentPrice || item.price ? Math.floor((item.currentPrice || item.price) * 1.2) : Math.floor(Math.random() * 60000) + 10000),
            rating: item.rating || 4.0,
            reviewCount: item.reviewCount || Math.floor(Math.random() * 1000) + 100,
            image: localImage, // Use local image for display but keep real ID for linking
            features: item.features || item.description || 'No description available',
            category: item.category || 'general'
        };
    });
}

// Get local image for product based on title and category
function getLocalImageForProduct(title, category, index) {
    if (!title) return '/images/categories/electronics.svg';
    
    const titleLower = title.toLowerCase();
    
    // Map specific products to their local images
    if (titleLower.includes('iphone')) return '/images/products/iphone-15-pro.svg';
    if (titleLower.includes('samsung') || titleLower.includes('galaxy')) return '/images/products/galaxy-s24-ultra.svg';
    if (titleLower.includes('oneplus')) return '/images/products/oneplus-12.svg';
    if (titleLower.includes('redmi') || titleLower.includes('xiaomi')) return '/images/products/redmi-note-13.svg';
    if (titleLower.includes('vivo')) return '/images/products/vivo-v29.svg';
    if (titleLower.includes('dell') || titleLower.includes('laptop')) return '/images/products/dell-xps-13.svg';
    if (titleLower.includes('macbook') || titleLower.includes('apple laptop')) return '/images/products/macbook-air-m3.svg';
    if (titleLower.includes('sony') || titleLower.includes('headphones') || titleLower.includes('audio')) return '/images/products/sony-headphones.svg';
    if (titleLower.includes('nike') || titleLower.includes('air force')) return '/images/products/nike-air-force.svg';
    if (titleLower.includes('adidas') || titleLower.includes('ultraboost')) return '/images/products/adidas-ultraboost.svg';
    if (titleLower.includes('levis') || titleLower.includes('jeans')) return '/images/products/levis-jeans.svg';
    if (titleLower.includes('psychology')) return '/images/products/psychology-book.svg';
    if (titleLower.includes('atomic') || titleLower.includes('habits')) return '/images/products/atomic-habits.svg';
    
    // Category-based fallbacks
    const categoryLower = (category || '').toLowerCase();
    if (categoryLower.includes('electronics') || categoryLower.includes('mobile') || categoryLower.includes('phone')) {
        return '/images/categories/electronics.svg';
    }
    if (categoryLower.includes('fashion') || categoryLower.includes('clothing') || categoryLower.includes('apparel')) {
        return '/images/categories/fashion.svg';
    }
    if (categoryLower.includes('book')) {
        return '/images/categories/books.svg';
    }
    
    // Default fallback
    return '/images/categories/electronics.svg';
}

// Perform category search
async function performCategorySearch(category) {
    showLoading();
    
    try {
        // Use actual API for category search
        const response = await fetch(`/api/search?q=${encodeURIComponent(category)}&limit=50`);
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        const results = data.results || data; // Handle both structured and direct response
        const transformedResults = transformApiResults(results);
        
        hideLoading();
        
        if (transformedResults.length > 0) {
            displayResults(transformedResults);
            updateResultsInfo(transformedResults.length, category);
        } else {
            showNoResults();
        }
    } catch (error) {
        console.error('Category search API error:', error);
        hideLoading();
        
        // Fallback to demo data
        const results = demoProducts.filter(product => 
            product.category.toLowerCase() === category.toLowerCase()
        );
        
        if (results.length > 0) {
            displayResults(results);
            updateResultsInfo(results.length, category);
        } else {
            showNoResults();
        }
    }
}

// Display search results
function displayResults(results) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    results.forEach(product => {
        const productCard = createProductCard(product);
        grid.appendChild(productCard);
    });

    document.getElementById('noResults').style.display = 'none';
}

// Create product card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const rating = product.rating || 4.0;
    const price = product.currentPrice || product.price || 999;
    const originalPrice = product.originalPrice || Math.floor(price * 1.3);
    const discount = Math.floor(((originalPrice - price) / originalPrice) * 100);

    // Create features text from features array or description
    let featuresText = '';
    if (Array.isArray(product.features)) {
        featuresText = product.features.slice(0, 3).join(', ');
    } else {
        featuresText = product.features || product.description || 'Free delivery available';
    }

    card.innerHTML = `
        <div class="product-image">
            ${product.image ? 
                `<img src="${product.image}" alt="${product.title}">` : 
                '<i class="fas fa-image"></i>'
            }
            <div class="wishlist-icon" onclick="toggleWishlist(event, '${product.id}')">
                <i class="far fa-heart"></i>
            </div>
        </div>
        <div class="product-info">
            <div class="product-title">${product.title}</div>
            <div class="product-rating">
                <div class="rating-badge">
                    ${rating.toFixed(1)} <i class="fas fa-star"></i>
                </div>
                <span class="rating-count">(${product.reviewCount || 150})</span>
            </div>
            <div class="product-price">
                <span class="price-current">₹${price.toLocaleString()}</span>
                <span class="price-original">₹${originalPrice.toLocaleString()}</span>
                <span class="price-discount">${discount}% off</span>
            </div>
            <div class="product-features">
                ${featuresText}
            </div>
        </div>
    `;

    card.addEventListener('click', (e) => {
        // Don't navigate if clicking on wishlist button
        if (e.target.closest('.wishlist-icon')) {
            return;
        }
        // Navigate to product details page
        window.location.href = `product.html?id=${product.id}`;
    });

    return card;
}

// Wishlist functionality
let wishlistItems = new Set();

function toggleWishlist(event, productId) {
    event.preventDefault();
    event.stopPropagation();
    
    const wishlistIcon = event.currentTarget;
    const heartIcon = wishlistIcon.querySelector('i');
    
    if (wishlistItems.has(productId)) {
        // Remove from wishlist
        wishlistItems.delete(productId);
        wishlistIcon.classList.remove('liked');
        heartIcon.classList.remove('fas');
        heartIcon.classList.add('far');
    } else {
        // Add to wishlist
        wishlistItems.add(productId);
        wishlistIcon.classList.add('liked');
        heartIcon.classList.remove('far');
        heartIcon.classList.add('fas');
    }
    
    // Optional: Save to localStorage
    localStorage.setItem('wishlistItems', JSON.stringify([...wishlistItems]));
}

// Load wishlist from localStorage on page load
function loadWishlist() {
    const saved = localStorage.getItem('wishlistItems');
    if (saved) {
        wishlistItems = new Set(JSON.parse(saved));
    }
}

// Initialize wishlist on page load
document.addEventListener('DOMContentLoaded', function() {
    loadWishlist();
    // Update wishlist icons after products are loaded
    setTimeout(() => {
        wishlistItems.forEach(productId => {
            const wishlistIcon = document.querySelector(`[onclick*="${productId}"]`);
            if (wishlistIcon) {
                const heartIcon = wishlistIcon.querySelector('i');
                wishlistIcon.classList.add('liked');
                heartIcon.classList.remove('far');
                heartIcon.classList.add('fas');
            }
        });
    }, 100);
});

// Update results info
function updateResultsInfo(count, query) {
    document.getElementById('resultsInfo').innerHTML = 
        `Showing ${count} results for "<strong>${query}</strong>"`;
}

// Show/hide loading
function showLoading() {
    document.getElementById('loadingResults').style.display = 'block';
    document.getElementById('noResults').style.display = 'none';
    document.getElementById('productsGrid').innerHTML = '';
}

function hideLoading() {
    document.getElementById('loadingResults').style.display = 'none';
}

// Show no results
function showNoResults() {
    document.getElementById('noResults').style.display = 'block';
}

// Search for suggestion
function searchFor(query) {
    document.getElementById('searchInput').value = query;
    performSearch(query);
    updateUrl(query);
}

// Update URL
function updateUrl(query) {
    const newUrl = `${window.location.pathname}?q=${encodeURIComponent(query)}`;
    window.history.pushState({ query }, '', newUrl);
    document.getElementById('searchQuery').textContent = query;
}

// Suggestion functionality
function handleSearch(query) {
    clearTimeout(searchTimeout);
    
    if (query.length < 1) {
        hideSuggestions();
        return;
    }

    searchTimeout = setTimeout(() => {
        // Double-check that query is still present when timeout executes
        const currentQuery = searchInput.value.trim();
        if (currentQuery.length >= 1) {
            fetchSuggestions(currentQuery);
        } else {
            hideSuggestions();
        }
    }, 150); // Even faster for search page
}

async function fetchSuggestions(query) {
    try {
        // Use the actual API endpoint for suggestions
        const response = await fetch(`/api/suggest?q=${encodeURIComponent(query)}&limit=8`);
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        
        // Transform API response to match our suggestion format
        const suggestions = data.map(item => ({
            text: item.suggestion || item.title || item.name,
            category: item.category || 'Product'
        }));
        
        displaySuggestions(suggestions);
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        // Fallback to smart suggestions if API fails
        showSmartSuggestions(query);
    }
}

function showSmartSuggestions(query) {
    const lowerQuery = query.toLowerCase();
    
    // Smart suggestions based on what user is typing
    const smartSuggestions = [];
    
    // Electronics/Mobile suggestions
    if (lowerQuery.includes('i') || lowerQuery.includes('ip') || lowerQuery.includes('iph') || lowerQuery.includes('phone') || lowerQuery.includes('apple') || lowerQuery.includes('mob')) {
        smartSuggestions.push({ text: 'iPhone 15', category: 'Electronics' });
        smartSuggestions.push({ text: 'iPhone 15 Pro', category: 'Electronics' });
        smartSuggestions.push({ text: 'Mobile phones', category: 'Electronics' });
    }
    if (lowerQuery.includes('sam') || lowerQuery.includes('galaxy') || lowerQuery.includes('mob')) {
        smartSuggestions.push({ text: 'Samsung Galaxy S24', category: 'Electronics' });
        smartSuggestions.push({ text: 'Samsung Galaxy Watch', category: 'Electronics' });
        smartSuggestions.push({ text: 'Samsung mobile', category: 'Electronics' });
    }
    if (lowerQuery.includes('one') || lowerQuery.includes('plus') || lowerQuery.includes('mob')) {
        smartSuggestions.push({ text: 'OnePlus 12', category: 'Electronics' });
        smartSuggestions.push({ text: 'OnePlus mobile', category: 'Electronics' });
    }
    if (lowerQuery.includes('xia') || lowerQuery.includes('red') || lowerQuery.includes('redmi') || lowerQuery.includes('mob')) {
        smartSuggestions.push({ text: 'Xiaomi Redmi Note', category: 'Electronics' });
        smartSuggestions.push({ text: 'Redmi mobile phone', category: 'Electronics' });
    }
    if (lowerQuery.includes('viv') || lowerQuery.includes('mob')) {
        smartSuggestions.push({ text: 'Vivo V29', category: 'Electronics' });
        smartSuggestions.push({ text: 'Vivo smartphone', category: 'Electronics' });
    }
    if (lowerQuery.includes('real') || lowerQuery.includes('mob')) {
        smartSuggestions.push({ text: 'Realme GT 6', category: 'Electronics' });
        smartSuggestions.push({ text: 'Realme mobile', category: 'Electronics' });
    }
    if (lowerQuery.includes('goo') || lowerQuery.includes('pix') || lowerQuery.includes('pixel') || lowerQuery.includes('mob')) {
        smartSuggestions.push({ text: 'Google Pixel 8', category: 'Electronics' });
        smartSuggestions.push({ text: 'Pixel phone', category: 'Electronics' });
    }
    if (lowerQuery.includes('nok') || lowerQuery.includes('mob')) {
        smartSuggestions.push({ text: 'Nokia G42', category: 'Electronics' });
        smartSuggestions.push({ text: 'Nokia smartphone', category: 'Electronics' });
    }
    
    // Other electronics
    if (lowerQuery.includes('lap') || lowerQuery.includes('dell') || lowerQuery.includes('computer') || lowerQuery.includes('mac')) {
        smartSuggestions.push({ text: 'Dell laptop', category: 'Electronics' });
        smartSuggestions.push({ text: 'MacBook', category: 'Electronics' });
        smartSuggestions.push({ text: 'Gaming laptop', category: 'Electronics' });
    }
    if (lowerQuery.includes('head') || lowerQuery.includes('sony') || lowerQuery.includes('audio') || lowerQuery.includes('music')) {
        smartSuggestions.push({ text: 'Sony headphones', category: 'Electronics' });
        smartSuggestions.push({ text: 'Wireless headphones', category: 'Electronics' });
        smartSuggestions.push({ text: 'Bluetooth headphones', category: 'Electronics' });
    }
    
    // Fashion suggestions
    if (lowerQuery.includes('nik') || lowerQuery.includes('shoe') || lowerQuery.includes('sneak') || lowerQuery.includes('run')) {
        smartSuggestions.push({ text: 'Nike shoes', category: 'Fashion' });
        smartSuggestions.push({ text: 'Running shoes', category: 'Fashion' });
        smartSuggestions.push({ text: 'Sports shoes', category: 'Fashion' });
    }
    if (lowerQuery.includes('adi') || lowerQuery.includes('ultra')) {
        smartSuggestions.push({ text: 'Adidas sneakers', category: 'Fashion' });
        smartSuggestions.push({ text: 'Adidas Ultraboost', category: 'Fashion' });
    }
    if (lowerQuery.includes('jean') || lowerQuery.includes('cloth') || lowerQuery.includes('shirt')) {
        smartSuggestions.push({ text: 'Jeans', category: 'Fashion' });
        smartSuggestions.push({ text: 'T-shirts', category: 'Fashion' });
        smartSuggestions.push({ text: 'Casual wear', category: 'Fashion' });
    }
    
    // Books suggestions
    if (lowerQuery.includes('book') || lowerQuery.includes('psych') || lowerQuery.includes('read')) {
        smartSuggestions.push({ text: 'Psychology books', category: 'Books' });
        smartSuggestions.push({ text: 'Best sellers', category: 'Books' });
        smartSuggestions.push({ text: 'Fiction books', category: 'Books' });
    }
    
    // Mobile specific suggestions
    if (lowerQuery.includes('mob') || lowerQuery.includes('phone') || lowerQuery.includes('smart')) {
        smartSuggestions.push({ text: 'Mobile phones', category: 'Electronics' });
        smartSuggestions.push({ text: 'Smartphones', category: 'Electronics' });
        smartSuggestions.push({ text: 'Mobile accessories', category: 'Electronics' });
    }
    
    // Generic fallbacks if no smart matches
    if (smartSuggestions.length === 0) {
        smartSuggestions.push(
            { text: `${query} deals`, category: 'Offers' },
            { text: `${query} offers`, category: 'Offers' },
            { text: `Best ${query}`, category: 'Popular' }
        );
    }
    
    // Add some popular categories if still less than 6
    if (smartSuggestions.length < 6) {
        smartSuggestions.push(
            { text: 'Electronics', category: 'Category' },
            { text: 'Fashion', category: 'Category' },
            { text: 'Books', category: 'Category' }
        );
    }

    const relevantSuggestions = smartSuggestions.slice(0, 8);
    displaySuggestions(relevantSuggestions);
}

function displaySuggestions(suggestionsList) {
    suggestions.innerHTML = '';
    
    suggestionsList.slice(0, 8).forEach((suggestion, index) => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.setAttribute('data-index', index);
        
        item.innerHTML = `
            <div class="suggestion-icon">
                <i class="fas fa-search"></i>
            </div>
            <div class="suggestion-content">
                <div class="suggestion-title">${highlightMatch(suggestion.text, searchInput.value)}</div>
                <div class="suggestion-category">${suggestion.category || 'Product'}</div>
            </div>
        `;
        
        item.addEventListener('click', () => {
            selectSuggestion(suggestion.text);
        });
        
        suggestions.appendChild(item);
    });
    
    suggestions.style.display = 'block';
    activeSuggestionIndex = -1;
}

function hideSuggestions() {
    suggestions.style.display = 'none';
    activeSuggestionIndex = -1;
}

function updateActiveSuggestion() {
    const suggestionItems = suggestions.querySelectorAll('.suggestion-item');
    suggestionItems.forEach((item, index) => {
        if (index === activeSuggestionIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
}

function selectSuggestion(text) {
    searchInput.value = text;
    hideSuggestions();
    performSearch(text);
    updateUrl(text);
}

// Event listeners
searchInput.addEventListener('input', (e) => {
    isSearchFocused = true;
    activeSuggestionIndex = -1;
    handleSearch(e.target.value);
});

searchInput.addEventListener('keyup', (e) => {
    // Handle immediate hiding of suggestions when input is cleared
    const query = e.target.value.trim();
    if (query.length < 1) {
        clearTimeout(searchTimeout);
        hideSuggestions();
    }
});

searchInput.addEventListener('focus', (e) => {
    isSearchFocused = true;
    activeSuggestionIndex = -1;
    const query = e.target.value.trim();
    if (query.length >= 1) {
        fetchSuggestions(query);
    }
});

searchInput.addEventListener('blur', (e) => {
    // Delay hiding to allow clicking on suggestions
    setTimeout(() => {
        if (!isSearchFocused) {
            hideSuggestions();
        }
    }, 150);
});

searchInput.addEventListener('keydown', (e) => {
    const isVisible = suggestions && suggestions.style.display === 'block';
    
    if (isVisible && suggestions.children.length > 0) {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                activeSuggestionIndex = Math.min(activeSuggestionIndex + 1, suggestions.children.length - 1);
                updateActiveSuggestion();
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                activeSuggestionIndex = Math.max(activeSuggestionIndex - 1, -1);
                updateActiveSuggestion();
                break;
                
            case 'Enter':
                e.preventDefault();
                if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.children.length) {
                    const selectedSuggestion = suggestions.children[activeSuggestionIndex];
                    const suggestionText = selectedSuggestion.querySelector('.suggestion-title').textContent;
                    selectSuggestion(suggestionText);
                } else {
                    const query = searchInput.value.trim();
                    if (query) {
                        performSearch(query);
                        updateUrl(query);
                        hideSuggestions();
                    }
                }
                break;
                
            case 'Escape':
                hideSuggestions();
                searchInput.blur();
                break;
        }
    } else {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                performSearch(query);
                updateUrl(query);
                hideSuggestions();
            }
        } else if (e.key === 'Escape') {
            hideSuggestions();
        }
    }
});

// Click outside to hide suggestions
document.addEventListener('click', (e) => {
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer && !searchContainer.contains(e.target)) {
        isSearchFocused = false;
        hideSuggestions();
        activeSuggestionIndex = -1;
    }
});

document.getElementById('searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
        performSearch(query);
        updateUrl(query);
        hideSuggestions();
    }
});

// Sort functionality
document.getElementById('sortSelect').addEventListener('change', (e) => {
    const sortBy = e.target.value;
    const currentGrid = document.getElementById('productsGrid');
    const products = Array.from(currentGrid.children);
    
    // Get current products data (we'll need to track this)
    let currentProducts = [...demoProducts]; // For now, use all products
    
    // Apply current filters first
    applyFilters();
    
    // Then sort the filtered results
    sortProducts(sortBy);
});

function sortProducts(sortBy) {
    const grid = document.getElementById('productsGrid');
    const productCards = Array.from(grid.children);
    
    // Extract product data from DOM
    const productsWithElements = productCards.map(card => {
        const title = card.querySelector('.product-title').textContent;
        const priceText = card.querySelector('.price-current').textContent.replace('₹', '').replace(',', '');
        const price = parseInt(priceText);
        const ratingText = card.querySelector('.rating-badge').textContent.split(' ')[0];
        const rating = parseFloat(ratingText);
        
        return {
            element: card,
            title,
            price,
            rating
        };
    });
    
    // Sort based on criteria
    let sortedProducts;
    switch(sortBy) {
        case 'price_low':
            sortedProducts = productsWithElements.sort((a, b) => a.price - b.price);
            break;
        case 'price_high':
            sortedProducts = productsWithElements.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            sortedProducts = productsWithElements.sort((a, b) => b.rating - a.rating);
            break;
        case 'popularity':
            // For demo, sort by rating (could be review count in real app)
            sortedProducts = productsWithElements.sort((a, b) => b.rating - a.rating);
            break;
        case 'newest':
            // For demo, reverse the original order
            sortedProducts = productsWithElements.reverse();
            break;
        default: // relevance
            sortedProducts = productsWithElements; // Keep original order
    }
    
    // Clear grid and re-add sorted elements
    grid.innerHTML = '';
    sortedProducts.forEach(product => {
        grid.appendChild(product.element);
    });
}

// Filter functionality
function clearAllFilters() {
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    // Show all products when clearing filters
    displayResults(demoProducts);
    updateResultsInfo(demoProducts.length, 'All Products');
}

// Add filter functionality
function applyFilters() {
    let filteredProducts = [...demoProducts];
    
    // Category filters
    const selectedCategories = [];
    if (document.getElementById('electronics').checked) selectedCategories.push('electronics');
    if (document.getElementById('fashion').checked) selectedCategories.push('fashion');
    if (document.getElementById('home').checked) selectedCategories.push('home');
    if (document.getElementById('beauty').checked) selectedCategories.push('beauty');
    if (document.getElementById('books').checked) selectedCategories.push('books');
    
    if (selectedCategories.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
            selectedCategories.includes(product.category)
        );
    }
    
    // Price filters
    const minPrice = parseInt(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseInt(document.getElementById('maxPrice').value) || Infinity;
    
    filteredProducts = filteredProducts.filter(product => 
        product.price >= minPrice && product.price <= maxPrice
    );
    
    // Price range checkboxes
    if (document.getElementById('price1').checked) {
        filteredProducts = filteredProducts.filter(product => product.price < 500);
    }
    if (document.getElementById('price2').checked) {
        filteredProducts = filteredProducts.filter(product => product.price >= 500 && product.price <= 1000);
    }
    if (document.getElementById('price3').checked) {
        filteredProducts = filteredProducts.filter(product => product.price >= 1000 && product.price <= 5000);
    }
    if (document.getElementById('price4').checked) {
        filteredProducts = filteredProducts.filter(product => product.price >= 5000 && product.price <= 10000);
    }
    if (document.getElementById('price5').checked) {
        filteredProducts = filteredProducts.filter(product => product.price > 10000);
    }
    
    // Rating filters
    if (document.getElementById('rating4').checked) {
        filteredProducts = filteredProducts.filter(product => product.rating >= 4.0);
    }
    if (document.getElementById('rating3').checked) {
        filteredProducts = filteredProducts.filter(product => product.rating >= 3.0);
    }
    if (document.getElementById('rating2').checked) {
        filteredProducts = filteredProducts.filter(product => product.rating >= 2.0);
    }
    
    // Brand filters
    const selectedBrands = [];
    if (document.getElementById('apple').checked) selectedBrands.push('apple');
    if (document.getElementById('samsung').checked) selectedBrands.push('samsung');
    if (document.getElementById('nike').checked) selectedBrands.push('nike');
    if (document.getElementById('adidas').checked) selectedBrands.push('adidas');
    
    if (selectedBrands.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
            selectedBrands.some(brand => 
                product.title.toLowerCase().includes(brand)
            )
        );
    }
    
    displayResults(filteredProducts);
    updateResultsInfo(filteredProducts.length, 'Filtered Products');
}

// Add event listeners for filters
function initializeFilters() {
    // Category filters
    document.getElementById('electronics').addEventListener('change', applyFilters);
    document.getElementById('fashion').addEventListener('change', applyFilters);
    document.getElementById('home').addEventListener('change', applyFilters);
    document.getElementById('beauty').addEventListener('change', applyFilters);
    document.getElementById('books').addEventListener('change', applyFilters);
    
    // Price filters
    document.getElementById('minPrice').addEventListener('input', applyFilters);
    document.getElementById('maxPrice').addEventListener('input', applyFilters);
    document.getElementById('price1').addEventListener('change', applyFilters);
    document.getElementById('price2').addEventListener('change', applyFilters);
    document.getElementById('price3').addEventListener('change', applyFilters);
    document.getElementById('price4').addEventListener('change', applyFilters);
    document.getElementById('price5').addEventListener('change', applyFilters);
    
    // Rating filters
    document.getElementById('rating4').addEventListener('change', applyFilters);
    document.getElementById('rating3').addEventListener('change', applyFilters);
    document.getElementById('rating2').addEventListener('change', applyFilters);
    
    // Brand filters
    document.getElementById('apple').addEventListener('change', applyFilters);
    document.getElementById('samsung').addEventListener('change', applyFilters);
    document.getElementById('nike').addEventListener('change', applyFilters);
    document.getElementById('adidas').addEventListener('change', applyFilters);
}

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
        hideSuggestions();
    }
});
