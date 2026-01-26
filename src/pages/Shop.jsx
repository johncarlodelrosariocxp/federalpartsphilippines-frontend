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
  Menu,
  SlidersHorizontal,
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Handle mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Close mobile filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileFiltersOpen && !event.target.closest('.mobile-filters')) {
        setMobileFiltersOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileFiltersOpen]);

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
          brand: product.brand || null,
          imageUrl:
            product.imageUrl || product.image || product.images?.[0] || "",
          stock: product.stock || 0,
          inStock: product.inStock !== false,
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
    // Close mobile filters on mobile after applying filter
    if (isMobile) {
      setMobileFiltersOpen(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
      // Scroll to top on page change for better mobile UX
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (isMobile) {
      setMobileFiltersOpen(false);
    }
  };

  // Render functions
  const renderHeroBanner = () => (
    <div className="relative pt-16 pb-12 md:pt-24 md:pb-20 overflow-hidden">
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/newbanner/shop daw.png"
          alt="Shop Products Banner"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/10"></div>
        {/* Gradient overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/20 to-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs mb-4 md:mb-8 px-1">
          <Link to="/" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1">
            <Home className="w-3 h-3" />
            <span className="hidden xs:inline">Home</span>
          </Link>
          <ChevronRightIcon className="w-3 h-3 text-gray-500" />
          <span className="text-white font-medium">Shop</span>
        </nav>

        <div className="text-center px-1">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-10 mt-2 md:mt-8 bg-gradient-to-r from-white via-blue-100 to-blue-300 bg-clip-text text-transparent">
            Premium Products
          </h1>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto px-2">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg bg-gray-900/90 backdrop-blur-sm border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-800 p-4 sticky top-16 md:top-24 mobile-filters">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-400" />
          <h3 className="font-bold text-sm text-white">Filters</h3>
        </div>
        <button
          onClick={clearFilters}
          className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
        >
          <X className="w-3 h-3" />
          <span>Clear</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-300">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none text-white rounded-lg placeholder-gray-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-medium mb-2 text-gray-300 text-sm">Categories</h4>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            <label className="flex items-center gap-2 p-1 hover:bg-gray-800 cursor-pointer rounded-lg transition-colors">
              <input
                type="radio"
                name="category"
                checked={filters.category === ""}
                onChange={() => handleFilterChange("category", "")}
                className="text-blue-500 w-3 h-3"
              />
              <span className="text-gray-300 text-xs">All Categories</span>
            </label>
            {Array.isArray(categories) && categories.map((cat) => (
              <label
                key={cat._id || cat.id}
                className="flex items-center gap-2 p-1 hover:bg-gray-800 cursor-pointer rounded-lg transition-colors"
              >
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === (cat._id || cat.id)}
                  onChange={() => handleFilterChange("category", cat._id || cat.id)}
                  className="text-blue-500 w-3 h-3"
                />
                <span className="text-gray-300 text-xs truncate">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Product Stats */}
        <div className="pt-3 border-t border-gray-800">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Total Products</span>
              <span className="text-xs font-medium text-white">{pagination.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Current Page</span>
              <span className="text-xs font-medium text-white">{pagination.page}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMobileFilterButton = () => (
    <div className="lg:hidden fixed bottom-4 left-0 right-0 z-30 px-4">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg font-medium transition-all duration-300"
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span>Filters & Sort</span>
          {products.length > 0 && (
            <span className="bg-white text-blue-600 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {products.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );

  const renderMobileFilters = () => (
    <div className={`lg:hidden fixed inset-0 z-40 transition-all duration-300 ${
      mobileFiltersOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
    }`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          mobileFiltersOpen ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={() => setMobileFiltersOpen(false)}
      />
      
      {/* Filters Panel */}
      <div className={`absolute bottom-0 left-0 right-0 h-[85vh] bg-gray-900 rounded-t-2xl shadow-2xl transition-transform duration-300 ${
        mobileFiltersOpen ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white">Filters & Sort</h2>
            </div>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          {/* Filters Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {renderFilters()}
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-800 bg-gray-900">
            <button
              onClick={clearFilters}
              className="w-full py-3 px-4 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-medium transition-colors mb-3"
            >
              Clear All Filters
            </button>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-3"></div>
            <p className="text-gray-400 text-sm">Loading products...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-900/20 border border-red-800/50 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-red-300 font-medium text-sm">{error}</p>
              <button
                onClick={fetchProducts}
                className="text-red-400 hover:text-red-300 text-xs mt-1 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <div className="bg-gray-900/90 backdrop-blur-sm p-6 text-center border border-gray-800 rounded-xl">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-black mb-4">
            <Package className="w-7 h-7 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            No products found
          </h3>
          <p className="text-gray-400 mb-4 text-sm">
            {filters.search
              ? "No products match your search. Try different keywords."
              : "Try adjusting your filters to find more products."}
          </p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-800 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors text-sm"
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
              ? "grid grid-cols-2 gap-3 sm:gap-4 md:gap-6"
              : "space-y-3 sm:space-y-4"
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
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-1 bg-gray-900/90 backdrop-blur-sm p-1 rounded-lg border border-gray-800">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`w-8 h-8 flex items-center justify-center rounded-md ${
                  pagination.page === 1
                    ? "bg-black text-gray-600 cursor-not-allowed"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                }`}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from(
                { length: Math.min(3, pagination.totalPages) },
                (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 2) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 1) {
                    pageNum = pagination.totalPages - 2 + i;
                  } else {
                    pageNum = pagination.page - 1 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 rounded-md text-xs ${
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
                className={`w-8 h-8 flex items-center justify-center rounded-md ${
                  pagination.page === pagination.totalPages
                    ? "bg-black text-gray-600 cursor-not-allowed"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                }`}
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section with Custom Banner */}
      {renderHeroBanner()}

      {/* Filters Bar */}
      <div className="sticky top-0 z-20 bg-black/95 backdrop-blur-md border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-400" />
              </button>
              <div className="text-xs text-gray-400">
                <span className="font-semibold text-white">{products.length}</span> products
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1">
                <span className="text-xs text-gray-400">View:</span>
                <div className="flex bg-black p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded transition-all ${
                      viewMode === "grid"
                        ? "bg-gray-800 text-blue-400"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                    title="Grid View"
                    aria-label="Grid view"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded transition-all ${
                      viewMode === "list"
                        ? "bg-gray-800 text-blue-400"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                    title="List View"
                    aria-label="List view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button
                onClick={fetchProducts}
                className="p-2 border border-gray-800 hover:bg-gray-800 transition-all text-gray-300 rounded-lg"
                title="Refresh"
                aria-label="Refresh products"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="lg:grid lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar Filters - Hidden on mobile */}
          <div className="hidden lg:block lg:col-span-1">
            {renderFilters()}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Mobile Controls */}
            <div className="lg:hidden bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-800 p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  Page <span className="font-semibold text-white">{pagination.page}</span> of {pagination.totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">View:</span>
                    <div className="flex bg-black p-1 rounded-lg">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-1 rounded transition-all ${
                          viewMode === "grid"
                            ? "bg-gray-800 text-blue-400"
                            : "text-gray-500 hover:text-gray-300"
                        }`}
                        title="Grid View"
                        aria-label="Grid view"
                      >
                        <Grid className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-1 rounded transition-all ${
                          viewMode === "list"
                            ? "bg-gray-800 text-blue-400"
                            : "text-gray-500 hover:text-gray-300"
                        }`}
                        title="List View"
                        aria-label="List view"
                      >
                        <List className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Controls */}
            <div className="hidden lg:block bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-800 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">View:</span>
                    <div className="flex bg-black p-1 rounded-lg">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded transition-all ${
                          viewMode === "grid"
                            ? "bg-gray-800 text-blue-400"
                            : "text-gray-500 hover:text-gray-300"
                        }`}
                        title="Grid View"
                        aria-label="Grid view"
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded transition-all ${
                          viewMode === "list"
                            ? "bg-gray-800 text-blue-400"
                            : "text-gray-500 hover:text-gray-300"
                        }`}
                        title="List View"
                        aria-label="List view"
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-300">
                    Page {pagination.page} of {pagination.totalPages}
                  </div>
                </div>
              </div>
            </div>

            {/* Products */}
            {renderProducts()}

            {/* Featured Brands */}
            {Array.isArray(brands) && brands.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-900">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Available Brands</span>
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {brands.slice(0, 4).map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => handleFilterChange("brand", brand.name)}
                      className={`bg-gray-900/90 backdrop-blur-sm rounded-lg border p-2 transition-all duration-300 group ${
                        filters.brand === brand.name
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-gray-800 hover:border-blue-500/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-black border border-gray-800 rounded-lg flex items-center justify-center">
                          <Factory className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <h4 className={`font-bold text-xs transition-colors truncate ${
                            filters.brand === brand.name
                              ? "text-blue-300"
                              : "text-white group-hover:text-blue-300"
                          }`}>
                            {brand.name}
                          </h4>
                          <p className="text-[10px] text-gray-400">
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

      {/* Mobile Filters Button */}
      {renderMobileFilterButton()}

      {/* Mobile Filters Modal */}
      {renderMobileFilters()}

      {/* Mobile Bottom Padding */}
      <div className="pb-20 lg:pb-0"></div>
    </div>
  );
};

export default Shop;