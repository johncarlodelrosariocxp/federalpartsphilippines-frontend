import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Filter,
  Grid,
  List,
  Search,
  X,
  RefreshCw,
  Package,
  ChevronLeft,
  ChevronRight,
  Home,
  ChevronRight as ChevronRightIcon,
  Factory,
  Award,
  Star,
  Sparkles,
  Tag,
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import { productAPI, categoryAPI } from "../services/api";

const Shop = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Get filters from URL
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    brand: searchParams.get("brand") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort: searchParams.get("sort") || "newest",
    search: searchParams.get("search") || "",
    page: parseInt(searchParams.get("page") || "1"),
    limit: 12,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.toString().trim() !== "") {
        params.set(key, value.toString());
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Fetch data
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, [filters.page, filters.category, filters.brand, filters.sort, filters.search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiParams = {
        page: filters.page,
        limit: filters.limit,
        category: filters.category || undefined,
        brand: filters.brand || undefined,
        search: filters.search || undefined,
        sortBy: getSortField(filters.sort),
        sortOrder: getSortOrder(filters.sort),
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
      };

      console.log("📦 Fetching products:", apiParams);

      const response = await productAPI.getAllProducts(apiParams);
      console.log("📦 API Response:", response);

      if (response?.success) {
        const productsData = response.products || response.data?.products || [];

        const transformedProducts = productsData.map((product) => ({
          ...product,
          id: product._id || product.id,
          name: product.name || "Unnamed Product",
          price: product.price || 0,
          discountedPrice: product.discountedPrice || null,
          category: product.category || "Uncategorized",
          brand: product.brand || null,
          imageUrl:
            product.imageUrl || product.image || product.images?.[0] || "",
          stock: product.stock || 0,
          inStock: product.inStock !== false,
          rating: product.rating || 4.5,
          reviews: product.reviews || 0,
          featured: product.featured || false,
        }));

        setProducts(transformedProducts);
        setPagination({
          page: filters.page,
          total: response.total || productsData.length,
          totalPages: response.totalPages || 1,
        });
      } else {
        setError(response?.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setError("Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAllCategories();
      if (response?.success) {
        const categoriesData = response.data || response.categories || [];
        setCategories(categoriesData);
      } else {
        console.warn("Failed to fetch categories:", response?.message);
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const fetchBrands = async () => {
    try {
      // Extract brands from products instead of separate brand API
      const response = await productAPI.getAllProducts({ limit: 100 });
      
      if (response?.success) {
        const productsData = response.products || response.data?.products || [];
        
        // Extract unique brands from products
        const brandSet = new Set();
        const brandsList = [];
        
        productsData.forEach(product => {
          if (product.brand && !brandSet.has(product.brand)) {
            brandSet.add(product.brand);
            brandsList.push({
              id: product.brand.toLowerCase().replace(/\s+/g, '-'),
              name: product.brand,
              productCount: productsData.filter(p => p.brand === product.brand).length
            });
          }
        });
        
        console.log("✅ Extracted brands from products:", brandsList);
        setBrands(brandsList);
      } else {
        console.warn("Failed to extract brands from products");
        setBrands([]);
      }
    } catch (error) {
      console.error("Error extracting brands:", error);
      setBrands([]);
    }
  };

  const getSortField = (sort) => {
    switch (sort) {
      case "price-low":
      case "price-high":
        return "price";
      case "rating":
        return "rating";
      case "popular":
        return "popularity";
      case "newest":
        return "createdAt";
      default:
        return "createdAt";
    }
  };

  const getSortOrder = (sort) => {
    switch (sort) {
      case "price-high":
        return "desc";
      case "rating":
        return "desc";
      case "popular":
        return "desc";
      default:
        return "asc";
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      brand: "",
      minPrice: "",
      maxPrice: "",
      sort: "newest",
      search: "",
      page: 1,
      limit: 12,
    });
  };

  // Render functions
  const renderHeroBanner = () => (
    <div className="relative pt-24 pb-20 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="Shop Products Banner"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-gray-900/40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8">
          <Link to="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
            <Home className="w-4 h-4" />
            Home
          </Link>
          <ChevronRightIcon className="w-4 h-4 text-gray-600" />
          <span className="text-white font-medium">Shop</span>
        </nav>

        <div className="text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-500/20 backdrop-blur-sm rounded-full border border-blue-500/30 mb-6">
            <Package className="w-5 h-5 text-blue-400" />
            <span className="text-blue-300 font-medium">Premium Products Collection</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-blue-300 bg-clip-text text-transparent">
            Shop Premium Products
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            Discover our curated collection of high-quality products. 
            From essential accessories to premium equipment.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Search products by name, description, brand..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-800/90 backdrop-blur-sm border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 sticky top-24">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-lg text-white">Filters</h3>
        </div>
        <button
          onClick={clearFilters}
          className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
        >
          <X className="w-4 h-4" />
          Clear
        </button>
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-white rounded-lg placeholder-gray-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-medium mb-3 text-gray-300">Categories</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            <label className="flex items-center gap-2 p-2 hover:bg-gray-700 cursor-pointer rounded-lg transition-colors">
              <input
                type="radio"
                name="category"
                checked={filters.category === ""}
                onChange={() => handleFilterChange("category", "")}
                className="text-blue-500"
              />
              <span className="text-gray-300">All Categories</span>
            </label>
            {Array.isArray(categories) && categories.map((cat) => (
              <label
                key={cat._id || cat.id}
                className="flex items-center gap-2 p-2 hover:bg-gray-700 cursor-pointer rounded-lg transition-colors"
              >
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === (cat._id || cat.id)}
                  onChange={() => handleFilterChange("category", cat._id || cat.id)}
                  className="text-blue-500"
                />
                <span className="text-gray-300">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Brands */}
        <div>
          <h4 className="font-medium mb-3 text-gray-300">Brands</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            <label className="flex items-center gap-2 p-2 hover:bg-gray-700 cursor-pointer rounded-lg transition-colors">
              <input
                type="radio"
                name="brand"
                checked={filters.brand === ""}
                onChange={() => handleFilterChange("brand", "")}
                className="text-blue-500"
              />
              <span className="text-gray-300">All Brands</span>
            </label>
            {Array.isArray(brands) && brands.slice(0, 10).map((brand) => (
              <label
                key={brand.id}
                className="flex items-center gap-2 p-2 hover:bg-gray-700 cursor-pointer rounded-lg transition-colors"
              >
                <input
                  type="radio"
                  name="brand"
                  checked={filters.brand === brand.name}
                  onChange={() => handleFilterChange("brand", brand.name)}
                  className="text-blue-500"
                />
                <span className="text-gray-300">{brand.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h4 className="font-medium mb-3 text-gray-300">Price Range</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
              <span className="text-gray-400">to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
          </div>
        </div>

        {/* Sort */}
        <div>
          <h4 className="font-medium mb-3 text-gray-300">Sort By</h4>
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange("sort", e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-white rounded-lg"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>

        {/* Product Stats */}
        <div className="pt-4 border-t border-gray-700">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Total Products</span>
              <span className="text-sm font-medium text-white">{pagination.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Current Page</span>
              <span className="text-sm font-medium text-white">{pagination.page}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading products...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-900/20 border border-red-800/50 p-6 rounded-xl">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-red-400" />
            <div>
              <p className="text-red-300 font-medium">{error}</p>
              <button
                onClick={fetchProducts}
                className="text-red-400 hover:text-red-300 text-sm mt-2 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <div className="bg-gray-800/50 backdrop-blur-sm p-12 text-center border border-gray-700 rounded-xl">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-900 mb-6">
            <Package className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-2">
            No products found
          </h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            {filters.search
              ? "No products match your search. Try different keywords."
              : "Try adjusting your filters to find more products."}
          </p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-700 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      );
    }

    return (
      <>
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              : "space-y-6"
          }
        >
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product}
              viewMode={viewMode}
            />
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm p-2 rounded-xl border border-gray-700">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                  pagination.page === 1
                    ? "bg-gray-900 text-gray-600 cursor-not-allowed"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg ${
                        pageNum === pagination.page
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
              )}

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                  pagination.page === pagination.totalPages
                    ? "bg-gray-900 text-gray-600 cursor-not-allowed"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section with Picture Banner */}
      {renderHeroBanner()}

      {/* Filters Bar */}
      <div className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-400" />
              <span className="font-medium text-gray-300">Shop Products:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilters(prev => ({...prev, sort: "newest"}))}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filters.sort === "newest"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => setFilters(prev => ({...prev, sort: "price-low"}))}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filters.sort === "price-low"
                    ? "bg-green-600 text-white shadow-lg shadow-green-500/25"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                }`}
              >
                Price Low
              </button>
              <button
                onClick={() => setFilters(prev => ({...prev, sort: "rating"}))}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filters.sort === "rating"
                    ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                }`}
              >
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  Top Rated
                </span>
              </button>
            </div>

            <div className="text-sm text-gray-400">
              Showing <span className="font-semibold text-white">{products.length}</span> of {pagination.total} products
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            {renderFilters()}

            {/* Shop Stats */}
            <div className="mt-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Shop Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Package className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Total Products</p>
                      <p className="text-xl font-bold text-white">
                        {pagination.total}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Tag className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Categories</p>
                      <p className="text-xl font-bold text-white">
                        {Array.isArray(categories) ? categories.length : 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Factory className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Brands</p>
                      <p className="text-xl font-bold text-white">
                        {Array.isArray(brands) ? brands.length : 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
              <div className="space-y-3">
                <Link
                  to="/categories"
                  className="flex items-center justify-between p-3 border border-gray-700 rounded-lg hover:border-blue-500/50 hover:bg-blue-500/10 transition-colors group"
                >
                  <span className="font-medium text-gray-300 group-hover:text-blue-400">
                    Browse Categories
                  </span>
                  <ChevronRightIcon className="w-4 h-4 text-gray-500 group-hover:text-blue-400" />
                </Link>
                <Link
                  to="/products/featured"
                  className="flex items-center justify-between p-3 border border-gray-700 rounded-lg hover:border-amber-500/50 hover:bg-amber-500/10 transition-colors group"
                >
                  <span className="font-medium text-gray-300 group-hover:text-amber-400">
                    Featured Products
                  </span>
                  <Award className="w-4 h-4 text-gray-500 group-hover:text-amber-400" />
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Controls */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">View:</span>
                    <div className="flex bg-gray-900 p-1 rounded-lg">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded transition-all ${
                          viewMode === "grid"
                            ? "bg-gray-800 text-blue-400"
                            : "text-gray-500 hover:text-gray-300"
                        }`}
                        title="Grid View"
                      >
                        <Grid className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded transition-all ${
                          viewMode === "list"
                            ? "bg-gray-800 text-blue-400"
                            : "text-gray-500 hover:text-gray-300"
                        }`}
                        title="List View"
                      >
                        <List className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-gray-300">
                    Page {pagination.page} of {pagination.totalPages}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={fetchProducts}
                    className="p-2 border border-gray-700 hover:bg-gray-700 transition-all text-gray-300 rounded-lg"
                    title="Refresh"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products */}
            {renderProducts()}

            {/* Featured Brands */}
            {Array.isArray(brands) && brands.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-amber-400" />
                    Available Brands
                  </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {brands
                    .slice(0, 8)
                    .map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => handleFilterChange("brand", brand.name)}
                        className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border p-4 transition-all duration-300 group ${
                          filters.brand === brand.name
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-gray-700 hover:border-blue-500/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-900 border border-gray-700 rounded-lg flex items-center justify-center">
                            <Factory className="w-6 h-6 text-blue-400" />
                          </div>
                          <div className="text-left">
                            <h4 className={`font-bold transition-colors ${
                              filters.brand === brand.name
                                ? "text-blue-300"
                                : "text-white group-hover:text-blue-300"
                            }`}>
                              {brand.name}
                            </h4>
                            <p className="text-sm text-gray-400">
                              {brand.productCount || 0} products
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;