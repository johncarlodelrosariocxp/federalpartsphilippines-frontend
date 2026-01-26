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
  ShoppingBag,
  ChevronsUp,
  Users,
  ChevronsDown,
  MoreVertical,
  Grid3x3,
  Layers,
  FolderOpen,
  Crown,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Star
} from "lucide-react";
import { toast } from "react-hot-toast";
import { categoryAPI, productAPI } from "../services/api";

// FIXED: Image URL helper function
const getImageUrl = (imagePath, type = "categories") => {
  // Handle null/undefined/empty cases
  if (!imagePath || imagePath === "undefined" || imagePath === "null" || imagePath === "") {
    return null;
  }

  // If already a full URL, return as-is
  if (imagePath.startsWith("http://") || 
      imagePath.startsWith("https://") ||
      imagePath.startsWith("blob:") || 
      imagePath.startsWith("data:")) {
    return imagePath;
  }

  // Get base URL from environment
  const API_BASE_URL = import.meta.env.VITE_API_URL || "https://federalpartsphilippines-backend.onrender.com/api";
  let baseUrl = API_BASE_URL.replace("/api", "");
  
  // Remove trailing slash if exists
  baseUrl = baseUrl.replace(/\/$/, '');
  
  // Extract filename from path
  let filename = imagePath;
  if (imagePath.includes("/")) {
    filename = imagePath.substring(imagePath.lastIndexOf("/") + 1);
  }
  
  // Construct proper URL - Based on your backend structure
  return `${baseUrl}/uploads/${type}/${filename}`;
};

// Product Card Component
const ProductCard = ({ product }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // Get product images
  const getProductImages = () => {
    let images = [];
    
    if (product.images && Array.isArray(product.images)) {
      images = product.images.map(img => getImageUrl(img, "products"));
    } else if (product.image) {
      images = [getImageUrl(product.image, "products")];
    } else if (product.imageUrl) {
      images = [getImageUrl(product.imageUrl, "products")];
    }
    
    return images.filter(img => img !== null && img !== undefined);
  };

  const productImages = getProductImages();
  const firstImage = productImages[0] || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop";

  const handleProductClick = () => {
    navigate(`/product/${product._id}`);
  };

  return (
    <div 
      className="group bg-gradient-to-b from-gray-900 to-black rounded-xl border border-gray-800 overflow-hidden hover:border-red-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleProductClick}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-900 to-black">
        <img
          src={firstImage}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
          onError={() => setImageError(true)}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
       
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-white text-sm line-clamp-1">{product.name}</h3>
          {product.featured && (
            <span className="px-1.5 py-0.5 text-[10px] bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 rounded-full">
            </span>
          )}
        </div>
        
        <p className="text-xs text-gray-400 line-clamp-2 mb-3">
          {product.shortDescription || product.description || 'No description available'}
        </p>
        
     
        
     
      </div>
    </div>
  );
};

// Main Category Card Component
const MainCategoryCard = ({ 
  category, 
  isActive,
  onClick 
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Get category image URL with fallback
  const getCategoryImageUrl = () => {
    const imagePath = category.image || category.imageUrl;
    const url = getImageUrl(imagePath, "categories");
    
    if (!url) {
      // Use Unsplash fallback based on category name
      const catName = category.name?.toLowerCase() || "";
      if (catName.includes("engine")) return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop";
      if (catName.includes("brake")) return "https://images.unsplash.com/photo-1558981806-ec527fa0b4c9?w=400&h=250&fit=crop";
      if (catName.includes("tire") || catName.includes("wheel")) return "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=400&h=250&fit=crop";
      if (catName.includes("suspension")) return "https://images.unsplash.com/photo-1566473359723-7e3e4d6c8c1b?w=400&h=250&fit=crop";
      if (catName.includes("electrical") || catName.includes("battery")) return "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=250&fit=crop";
      return "https://images.unsplash.com/photo-1580261450035-4d4f04b7b4c5?w=400&h=250&fit=crop";
    }
    
    return url;
  };

  const imageUrl = getCategoryImageUrl();

  return (
    <div 
      className="group cursor-pointer"
      onClick={() => onClick(category._id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 shadow-lg group-hover:shadow-xl ${
        isActive 
          ? 'border-red-500 bg-gradient-to-br from-red-900/10 to-black group-hover:border-red-400' 
          : 'border-gray-800 bg-gradient-to-b from-gray-900 to-black group-hover:border-red-500/50 group-hover:bg-gray-900/50'
      }`}>
        {/* Image Container */}
        <div className="aspect-square overflow-hidden">
          <img
            src={imageError ? "https://images.unsplash.com/photo-1580261450035-4d4f04b7b4c5?w=400&h=250&fit=crop" : imageUrl}
            alt={category.name}
            className={`w-full h-full object-cover transition-all duration-500 ${
              isHovered ? 'scale-110 brightness-110' : 'scale-100 brightness-90'
            }`}
            onError={() => setImageError(true)}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          {/* Category Name Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h4 className={`font-bold text-lg mb-1 line-clamp-1 ${
              isActive ? 'text-white' : 'text-white'
            }`}>
              {category.name}
            </h4>
            <p className="text-sm text-gray-300">
              {category.productCount || 0} products
            </p>
          </div>
          
          {/* Featured Badge */}
          {category.featured && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 bg-gradient-to-r from-amber-500/30 to-amber-600/30 text-amber-300 text-xs font-semibold rounded-full backdrop-blur-sm">
                <Award className="w-3 h-3 inline mr-1" />
                Featured
              </span>
            </div>
          )}
        </div>
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
  
  // Get sub-category image URL
  const getSubCategoryImageUrl = () => {
    const imagePath = subCategory.image || subCategory.imageUrl;
    const url = getImageUrl(imagePath, "categories");
    
    if (!url) {
      return "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=250&fit=crop";
    }
    
    return url;
  };

  const imageUrl = getSubCategoryImageUrl();

  return (
    <div 
      className="group cursor-pointer"
      onClick={() => onViewProducts(subCategory._id)}
    >
      <div className="relative overflow-hidden rounded-xl border border-gray-800 group-hover:border-red-500/50 transition-all duration-300 bg-gradient-to-b from-gray-900 to-black shadow-lg group-hover:shadow-xl group-hover:shadow-red-500/10">
        {/* Image Container */}
        <div className="aspect-square overflow-hidden">
          <img
            src={imageError ? "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=250&fit=crop" : imageUrl}
            alt={subCategory.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          {/* Sub-category Info */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h4 className="font-semibold text-white text-sm line-clamp-1">{subCategory.name}</h4>
            <p className="text-xs text-gray-300 mt-1">
              {subCategory.productCount || 0} products
            </p>
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
        <div className="relative bg-gradient-to-b from-gray-900 to-black rounded-2xl border border-gray-800 shadow-xl overflow-hidden p-8">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-gray-700 border-t-red-500 animate-spin mx-auto mb-4"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="w-8 h-8 text-red-400 animate-pulse" />
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
        <div className="relative bg-gradient-to-b from-gray-900 to-black rounded-2xl border border-gray-800 shadow-xl overflow-hidden p-8">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center mb-4 shadow-lg">
              <Package className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No products found</h3>
            <p className="text-gray-400 text-center max-w-md">
              There are no products available in this category at the moment.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg transition-all duration-300 flex items-center gap-2"
            >
              <ChevronsUp className="w-4 h-4" />
              Back to Categories
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 mb-8 relative">
      <div className="relative bg-gradient-to-b from-gray-900 to-black rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-black">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center shadow-lg">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Products in <span className="text-red-400">{category?.name}</span>
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-gray-300 bg-black px-3 py-1 rounded-full border border-gray-800">
                    {products.length} products
                  </span>
                  {category?.productCount && (
                    <span className="text-sm text-gray-400">
                      Total in category: {category.productCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-black hover:bg-gray-900 text-gray-300 rounded-lg border border-gray-800 transition-all duration-300 hover:border-gray-700 flex items-center gap-2"
              >
                <ChevronsUp className="w-4 h-4" />
                <span className="font-medium">Back to Categories</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Products Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 bg-gradient-to-r from-gray-900 to-black">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-black hover:bg-gray-900 text-gray-300 rounded-lg border border-gray-800 transition-all duration-300 hover:border-gray-700 flex items-center gap-2"
            >
              <ChevronsUp className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Categories</span>
            </button>
            <Link
              to={`/products?category=${category?.slug || category?._id}`}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg transition-all duration-300 flex items-center gap-2"
            >
              View All Products
              <ArrowRight className="w-4 h-4" />
            </Link>
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
  const [activeMainCategory, setActiveMainCategory] = useState(null);
  const [viewingProducts, setViewingProducts] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  
  // Filters
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
  }, []);

  // Set first main category as active
  useEffect(() => {
    if (mainCategories.length > 0 && !activeMainCategory) {
      setActiveMainCategory(mainCategories[0]?._id);
    }
  }, [mainCategories, activeMainCategory]);

  // Fetch categories function
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("📁 Fetching categories...");
      
      // Try direct API call first
      const API_BASE_URL = import.meta.env.VITE_API_URL || "https://federalpartsphilippines-backend.onrender.com/api";
      const baseUrl = API_BASE_URL.replace("/api", "");
      
      let categoriesData = [];
      
      try {
        // Try direct fetch
        const response = await fetch(`${baseUrl}/api/categories`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
        });

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Direct API response:", data);
          
          if (data?.success && data.data) {
            categoriesData = data.data;
          } else if (data?.data && Array.isArray(data.data)) {
            categoriesData = data.data;
          } else if (data?.categories && Array.isArray(data.categories)) {
            categoriesData = data.categories;
          } else if (Array.isArray(data)) {
            categoriesData = data;
          }
        } else {
          console.warn("⚠️ Direct fetch failed, trying categoryAPI...");
          throw new Error("Direct fetch failed");
        }
      } catch (directError) {
        console.warn("Direct fetch error:", directError);
        
        // Fallback to categoryAPI
        try {
          const response = await categoryAPI.getAll();
          console.log("📁 categoryAPI response:", response);
          
          if (response?.success && response.data) {
            categoriesData = response.data;
          } else if (response?.data && Array.isArray(response.data)) {
            categoriesData = response.data;
          } else if (response?.categories && Array.isArray(response.categories)) {
            categoriesData = response.categories;
          } else if (Array.isArray(response)) {
            categoriesData = response;
          }
        } catch (apiError) {
          console.error("❌ categoryAPI error:", apiError);
          throw apiError;
        }
      }

      console.log("📊 Raw categories data:", categoriesData);

      // Process categories
      const processedCategories = categoriesData.map((cat, index) => {
        // Ensure all required fields exist
        const processedCat = {
          ...cat,
          _id: cat._id || cat.id || `cat-${index}`,
          name: cat.name || "Unnamed Category",
          description: cat.description || "",
          image: cat.image || cat.imageUrl || "",
          productCount: cat.productCountReal || cat.totalProductCount || cat.productCount || 0,
          featured: cat.featured || false,
          isActive: cat.isActive !== false,
          slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-"),
          children: [],
          parentCategory: cat.parentCategory || cat.parent || null
        };

        console.log(`📋 Processed category ${processedCat.name}:`, {
          image: processedCat.image,
          productCount: processedCat.productCount
        });

        return processedCat;
      });

      // Build category hierarchy
      const categoryMap = {};
      const rootCategories = [];

      // Create map
      processedCategories.forEach(category => {
        categoryMap[category._id] = { ...category, children: [] };
      });

      // Build hierarchy
      processedCategories.forEach(category => {
        const categoryNode = categoryMap[category._id];
        
        if (category.parentCategory && categoryMap[category.parentCategory]) {
          categoryMap[category.parentCategory].children.push(categoryNode);
        } else {
          rootCategories.push(categoryNode);
        }
      });

      // Sort children by name
      Object.values(categoryMap).forEach(cat => {
        if (cat.children && cat.children.length > 0) {
          cat.children.sort((a, b) => a.name.localeCompare(b.name));
        }
      });

      // Sort root categories by name
      rootCategories.sort((a, b) => a.name.localeCompare(b.name));

      console.log("🌳 Category hierarchy:", {
        rootCount: rootCategories.length,
        roots: rootCategories.map(c => ({
          name: c.name,
          productCount: c.productCount,
          children: c.children.length
        }))
      });

      setCategories(rootCategories);
      setMainCategories(rootCategories);
      
      // Flatten all categories for search
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
      
      setAllCategories(flattenCategories(rootCategories));
      
      toast.success(`Loaded ${rootCategories.length} main categories`);
      
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
      setError("Failed to load categories. Please try again.");
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  // Fetch products for a category
  const fetchCategoryProducts = async (categoryId) => {
    try {
      setProductsLoading(true);
      setProducts([]);
      
      console.log(`📦 Fetching products for category: ${categoryId}`);
      
      let productsData = [];
      
      try {
        // Try direct API call
        const API_BASE_URL = import.meta.env.VITE_API_URL || "https://federalpartsphilippines-backend.onrender.com/api";
        const baseUrl = API_BASE_URL.replace("/api", "");
        
        const response = await fetch(`${baseUrl}/api/products?category=${categoryId}&limit=50`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data?.success && data.products) {
            productsData = data.products;
          } else if (data?.data && Array.isArray(data.data)) {
            productsData = data.data;
          } else if (Array.isArray(data)) {
            productsData = data;
          }
        } else {
          throw new Error("Direct fetch failed");
        }
      } catch (directError) {
        console.warn("Direct product fetch failed, using productAPI...");
        
        // Fallback to productAPI
        const response = await productAPI.getProductsByCategory(categoryId, {
          limit: 50,
          page: 1,
          sort: 'name'
        });
        
        if (response?.success && response.products) {
          productsData = response.products;
        } else if (response?.data && Array.isArray(response.data)) {
          productsData = response.data;
        }
      }
      
      // Process products
      const processedProducts = productsData.map(product => ({
        ...product,
        _id: product._id || product.id,
        images: product.images || [product.image || product.imageUrl].filter(Boolean),
        image: product.image || product.images?.[0] || product.imageUrl,
        price: product.price || product.basePrice || 0,
        discountedPrice: product.discountedPrice || product.discountPrice || null,
        rating: product.rating || product.averageRating || 4.0,
        stock: product.stock || product.quantity || 0,
        category: product.category || {}
      }));
      
      console.log(`📦 Loaded ${processedProducts.length} products`);
      setProducts(processedProducts);
      
      if (processedProducts.length === 0) {
        toast.info("No products found in this category");
      } else {
        toast.success(`Loaded ${processedProducts.length} products`);
      }
      
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      toast.error("Failed to load products");
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  // Handle viewing products
  const handleViewProducts = async (categoryId) => {
    setViewingProducts(categoryId);
    await fetchCategoryProducts(categoryId);
  };

  // Handle main category click
  const handleMainCategoryClick = (categoryId) => {
    setActiveMainCategory(categoryId);
    setViewingProducts(null);
    setProducts([]);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
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
    setActiveMainCategory(mainCategories[0]?._id);
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
    } else if (filters.featured === "active") {
      filtered = filtered.filter(cat => cat.isActive);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (filters.sort) {
        case "name":
          return a.name?.localeCompare(b.name);
        case "products":
          return (b.productCount || 0) - (a.productCount || 0);
        case "featured":
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        case "popular":
        default:
          return (b.productCount || 0) - (a.productCount || 0);
      }
    });

    return filtered;
  };

  const filteredCategories = getFilteredCategories();
  const activeCategory = activeMainCategory 
    ? allCategories.find(cat => cat._id === activeMainCategory)
    : mainCategories[0];
  const currentCategoryWithProducts = viewingProducts 
    ? allCategories.find(cat => cat._id === viewingProducts)
    : null;

  // Render Hero Banner - UPDATED WITH NEW IMAGE
  const renderHeroBanner = () => (
    <div className="relative pt-20 pb-16 overflow-hidden bg-black">
      {/* Background Image - UPDATED */}
      <div className="absolute inset-0">
        <img
          src="/newbanner/destktop website Federal (Category).png"
          alt="Federal Parts Categories Banner"
          className="w-full h-full object-cover object-center"
          loading="eager"
        />
   
      </div>
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8">
          <Link to="/" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1 group">
            <Home className="w-4 h-4 group-hover:text-red-400 transition-colors" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-500" />
          <span className="text-white font-medium">Categories</span>
          {viewingProducts && currentCategoryWithProducts && (
            <>
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <span className="text-red-400 font-medium">Products</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <span className="text-red-300 font-medium">{currentCategoryWithProducts.name}</span>
            </>
          )}
        </nav>

        <div className="text-center mt-13 mb-12">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 mt-19 text-white">
            {viewingProducts 
              ? `Products in ${currentCategoryWithProducts?.name || 'Category'}`
              : "Browse Categories"}
          </h1>
          
          <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8">
            {viewingProducts 
              ? "Discover our premium motorcycle parts and accessories"
              : "Explore our comprehensive collection of motorcycle parts organized by category"}
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
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
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/60 backdrop-blur-sm border border-gray-700 focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400 shadow-xl"
              />
              {filters.search && (
                <button
                  onClick={() => handleFilterChange("search", "")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Main Categories Navigation
  const renderMainCategoriesNav = () => {
    if (viewingProducts || loading) return null;

    const mainCategoriesToShow = filteredCategories.filter(cat => !cat.parentCategory);

    return (
      <div className="bg-gradient-to-b from-gray-900 to-black rounded-2xl border border-gray-800 p-6 mb-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500/20 to-red-600/20 flex items-center justify-center">
              <Grid3x3 className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">BRANDS</h3>
              <p className="text-sm text-gray-400">Select a brands to view its motorcycle</p>
            </div>
          </div>
          
       
        </div>

        {/* Main Categories Grid */}
        {mainCategoriesToShow.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {mainCategoriesToShow.map((category) => (
              <MainCategoryCard
                key={category._id}
                category={category}
                isActive={activeMainCategory === category._id}
                onClick={handleMainCategoryClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center mx-auto mb-4">
              <FolderTree className="w-10 h-10 text-gray-600" />
            </div>
            <p className="text-gray-400">No main categories found</p>
            {filters.search && (
              <button
                onClick={() => handleFilterChange("search", "")}
                className="mt-4 text-red-400 hover:text-red-300"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render Sub-categories Section
  const renderSubCategories = () => {
    if (viewingProducts || !activeCategory || !activeCategory.children || activeCategory.children.length === 0) {
      return null;
    }

    return (
      <div className="bg-gradient-to-b from-gray-900 to-black rounded-2xl border border-gray-800 p-6 mb-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500/20 to-purple-600/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Motorcycles of {activeCategory.name}</h3>
              <p className="text-sm text-gray-400">Click any motorcycle to view products</p>
            </div>
          </div>
          
        
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

  // Render Controls
  const renderControls = () => (
    <div className="bg-gradient-to-b from-gray-900 to-black rounded-2xl border border-gray-800 p-6 mb-8 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3">
           
          
          </div>
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
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );

  // Render Categories or Products
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-gray-700 border-t-red-500 animate-spin mx-auto mb-4"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FolderTree className="w-8 h-8 text-red-400 animate-pulse" />
              </div>
            </div>
            <p className="text-gray-400 mt-4">Loading categories...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl border border-red-800/50 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
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

    if (filteredCategories.length === 0 && !viewingProducts) {
      return (
        <div className="bg-gradient-to-b from-gray-900 to-black p-12 text-center border border-gray-700 rounded-2xl shadow-lg">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-gray-900 to-black mb-6 shadow-lg">
            <FolderTree className="w-12 h-12 text-gray-600" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">
            No categories found
          </h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
            {filters.search
              ? "No categories match your search. Try different keywords or clear the search."
              : "No categories available at the moment. Please check back later."}
          </p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-500/25"
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
        {renderMainCategoriesNav()}
        {renderSubCategories()}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      {renderHeroBanner()}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Controls */}
        {renderControls()}

        {/* Content */}
        {renderContent()}

        {/* Help Section */}
        <div className="mt-16 pt-12 border-t border-gray-800/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-3">Need Help?</h3>
              <p className="text-gray-400 max-w-lg">
                Can't find what you're looking for? Our team is here to help you find the perfect motorcycle parts.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/contact')}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Contact Support
              </button>
              <button
                onClick={fetchCategories}
                className="px-6 py-3 bg-black hover:bg-gray-900 text-gray-300 rounded-lg border border-gray-800 transition-all duration-300 hover:border-gray-700 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;