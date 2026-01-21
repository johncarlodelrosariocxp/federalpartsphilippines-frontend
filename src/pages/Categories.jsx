import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  ChevronRight,
  Home,
  Factory,
  Grid3x3,
  List,
  X,
  RefreshCw,
  ArrowRight,
  Award,
  TrendingUp,
  Package,
  FolderTree,
  CheckCircle,
  Truck,
  Sparkles,
  Heart,
  Share2,
  Eye
} from "lucide-react";
import { toast } from "react-hot-toast";
import { categoryAPI } from "../services/api";

// Helper function to get image URL
const getImageUrl = (imagePath) => {
  if (!imagePath || imagePath === "undefined" || imagePath === "null") {
    return "";
  }

  // If it's already a full URL
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // If it's a blob or data URL
  if (imagePath.startsWith("blob:") || imagePath.startsWith("data:")) {
    return imagePath;
  }

  // Get the server URL
  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  let IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_URL;

  if (!IMAGE_BASE_URL) {
    IMAGE_BASE_URL = API_BASE_URL.replace("/api", "");
  }

  if (!IMAGE_BASE_URL) {
    IMAGE_BASE_URL = "http://localhost:5000";
  }

  // If it's an absolute path starting with /uploads/
  if (imagePath.startsWith("/uploads/")) {
    return `${IMAGE_BASE_URL}${imagePath}`;
  }

  // If it starts with /
  if (imagePath.startsWith("/")) {
    return `${IMAGE_BASE_URL}${imagePath}`;
  }

  // Otherwise, assume it's a filename in categories folder
  const cleanFilename = imagePath.replace(/^.*[\\/]/, "");
  return `${IMAGE_BASE_URL}/uploads/categories/${cleanFilename}`;
};

// Fallback image generator
const getFallbackColor = (name) => {
  const colors = [
    "bg-gradient-to-r from-blue-500 to-purple-600",
    "bg-gradient-to-r from-green-500 to-teal-600",
    "bg-gradient-to-r from-red-500 to-pink-600",
    "bg-gradient-to-r from-yellow-500 to-orange-600",
    "bg-gradient-to-r from-indigo-500 to-blue-600",
    "bg-gradient-to-r from-pink-500 to-rose-600",
    "bg-gradient-to-r from-teal-500 to-green-600",
    "bg-gradient-to-r from-orange-500 to-red-600",
  ];

  const colorIndex =
    name?.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;
  return colors[colorIndex || 0];
};

// Category Card Component
const CategoryCard = ({ category, onViewProducts }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageUrl = getImageUrl(category.image || category.imageUrl);
  const fallbackClass = getFallbackColor(category.name);

  return (
    <Link
      to={`/products?category=${category._id}`}
      className="group bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Category Header */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-start gap-4">
          {/* Logo Container with Glow Effect */}
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur group-hover:blur-xl transition duration-500"></div>
            <div className="relative w-16 h-16 rounded-xl bg-gray-900 border border-gray-700 overflow-hidden flex-shrink-0">
              {!imageError && imageUrl ? (
                <img
                  src={imageUrl}
                  alt={category.name}
                  className="w-full h-full object-contain p-2"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <FolderTree className="w-8 h-8 text-blue-400" />
                </div>
              )}
            </div>
          </div>

          {/* Category Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-bold text-white truncate group-hover:text-blue-300 transition-colors">
                {category.name || "Unnamed Category"}
              </h3>
              {category.featured && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-semibold rounded-full border border-amber-500/30">
                  <Award className="w-3 h-3" />
                  Featured
                </span>
              )}
            </div>
            
            {category.description && (
              <p className="text-sm text-gray-400 italic mb-2 line-clamp-1">
                "{category.description}"
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-900 text-gray-300 text-xs rounded-md border border-gray-700">
                <Package className="w-3 h-3" />
                {category.productCount || 0} Products
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Details */}
      <div className="p-6">
        {category.description && (
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {category.description}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-3 bg-gray-900/50 rounded-lg border border-gray-700 group-hover:border-blue-500/30 transition-colors">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-blue-300 font-medium">
                Products
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              {category.productCount || 0}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-900/50 rounded-lg border border-gray-700 group-hover:border-green-500/30 transition-colors">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-300 font-medium">
                Quality
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              Verified
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${
            category.isActive
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-gray-900 text-gray-400 border border-gray-700"
          }`}>
            {category.isActive ? "Active" : "Inactive"}
          </span>
          
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                onViewProducts(category._id);
              }}
              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            >
              <Eye className="w-4 h-4" />
              Quick View
            </button>
            <span className="text-sm text-gray-500 group-hover:text-blue-400 transition-colors flex items-center gap-1">
              View Details
              <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Category List Item Component
const CategoryListItem = ({ category, onViewProducts }) => {
  const [imageError, setImageError] = useState(false);

  const imageUrl = getImageUrl(category.image || category.imageUrl);
  const fallbackClass = getFallbackColor(category.name);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:border-blue-500/30 transition-all duration-300">
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 rounded-lg blur group-hover:blur-xl transition duration-500"></div>
          <div className="relative w-24 h-24 rounded-lg bg-gray-900 border border-gray-700 overflow-hidden flex-shrink-0">
            {!imageError && imageUrl ? (
              <img
                className="w-full h-full object-cover"
                src={imageUrl}
                alt={category.name}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <FolderTree className="w-8 h-8 text-blue-400" />
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                {category.name}
              </h3>
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                {category.description || "No description available"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1 bg-gray-900 rounded-lg border border-gray-700">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-white">
                  {category.productCount || 0}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-900 text-sm text-gray-300 rounded-md border border-gray-700">
                <CheckCircle className="w-3 h-3 text-green-400" />
                Quality
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-900 text-sm text-gray-300 rounded-md border border-gray-700">
                <Truck className="w-3 h-3 text-blue-400" />
                Fast Delivery
              </span>
              {category.featured && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/20 text-sm text-amber-300 rounded-md border border-amber-500/30">
                  <Award className="w-3 h-3" />
                  Featured
                </span>
              )}
            </div>
            <button
              onClick={() => onViewProducts(category._id)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors rounded-lg"
            >
              View Products
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Categories = () => {
  const navigate = useNavigate();

  // States
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("popular");
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    sortOrder: "desc",
    featured: "all",
  });
  const [wishlist, setWishlist] = useState([]);
  const [featuredCategories, setFeaturedCategories] = useState([]);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories when search or filters change
  useEffect(() => {
    filterCategories();
  }, [categories, searchTerm, filters, sortBy]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getAllCategories();

      let categoriesData = [];
      if (response?.success && response.data) {
        categoriesData = response.data;
      } else if (Array.isArray(response)) {
        categoriesData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (response?.categories && Array.isArray(response.categories)) {
        categoriesData = response.categories;
      } else if (Array.isArray(response)) {
        categoriesData = response;
      }

      // Process categories with images
      const processedCategories = categoriesData.map((cat) => ({
        ...cat,
        image: cat.image || cat.imageUrl,
        productCount: cat.productCount || 0,
        description: cat.description || "",
        featured: cat.featured || false,
        isActive: cat.isActive !== false,
      }));

      setCategories(processedCategories);
      setFeaturedCategories(
        processedCategories.filter((cat) => cat.featured).slice(0, 3)
      );
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = () => {
    let filtered = [...categories];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (cat) =>
          cat.name?.toLowerCase().includes(term) ||
          cat.description?.toLowerCase().includes(term) ||
          (cat.slug && cat.slug.toLowerCase().includes(term))
      );
    }

    // Featured filter
    if (filters.featured === "featured") {
      filtered = filtered.filter((cat) => cat.featured);
    } else if (filters.featured === "popular") {
      filtered = filtered.filter((cat) => (cat.productCount || 0) > 100);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.name?.toLowerCase() || "";
          bValue = b.name?.toLowerCase() || "";
          break;
        case "popular":
          aValue = a.productCount || 0;
          bValue = b.productCount || 0;
          break;
        case "featured":
          aValue = a.featured ? 1 : 0;
          bValue = b.featured ? 1 : 0;
          break;
        default:
          aValue = a.productCount || 0;
          bValue = b.productCount || 0;
      }

      return filters.sortOrder === "desc"
        ? aValue < bValue
          ? 1
          : -1
        : aValue > bValue
        ? 1
        : -1;
    });

    setFilteredCategories(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({
      sortOrder: "desc",
      featured: "all",
    });
    setSortBy("popular");
  };

  const handleViewProducts = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
  };

  const handleAddToWishlist = (categoryId, add) => {
    if (add) {
      setWishlist([...wishlist, categoryId]);
    } else {
      setWishlist(wishlist.filter((id) => id !== categoryId));
    }
  };

  const handleRefresh = () => {
    fetchCategories();
    toast.success("Categories refreshed!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section with Picture Banner */}
      <div className="relative pt-24 pb-20 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Product Categories Banner"
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
            <ChevronRight className="w-4 h-4 text-gray-600" />
            <span className="text-white font-medium">Categories</span>
          </nav>

          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-500/20 backdrop-blur-sm rounded-full border border-blue-500/30 mb-6">
              <FolderTree className="w-5 h-5 text-blue-400" />
              <span className="text-blue-300 font-medium">Premium Categories</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-blue-300 bg-clip-text text-transparent">
              Product Categories
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
              Explore our wide range of premium product categories. 
              From essential accessories to high-performance gear.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search categories by name, description..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-800/90 backdrop-blur-sm border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-400" />
              <span className="font-medium text-gray-300">Filter Categories:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilters({...filters, featured: "all"})}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filters.featured === "all"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                }`}
              >
                All Categories
              </button>
              <button
                onClick={() => setFilters({...filters, featured: "featured"})}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filters.featured === "featured"
                    ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                }`}
              >
                <span className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  Featured
                </span>
              </button>
              <button
                onClick={() => setFilters({...filters, featured: "popular"})}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filters.featured === "popular"
                    ? "bg-green-600 text-white shadow-lg shadow-green-500/25"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                }`}
              >
                Popular
              </button>

              {/* Sort Order */}
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    sortOrder: prev.sortOrder === "desc" ? "asc" : "desc",
                  }))
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                  filters.sortOrder === "desc"
                    ? "bg-gray-800 text-gray-300 border-gray-700"
                    : "bg-gray-700 text-white border-gray-600"
                }`}
              >
                {filters.sortOrder === "desc" ? "Most First" : "Least First"}
              </button>
            </div>

            <div className="text-sm text-gray-400">
              Showing <span className="font-semibold text-white">{filteredCategories.length}</span> of {categories.length} categories
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Featured Categories */}
        {featuredCategories.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-400" />
                Featured Categories
              </h2>
              <Link
                to="/products"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                View All Products →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredCategories.map((category) => (
                <div
                  key={category._id}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:border-blue-500/50 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-500/20 rounded-lg blur group-hover:blur-xl transition duration-500"></div>
                      <div className="relative w-16 h-16 bg-gray-900 border border-gray-700 rounded-lg flex items-center justify-center">
                        <FolderTree className="w-8 h-8 text-blue-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {category.productCount || 0} products
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-4 text-sm line-clamp-2">
                    {category.description}
                  </p>
                  <button
                    onClick={() => handleViewProducts(category._id)}
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Shop Now
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories Controls */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-gray-500 rounded-lg"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Sort Options */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none rounded-lg"
              >
                <option value="popular">Most Popular</option>
                <option value="name">Alphabetical</option>
                <option value="featured">Featured</option>
              </select>
            </div>

            {/* View Mode and Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="p-2 border border-gray-700 hover:bg-gray-700 transition-all text-gray-300 rounded-lg"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 bg-gray-900 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-all rounded ${
                    viewMode === "grid"
                      ? "bg-gray-800 text-blue-400"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                  title="Grid View"
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-all rounded ${
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
          </div>
        </div>

        {/* Categories Grid/List */}
        {filteredCategories.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-900 mb-6">
              <FolderTree className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              No categories found
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              {searchTerm
                ? "No categories match your search. Try different keywords."
                : "We're updating our categories. Please check back soon!"}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-700 text-gray-300 hover:bg-gray-700 rounded-lg"
              >
                Clear Filters
              </button>
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 rounded-lg"
              >
                Back to Home
              </Link>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category._id}
                category={category}
                onViewProducts={handleViewProducts}
              />
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-4">
            {filteredCategories.map((category) => (
              <CategoryListItem
                key={category._id}
                category={category}
                onViewProducts={handleViewProducts}
              />
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {filteredCategories.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-blue-500/30 transition-colors group">
                <div className="text-2xl font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">
                  {categories.length}
                </div>
                <div className="text-sm text-gray-400">Total Categories</div>
              </div>
              <div className="text-center p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-green-500/30 transition-colors group">
                <div className="text-2xl font-bold text-green-400 mb-1 group-hover:text-green-300 transition-colors">
                  {categories.filter(b => b.isActive).length}
                </div>
                <div className="text-sm text-gray-400">Active Categories</div>
              </div>
              <div className="text-center p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-amber-500/30 transition-colors group">
                <div className="text-2xl font-bold text-amber-400 mb-1 group-hover:text-amber-300 transition-colors">
                  {categories.filter(b => b.featured).length}
                </div>
                <div className="text-sm text-gray-400">Featured Categories</div>
              </div>
              <div className="text-center p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-purple-500/30 transition-colors group">
                <div className="text-2xl font-bold text-purple-400 mb-1 group-hover:text-purple-300 transition-colors">
                  {categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0)}
                </div>
                <div className="text-sm text-gray-400">Total Products</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;