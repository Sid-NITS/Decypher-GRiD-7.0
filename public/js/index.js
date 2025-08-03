// DeCypher Homepage JavaScript Functionality

// Search functionality
let searchTimeout;
let currentSuggestions = [];
let activeSuggestionIndex = -1;
let isSearchFocused = false;

// Global data variables
let categoryImagesData = {};

// Wishlist functionality
let wishlistItems = new Set();

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    // Load data from API first
    await loadDataFromAPI();
    
    setupSearchFunctionality();
    await loadFeaturedProducts();
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
    }, 500); // Increased timeout to allow for async loading
});

function setupSearchFunctionality() {
    const searchInputs = [
        document.getElementById('searchInput'),
        document.getElementById('heroSearchInput')
    ];

    searchInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', handleSearchInput);
            input.addEventListener('keyup', handleSearchKeyUp);
            input.addEventListener('keydown', handleSearchKeydown);
            input.addEventListener('blur', handleSearchBlur);
            input.addEventListener('focus', handleSearchFocus);
        }
    });

    // Form submissions
    document.getElementById('searchForm').addEventListener('submit', handleSearchSubmit);
    document.getElementById('heroSearchForm').addEventListener('submit', handleSearchSubmit);
    
    // Click outside to hide suggestions
    document.addEventListener('click', handleDocumentClick);
}

function handleSearchFocus(e) {
    const query = e.target.value.trim();
    const isHeroSearch = e.target.id === 'heroSearchInput';
    isSearchFocused = true;
    activeSuggestionIndex = -1;
    
    if (query.length >= 1) {
        fetchSuggestions(query, isHeroSearch);
    }
}

function handleSearchBlur(e) {
    // Delay hiding to allow clicking on suggestions
    setTimeout(() => {
        if (!isSearchFocused) {
            const isHeroSearch = e.target.id === 'heroSearchInput';
            hideSuggestions(isHeroSearch);
        }
    }, 150);
}

function handleSearchKeyUp(e) {
    // Handle immediate hiding of suggestions when input is cleared
    const query = e.target.value.trim();
    const isHeroSearch = e.target.id === 'heroSearchInput';
    
    if (query.length < 1) {
        clearTimeout(searchTimeout);
        hideSuggestions(isHeroSearch);
    }
}

function handleDocumentClick(e) {
    const searchContainers = document.querySelectorAll('.search-container, .hero-search');
    let clickedInSearch = false;
    
    searchContainers.forEach(container => {
        if (container.contains(e.target)) {
            clickedInSearch = true;
        }
    });
    
    if (!clickedInSearch) {
        isSearchFocused = false;
        hideSuggestions(false);
        hideSuggestions(true);
        activeSuggestionIndex = -1;
    }
}

function handleSearchInput(e) {
    const query = e.target.value.trim();
    const isHeroSearch = e.target.id === 'heroSearchInput';
    isSearchFocused = true;
    activeSuggestionIndex = -1;
    
    // Clear any pending timeout
    clearTimeout(searchTimeout);
    
    if (query.length < 1) {
        hideSuggestions(isHeroSearch);
        return;
    }

    searchTimeout = setTimeout(() => {
        // Double-check that the input still has content when timeout executes
        const currentQuery = e.target.value.trim();
        if (currentQuery.length >= 1) {
            fetchSuggestions(currentQuery, isHeroSearch);
        } else {
            hideSuggestions(isHeroSearch);
        }
    }, 200); // Reduced delay for faster response
}

async function fetchSuggestions(query, isHeroSearch = false) {
    // Safety check: if query is empty, hide suggestions instead
    if (!query || query.trim().length < 1) {
        hideSuggestions(isHeroSearch);
        return;
    }
    
    try {
        // Use the actual API endpoint for suggestions
        const response = await fetch(`/api/suggest?q=${encodeURIComponent(query)}&limit=6`);
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        
        // Transform API response to match our suggestion format
        const suggestions = data.map(item => ({
            text: item.suggestion || item.title || item.name,
            type: item.type || 'product',
            category: item.category || 'Product'
        }));
        
        showSuggestions(suggestions, isHeroSearch);
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        // Fallback to demo suggestions if API fails
        showDemoSuggestions(query, isHeroSearch);
    }
}

function showDemoSuggestions(query, isHeroSearch = false) {
    const lowerQuery = query.toLowerCase();
    
    // Smart suggestions based on what user is typing
    const smartSuggestions = [];
    
    // Electronics suggestions
    if (lowerQuery.includes('i') || lowerQuery.includes('ip') || lowerQuery.includes('iph') || lowerQuery.includes('phone') || lowerQuery.includes('apple') || lowerQuery.includes('mob')) {
        smartSuggestions.push({ text: 'iPhone 15', type: 'product' });
        smartSuggestions.push({ text: 'iPhone 15 Pro', type: 'product' });
        smartSuggestions.push({ text: 'Mobile phones', type: 'category' });
    }
    if (lowerQuery.includes('sam') || lowerQuery.includes('galaxy') || lowerQuery.includes('mob')) {
        smartSuggestions.push({ text: 'Samsung Galaxy S24', type: 'product' });
        smartSuggestions.push({ text: 'Samsung Galaxy Watch', type: 'product' });
        smartSuggestions.push({ text: 'Samsung mobile', type: 'product' });
    }
    if (lowerQuery.includes('lap') || lowerQuery.includes('dell') || lowerQuery.includes('computer') || lowerQuery.includes('mac')) {
        smartSuggestions.push({ text: 'Dell laptop', type: 'product' });
        smartSuggestions.push({ text: 'MacBook', type: 'product' });
        smartSuggestions.push({ text: 'Gaming laptop', type: 'product' });
    }
    if (lowerQuery.includes('head') || lowerQuery.includes('sony') || lowerQuery.includes('audio') || lowerQuery.includes('music')) {
        smartSuggestions.push({ text: 'Sony headphones', type: 'product' });
        smartSuggestions.push({ text: 'Wireless headphones', type: 'product' });
        smartSuggestions.push({ text: 'Bluetooth headphones', type: 'product' });
    }
    
    // Fashion suggestions
    if (lowerQuery.includes('nik') || lowerQuery.includes('shoe') || lowerQuery.includes('sneak') || lowerQuery.includes('run')) {
        smartSuggestions.push({ text: 'Nike shoes', type: 'product' });
        smartSuggestions.push({ text: 'Running shoes', type: 'product' });
        smartSuggestions.push({ text: 'Sports shoes', type: 'product' });
    }
    if (lowerQuery.includes('adi') || lowerQuery.includes('ultra')) {
        smartSuggestions.push({ text: 'Adidas sneakers', type: 'product' });
        smartSuggestions.push({ text: 'Adidas Ultraboost', type: 'product' });
    }
    if (lowerQuery.includes('jean') || lowerQuery.includes('cloth') || lowerQuery.includes('shirt')) {
        smartSuggestions.push({ text: 'Jeans', type: 'product' });
        smartSuggestions.push({ text: 'T-shirts', type: 'product' });
        smartSuggestions.push({ text: 'Casual wear', type: 'category' });
    }
    
    // Books suggestions
    if (lowerQuery.includes('book') || lowerQuery.includes('psych') || lowerQuery.includes('read')) {
        smartSuggestions.push({ text: 'Psychology books', type: 'product' });
        smartSuggestions.push({ text: 'Best sellers', type: 'category' });
        smartSuggestions.push({ text: 'Fiction books', type: 'category' });
    }
    
    // Mobile specific suggestions
    if (lowerQuery.includes('mob') || lowerQuery.includes('phone') || lowerQuery.includes('smart')) {
        smartSuggestions.push({ text: 'Mobile phones', type: 'category' });
        smartSuggestions.push({ text: 'Smartphones', type: 'category' });
        smartSuggestions.push({ text: 'Mobile accessories', type: 'category' });
    }
    
    // Generic fallbacks if no smart matches
    if (smartSuggestions.length === 0) {
        smartSuggestions.push(
            { text: `${query} deals`, type: 'category' },
            { text: `${query} offers`, type: 'category' },
            { text: `Best ${query}`, type: 'category' }
        );
    }
    
    // Add some popular categories if still less than 6
    if (smartSuggestions.length < 6) {
        smartSuggestions.push(
            { text: 'Electronics', type: 'category' },
            { text: 'Fashion', type: 'category' },
            { text: 'Books', type: 'category' }
        );
    }

    const relevantSuggestions = smartSuggestions.slice(0, 6);
    showSuggestions(relevantSuggestions, isHeroSearch);
}

function showSuggestions(suggestions, isHeroSearch = false) {
    const suggestionsEl = document.getElementById(isHeroSearch ? 'heroSearchSuggestions' : 'searchSuggestions');
    if (!suggestionsEl) return;

    currentSuggestions = suggestions;
    activeSuggestionIndex = -1;

    if (suggestions.length === 0) {
        suggestionsEl.style.display = 'none';
        return;
    }

    suggestionsEl.innerHTML = suggestions.map((suggestion, index) => {
        const icon = suggestion.type === 'loading' ? 'fas fa-spinner fa-spin' :
                   suggestion.type === 'category' ? 'fas fa-th-large' : 'fas fa-search';
        
        return `
            <div class="suggestion-item" data-index="${index}" onclick="selectSuggestion('${suggestion.text.replace(/'/g, "\\'")}', ${isHeroSearch})">
                <i class="${icon} suggestion-icon"></i>
                <span>${suggestion.text}</span>
            </div>
        `;
    }).join('');

    suggestionsEl.style.display = 'block';
    updateActiveSuggestion(isHeroSearch);
}

function hideSuggestions(isHeroSearch = false) {
    const suggestionsEl = document.getElementById(isHeroSearch ? 'heroSearchSuggestions' : 'searchSuggestions');
    if (suggestionsEl) {
        suggestionsEl.style.display = 'none';
    }
    activeSuggestionIndex = -1;
}

function updateActiveSuggestion(isHeroSearch = false) {
    const suggestionsEl = document.getElementById(isHeroSearch ? 'heroSearchSuggestions' : 'searchSuggestions');
    if (!suggestionsEl) return;

    const suggestionItems = suggestionsEl.querySelectorAll('.suggestion-item');
    suggestionItems.forEach((item, index) => {
        if (index === activeSuggestionIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function selectSuggestion(text, isHeroSearch = false) {
    const inputEl = document.getElementById(isHeroSearch ? 'heroSearchInput' : 'searchInput');
    if (inputEl) {
        inputEl.value = text;
    }
    hideSuggestions(isHeroSearch);
    performSearch(text);
}

function handleSearchKeydown(e) {
    const isHeroSearch = e.target.id === 'heroSearchInput';
    const suggestionsEl = document.getElementById(isHeroSearch ? 'heroSearchSuggestions' : 'searchSuggestions');
    const isVisible = suggestionsEl && suggestionsEl.style.display === 'block';
    
    if (!isVisible || currentSuggestions.length === 0) {
        if (e.key === 'Escape') {
            hideSuggestions(isHeroSearch);
        }
        return;
    }

    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            activeSuggestionIndex = Math.min(activeSuggestionIndex + 1, currentSuggestions.length - 1);
            updateActiveSuggestion(isHeroSearch);
            break;
            
        case 'ArrowUp':
            e.preventDefault();
            activeSuggestionIndex = Math.max(activeSuggestionIndex - 1, -1);
            updateActiveSuggestion(isHeroSearch);
            break;
            
        case 'Enter':
            e.preventDefault();
            if (activeSuggestionIndex >= 0 && activeSuggestionIndex < currentSuggestions.length) {
                selectSuggestion(currentSuggestions[activeSuggestionIndex].text, isHeroSearch);
            } else {
                const query = e.target.value.trim();
                if (query) {
                    hideSuggestions(isHeroSearch);
                    performSearch(query);
                }
            }
            break;
            
        case 'Escape':
            hideSuggestions(isHeroSearch);
            e.target.blur();
            break;
    }
}

function handleSearchSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const input = form.querySelector('.search-input');
    const query = input.value.trim();
    
    if (query) {
        performSearch(query);
    }
}

function performSearch(query) {
    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
}

// Load data from API
async function loadDataFromAPI() {
    try {
        console.log('Loading category images from API...');
        
        // Load category images
        const categoryResponse = await fetch('/api/data/category-images');
        if (categoryResponse.ok) {
            categoryImagesData = await categoryResponse.json();
            console.log('Loaded category images data');
        } else {
            console.error('Failed to load category images');
            categoryImagesData = { categoryImages: {}, defaultFallbacks: {} };
        }

    } catch (error) {
        console.error('Error loading data from API:', error);
        // Fallback to empty objects if API fails
        categoryImagesData = { categoryImages: {}, defaultFallbacks: {} };
    }
}

// Load featured products
async function loadFeaturedProducts() {
    try {
        // Try to load featured products from data API first
        const featuredResponse = await fetch('/api/data/featured-products');
        if (featuredResponse.ok) {
            const featuredProducts = await featuredResponse.json();
            console.log('Loaded featured products from data API:', featuredProducts.length);
            
            // Transform to match displayFeaturedProducts format
            const transformedProducts = featuredProducts.map(product => ({
                id: product.id,
                name: product.title,
                rating: product.rating,
                ratingCount: product.reviewCount,
                price: product.currentPrice,
                originalPrice: product.originalPrice,
                image: product.image
            }));
            
            displayFeaturedProducts(transformedProducts);
            return;
        }
        
        // Fallback to search API
        const response = await fetch('/api/search?q=featured&limit=8');
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        const results = data.results || data; // Handle both structured and direct response
        
        // Use category images from loaded data
        const categoryImages = categoryImagesData.categoryImages || {};
        const defaultFallbacks = categoryImagesData.defaultFallbacks || {};
        
        // Transform API response to match our product format
        const products = results.map((item, index) => {
            const category = (item.category || 'electronics').toLowerCase();
            const categoryImageList = categoryImages[category] || categoryImages['electronics'] || [];
            const fallbackImage = categoryImageList[index % categoryImageList.length] || 
                                defaultFallbacks[category] || 
                                defaultFallbacks['general'] || 
                                'https://via.placeholder.com/300x200/607D8B/ffffff?text=Product';
            
            return {
                id: item.id || item._id,
                name: item.title || item.name,
                rating: item.rating || 4.0,
                ratingCount: item.reviewCount || Math.floor(Math.random() * 1000) + 100,
                price: item.currentPrice || item.price || Math.floor(Math.random() * 50000) + 5000,
                originalPrice: item.originalPrice || (item.currentPrice || item.price ? Math.floor((item.currentPrice || item.price) * 1.2) : Math.floor(Math.random() * 60000) + 10000),
                image: item.image || fallbackImage
            };
        });
        
        displayFeaturedProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to demo data from API if main API fails
        await loadDemoProductsFromAPI();
    }
}

async function loadDemoProductsFromAPI() {
    try {
        const response = await fetch('/api/data/featured-products');
        if (response.ok) {
            const featuredProducts = await response.json();
            
            // Transform to match displayFeaturedProducts format
            const transformedProducts = featuredProducts.map(product => ({
                id: product.id,
                name: product.title,
                rating: product.rating,
                ratingCount: product.reviewCount,
                price: product.currentPrice,
                originalPrice: product.originalPrice,
                image: product.image
            }));
            
            displayFeaturedProducts(transformedProducts);
        } else {
            // Final fallback to hardcoded demo data
            displayHardcodedDemoProducts();
        }
    } catch (error) {
        console.error('Error loading demo products from API:', error);
        displayHardcodedDemoProducts();
    }
}

function displayHardcodedDemoProducts() {
    const demoProducts = [
        {
            id: 'demo-1',
            name: 'Apple iPhone 15 (128GB) - Blue',
            rating: 4.3,
            ratingCount: 2834,
            price: 12999,
            originalPrice: 16999,
            image: 'https://via.placeholder.com/300x200/007acc/ffffff?text=iPhone+15'
        },
        {
            id: 'demo-2',
            name: 'Samsung Galaxy S24 (256GB) - Phantom Black',
            rating: 4.5,
            ratingCount: 1876,
            price: 14999,
            originalPrice: 18999,
            image: 'https://via.placeholder.com/300x200/1a1a1a/ffffff?text=Galaxy+S24'
        },
        {
            id: 'demo-3',
            name: 'OnePlus 12 5G (128GB) - Flowy Emerald',
            rating: 4.4,
            ratingCount: 1245,
            price: 10999,
            originalPrice: 13999,
            image: 'https://via.placeholder.com/300x200/00a040/ffffff?text=OnePlus+12'
        },
        {
            id: 'demo-4',
            name: 'Xiaomi Redmi Note 13 Pro (128GB)',
            rating: 4.2,
            ratingCount: 3421,
            price: 5999,
            originalPrice: 7999,
            image: 'https://via.placeholder.com/300x200/ff6b35/ffffff?text=Redmi+Note'
        },
        {
            id: 'demo-5',
            name: 'Sony WH-1000XM4 Wireless Headphones',
            rating: 4.6,
            ratingCount: 2156,
            price: 7999,
            originalPrice: 9999,
            image: 'https://via.placeholder.com/300x200/000000/ffffff?text=Sony+Headphones'
        },
        {
            id: 'demo-6',
            name: 'Dell XPS 13 Laptop Intel i7',
            rating: 4.4,
            ratingCount: 892,
            price: 89999,
            originalPrice: 99999,
            image: 'https://via.placeholder.com/300x200/0066cc/ffffff?text=Dell+XPS'
        },
        {
            id: 'demo-7',
            name: 'Vivo V29 5G (128GB) - Himalayan Blue',
            rating: 4.1,
            ratingCount: 654,
            price: 8999,
            originalPrice: 11999,
            image: 'https://via.placeholder.com/300x200/4169e1/ffffff?text=Vivo+V29'
        },
        {
            id: 'demo-8',
            name: 'Realme GT 6 5G Mobile Phone',
            rating: 4.3,
            ratingCount: 987,
            price: 7499,
            originalPrice: 9999,
            image: 'https://via.placeholder.com/300x200/ffaa00/ffffff?text=Realme+GT6'
        }
    ];

    displayFeaturedProducts(demoProducts);
}

function displayFeaturedProducts(products) {
    const container = document.getElementById('featuredProducts');
    if (!container) return;

    container.innerHTML = products.map(product => {
        const discount = Math.floor(((product.originalPrice - product.price) / product.originalPrice) * 100);
        
        return `
            <div class="product-card">
                <a href="product.html?id=${product.id}" class="product-link">
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <i class="fas fa-image" style="display: none;"></i>
                        <div class="wishlist-icon" onclick="toggleWishlist(event, '${product.id}')">
                            <i class="far fa-heart"></i>
                        </div>
                    </div>
                    <div class="product-name">${product.name}</div>
                    <div class="product-rating">
                        <div class="rating-badge">
                            <span>${product.rating}</span>
                            <i class="fas fa-star"></i>
                        </div>
                        <span class="rating-count">(${product.ratingCount})</span>
                    </div>
                    <div class="product-price">
                        <span class="price-current">₹${product.price.toLocaleString()}</span>
                        <span class="price-original">₹${product.originalPrice.toLocaleString()}</span>
                        <span class="price-discount">${discount}% off</span>
                    </div>
                </a>
            </div>
        `;
    }).join('');
}

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
