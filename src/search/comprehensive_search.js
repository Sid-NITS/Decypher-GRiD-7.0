const express = require('express');

class ComprehensiveSearchEngine {
    constructor() {
        this.products = [];
        this.loadProducts();
    }

    loadProducts() {
        try {
            // Try to load comprehensive products first, fallback to basic products
            try {
                this.products = require('../../data/comprehensive_products.json');
                console.log(`✅ Loaded ${this.products.length} comprehensive products`);
            } catch (error) {
                this.products = require('../../data/products.json');
                console.log(`✅ Loaded ${this.products.length} basic products (fallback)`);
            }
        } catch (error) {
            console.error('❌ Error loading products:', error.message);
            this.products = [];
        }
    }

    // Get product suggestions (actual products that match)
    getProductSuggestions(query, limit = 10) {
        if (!query || query.length < 1) return [];

        const searchQuery = query.toLowerCase().trim();
        const suggestions = [];

        // Create synonym mapping for better matching
        const synonyms = {
            'mobile': ['smartphone', 'phone', 'smartphones', 'mobiles'],
            'phone': ['mobile', 'smartphone', 'smartphones', 'mobiles'],
            'smartphone': ['mobile', 'phone', 'smartphones', 'mobiles'],
            'laptop': ['computer', 'notebook', 'laptops'],
            'computer': ['laptop', 'pc', 'desktop', 'laptops'],
            'headphone': ['earphone', 'headphones', 'earphones', 'earbuds'],
            'earphone': ['headphone', 'headphones', 'earphones', 'earbuds']
        };

        // Get all possible search terms including synonyms
        const searchTerms = [searchQuery];
        if (synonyms[searchQuery]) {
            searchTerms.push(...synonyms[searchQuery]);
        }

        // Score products based on relevance
        this.products.forEach(product => {
            let score = 0;
            const title = product.title.toLowerCase();
            const brand = product.brand.toLowerCase();
            const category = product.category.toLowerCase();

            // Check against all search terms (including synonyms)
            searchTerms.forEach(term => {
                // Title matching - highest priority
                if (title.includes(term)) {
                    score += title.startsWith(term) ? 100 : 50;
                }

                // Brand matching
                if (brand.includes(term)) {
                    score += brand.startsWith(term) ? 80 : 40;
                }

                // Category matching
                if (category.includes(term)) {
                    score += 30;
                }

                // Fuzzy matching for titles
                if (this.fuzzyMatch(term, title)) {
                    score += 20;
                }

                // Fuzzy matching for brands
                if (this.fuzzyMatch(term, brand)) {
                    score += 15;
                }
            });

            if (score > 0) {
                suggestions.push({
                    ...product,
                    score: score,
                    searchQuery: product.title // This will be used for search navigation
                });
            }
        });

        // Sort by score and return top results
        return suggestions
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(product => ({
                id: product.id,
                title: product.title,
                brand: product.brand,
                category: product.category,
                price: product.currentPrice || product.price,
                image: product.image,
                searchQuery: product.title, // This will be used when navigating to search results
                display_text: product.title,
                subtitle: `${product.brand} - ₹${product.currentPrice || product.price}`
            }));
    }

    // Get search query suggestions (not specific products) - keeping for backward compatibility
    getQuerySuggestions(query, limit = 10) {
        if (!query || query.length < 1) return [];

        const searchQuery = query.toLowerCase().trim();
        const suggestionSet = new Set();
        const suggestions = [];

        // Create synonym mapping for better matching
        const synonyms = {
            'mobile': ['smartphone', 'phone', 'smartphones', 'mobiles'],
            'phone': ['mobile', 'smartphone', 'smartphones', 'mobiles'],
            'smartphone': ['mobile', 'phone', 'smartphones', 'mobiles'],
            'laptop': ['computer', 'notebook', 'laptops'],
            'computer': ['laptop', 'pc', 'desktop', 'laptops'],
            'headphone': ['earphone', 'headphones', 'earphones', 'earbuds'],
            'earphone': ['headphone', 'headphones', 'earphones', 'earbuds']
        };

        // Get all possible search terms including synonyms
        const searchTerms = [searchQuery];
        if (synonyms[searchQuery]) {
            searchTerms.push(...synonyms[searchQuery]);
        }

        // For very short queries, be more permissive
        const isShortQuery = searchQuery.length <= 2;

        // Collect different types of search suggestions
        this.products.forEach(product => {
            const title = product.title.toLowerCase();
            const brand = product.brand.toLowerCase();
            const category = product.category.toLowerCase();

            // Check against all search terms (including synonyms)
            searchTerms.forEach(term => {
                // Brand suggestions - exact and partial matches
                if (brand.includes(term) && !suggestionSet.has(brand)) {
                    suggestionSet.add(brand);
                    suggestions.push({
                        query: product.brand,
                        type: 'brand',
                        count: this.products.filter(p => p.brand.toLowerCase() === brand).length,
                        score: brand.startsWith(term) ? 100 : 50
                    });
                }

                // Category suggestions - be more flexible
                const categoryParts = category.split(' > ');
                categoryParts.forEach(categoryPart => {
                    const cleanCategory = categoryPart.trim().toLowerCase();
                    
                    // Check if category contains the search term or vice versa
                    if ((cleanCategory.includes(term) || (isShortQuery && term.includes(cleanCategory))) && 
                        !suggestionSet.has(cleanCategory)) {
                        suggestionSet.add(cleanCategory);
                        suggestions.push({
                            query: categoryPart.trim(),
                            type: 'category',
                            count: this.products.filter(p => p.category.toLowerCase().includes(cleanCategory)).length,
                            score: cleanCategory.startsWith(term) ? 90 : 40
                        });
                    }
                });

                // Product type suggestions from title words - much more flexible
                const titleWords = title.split(/[\s\-_,\.]+/).filter(word => word.length > 2);
                titleWords.forEach(word => {
                    const wordLower = word.toLowerCase();
                    
                    // More flexible word matching - especially for short queries
                    const hasMatch = wordLower.includes(term) || 
                                    (isShortQuery && wordLower.startsWith(term)) ||
                                    (!isShortQuery && term.includes(wordLower)) ||
                                    this.fuzzyMatch(term, wordLower);
                    
                    if (hasMatch && !suggestionSet.has(wordLower) && wordLower !== term) {
                        suggestionSet.add(wordLower);
                        suggestions.push({
                            query: word,
                            type: 'product_type',
                            count: this.products.filter(p => p.title.toLowerCase().includes(wordLower)).length,
                            score: wordLower.startsWith(term) ? 80 : (wordLower.includes(term) ? 60 : 30)
                        });
                    }
                });

                // Direct title matching for common terms
                if (title.includes(term)) {
                    // Extract phrases containing the search term
                    const words = product.title.split(' ');
                    for (let i = 0; i < words.length; i++) {
                        if (words[i].toLowerCase().includes(term)) {
                            // Create 1-3 word phrases around the matching word
                            for (let len = 1; len <= 3; len++) {
                                if (i + len <= words.length) {
                                    const phrase = words.slice(i, i + len).join(' ');
                                    const phraseLower = phrase.toLowerCase();
                                    
                                    if (phraseLower.includes(term) && 
                                        !suggestionSet.has(phraseLower) && 
                                        phrase.length > term.length) {
                                        suggestionSet.add(phraseLower);
                                        suggestions.push({
                                            query: phrase,
                                            type: 'product_match',
                                            count: this.products.filter(p => p.title.toLowerCase().includes(phraseLower)).length,
                                            score: phraseLower.startsWith(term) ? 85 : 45
                                        });
                                    }
                                }
                            }
                        }
                    }
                }

                // Combined suggestions
                const combinedQuery = `${product.brand} ${categoryParts[0] || ''}`.toLowerCase().trim();
                if (combinedQuery.includes(term) && 
                    !suggestionSet.has(combinedQuery) && 
                    combinedQuery.length > term.length) {
                    suggestionSet.add(combinedQuery);
                    suggestions.push({
                        query: `${product.brand} ${categoryParts[0] || ''}`.trim(),
                        type: 'brand_category',
                        count: this.products.filter(p => {
                            const brandMatch = p.brand.toLowerCase() === brand;
                            const categoryMatch = categoryParts[0] ? 
                                p.category.toLowerCase().includes(categoryParts[0]) : true;
                            return brandMatch && categoryMatch;
                        }).length,
                        score: combinedQuery.startsWith(term) ? 70 : 25
                    });
                }
            });
        });

        // Add some common search terms if they match
        const commonTerms = [
            'mobile', 'phone', 'smartphone', 'laptop', 'computer', 'tablet', 'headphones',
            'earphones', 'watch', 'smartwatch', 'camera', 'gaming', 'keyboard', 'mouse',
            'charger', 'cable', 'case', 'cover', 'screen', 'wireless', 'bluetooth',
            'electronics', 'accessories', 'home', 'kitchen', 'furniture', 'books',
            'sports', 'fitness', 'clothing', 'shoes', 'bags', 'beauty', 'health'
        ];

        commonTerms.forEach(term => {
            if (term.includes(searchQuery) && !suggestionSet.has(term)) {
                // Check with synonyms too
                const relatedTerms = [term];
                if (synonyms[term]) {
                    relatedTerms.push(...synonyms[term]);
                }
                
                const matchingProducts = this.products.filter(p => {
                    const titleLower = p.title.toLowerCase();
                    const categoryLower = p.category.toLowerCase();
                    return relatedTerms.some(relatedTerm => 
                        titleLower.includes(relatedTerm) || 
                        categoryLower.includes(relatedTerm)
                    );
                });
                
                if (matchingProducts.length > 0) {
                    suggestionSet.add(term);
                    suggestions.push({
                        query: term,
                        type: 'popular_term',
                        count: matchingProducts.length,
                        score: term.startsWith(searchQuery) ? 75 : 35
                    });
                }
            }
        });

        // Sort by score and return top results
        return suggestions
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(suggestion => ({
                query: suggestion.query,
                type: suggestion.type,
                count: suggestion.count,
                display_text: suggestion.query,
                subtitle: `${suggestion.count} ${suggestion.count === 1 ? 'product' : 'products'} in ${suggestion.type.replace('_', ' ')}`
            }));
    }

    // Get autocomplete suggestions (existing functionality) - Main suggestion method
    getSuggestions(query, limit = 10) {
        if (!query || query.length < 1) return [];

        const searchQuery = query.toLowerCase().trim();
        const suggestions = [];

        // Score and rank products
        this.products.forEach(product => {
            const score = this.calculateSuggestionScore(product, searchQuery);
            if (score > 0) {
                suggestions.push({
                    ...product,
                    score,
                    suggestion_type: this.getSuggestionType(product, searchQuery)
                });
            }
        });

        // Sort by score and return top results
        return suggestions
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(product => ({
                id: product.id,
                title: product.title,
                category: product.category,
                brand: product.brand,
                currentPrice: product.currentPrice || product.price,
                originalPrice: product.originalPrice,
                image: product.image,
                rating: product.rating,
                suggestion_type: product.suggestion_type,
                // Add search query for navigation to search results
                searchQuery: product.title
            }));
    }

    // Full search with filters, sorting, and pagination
    search(query, filters = {}, options = {}) {
        const {
            page = 1,
            limit = 20,
            sortBy = 'relevance',
            sortOrder = 'desc',
            location = 'Mumbai'
        } = options;

        let results = this.products;

        // Apply text search
        if (query && query.trim()) {
            const searchQuery = query.toLowerCase().trim();
            results = results.map(product => ({
                ...product,
                searchScore: this.calculateSearchScore(product, searchQuery)
            })).filter(product => product.searchScore > 0);
        }

        // Apply filters
        results = this.applyFilters(results, filters, location);

        // Apply sorting
        results = this.applySorting(results, sortBy, sortOrder);

        // Calculate pagination
        const totalResults = results.length;
        const totalPages = Math.ceil(totalResults / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedResults = results.slice(startIndex, endIndex);

        // Generate facets/filters
        const facets = this.generateFacets(this.products, query);

        return {
            query,
            results: paginatedResults.map(product => this.formatSearchResult(product, location)),
            pagination: {
                currentPage: page,
                totalPages,
                totalResults,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                resultsPerPage: limit
            },
            facets,
            appliedFilters: filters,
            sortBy,
            sortOrder,
            processingTime: '15ms' // Would be calculated in real implementation
        };
    }

    calculateSuggestionScore(product, query) {
        let score = 0;
        const title = product.title.toLowerCase();
        const category = product.category.toLowerCase();
        const brand = product.brand.toLowerCase();

        // Exact prefix matches get highest score
        if (title.startsWith(query)) score += 100;
        if (brand.startsWith(query)) score += 90;
        if (category.includes(query)) score += 80;

        // Word boundary matches
        const titleWords = title.split(' ');
        const categoryWords = category.split(' ');
        
        titleWords.forEach(word => {
            if (word.startsWith(query)) score += 70;
            if (word.includes(query)) score += 40;
        });

        categoryWords.forEach(word => {
            if (word.startsWith(query)) score += 60;
            if (word.includes(query)) score += 30;
        });

        // Fuzzy matching for typos
        if (this.fuzzyMatch(query, title)) score += 20;
        if (this.fuzzyMatch(query, brand)) score += 15;

        // Boost popular items
        score += (product.popularity || 0) * 0.1;
        score += (product.rating || 0) * 2;

        return score;
    }

    calculateSearchScore(product, query) {
        let score = this.calculateSuggestionScore(product, query);
        
        // Additional scoring for search results
        if (product.searchKeywords) {
            product.searchKeywords.forEach(keyword => {
                if (keyword.includes(query)) score += 10;
            });
        }

        if (product.description && product.description.toLowerCase().includes(query)) {
            score += 15;
        }

        return score;
    }

    getSuggestionType(product, query) {
        const title = product.title.toLowerCase();
        const brand = product.brand.toLowerCase();
        const category = product.category.toLowerCase();

        if (brand.startsWith(query)) return 'brand';
        if (category.includes(query)) return 'category';
        if (title.startsWith(query)) return 'product';
        return 'related';
    }

    applyFilters(results, filters, location) {
        let filtered = [...results];

        // Price range filter
        if (filters.minPrice || filters.maxPrice) {
            filtered = filtered.filter(product => {
                const price = product.currentPrice;
                if (filters.minPrice && price < filters.minPrice) return false;
                if (filters.maxPrice && price > filters.maxPrice) return false;
                return true;
            });
        }

        // Brand filter
        if (filters.brands && filters.brands.length > 0) {
            filtered = filtered.filter(product => 
                filters.brands.includes(product.brand)
            );
        }

        // Category filter
        if (filters.categories && filters.categories.length > 0) {
            filtered = filtered.filter(product => 
                filters.categories.some(cat => product.category.includes(cat))
            );
        }

        // Rating filter
        if (filters.minRating) {
            filtered = filtered.filter(product => 
                (product.rating || 0) >= filters.minRating
            );
        }

        // Discount filter
        if (filters.minDiscount) {
            filtered = filtered.filter(product => 
                (product.discount || 0) >= filters.minDiscount
            );
        }

        // Availability filter
        if (filters.availability) {
            filtered = filtered.filter(product => {
                if (filters.availability === 'in_stock') {
                    return product.inStock !== false;
                }
                if (filters.availability === 'fast_delivery') {
                    return product.fastDelivery === true;
                }
                if (filters.availability === 'cod') {
                    return product.locationData && 
                           product.locationData[location] && 
                           product.locationData[location].cod === true;
                }
                return true;
            });
        }

        // Special offers filter
        if (filters.offers && filters.offers.length > 0) {
            filtered = filtered.filter(product => {
                if (filters.offers.includes('bestseller') && !product.bestseller) return false;
                if (filters.offers.includes('new_arrival') && !product.newArrival) return false;
                return true;
            });
        }

        return filtered;
    }

    applySorting(results, sortBy, sortOrder) {
        const ascending = sortOrder === 'asc';
        
        switch (sortBy) {
            case 'price':
                return results.sort((a, b) => 
                    ascending ? a.currentPrice - b.currentPrice : b.currentPrice - a.currentPrice
                );
            
            case 'rating':
                return results.sort((a, b) => 
                    ascending ? (a.rating || 0) - (b.rating || 0) : (b.rating || 0) - (a.rating || 0)
                );
            
            case 'popularity':
                return results.sort((a, b) => 
                    ascending ? (a.popularity || 0) - (b.popularity || 0) : (b.popularity || 0) - (a.popularity || 0)
                );
            
            case 'discount':
                return results.sort((a, b) => 
                    ascending ? (a.discount || 0) - (b.discount || 0) : (b.discount || 0) - (a.discount || 0)
                );
            
            case 'newest':
                return results.sort((a, b) => 
                    ascending ? (a.newArrival ? -1 : 1) : (b.newArrival ? -1 : 1)
                );
            
            case 'relevance':
            default:
                return results.sort((a, b) => 
                    (b.searchScore || 0) - (a.searchScore || 0)
                );
        }
    }

    generateFacets(allProducts, query) {
        // Calculate available filters based on search results
        const brands = {};
        const categories = {};
        const priceRanges = { '0-1000': 0, '1000-5000': 0, '5000-15000': 0, '15000-50000': 0, '50000+': 0 };
        const ratings = { '4+': 0, '3+': 0, '2+': 0, '1+': 0 };
        const discounts = { '10+': 0, '20+': 0, '30+': 0, '40+': 0 };
        
        allProducts.forEach(product => {
            // Brand facets
            brands[product.brand] = (brands[product.brand] || 0) + 1;
            
            // Category facets
            const mainCategory = product.category.split(' > ')[0];
            categories[mainCategory] = (categories[mainCategory] || 0) + 1;
            
            // Price range facets
            const price = product.currentPrice;
            if (price < 1000) priceRanges['0-1000']++;
            else if (price < 5000) priceRanges['1000-5000']++;
            else if (price < 15000) priceRanges['5000-15000']++;
            else if (price < 50000) priceRanges['15000-50000']++;
            else priceRanges['50000+']++;
            
            // Rating facets
            const rating = product.rating || 0;
            if (rating >= 4) ratings['4+']++;
            if (rating >= 3) ratings['3+']++;
            if (rating >= 2) ratings['2+']++;
            if (rating >= 1) ratings['1+']++;
            
            // Discount facets
            const discount = product.discount || 0;
            if (discount >= 40) discounts['40+']++;
            if (discount >= 30) discounts['30+']++;
            if (discount >= 20) discounts['20+']++;
            if (discount >= 10) discounts['10+']++;
        });

        return {
            brands: Object.entries(brands)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 20)
                .map(([name, count]) => ({ name, count })),
            categories: Object.entries(categories)
                .sort(([,a], [,b]) => b - a)
                .map(([name, count]) => ({ name, count })),
            priceRanges,
            ratings,
            discounts,
            availability: {
                'in_stock': allProducts.filter(p => p.inStock !== false).length,
                'fast_delivery': allProducts.filter(p => p.fastDelivery === true).length,
                'cod': allProducts.filter(p => p.locationData && Object.values(p.locationData).some(loc => loc.cod)).length
            }
        };
    }

    formatSearchResult(product, location = 'Mumbai') {
        const locationData = product.locationData && product.locationData[location] 
            ? product.locationData[location] 
            : {};

        return {
            id: product.id,
            title: product.title,
            brand: product.brand,
            category: product.category,
            currentPrice: product.currentPrice,
            originalPrice: product.originalPrice,
            discount: product.discount,
            rating: product.rating,
            reviewCount: product.reviewCount,
            image: product.image,
            images: product.images,
            description: product.description,
            specifications: product.specifications,
            features: product.features,
            offers: product.offers,
            tags: product.tags,
            sku: product.sku,
            inStock: product.inStock,
            bestseller: product.bestseller,
            newArrival: product.newArrival,
            warranty: product.warranty,
            returnPolicy: product.returnPolicy,
            seller: product.seller,
            variants: product.variants,
            availability: locationData.availability || 'Check availability',
            deliveryTime: locationData.deliveryTime || '3-5 days',
            cod: locationData.cod || false,
            freeDelivery: locationData.freeDelivery || false,
            localOffers: locationData.localOffers || [],
            searchScore: product.searchScore
        };
    }

    getProductById(id, location = 'Mumbai') {
        const product = this.products.find(p => p.id === id);
        if (!product) return null;
        
        return this.formatSearchResult(product, location);
    }

    getRelatedProducts(productId, limit = 6) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return [];

        const category = product.category;
        const brand = product.brand;
        
        return this.products
            .filter(p => p.id !== productId && (
                p.category === category || 
                p.brand === brand ||
                p.category.split(' > ')[0] === category.split(' > ')[0]
            ))
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, limit)
            .map(p => ({
                id: p.id,
                title: p.title,
                brand: p.brand,
                currentPrice: p.currentPrice,
                originalPrice: p.originalPrice,
                rating: p.rating,
                image: p.image
            }));
    }

    fuzzyMatch(query, target) {
        if (!query || !target) return false;
        
        query = query.toLowerCase();
        target = target.toLowerCase();
        
        // Exact or substring match
        if (target.includes(query) || query.includes(target)) return true;
        
        // For very short queries, be more permissive with starts-with
        if (query.length <= 2) {
            return target.startsWith(query) || query.startsWith(target);
        }
        
        // For longer queries, allow some character differences
        const distance = this.levenshteinDistance(query, target);
        const maxDistance = Math.max(1, Math.floor(Math.min(query.length, target.length) * 0.3)); // Allow 30% character difference
        
        // Also check if one starts with most of the other
        const minLength = Math.min(query.length, target.length);
        const prefixMatch = query.slice(0, minLength - 1) === target.slice(0, minLength - 1);
        
        return distance <= maxDistance || prefixMatch;
    }

    levenshteinDistance(str1, str2) {
        const matrix = [];
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        return matrix[str2.length][str1.length];
    }
}

module.exports = ComprehensiveSearchEngine;
