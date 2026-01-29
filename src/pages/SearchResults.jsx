// src/pages/SearchResults.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronRight, Star, Truck, Shield, Clock, Package, Grid, Loader2, X, Eye } from 'lucide-react';
import apiService, { getImageUrl, formatPrice } from '../services/api';
import debounce from 'lodash/debounce';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q') || '';
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({}); // Store products by category
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    category: 'all',
    minPrice: '',
    maxPrice: '',
    brand: 'all',
    inStock: false,
    sortBy: 'relevance'
  });
  const [isSearching, setIsSearching] = useState(false);
  const [priceError, setPriceError] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [loadingCategoryProducts, setLoadingCategoryProducts] = useState({});

  // Get unique categories and brands for filters
  const allCategories = [...new Set(products.map(p => p.category?.name).filter(Boolean))];
  const allBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];
  
  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
    { value: 'newest', label: 'Newest First' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setProducts([]);
        setCategories([]);
        setCategoryProducts({});
        setLoading(false);
        return;
      }

      setLoading(true);
      setIsSearching(true);
      setError(null);
      
      try {
        console.log("🔍 Searching for:", query);
        
        // Search products
        const productResponse = await apiService.productAPI.searchProducts(query);
        console.log("📦 Product search results:", productResponse);
        
        // Search categories
        const categoryResponse = await apiService.categoryAPI.getAllCategories();
        console.log("📁 All categories:", categoryResponse);
        
        if (productResponse.success) {
          setProducts(productResponse.products || []);
        } else {
          setProducts([]);
          console.error("❌ Product search failed:", productResponse.message);
        }
        
        if (categoryResponse.success) {
          // Filter categories based on search query
          const filteredCategories = (categoryResponse.categories || []).filter(category => {
            if (!category || !category.name) return false;
            return category.name.toLowerCase().includes(query.toLowerCase()) ||
                   (category.description && category.description.toLowerCase().includes(query.toLowerCase()));
          });
          setCategories(filteredCategories);
          console.log("📁 Filtered categories:", filteredCategories);
        } else {
          setCategories([]);
          console.error("❌ Category fetch failed:", categoryResponse.message);
        }
        
      } catch (err) {
        console.error("❌ Search error:", err);
        setError('Failed to load search results. Please try again.');
        setProducts([]);
        setCategories([]);
        setCategoryProducts({});
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
    
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

  // Apply filters to products
  const filteredProducts = React.useMemo(() => {
    let result = [...products];

    // Filter by selected category
    if (filters.category !== 'all') {
      result = result.filter(product => product.category?.name === filters.category);
    }

    // Filter by brand
    if (filters.brand !== 'all') {
      result = result.filter(product => product.brand === filters.brand);
    }

    // Filter by price range
    const minPrice = parseFloat(filters.minPrice) || 0;
    const maxPrice = parseFloat(filters.maxPrice) || Infinity;
    
    if (minPrice > 0 || maxPrice < Infinity) {
      if (minPrice > maxPrice && filters.maxPrice !== '') {
        setPriceError('Minimum price cannot be greater than maximum price');
        return [];
      } else {
        setPriceError('');
      }
      
      result = result.filter(product => {
        const price = product.discountedPrice || product.price || 0;
        return price >= minPrice && price <= maxPrice;
      });
    }

    // Filter by stock availability
    if (filters.inStock) {
      result = result.filter(product => product.stock > 0);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-low':
        result.sort((a, b) => {
          const priceA = a.discountedPrice || a.price || 0;
          const priceB = b.discountedPrice || b.price || 0;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        result.sort((a, b) => {
          const priceA = a.discountedPrice || a.price || 0;
          const priceB = b.discountedPrice || b.price || 0;
          return priceB - priceA;
        });
        break;
      case 'name-asc':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name-desc':
        result.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      // Relevance remains as-is (default order from API)
    }

    return result;
  }, [products, filters]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      minPrice: '',
      maxPrice: '',
      brand: 'all',
      inStock: false,
      sortBy: 'relevance'
    });
    setPriceError('');
  };

  const handleAddToCart = async (product) => {
    try {
      const result = await apiService.cartAPI.addToCart({
        productId: product._id,
        quantity: 1
      });
      if (result.success) {
        // Show success message
        console.log("✅ Added to cart:", product.name);
        // You could add a toast notification here
      } else {
        console.error("❌ Failed to add to cart:", result.message);
      }
    } catch (err) {
      console.error("❌ Error adding to cart:", err);
    }
  };

  const toggleCategoryExpand = async (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));

    // If expanding and haven't loaded products for this category yet
    if (!expandedCategories[categoryId] && !categoryProducts[categoryId]) {
      setLoadingCategoryProducts(prev => ({ ...prev, [categoryId]: true }));
      
      try {
        const response = await apiService.productAPI.getProductsByCategory(categoryId, { limit: 6 });
        
        if (response.success) {
          setCategoryProducts(prev => ({
            ...prev,
            [categoryId]: response.products || []
          }));
        }
      } catch (err) {
        console.error("❌ Error loading category products:", err);
      } finally {
        setLoadingCategoryProducts(prev => ({ ...prev, [categoryId]: false }));
      }
    }
  };

  const viewAllCategoryProducts = (categoryId, categoryName) => {
    navigate(`/shop?category=${categoryId}`);
  };

  const getResultsCount = () => {
    switch (activeTab) {
      case 'all':
        return {
          products: filteredProducts.length,
          categories: categories.length,
          total: filteredProducts.length + categories.length
        };
      case 'products':
        return { products: filteredProducts.length, categories: 0, total: filteredProducts.length };
      case 'categories':
        return { products: 0, categories: categories.length, total: categories.length };
      default:
        return { products: 0, categories: 0, total: 0 };
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
  };

  const renderProductCard = (product) => {
    const finalPrice = product.discountedPrice || product.price || 0;
    const originalPrice = product.discountedPrice ? product.price : null;
    const discountPercent = originalPrice 
      ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
      : 0;
    const isOutOfStock = product.stock === 0;

    return (
      <div
        key={product._id}
        className="bg-gray-900 rounded-xl hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-800 hover:border-gray-700 hover:border-[#cc0000]/50"
      >
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-800">
          <Link to={`/product/${product._id}`} className="block w-full h-full">
            <img
              src={getImageUrl(product.images?.[0], 'products') || '/images/product-placeholder.jpg'}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = '/images/product-placeholder.jpg';
              }}
            />
          </Link>
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {discountPercent > 0 && (
              <div className="bg-[#cc0000] text-white text-xs font-bold px-2 py-1 rounded">
                -{discountPercent}%
              </div>
            )}
            {isOutOfStock && (
              <div className="bg-gray-700 text-gray-300 text-xs font-bold px-2 py-1 rounded">
                Out of Stock
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <Link to={`/product/${product._id}`} className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-100 group-hover:text-[#cc0000] transition-colors line-clamp-2">
                {product.name}
              </h4>
            </Link>
            {product.brand && (
              <span className="text-xs font-medium text-gray-400 bg-gray-800 px-2 py-1 rounded flex-shrink-0 ml-2">
                {product.brand}
              </span>
            )}
          </div>

          {product.category?.name && (
            <div className="text-xs text-gray-500 mb-2">
              {product.category.name}
            </div>
          )}

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 mb-3">
              {renderStars(product.rating)}
              <span className="text-sm text-gray-400 ml-1">
                ({product.rating?.toFixed(1) || '0.0'})
              </span>
              {product.reviewCount > 0 && (
                <span className="text-sm text-gray-500">
                  ({product.reviewCount})
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">
                ₱{formatPrice(finalPrice)}
              </span>
              {originalPrice && (
                <>
                  <span className="text-gray-400 line-through">
                    ₱{formatPrice(originalPrice)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-gray-400 mb-4 line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!isOutOfStock ? (
              <button
                onClick={() => handleAddToCart(product)}
                className="flex-1 bg-[#cc0000] text-white py-2 px-4 rounded-lg hover:bg-[#aa0000] transition-colors text-sm font-medium"
              >
                Add to Cart
              </button>
            ) : (
              <button
                disabled
                className="flex-1 bg-gray-700 text-gray-400 py-2 px-4 rounded-lg cursor-not-allowed text-sm font-medium"
              >
                Out of Stock
              </button>
            )}
            <Link
              to={`/product/${product._id}`}
              className="py-2 px-4 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              View Details
            </Link>
          </div>

          {/* Features */}
          <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-3 gap-2">
            <div className="flex items-center text-xs text-gray-500">
              <Truck className="w-3 h-3 mr-1" />
              <span>Delivery</span>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <Shield className="w-3 h-3 mr-1" />
              <span>Warranty</span>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="w-3 h-3 mr-1" />
              <span>Support</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && isSearching) {
    return (
      <div className="container mx-auto px-4 py-12 bg-black min-h-screen">
        <div className="text-center">
          <Loader2 className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#cc0000] border-t-transparent mb-4" />
          <h2 className="text-xl font-semibold text-gray-200">Searching for "{searchQuery}"...</h2>
          <p className="text-gray-400 mt-2">Finding the best parts for you</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 bg-black min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-200 mb-2">Search Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => debouncedSearch(searchQuery)}
            className="bg-[#cc0000] text-white px-6 py-2 rounded-lg hover:bg-[#aa0000] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const resultsCount = getResultsCount();

  return (
    <div className="container mx-auto px-4 py-8 bg-black min-h-screen">
      {/* Search Header */}
      <div className="mb-8">
        <div className="flex items-center text-sm text-gray-400 mb-2">
          <Link to="/" className="hover:text-[#cc0000]">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span>Search Results</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-100 mb-2">
          {searchQuery ? `Results for "${searchQuery}"` : 'Search Results'}
        </h1>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-gray-300">
            Found {resultsCount.total} {resultsCount.total === 1 ? 'result' : 'results'}
            {searchQuery && ` for "${searchQuery}"`}
            {resultsCount.products > 0 && ` • ${resultsCount.products} products`}
            {resultsCount.categories > 0 && ` • ${resultsCount.categories} categories`}
          </p>
          
          <div className="flex items-center space-x-4">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="appearance-none bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000] focus:border-transparent text-gray-200"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronRight className="w-4 h-4 text-gray-500 rotate-90" />
              </div>
            </div>
            
            {(filters.category !== 'all' || filters.brand !== 'all' || filters.minPrice || filters.maxPrice || filters.inStock) && (
              <button
                onClick={clearFilters}
                className="text-sm text-[#cc0000] hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 mb-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-[#cc0000] text-[#cc0000]'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          All ({resultsCount.total})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'products'
              ? 'border-[#cc0000] text-[#cc0000]'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Products ({resultsCount.products})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'categories'
              ? 'border-[#cc0000] text-[#cc0000]'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Categories ({resultsCount.categories})
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-1/4">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-100 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </h3>
              {(filters.category !== 'all' || filters.brand !== 'all' || filters.minPrice || filters.maxPrice || filters.inStock) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-[#cc0000] hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Category Filter */}
            {allCategories.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-300 mb-3">Category</h4>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000] focus:border-transparent text-gray-200"
                >
                  <option value="all">All Categories</option>
                  {allCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Brand Filter */}
            {allBrands.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-300 mb-3">Brand</h4>
                <select
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000] focus:border-transparent text-gray-200"
                >
                  <option value="all">All Brands</option>
                  {allBrands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Price Range Filter */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-300 mb-3">Price Range</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">₱</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000] focus:border-transparent text-gray-200"
                    min="0"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">₱</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000] focus:border-transparent text-gray-200"
                    min="0"
                  />
                </div>
              </div>
              {priceError && (
                <p className="text-red-500 text-xs mt-2">{priceError}</p>
              )}
            </div>

            {/* Stock Filter */}
            <div className="mb-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                  className="w-4 h-4 text-[#cc0000] bg-gray-800 border-gray-700 rounded focus:ring-[#cc0000] focus:ring-2"
                />
                <span className="ml-3 text-gray-300">In Stock Only</span>
              </label>
            </div>

            {/* Active Filters Summary */}
            {(filters.category !== 'all' || filters.brand !== 'all' || filters.minPrice || filters.maxPrice || filters.inStock) && (
              <div className="pt-6 border-t border-gray-800">
                <h4 className="font-medium text-gray-300 mb-3">Active Filters</h4>
                <div className="flex flex-wrap gap-2">
                  {filters.category !== 'all' && (
                    <span className="inline-flex items-center gap-1 bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full">
                      Category: {filters.category}
                      <button onClick={() => handleFilterChange('category', 'all')}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.brand !== 'all' && (
                    <span className="inline-flex items-center gap-1 bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full">
                      Brand: {filters.brand}
                      <button onClick={() => handleFilterChange('brand', 'all')}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.minPrice && (
                    <span className="inline-flex items-center gap-1 bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full">
                      Min: ₱{filters.minPrice}
                      <button onClick={() => handleFilterChange('minPrice', '')}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.maxPrice && (
                    <span className="inline-flex items-center gap-1 bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full">
                      Max: ₱{filters.maxPrice}
                      <button onClick={() => handleFilterChange('maxPrice', '')}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.inStock && (
                    <span className="inline-flex items-center gap-1 bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full">
                      In Stock
                      <button onClick={() => handleFilterChange('inStock', false)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Grid */}
        <div className="lg:w-3/4">
          {/* No Results */}
          {resultsCount.total === 0 ? (
            <div className="bg-gray-900 rounded-xl p-12 text-center border border-gray-800">
              <Search className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-200 mb-2">No results found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery ? `We couldn't find any products or categories matching "${searchQuery}"` : 'Please enter a search term'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/categories"
                  className="bg-[#cc0000] text-white px-6 py-3 rounded-lg hover:bg-[#aa0000] transition-colors font-medium"
                >
                  Browse Categories
                </Link>
                <Link
                  to="/shop"
                  className="bg-gray-800 text-gray-200 px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  View All Products
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Categories Results */}
              {(activeTab === 'all' || activeTab === 'categories') && categories.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-100 mb-4 flex items-center">
                    <Grid className="w-5 h-5 mr-2 text-[#cc0000]" />
                    Categories ({categories.length})
                  </h3>
                  <div className="space-y-6">
                    {categories.map((category) => (
                      <div key={category._id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                        {/* Category Header */}
                        <div className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={getImageUrl(category.image, 'categories') || '/images/category-placeholder.jpg'}
                                  alt={category.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = '/images/category-placeholder.jpg';
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-100 text-lg mb-1">
                                  {category.name}
                                </h4>
                                {category.description && (
                                  <p className="text-sm text-gray-400 line-clamp-2">
                                    {category.description}
                                  </p>
                                )}
                                {category.productCount !== undefined && (
                                  <div className="mt-2 text-sm text-gray-500">
                                    {category.productCount} product{category.productCount !== 1 ? 's' : ''}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleCategoryExpand(category._id)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                              >
                                {expandedCategories[category._id] ? 'Hide Products' : 'Show Products'}
                                <ChevronRight className={`w-4 h-4 transition-transform ${expandedCategories[category._id] ? 'rotate-90' : ''}`} />
                              </button>
                              <button
                                onClick={() => viewAllCategoryProducts(category._id, category.name)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#cc0000] text-white rounded-lg hover:bg-[#aa0000] transition-colors text-sm"
                              >
                                <Eye className="w-4 h-4" />
                                View All
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Category Products (Expanded View) */}
                        {expandedCategories[category._id] && (
                          <div className="border-t border-gray-800 p-6 bg-gray-950/50">
                            <div className="mb-4">
                              <h5 className="font-medium text-gray-300 mb-2">Products in {category.name}</h5>
                              {loadingCategoryProducts[category._id] ? (
                                <div className="flex justify-center py-8">
                                  <Loader2 className="animate-spin h-8 w-8 text-[#cc0000]" />
                                </div>
                              ) : categoryProducts[category._id] ? (
                                <>
                                  {categoryProducts[category._id].length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                      {categoryProducts[category._id].map(product => renderProductCard(product))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-8 text-gray-400">
                                      No products found in this category.
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="text-center py-8 text-gray-400">
                                  Click "Show Products" to load products.
                                </div>
                              )}
                            </div>
                            
                            {/* View All Link */}
                            <div className="flex justify-center mt-4">
                              <button
                                onClick={() => viewAllCategoryProducts(category._id, category.name)}
                                className="text-[#cc0000] hover:text-[#aa0000] text-sm font-medium flex items-center gap-1"
                              >
                                View all products in {category.name}
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products Results */}
              {(activeTab === 'all' || activeTab === 'products') && filteredProducts.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-100 mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-[#cc0000]" />
                    Products ({filteredProducts.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map(product => renderProductCard(product))}
                  </div>
                </div>
              )}

              {/* Pagination */}
              {filteredProducts.length > 9 && (
                <div className="mt-8 flex justify-center">
                  <nav className="flex items-center space-x-2">
                    <button className="px-3 py-2 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
                      Previous
                    </button>
                    {[1, 2, 3].map((num) => (
                      <button
                        key={num}
                        className={`px-3 py-2 rounded-lg ${
                          num === 1
                            ? 'bg-[#cc0000] text-white'
                            : 'border border-gray-700 text-gray-400 hover:bg-gray-800'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                    <span className="px-3 py-2 text-gray-500">...</span>
                    <button className="px-3 py-2 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800">
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}

          {/* Search Tips */}
          {searchQuery && resultsCount.total === 0 && (
            <div className="mt-8 bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h4 className="font-semibold text-gray-200 mb-3">Search Tips</h4>
              <ul className="text-gray-400 space-y-2 text-sm">
                <li>• Check your spelling and try again</li>
                <li>• Try using more general keywords</li>
                <li>• Browse through our categories instead</li>
                <li>• Contact support if you need help finding a specific product</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;