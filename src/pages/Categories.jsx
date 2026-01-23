import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  ChevronRight,
  Home,
  Grid,
  List,
  X,
  RefreshCw,
  ArrowRight,
  Award,
  Package,
  FolderTree,
  Sparkles,
  Eye,
  FolderOpen,
  Crown,
  Layers,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Star,
  Tag,
  TrendingUp,
  CheckCircle,
  Truck,
  Maximize2,
  Minimize2,
  ChevronsDown,
  ChevronsUp,
  ShoppingBag,
  DollarSign,
  Hash,
  Calendar,
  Clock,
  Percent,
  Users,
  Globe,
  Shield,
  Zap,
  Menu,
  Grid3x3,
  MoreVertical
} from "lucide-react";
import { toast } from "react-hot-toast";
import { categoryAPI, productAPI } from "../services/api";

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

// Product Card Component - UPDATED to navigate to product detail
const ProductCard = ({ product }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const getProductImageUrl = (imagePath) => {
    if (!imagePath) return "";
    
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    let IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_URL || API_BASE_URL.replace("/api", "");
    
    if (imagePath.startsWith("/uploads/")) {
      return `${IMAGE_BASE_URL}${imagePath}`;
    }
    
    return `${IMAGE_BASE_URL}/uploads/products/${imagePath}`;
  };

  const imageUrl = getProductImageUrl(product.images?.[0] || product.image || product.imageUrl);

  const handleProductClick = () => {
    navigate(`/product/${product._id}`);
  };

  return (
    <div 
      className="group bg-black rounded-xl border border-gray-700 overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleProductClick}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-black">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-black">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-3 shadow-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
            <span className="text-sm font-medium text-blue-300 text-center px-2">
              {product.name}
            </span>
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-4 bg-black">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-white text-sm line-clamp-1">{product.name}</h3>
        </div>
        
        <p className="text-xs text-gray-400 line-clamp-2 mb-3">
          {product.shortDescription || product.description || 'No description available'}
        </p>
      
      </div>
    </div>
  );
};

// Main Category Card Component - ADDED NEW COMPONENT
const MainCategoryCard = ({ 
  category, 
  isActive,
  onClick 
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const imageUrl = getImageUrl(category.image || category.imageUrl);

  return (
    <div 
      className="group cursor-pointer"
      onClick={() => onClick(category._id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative overflow-hidden rounded-xl border transition-all duration-300 shadow-md group-hover:shadow-lg ${
        isActive 
          ? 'border-blue-500/50 bg-gradient-to-br from-blue-900/20 to-blue-800/10 group-hover:border-blue-500/70 group-hover:shadow-blue-500/10' 
          : 'border-gray-700/50 bg-black group-hover:border-blue-500/30 group-hover:bg-gray-900/50'
      }`}>
        {/* Image Container */}
        <div className="aspect-square overflow-hidden bg-black">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={category.name}
              className={`w-full h-full object-cover transition-all duration-500 ${
                isHovered ? 'scale-110 brightness-110' : 'scale-100 brightness-90'
              }`}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-black">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-lg ${
                isActive 
                  ? 'bg-gradient-to-br from-blue-600 to-blue-500' 
                  : 'bg-gradient-to-br from-gray-700 to-gray-800'
              }`}>
                <Crown className="w-8 h-8 text-white" />
              </div>
              <span className={`text-sm font-medium text-center px-2 ${
                isActive ? 'text-blue-300' : 'text-gray-300'
              }`}>
                {category.name}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <div className="flex items-start justify-between mb-1">
            <h4 className={`font-semibold text-sm line-clamp-1 ${
              isActive ? 'text-white' : 'text-gray-300'
            }`}>
              {category.name}
            </h4>
            {category.featured && (
              <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${
                isActive 
                  ? 'bg-gradient-to-r from-amber-500/30 to-amber-600/30 text-amber-300' 
                  : 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-400'
              }`}>
                <Award className="w-2.5 h-2.5 inline" />
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className={`text-xs ${
              isActive ? 'text-gray-300' : 'text-gray-400'
            }`}>
              {category.productCount || 0} products
            </span>
            <button className={`text-xs font-medium group flex items-center gap-0.5 ${
              isActive ? 'text-blue-400 hover:text-blue-300' : 'text-gray-400 hover:text-gray-300'
            }`}>
              View
              <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Active indicator */}
        {isActive && (
          <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
        )}
      </div>
    </div>
  );
};

// Sub-category Card Component
const SubCategoryCard = ({ 
  subCategory, 
  onViewProducts
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const imageUrl = getImageUrl(subCategory.image || subCategory.imageUrl);

  return (
    <div 
      className="group cursor-pointer"
      onClick={() => onViewProducts(subCategory._id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-xl border border-gray-700/50 group-hover:border-purple-500/50 transition-all duration-300 bg-black shadow-md group-hover:shadow-lg group-hover:shadow-purple-500/10">
        {/* Image Container */}
        <div className="aspect-square overflow-hidden bg-black">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={subCategory.name}
              className={`w-full h-full object-cover transition-all duration-500 ${
                isHovered ? 'scale-110 brightness-110' : 'scale-100 brightness-90'
              }`}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-black">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-2 shadow-lg">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-purple-300 text-center px-2">
                {subCategory.name}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <div className="flex items-start justify-between mb-1">
            <h4 className="font-semibold text-white text-xs line-clamp-1">{subCategory.name}</h4>
            {subCategory.featured && (
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 rounded-full">
                <Award className="w-2.5 h-2.5 inline" />
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400">
              {subCategory.productCount || 0} products
            </span>
            <button className="text-[10px] text-purple-400 hover:text-purple-300 font-medium group flex items-center gap-0.5">
              View
              <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 pointer-events-none">
          <div className="text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <h4 className="font-bold text-xs mb-0.5">{subCategory.name}</h4>
            <p className="text-[10px] text-gray-300 line-clamp-2 mb-1">
              {subCategory.description || 'No description'}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
                {subCategory.productCount || 0} products
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Products Section Component
const ProductsSection = ({ 
  products, 
  category, 
  onClose,
  loading 
}) => {
  if (loading) {
    return (
      <div className="mt-6 mb-8 relative">
        <div className="relative bg-black rounded-2xl border border-gray-700/70 shadow-xl overflow-hidden p-8">
          <div className="flex flex-col items-center justify-center h-64 bg-black">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-gray-700 border-t-blue-500 animate-spin mx-auto mb-4"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="w-8 h-8 text-blue-400 animate-pulse" />
              </div>
            </div>
            <p className="text-gray-400 mt-4">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="mt-6 mb-8 relative">
        <div className="relative bg-black rounded-2xl border border-gray-700/70 shadow-xl overflow-hidden p-8">
          <div className="flex flex-col items-center justify-center h-64 bg-black">
            <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center mb-4 shadow-lg">
              <Package className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No products found</h3>
            <p className="text-gray-400 text-center max-w-md">
              There are no products available in this category at the moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 mb-8 relative">
      {/* Main container */}
      <div className="relative bg-black rounded-2xl border border-gray-700/70 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-700/50 bg-black">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"></div>
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center shadow-lg">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Products in <span className="text-green-400">{category?.name}</span>
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-gray-300 bg-black px-3 py-1 rounded-full border border-gray-700">
                    {products.length} products
                  </span>
               
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-black hover:bg-gray-900 text-gray-300 rounded-lg border border-gray-700 transition-all duration-300 hover:border-gray-600 flex items-center gap-2"
              >
                <ChevronsUp className="w-4 h-4" />
                <span className="font-medium">Back to Categories</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Products Grid */}
        <div className="p-6 bg-black">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700/50 bg-black">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-black hover:bg-gray-900 text-gray-300 rounded-lg border border-gray-700 transition-all duration-300 hover:border-gray-600 flex items-center gap-2"
              >
                <ChevronsUp className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Categories</span>
              </button>
              
          
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Categories = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // States
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [activeMainCategory, setActiveMainCategory] = useState(null);
  const [viewingProducts, setViewingProducts] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  
  // Filters from URL
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    type: searchParams.get("type") || "main",
    featured: searchParams.get("featured") || "all",
    sort: searchParams.get("sort") || "popular",
    page: parseInt(searchParams.get("page") || "1"),
    limit: 12,
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

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [filters.page]);

  // Set first main category as active when categories are loaded
  useEffect(() => {
    if (mainCategories.length > 0 && !activeMainCategory) {
      setActiveMainCategory(mainCategories[0]?._id);
    }
  }, [mainCategories, activeMainCategory]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
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

      // Process categories and build hierarchy
      const processedCategories = categoriesData.map((cat) => ({
        ...cat,
        image: cat.image || cat.imageUrl,
        productCount: cat.productCount || 0,
        description: cat.description || "",
        featured: cat.featured || false,
        isActive: cat.isActive !== false,
        children: [],
      }));

      // Build category hierarchy
      const categoryMap = {};
      const rootCategories = [];

      // First pass: create map and identify roots
      processedCategories.forEach(category => {
        categoryMap[category._id] = { ...category, children: [] };
      });

      // Second pass: build hierarchy
      processedCategories.forEach(category => {
        const categoryNode = categoryMap[category._id];
        
        if (category.parentCategory) {
          if (categoryMap[category.parentCategory]) {
            categoryMap[category.parentCategory].children.push(categoryNode);
          }
        } else {
          rootCategories.push(categoryNode);
        }
      });

      // Flatten all categories for search and filtering
      const flattenCategories = (catList) => {
        let flat = [];
        catList.forEach(cat => {
          flat.push(cat);
          if (cat.children && cat.children.length > 0) {
            flat = flat.concat(flattenCategories(cat.children));
          }
        });
        return flat;
      };

      setCategories(rootCategories);
      setAllCategories(flattenCategories(rootCategories));
      setMainCategories(rootCategories);
      
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to load categories");
      setCategories([]);
      setAllCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products for a specific category
  const fetchCategoryProducts = async (categoryId) => {
    try {
      setProductsLoading(true);
      setProducts([]);
      
      const response = await productAPI.getProductsByCategory(categoryId, {
        limit: 50,
        page: 1,
        sort: 'name'
      });
      
      if (response.success && response.products) {
        setProducts(response.products);
        toast.success(`Loaded ${response.products.length} products`);
      } else {
        toast.error(response.message || "Failed to load products");
        setProducts([]);
      }
      
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  // Fetch products for main category (all products from all sub-categories)
  const fetchMainCategoryProducts = async (categoryId) => {
    try {
      setProductsLoading(true);
      setProducts([]);
      
      const category = allCategories.find(cat => cat._id === categoryId);
      
      if (category && category.children && category.children.length > 0) {
        const allProducts = [];
        
        for (const subCategory of category.children) {
          const response = await productAPI.getProductsByCategory(subCategory._id, {
            limit: 100,
            page: 1
          });
          
          if (response.success && response.products) {
            allProducts.push(...response.products);
          }
        }
        
        const uniqueProducts = Array.from(new Map(allProducts.map(product => [product._id, product])).values());
        setProducts(uniqueProducts);
        toast.success(`Loaded ${uniqueProducts.length} products from all sub-categories`);
      } else {
        const response = await productAPI.getProductsByCategory(categoryId, {
          limit: 100,
          page: 1
        });
        
        if (response.success && response.products) {
          setProducts(response.products);
          toast.success(`Loaded ${response.products.length} products`);
        }
      }
      
    } catch (error) {
      console.error("Error fetching main category products:", error);
      toast.error("Failed to load products");
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handleMainCategoryClick = (categoryId) => {
    setActiveMainCategory(categoryId);
    setViewingProducts(null);
    setProducts([]);
  };

  const handleViewProducts = async (categoryId) => {
    setViewingProducts(categoryId);
    
    const category = allCategories.find(cat => cat._id === categoryId);
    if (category && !category.parentCategory) {
      await fetchMainCategoryProducts(categoryId);
    } else {
      await fetchCategoryProducts(categoryId);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      type: "main",
      featured: "all",
      sort: "popular",
      page: 1,
      limit: 12,
    });
    setActiveMainCategory(mainCategories[0]?._id || null);
    setViewingProducts(null);
    setProducts([]);
  };

  const handleRefresh = () => {
    fetchCategories();
    toast.success("Categories refreshed!");
  };

  // Get filtered categories
  const getFilteredCategories = () => {
    let filtered = filters.type === "main" 
      ? mainCategories 
      : filters.type === "sub"
      ? allCategories.filter(cat => cat.parentCategory)
      : allCategories;

    // Search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(cat => 
        cat.name?.toLowerCase().includes(term) ||
        cat.description?.toLowerCase().includes(term)
      );
    }

    // Featured filter
    if (filters.featured === "featured") {
      filtered = filtered.filter(cat => cat.featured);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (filters.sort) {
        case "name":
          aValue = a.name?.toLowerCase() || "";
          bValue = b.name?.toLowerCase() || "";
          return aValue.localeCompare(bValue);
        case "products":
          aValue = a.productCount || 0;
          bValue = b.productCount || 0;
          return bValue - aValue;
        case "featured":
          aValue = a.featured ? 1 : 0;
          bValue = b.featured ? 1 : 0;
          return bValue - aValue;
        case "popular":
        default:
          aValue = a.productCount || 0;
          bValue = b.productCount || 0;
          return bValue - aValue;
      }
    });

    return filtered;
  };

  const filteredCategories = getFilteredCategories();

  // Find the active main category
  const activeCategory = activeMainCategory 
    ? allCategories.find(cat => cat._id === activeMainCategory)
    : mainCategories[0];

  // Find the category currently showing products
  const currentCategoryWithProducts = viewingProducts 
    ? allCategories.find(cat => cat._id === viewingProducts)
    : null;

  // Hero Banner
  const renderHeroBanner = () => (
    <div className="relative pt-20 pb-16 overflow-hidden bg-black">
      {/* Banner Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/newbanner/destktop website Federal (Category).png"
          alt="Federal Parts - Categories"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8">
          <Link to="/" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1 group">
            <Home className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-500" />
          <span className="text-white font-medium">Categories</span>
          {viewingProducts && currentCategoryWithProducts && (
            <>
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <span className="text-blue-400 font-medium">Products</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <span className="text-green-400 font-medium">{currentCategoryWithProducts.name}</span>
            </>
          )}
        </nav>

        <div className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-20 mt-20 text-white">
            {viewingProducts 
              ? `Products in ${currentCategoryWithProducts?.name || 'Category'}`
              : "Browse Our Categories"}
          </h1>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-10">
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                placeholder={
                  viewingProducts 
                    ? "Search products by name, description..."
                    : "Search categories by name, description..."
                }
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-black/70 backdrop-blur-sm border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Main Categories Navigation (Updated with images)
  const renderMainCategoriesNav = () => {
    if (viewingProducts || loading) return null;

    return (
      <div className="bg-black rounded-2xl border border-gray-700 p-6 mb-8 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
           
            <div>
              <h3 className="text-lg font-bold text-white">Main Categories</h3>
              <p className="text-sm text-gray-400">Select a category to view its sub-categories and products</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">View:</span>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === "grid" 
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" 
                : "text-gray-400 hover:text-white hover:bg-black border border-gray-700"}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${viewMode === "list" 
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" 
                : "text-gray-400 hover:text-white hover:bg-black border border-gray-700"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Categories Grid with Images */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredCategories
            .filter(cat => !cat.parentCategory)
            .map((category) => (
              <MainCategoryCard
                key={category._id}
                category={category}
                isActive={activeMainCategory === category._id}
                onClick={handleMainCategoryClick}
              />
            ))}
        </div>
      </div>
    );
  };

  // Sub-categories Section
  const renderSubCategories = () => {
    if (viewingProducts || !activeCategory || !activeCategory.children || activeCategory.children.length === 0) return null;

    return (
      <div className="bg-black rounded-2xl border border-gray-700 p-6 mb-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500/20 to-purple-600/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Sub-categories of {activeCategory.name}</h3>
              <p className="text-sm text-gray-400">Click any sub-category to view products</p>
            </div>
          </div>
          
          <button
            onClick={() => handleViewProducts(activeCategory._id)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="font-medium">View All Products</span>
          </button>
        </div>

        {/* Sub-categories Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
          {activeCategory.children.map((subCategory) => (
            <SubCategoryCard
              key={subCategory._id}
              subCategory={subCategory}
              onViewProducts={handleViewProducts}
            />
          ))}
        </div>
      </div>
    );
  };

  // Controls Section
  const renderControls = () => (
    <div className="bg-black rounded-2xl border border-gray-700 p-6 mb-8 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-black hover:bg-gray-900 text-gray-300 rounded-lg border border-gray-700 transition-all duration-300 hover:border-gray-600 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
          
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );

  // Render Categories
  const renderCategories = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-gray-700 border-t-blue-500 animate-spin mx-auto mb-4"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FolderTree className="w-8 h-8 text-blue-400 animate-pulse" />
              </div>
            </div>
            <p className="text-gray-400 mt-4">Loading categories...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-black p-8 rounded-2xl border border-red-800/50 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center">
              <FolderTree className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-red-300 font-medium text-lg">{error}</p>
              <button
                onClick={fetchCategories}
                className="text-red-400 hover:text-red-300 text-sm mt-2 flex items-center gap-1 transition-colors group"
              >
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (filteredCategories.length === 0) {
      return (
        <div className="bg-black p-12 text-center border border-gray-700 rounded-2xl shadow-lg">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-black mb-6 shadow-lg">
            {viewingProducts ? (
              <ShoppingBag className="w-12 h-12 text-gray-600" />
            ) : (
              <FolderTree className="w-12 h-12 text-gray-600" />
            )}
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">
            {viewingProducts ? "No products found" : "No categories found"}
          </h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
            {filters.search
              ? viewingProducts
                ? "No products match your search. Try different keywords or clear the search."
                : "No categories match your search. Try different keywords or clear the search."
              : "Try adjusting your filters to find more results."}
          </p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
          >
            Clear All Filters
          </button>
        </div>
      );
    }

    if (viewingProducts) {
      return (
        <ProductsSection
          products={products}
          category={currentCategoryWithProducts}
          onClose={() => {
            setViewingProducts(null);
            setProducts([]);
          }}
          loading={productsLoading}
        />
      );
    }

    return (
      <div>
        {/* Main Categories Navigation */}
        {renderMainCategoriesNav()}

        {/* Sub-categories Grid */}
        {renderSubCategories()}
      </div>
    );
  };

  // Featured Categories Section
  const renderFeaturedCategories = () => {
    if (viewingProducts) return null;
    
    const featuredCategories = mainCategories.filter(cat => cat.featured).slice(0, 3);
    
    if (featuredCategories.length === 0) return null;

    return (
      <div className="mt-16 pt-12 border-t border-gray-800/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Featured Categories</h2>
              <p className="text-gray-400">Top categories curated for you</p>
            </div>
          </div>
          <button
            onClick={() => handleFilterChange("featured", "featured")}
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors flex items-center gap-1 group"
          >
            View All Featured
            <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section with Picture Banner */}
      {renderHeroBanner()}

      {/* Filters Bar */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-xl border-b border-gray-800/50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                {viewingProducts ? (
                  <ShoppingBag className="w-4 h-4 text-blue-400" />
                ) : (
                  <Filter className="w-4 h-4 text-blue-400" />
                )}
              </div>
              <span className="font-medium text-gray-300">
                {viewingProducts ? "Filter & Sort Products" : "Filter & Sort Categories"}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Controls */}
        {renderControls()}

        {/* Categories/Products */}
        {renderCategories()}

        {/* Featured Categories */}
        {renderFeaturedCategories()}

        {/* Stats Footer */}
        {(filteredCategories.length > 0 || products.length > 0) && (
          <div className="mt-16 pt-12 border-t border-gray-800/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-3">Need Help?</h3>
                <p className="text-gray-400 max-w-lg">
                  {viewingProducts
                    ? "Can't find what you're looking for? Contact our support team for personalized assistance."
                    : "Explore our categories to find exactly what you need. Each category contains carefully curated products."}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/contact')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Contact Support
                </button>
                
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;