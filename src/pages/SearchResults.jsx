// src/pages/SearchResults.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, Filter, ChevronRight, Star, Truck, Shield, Clock, Package, Grid } from 'lucide-react';
import apiService, { getImageUrl, formatPrice } from '../services/api';

const SearchResults = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q') || '';
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'products', 'categories'
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: 'all',
    brand: 'all',
    inStock: false,
    sortBy: 'relevance'
  });

  // Get unique categories and brands for filters
  const allCategories = [...new Set(products.map(p => p.category?.name).filter(Boolean))];
  const allBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];
  
  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: 'under50', label: 'Under ₱50' },
    { value: '50-500', label: '₱50 - ₱500' },
    { value: '500-2000', label: '₱500 - ₱2,000' },
    { value: '2000-5000', label: '₱2,000 - ₱5,000' },
    { value: 'over5000', label: 'Over ₱5,000' }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
    { value: 'newest', label: 'Newest First' },
    { value: 'popular', label: 'Most Popular' }
  ];

  useEffect(() => {
    const searchAll = async () => {
      if (!searchQuery.trim()) {
        setProducts([]);
        setCategories([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        console.log("🔍 Searching for:", searchQuery);
        
        // Search products
        const productResponse = await apiService.productAPI.searchProducts(searchQuery);
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
            return category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()));
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
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to avoid too many requests
    const timer = setTimeout(() => {
      searchAll();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
        result.sort((a, b) => a.name?.localeCompare(b.name || ''));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name?.localeCompare(a.name || ''));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      // Relevance and popular remain as-is (default order from API)
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
      priceRange: 'all',
      brand: 'all',
      inStock: false,
      sortBy: 'relevance'
    });
  };

  const handleAddToCart = (product) => {
    try {
      const result = apiService.cartAPI.addToCart(product, 1);
      if (result.success) {
        // Show success message (you can implement a toast notification here)
        console.log("✅ Added to cart:", product.name);
      }
    } catch (err) {
      console.error("❌ Error adding to cart:", err);
    }
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 bg-black">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#cc0000] border-t-transparent mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-200">Searching for "{searchQuery}"...</h2>
          <p className="text-gray-400 mt-2">Finding the best parts for you</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 bg-black">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-200 mb-2">Search Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
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
                className="appearance-none bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000] focus:border-transparent text-gray-200"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    Sort by: {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {filters.category !== 'all' || filters.brand !== 'all' || filters.priceRange !== 'all' || filters.inStock ? (
              <button
                onClick={clearFilters}
                className="text-sm text-[#cc0000] hover:underline"
              >
                Clear Filters
              </button>
            ) : null}
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
       

        {/* Results Grid */}
        <div className="lg:w-3/4">
          {/* No Results */}
          {resultsCount.total === 0 ? (
            <div className="bg-gray-900 rounded-xl p-12 text-center border border-gray-800">
              <Search className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-200 mb-2">No results found</h3>
              <p className="text-gray-400 mb-6">
                We couldn't find any products or categories matching "{searchQuery}"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                      <Link
                        key={category._id}
                        to={`/categories/${category._id}`}
                        className="bg-gray-900 rounded-xl hover:shadow-lg transition-all overflow-hidden group border border-gray-800 hover:border-gray-700"
                      >
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={getImageUrl(category.image, 'categories') || '/images/category-placeholder.jpg'}
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-100 group-hover:text-[#cc0000] transition-colors">
                            {category.name}
                          </h4>
                          {category.description && (
                            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                              {category.description}
                            </p>
                          )}
                          {category.productCount !== undefined && (
                            <div className="mt-3 text-sm text-gray-500">
                              {category.productCount} product{category.productCount !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </Link>
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
                    {filteredProducts.map((product) => {
                      const finalPrice = product.discountedPrice || product.price || 0;
                      const originalPrice = product.discountedPrice ? product.price : null;
                      const discountPercent = originalPrice 
                        ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
                        : 0;

                      return (
                        <div
                          key={product._id}
                          className="bg-gray-900 rounded-xl hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-800 hover:border-gray-700"
                        >
                          {/* Product Image */}
                          <Link to={`/product/${product._id}`} className="block aspect-square overflow-hidden bg-gray-800">
                            <img
                              src={getImageUrl(product.images?.[0], 'products') || '/images/product-placeholder.jpg'}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.src = '/images/product-placeholder.jpg';
                              }}
                            />
                            {discountPercent > 0 && (
                              <div className="absolute top-3 left-3 bg-[#cc0000] text-white text-xs font-bold px-2 py-1 rounded">
                                -{discountPercent}%
                              </div>
                            )}
                            {product.stock <= 0 && (
                              <div className="absolute top-3 right-3 bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded">
                                Out of Stock
                              </div>
                            )}
                          </Link>

                          {/* Product Info */}
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <Link to={`/product/${product._id}`}>
                                <h4 className="font-semibold text-gray-100 group-hover:text-[#cc0000] transition-colors line-clamp-2">
                                  {product.name}
                                </h4>
                              </Link>
                              {product.brand && (
                                <span className="text-xs font-medium text-gray-400 bg-gray-800 px-2 py-1 rounded">
                                  {product.brand}
                                </span>
                              )}
                            </div>

                            {product.category?.name && (
                              <div className="text-xs text-gray-500 mb-2">
                                {product.category.name}
                              </div>
                            )}

                            {product.description && (
                              <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                                {product.description}
                              </p>
                            )}

                            {/* Rating */}
                            {product.rating !== undefined && (
                              <div className="flex items-center mb-3">
                                <div className="flex items-center">
                                  {renderStars(product.rating)}
                                </div>
                                {product.reviewCount > 0 && (
                                  <span className="text-xs text-gray-500 ml-2">
                                    ({product.reviewCount})
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Price */}
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <div className="text-xl font-bold text-[#cc0000]">
                                  {formatPrice(finalPrice)}
                                </div>
                                {originalPrice && (
                                  <div className="text-sm text-gray-500 line-through">
                                    {formatPrice(originalPrice)}
                                  </div>
                                )}
                              </div>
                              {product.stock > 0 && (
                                <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded">
                                  In Stock
                                </span>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAddToCart(product)}
                                disabled={product.stock <= 0}
                                className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                                  product.stock > 0
                                    ? 'bg-[#cc0000] text-white hover:bg-[#aa0000]'
                                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                              </button>
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
                    })}
                  </div>
                </div>
              )}

              {/* Pagination (if needed) */}
              {filteredProducts.length > 9 && (
                <div className="mt-8 flex justify-center">
                  <nav className="flex items-center space-x-2">
                    <button className="px-3 py-2 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800">
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

          {/* Related Searches */}
          {resultsCount.total > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-800">
              <h4 className="font-semibold text-gray-100 mb-4">Related Searches</h4>
              <div className="flex flex-wrap gap-2">
                {['Brake Pads', 'Oil Filter', 'Spark Plugs', 'Battery', 'Tires', 'Air Filter'].map((term) => (
                  <Link
                    key={term}
                    to={`/search?q=${encodeURIComponent(term)}`}
                    className="px-4 py-2 bg-gray-800 text-gray-300 rounded-full hover:bg-gray-700 transition-colors text-sm"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;