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
  Star,
  Menu,
  ChevronLeft,
  Bike,
  Tag
} from "lucide-react";
import { toast } from "react-hot-toast";
import { categoryAPI, productAPI } from "../services/api";

// FIXED: Enhanced Image URL helper function
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
  
  // Clean and extract filename from path
  let filename = imagePath;
  
  // Remove any query parameters
  if (filename.includes('?')) {
    filename = filename.split('?')[0];
  }
  
  // Extract just the filename
  if (filename.includes("/")) {
    filename = filename.substring(filename.lastIndexOf("/") + 1);
  }
  
  // Remove any URL encoding if present
  filename = decodeURIComponent(filename);
  
  // Construct proper URL - Based on your backend structure
  return `${baseUrl}/uploads/${type}/${filename}`;
};

// Product Card Component
const ProductCard = ({ product, categoryId }) => {
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // Get product images
  const getProductImages = () => {
    let images = [];
    
    // Try multiple possible image sources
    if (product.images && Array.isArray(product.images)) {
      images = product.images
        .map(img => getImageUrl(img, "products"))
        .filter(img => img !== null && img !== undefined);
    }
    
    if (images.length === 0 && product.image) {
      const imageUrl = getImageUrl(product.image, "products");
      if (imageUrl) images.push(imageUrl);
    }
    
    if (images.length === 0 && product.imageUrl) {
      const imageUrl = getImageUrl(product.imageUrl, "products");
      if (imageUrl) images.push(imageUrl);
    }
    
    // If no images found, use fallback
    if (images.length === 0) {
      images.push("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&auto=format");
    }
    
    return images;
  };

  const productImages = getProductImages();
  const currentImage = productImages[currentImageIndex] || productImages[0];

  const handleProductClick = () => {
    // Navigate to product detail with return state
    navigate(`/product/${product._id}`, {
      state: {
        returnTo: `/categories?view=products&category=${categoryId}`,
        categoryId: categoryId
      }
    });
  };

  const handleImageError = (e) => {
    setImageError(true);
    e.target.src = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&auto=format";
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
          src={currentImage}
          alt={product.name || "Product Image"}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
          onError={handleImageError}
          loading="lazy"
          crossOrigin="anonymous"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Multiple images indicator */}
        {productImages.length > 1 && (
          <div className="absolute bottom-2 right-2 flex gap-1">
            {productImages.map((_, index) => (
              <div 
                key={index}
                className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-red-500' : 'bg-gray-600'}`}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-white text-xs sm:text-sm line-clamp-1">{product.name || "Unnamed Product"}</h3>
        </div>
        
        <p className="text-[10px] sm:text-xs text-gray-400 line-clamp-2 mb-2 sm:mb-3">
          {product.shortDescription || product.description || 'No description available'}
        </p>
      </div>
    </div>
  );
};

// Search Result Brand Card Component
const SearchBrandCard = ({ brand, onClick }) => {
  const [imageError, setImageError] = useState(false);
  
  const getBrandImageUrl = () => {
    const imagePath = brand.image || brand.imageUrl || brand.thumbnail;
    const url = getImageUrl(imagePath, "categories");
    
    if (!url) {
      // Use brand-specific Unsplash fallback
      const brandName = (brand.name || "").toLowerCase();
      if (brandName.includes("engine")) return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop&auto=format";
      if (brandName.includes("brake")) return "https://images.unsplash.com/photo-1558981806-ec527fa0b4c9?w=400&h=250&fit=crop&auto=format";
      if (brandName.includes("tire") || brandName.includes("wheel")) return "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=400&h=250&fit=crop&auto=format";
      return "https://images.unsplash.com/photo-1580261450035-4d4f04b7b4c5?w=400&h=250&fit=crop&auto=format";
    }
    
    return url;
  };

  const imageUrl = getBrandImageUrl();

  const handleImageError = (e) => {
    setImageError(true);
    e.target.src = "https://images.unsplash.com/photo-1580261450035-4d4f04b7b4c5?w=400&h=250&fit=crop&auto=format";
  };

  return (
    <div 
      className="group cursor-pointer"
      onClick={() => onClick(brand._id)}
    >
      <div className="relative overflow-hidden rounded-xl border border-gray-800 group-hover:border-blue-500/50 transition-all duration-300 bg-gradient-to-b from-gray-900 to-black shadow-lg group-hover:shadow-xl group-hover:shadow-blue-500/10 h-full">
        {/* Image Container */}
        <div className="aspect-square overflow-hidden">
          <img
            src={imageUrl}
            alt={brand.name || "Brand Image"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={handleImageError}
            loading="lazy"
            crossOrigin="anonymous"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          {/* Brand Info */}
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
              <h4 className="font-bold text-white text-xs sm:text-sm line-clamp-1">{brand.name || "Unnamed Brand"}</h4>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-300">
              {brand.productCount || brand.totalProducts || 0} products
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Search Result Motorcycle Card Component
const SearchMotorcycleCard = ({ motorcycle, onViewProducts }) => {
  const [imageError, setImageError] = useState(false);
  
  const getMotorcycleImageUrl = () => {
    const imagePath = motorcycle.image || motorcycle.imageUrl || motorcycle.thumbnail;
    const url = getImageUrl(imagePath, "categories");
    
    if (!url) {
      // Use motorcycle-specific Unsplash fallback
      const bikeName = (motorcycle.name || "").toLowerCase();
      if (bikeName.includes("engine")) return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop&auto=format";
      if (bikeName.includes("brake")) return "https://images.unsplash.com/photo-1558981806-ec527fa0b4c9?w=400&h=250&fit=crop&auto=format";
      if (bikeName.includes("sport")) return "https://images.unsplash.com/photo-1566473359723-7e3e4d6c8c1b?w=400&h=250&fit=crop&auto=format";
      return "https://images.unsplash.com/photo-1520295187453-cd239786490c?w=400&h=250&fit=crop&auto=format";
    }
    
    return url;
  };

  const imageUrl = getMotorcycleImageUrl();

  const handleImageError = (e) => {
    setImageError(true);
    e.target.src = "https://images.unsplash.com/photo-1520295187453-cd239786490c?w=400&h=250&fit=crop&auto=format";
  };

  return (
    <div 
      className="group cursor-pointer"
      onClick={() => onViewProducts(motorcycle._id)}
    >
      <div className="relative overflow-hidden rounded-xl border border-gray-800 group-hover:border-green-500/50 transition-all duration-300 bg-gradient-to-b from-gray-900 to-black shadow-lg group-hover:shadow-xl group-hover:shadow-green-500/10 h-full">
        {/* Image Container */}
        <div className="aspect-square overflow-hidden">
          <img
            src={imageUrl}
            alt={motorcycle.name || "Motorcycle Image"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={handleImageError}
            loading="lazy"
            crossOrigin="anonymous"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          {/* Motorcycle Info */}
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1">
              <Bike className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
              <h4 className="font-bold text-white text-xs sm:text-sm line-clamp-1">{motorcycle.name || "Unnamed Motorcycle"}</h4>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-300">
              {motorcycle.productCount || motorcycle.totalProducts || 0} products
            </p>
            {motorcycle.parentName && (
              <p className="text-[9px] sm:text-[10px] text-gray-400 mt-1">
                Brand: {motorcycle.parentName}
              </p>
            )}
          </div>
        </div>
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
    // Try multiple possible image sources
    const imagePath = category.image || category.imageUrl || category.thumbnail;
    const url = getImageUrl(imagePath, "categories");
    
    if (!url) {
      // Use category-specific Unsplash fallback
      const catName = (category.name || "").toLowerCase();
      if (catName.includes("engine")) return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop&auto=format";
      if (catName.includes("brake")) return "https://images.unsplash.com/photo-1558981806-ec527fa0b4c9?w=400&h=250&fit=crop&auto=format";
      if (catName.includes("tire") || catName.includes("wheel")) return "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=400&h=250&fit=crop&auto=format";
      if (catName.includes("suspension")) return "https://images.unsplash.com/photo-1566473359723-7e3e4d6c8c1b?w=400&h=250&fit=crop&auto=format";
      if (catName.includes("electrical") || catName.includes("battery")) return "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=250&fit=crop&auto=format";
      if (catName.includes("exhaust")) return "https://images.unsplash.com/photo-1597701466590-b7c887e4a4a3?w=400&h=250&fit=crop&auto=format";
      if (catName.includes("body")) return "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&h=250&fit=crop&auto=format";
      if (catName.includes("light")) return "https://images.unsplash.com/photo-1590866263196-58076e2d5481?w=400&h=250&fit=crop&auto=format";
      return "https://images.unsplash.com/photo-1580261450035-4d4f04b7b4c5?w=400&h=250&fit=crop&auto=format";
    }
    
    return url;
  };

  const imageUrl = getCategoryImageUrl();

  const handleImageError = (e) => {
    setImageError(true);
    e.target.src = "https://images.unsplash.com/photo-1580261450035-4d4f04b7b4c5?w=400&h=250&fit=crop&auto=format";
  };

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
            src={imageUrl}
            alt={category.name || "Category Image"}
            className={`w-full h-full object-cover transition-all duration-500 ${
              isHovered ? 'scale-110 brightness-110' : 'scale-100 brightness-90'
            }`}
            onError={handleImageError}
            loading="lazy"
            crossOrigin="anonymous"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          {/* Category Name Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
            <h4 className={`font-bold text-sm sm:text-lg mb-0.5 sm:mb-1 line-clamp-1 ${
              isActive ? 'text-white' : 'text-white'
            }`}>
              {category.name || "Unnamed Category"}
            </h4>
          </div>
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
    const imagePath = subCategory.image || subCategory.imageUrl || subCategory.thumbnail;
    const url = getImageUrl(imagePath, "categories");
    
    if (!url) {
      // Use fallback based on subcategory name
      const subName = (subCategory.name || "").toLowerCase();
      if (subName.includes("engine")) return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop&auto=format";
      if (subName.includes("brake")) return "https://images.unsplash.com/photo-1558981806-ec527fa0b4c9?w=400&h=250&fit=crop&auto=format";
      if (subName.includes("tire") || subName.includes("wheel")) return "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=400&h=250&fit=crop&auto=format";
      return "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=250&fit=crop&auto=format";
    }
    
    return url;
  };

  const imageUrl = getSubCategoryImageUrl();

  const handleImageError = (e) => {
    setImageError(true);
    e.target.src = "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=250&fit=crop&auto=format";
  };

  return (
    <div 
      className="group cursor-pointer"
      onClick={() => onViewProducts(subCategory._id)}
    >
      <div className="relative overflow-hidden rounded-xl border border-gray-800 group-hover:border-red-500/50 transition-all duration-300 bg-gradient-to-b from-gray-900 to-black shadow-lg group-hover:shadow-xl group-hover:shadow-red-500/10">
        {/* Image Container */}
        <div className="aspect-square overflow-hidden">
          <img
            src={imageUrl}
            alt={subCategory.name || "Sub-category Image"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={handleImageError}
            loading="lazy"
            crossOrigin="anonymous"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          {/* Sub-category Info */}
          <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
            <h4 className="font-semibold text-white text-xs sm:text-sm line-clamp-1">{subCategory.name || "Unnamed Sub-category"}</h4>
            <p className="text-[10px] sm:text-xs text-gray-300 mt-0.5 sm:mt-1">
              {subCategory.productCount || subCategory.totalProducts || 0} products
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mobile Back Button
const MobileBackButton = ({ onClick, label = "Back" }) => (
  <button
    onClick={onClick}
    className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg transition-all duration-300 mb-4"
  >
    <ChevronLeft className="w-5 h-5" />
    <span className="font-medium">{label}</span>
  </button>
);

// Products Section Component
const ProductsSection = ({ 
  products, 
  category, 
  onClose,
  loading 
}) => {
  if (loading) {
    return (
      <div className="mt-4 sm:mt-6 mb-6 sm:mb-8 relative">
        <MobileBackButton onClick={onClose} label="Back to Categories" />
        <div className="relative bg-gradient-to-b from-gray-900 to-black rounded-2xl border border-gray-800 shadow-xl overflow-hidden p-6 sm:p-8">
          <div className="flex flex-col items-center justify-center h-48 sm:h-64">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-gray-700 border-t-red-500 animate-spin mx-auto mb-3 sm:mb-4"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-red-400 animate-pulse" />
              </div>
            </div>
            <p className="text-gray-400 mt-3 sm:mt-4 text-sm sm:text-base">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="mt-4 sm:mt-6 mb-6 sm:mb-8 relative">
        <MobileBackButton onClick={onClose} label="Back to Categories" />
        <div className="relative bg-gradient-to-b from-gray-900 to-black rounded-2xl border border-gray-800 shadow-xl overflow-hidden p-6 sm:p-8">
          <div className="flex flex-col items-center justify-center h-48 sm:h-64">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
              <Package className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No products found</h3>
            <p className="text-gray-400 text-center text-sm sm:text-base max-w-md">
              There are no products available in this category at the moment.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg transition-all duration-300 flex items-center gap-2 text-sm sm:text-base"
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
    <div className="mt-4 sm:mt-6 mb-6 sm:mb-8 relative">
      {/* Mobile Back Button */}
      <MobileBackButton onClick={onClose} label="Back to Categories" />
      
      <div className="relative bg-gradient-to-b from-gray-900 to-black rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="relative p-4 sm:p-6 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-black">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center shadow-lg">
                  <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-lg sm:text-2xl font-bold text-white">
                  Products in <span className="text-red-400">{category?.name || "Category"}</span>
                </h2>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                  <span className="text-xs sm:text-sm text-gray-300 bg-black px-2 py-1 sm:px-3 sm:py-1 rounded-full border border-gray-800">
                    {products.length} products
                  </span>
                  {category?.productCount && (
                    <span className="text-xs sm:text-sm text-gray-400">
                      Total: {category.productCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
          
          </div>
        </div>
        
        {/* Products Grid */}
        <div className="p-3 sm:p-4 md:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product._id || product.id} 
                product={product}
                categoryId={category?._id}
              />
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-800 bg-gradient-to-r from-gray-900 to-black">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 bg-black hover:bg-gray-900 text-gray-300 rounded-lg border border-gray-800 transition-all duration-300 hover:border-gray-700 flex items-center justify-center gap-2"
            >
              <ChevronsUp className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Categories</span>
            </button>
            
            
          </div>
        </div>
      </div>
    </div>
  );
};

// Search Result Section Component - UPDATED: Show brands, motorcycles, and products
const SearchResultSection = ({ 
  results, 
  onBrandClick, 
  onMotorcycleClick,
  onProductClick,
  searchTerm 
}) => {
  // Calculate total results
  const totalResults = results.brands.length + results.motorcycles.length + results.products.length;

  if (!searchTerm || searchTerm.trim() === "" || totalResults === 0) {
    return null;
  }

  return (
    <div className="mt-6 sm:mt-8">
      <div className="bg-gradient-to-b from-gray-900 to-black rounded-xl sm:rounded-2xl border border-gray-800 p-4 sm:p-6 shadow-xl">
        {/* Search Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-blue-500/20 to-blue-600/20 flex items-center justify-center">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Search Results for "{searchTerm}"
              </h3>
              <p className="text-xs sm:text-sm text-gray-400">
                Found {totalResults} results across brands, motorcycles, and products
              </p>
            </div>
          </div>
          
          {/* Clear Search Button - Only shown when searching */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.href = '/categories'}
              className="px-3 py-1.5 bg-black hover:bg-gray-900 text-gray-300 rounded-lg border border-gray-700 transition-all duration-300 hover:border-gray-600 flex items-center gap-1.5 text-xs sm:text-sm"
            >
              <X className="w-3 h-3" />
              Clear Search
            </button>
          </div>
        </div>

        {/* Brands Results */}
        {results.brands.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-blue-400" />
              <h4 className="text-base font-bold text-white">Brands ({results.brands.length})</h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {results.brands.map(brand => (
                <div key={brand._id} onClick={() => onBrandClick(brand._id)}>
                  <SearchBrandCard brand={brand} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Motorcycles Results */}
        {results.motorcycles.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Bike className="w-5 h-5 text-green-400" />
              <h4 className="text-base font-bold text-white">Motorcycles ({results.motorcycles.length})</h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {results.motorcycles.map(motorcycle => (
                <div key={motorcycle._id} onClick={() => onMotorcycleClick(motorcycle._id)}>
                  <SearchMotorcycleCard motorcycle={motorcycle} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products Results */}
        {results.products.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="w-5 h-5 text-red-400" />
              <h4 className="text-base font-bold text-white">Products ({results.products.length})</h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {results.products.slice(0, 12).map(product => (
                <div 
                  key={product._id}
                  onClick={() => onProductClick(product._id)}
                >
                  <ProductCard 
                    product={product}
                    categoryId={product.category?._id}
                  />
                </div>
              ))}
            </div>
            {results.products.length > 12 && (
              <div className="text-center mt-6">
                <Link
                  to={`/products?search=${encodeURIComponent(searchTerm)}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg transition-all duration-300"
                >
                  View all {results.products.length} products
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}
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
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeMainCategory, setActiveMainCategory] = useState(null);
  const [viewingProducts, setViewingProducts] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Search states
  const [searchResults, setSearchResults] = useState({
    brands: [],
    motorcycles: [],
    products: []
  });
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [isSearching, setIsSearching] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    type: searchParams.get("type") || "main",
    featured: searchParams.get("featured") || "all",
    sort: searchParams.get("sort") || "popular",
    page: parseInt(searchParams.get("page") || "1"),
    limit: 12,
  });

  // NEW: Check URL for view state when component mounts
  useEffect(() => {
    const viewParam = searchParams.get("view");
    const categoryParam = searchParams.get("category");
    
    if (viewParam === "products" && categoryParam) {
      // We're coming back from a product detail page
      // Wait for categories to load, then restore the products view
      if (allCategories.length > 0) {
        const category = allCategories.find(cat => cat._id === categoryParam);
        if (category) {
          console.log("🔙 Restoring products view for category:", category.name);
          setViewingProducts(categoryParam);
          fetchCategoryProducts(categoryParam);
        }
      }
    }
  }, [searchParams, allCategories]);

  // Update URL when filters OR viewingProducts change
  useEffect(() => {
    const params = new URLSearchParams();
    
    // Always preserve view state
    if (viewingProducts) {
      params.set("view", "products");
      params.set("category", viewingProducts);
    }
    
    // Add filter params
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.toString().trim() !== "") {
        params.set(key, value.toString());
      }
    });
    
    setSearchParams(params);
  }, [filters, viewingProducts, setSearchParams]);

  // Close mobile filters when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowMobileFilters(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
    fetchAllProducts();
  }, []);

  // Set first main category as active
  useEffect(() => {
    if (mainCategories.length > 0 && !activeMainCategory) {
      setActiveMainCategory(mainCategories[0]?._id);
    }
  }, [mainCategories, activeMainCategory]);

  // Perform search when search term changes
  useEffect(() => {
    if (searchTerm && searchTerm.trim() !== "") {
      performSearch(searchTerm);
    } else {
      setSearchResults({ brands: [], motorcycles: [], products: [] });
      setIsSearching(false);
    }
  }, [searchTerm]);

  // Fetch all products for search functionality
  const fetchAllProducts = async () => {
    try {
      console.log("📦 Fetching all products for search...");
      
      let productsData = [];
      
      try {
        // Try direct API call
        const API_BASE_URL = import.meta.env.VITE_API_URL || "https://federalpartsphilippines-backend.onrender.com/api";
        const baseUrl = API_BASE_URL.replace("/api", "");
        
        const response = await fetch(`${baseUrl}/api/products?limit=200&populate=images`, {
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
          throw new Error("Direct product fetch failed");
        }
      } catch (directError) {
        console.warn("Direct all products fetch failed, using productAPI...");
        
        // Fallback to productAPI
        try {
          const response = await productAPI.getAll({
            limit: 200,
            page: 1,
          });
          
          if (response?.success && response.products) {
            productsData = response.products;
          } else if (response?.data && Array.isArray(response.data)) {
            productsData = response.data;
          }
        } catch (apiError) {
          console.error("❌ productAPI error for all products:", apiError);
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
      
      console.log(`📦 Loaded ${processedProducts.length} products for search`);
      setAllProducts(processedProducts);
      
    } catch (error) {
      console.error("❌ Error fetching all products:", error);
    }
  };

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
        // Try direct fetch with proper headers
        const response = await fetch(`${baseUrl}/api/categories?populate=image&limit=100`, {
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
          
          // If still no data, use mock data for testing
          console.log("⚠️ Using mock data for testing");
          categoriesData = [
            {
              _id: "1",
              name: "Engine Parts",
              description: "Complete engine components and accessories",
              image: "engine.jpg",
              productCount: 45,
              featured: true,
              children: [
                { _id: "1-1", name: "Cylinder Heads", productCount: 12 },
                { _id: "1-2", name: "Pistons", productCount: 8 },
                { _id: "1-3", name: "Crankshafts", productCount: 6 },
              ]
            },
            {
              _id: "2",
              name: "Brake Systems",
              description: "Brake components and accessories",
              image: "brake.jpg",
              productCount: 32,
              featured: false,
              children: [
                { _id: "2-1", name: "Brake Pads", productCount: 15 },
                { _id: "2-2", name: "Brake Discs", productCount: 10 },
              ]
            }
          ];
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
          image: cat.image || cat.imageUrl || cat.thumbnail || "",
          productCount: cat.productCountReal || cat.totalProductCount || cat.productCount || cat.totalProducts || 0,
          featured: cat.featured || false,
          isActive: cat.isActive !== false,
          slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-"),
          children: cat.children || cat.subcategories || [],
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

      // Sort root categories by product count (descending)
      rootCategories.sort((a, b) => (b.productCount || 0) - (a.productCount || 0));

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
      
      const flattened = flattenCategories(rootCategories);
      setAllCategories(flattened);
      
      // NEW: Check if we need to restore products view after loading categories
      const viewParam = searchParams.get("view");
      const categoryParam = searchParams.get("category");
      if (viewParam === "products" && categoryParam) {
        const category = flattened.find(cat => cat._id === categoryParam);
        if (category) {
          console.log("🔄 Restoring products view after categories load");
          setViewingProducts(categoryParam);
          fetchCategoryProducts(categoryParam);
        }
      }
      
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
        
        const response = await fetch(`${baseUrl}/api/products?category=${categoryId}&limit=50&populate=images`, {
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
        try {
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
        } catch (apiError) {
          console.error("❌ productAPI error:", apiError);
        }
      }
      
      // If still no data, use mock products for testing
      if (productsData.length === 0) {
        console.log("⚠️ Using mock products for testing");
        productsData = [
          {
            _id: "p1",
            name: "High Performance Brake Pads",
            description: "Premium brake pads for maximum stopping power",
            price: 2499,
            discountedPrice: 1999,
            stock: 25,
            featured: true,
            images: ["brake-pads.jpg"]
          },
          {
            _id: "p2",
            name: "Sport Exhaust System",
            description: "Performance exhaust system for enhanced power",
            price: 12999,
            stock: 8,
            featured: true,
            images: ["exhaust.jpg"]
          }
        ];
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

  // Perform search across brands, motorcycles, and products
  const performSearch = async (term) => {
    if (!term || term.trim() === "") {
      setSearchResults({ brands: [], motorcycles: [], products: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSearchLoading(true);

    const searchTerm = term.toLowerCase().trim();
    
    // Search in brands (main categories)
    const brandsResults = mainCategories.filter(brand =>
      brand.name.toLowerCase().includes(searchTerm) ||
      (brand.description && brand.description.toLowerCase().includes(searchTerm))
    ).map(brand => ({
      ...brand,
      parentName: null
    }));

    // Search in motorcycles (sub-categories)
    const motorcyclesResults = [];
    allCategories.forEach(category => {
      if (category.children && category.children.length > 0) {
        category.children.forEach(subCat => {
          if (subCat.name.toLowerCase().includes(searchTerm) ||
              (subCat.description && subCat.description.toLowerCase().includes(searchTerm))) {
            motorcyclesResults.push({
              ...subCat,
              parentName: category.name,
              parentId: category._id
            });
          }
        });
      }
    });

    // Search in products
    const productsResults = allProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      (product.description && product.description.toLowerCase().includes(searchTerm)) ||
      (product.shortDescription && product.shortDescription.toLowerCase().includes(searchTerm))
    );

    setSearchResults({
      brands: brandsResults,
      motorcycles: motorcyclesResults,
      products: productsResults
    });

    setSearchLoading(false);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleFilterChange("search", value);
  };

  // Handle brand click from search results
  const handleBrandClick = (brandId) => {
    setActiveMainCategory(brandId);
    setViewingProducts(null);
    setProducts([]);
    setIsSearching(false);
    
    // Scroll to subcategories
    setTimeout(() => {
      const element = document.querySelector('[data-subcategories]');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Handle motorcycle click from search results
  const handleMotorcycleClick = async (motorcycleId) => {
    setViewingProducts(motorcycleId);
    setIsSearching(false);
    await fetchCategoryProducts(motorcycleId);
    // Scroll to top on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle viewing products
  const handleViewProducts = async (categoryId) => {
    setViewingProducts(categoryId);
    setIsSearching(false);
    await fetchCategoryProducts(categoryId);
    // Scroll to top on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle main category click
  const handleMainCategoryClick = (categoryId) => {
    setActiveMainCategory(categoryId);
    setViewingProducts(null);
    setProducts([]);
    setIsSearching(false);
    // Scroll to subcategories on mobile
    if (window.innerWidth < 768) {
      setTimeout(() => {
        const element = document.querySelector('[data-subcategories]');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  // Handle product click from search results
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`, {
      state: {
        returnTo: `/categories?search=${encodeURIComponent(searchTerm)}`,
        searchTerm: searchTerm
      }
    });
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
    setSearchTerm("");
    setIsSearching(false);
    setSearchResults({ brands: [], motorcycles: [], products: [] });
    setActiveMainCategory(mainCategories[0]?._id);
    setViewingProducts(null);
    setProducts([]);
    setShowMobileFilters(false);
  };

  // Get filtered categories
  const getFilteredCategories = () => {
    let filtered = filters.type === "main" 
      ? mainCategories 
      : filters.type === "sub"
      ? allCategories.filter(cat => cat.parentCategory)
      : allCategories;

    // Search filter
    if (filters.search && filters.search.trim() !== "" && !isSearching) {
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

  // Render Hero Banner
  const renderHeroBanner = () => (
    <div className="relative pt-16 sm:pt-20 pb-12 sm:pb-16 overflow-hidden bg-black">
      {/* Background Image - Fixed URL */}
      <div className="absolute inset-0">
        <img
          src="/newbanner/destktop website Federal (Category).png"
          alt="Federal Parts Categories Banner"
          className="w-full h-full object-cover object-center"
          loading="eager"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1597701466590-b7c887e4a4a3?w=1920&h=600&fit=crop&auto=format";
          }}
        />
        <div className="absolute inset-0 "></div>
      </div>
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm mb-6 sm:mb-8">
          <Link to="/" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1 group">
            <Home className="w-3 h-3 sm:w-4 sm:h-4 group-hover:text-red-400 transition-colors" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
          <span className="text-white font-medium">Categories</span>
          {viewingProducts && currentCategoryWithProducts && (
            <>
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
              <span className="text-red-400 font-medium">Products</span>
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
              <span className="text-red-300 font-medium truncate max-w-[100px] sm:max-w-none">
                {currentCategoryWithProducts.name}
              </span>
            </>
          )}
        </nav>

        <div className="text-center mt-10 sm:mt-13 mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-[#cc0000]">
            {viewingProducts 
              ? `Products in ${currentCategoryWithProducts?.name || 'Category'}`
              : "Browse Categories"}
          </h1>
          
          <p className="text-sm sm:text-base md:text-xl text-gray-200 max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
            {viewingProducts 
              ? "Discover our premium motorcycle parts and accessories"
              : "Search brands, motorcycles, and products - All in one place"}
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto px-4 relative">
            <div className="relative">
              <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search brands, motorcycles, or products..."
                className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl bg-black/60 backdrop-blur-sm border border-gray-700 focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400 shadow-xl text-sm sm:text-base"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    handleFilterChange("search", "");
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Type to search across brands, motorcycles, and products
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile Filter Overlay
  const renderMobileFilters = () => {
    if (!showMobileFilters) return null;

    return (
      <div className="fixed inset-0 z-50 md:hidden">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
        <div className="absolute right-0 top-0 bottom-0 w-4/5 max-w-sm bg-gradient-to-b from-gray-900 to-black border-l border-gray-800 shadow-2xl overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Filters</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="space-y-6">
              
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sort by:
                </label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange("sort", e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="popular">Most Popular</option>
                  <option value="products">Most Products</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="featured">Featured First</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  View Type:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleFilterChange("type", "main")}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${
                      filters.type === "main"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-gray-800 text-gray-400 border border-gray-700"
                    }`}
                  >
                    Main
                  </button>
                  <button
                    onClick={() => handleFilterChange("type", "sub")}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${
                      filters.type === "sub"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-gray-800 text-gray-400 border border-gray-700"
                    }`}
                  >
                    Sub
                  </button>
                  <button
                    onClick={() => handleFilterChange("type", "all")}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${
                      filters.type === "all"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-gray-800 text-gray-400 border border-gray-700"
                    }`}
                  >
                    All
                  </button>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-800">
                <button
                  onClick={clearFilters}
                  className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 transition-all duration-300 mb-3"
                >
                  Clear All Filters
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg transition-all duration-300"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Main Categories Navigation
  const renderMainCategoriesNav = () => {
    if (viewingProducts || loading || isSearching) return null;

    const mainCategoriesToShow = filteredCategories.filter(cat => !cat.parentCategory);

    return (
      <div className="bg-gradient-to-b from-gray-900 to-black rounded-xl sm:rounded-2xl border border-gray-800 p-4 sm:p-6 mb-6 sm:mb-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-red-500/20 to-red-600/20 flex items-center justify-center">
              <Grid3x3 className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">BRANDS</h3>
              <p className="text-xs sm:text-sm text-gray-400">Select a brands to view its motorcycle</p>
            </div>
          </div>
        </div>

        {/* Main Categories Grid */}
        {mainCategoriesToShow.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
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
          <div className="text-center py-8 sm:py-12">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <FolderTree className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600" />
            </div>
            <p className="text-gray-400 text-sm sm:text-base">No main categories found</p>
            {filters.search && (
              <button
                onClick={() => handleFilterChange("search", "")}
                className="mt-3 text-red-400 hover:text-red-300 text-sm"
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
    if (viewingProducts || !activeCategory || !activeCategory.children || activeCategory.children.length === 0 || isSearching) {
      return null;
    }

    return (
      <div data-subcategories className="bg-gradient-to-b from-gray-900 to-black rounded-xl sm:rounded-2xl border border-gray-800 p-4 sm:p-6 mb-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-purple-500/20 to-purple-600/20 flex items-center justify-center">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Motorcycles of {activeCategory.name}</h3>
              <p className="text-xs sm:text-sm text-gray-400">Click any motorcycle to view products</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-400">
              {activeCategory.children.length} models
            </span>
          </div>
        </div>

        {/* Sub-categories Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4">
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
    <div className="bg-gradient-to-b from-gray-900 to-black rounded-xl sm:rounded-2xl border border-gray-800 p-4 sm:p-6 mb-6 sm:mb-8 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Mobile Filter Button */}
        <div className="md:hidden">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="w-full px-4 py-3 bg-black hover:bg-gray-900 text-gray-300 rounded-lg border border-gray-800 transition-all duration-300 hover:border-gray-700 flex items-center justify-center gap-2"
          >
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filters & Sort</span>
          </button>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          {/* Clear Filters Button - Only shown when filters are applied */}
          {(filters.search || filters.type !== "main" || filters.featured !== "all" || filters.sort !== "popular") && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-black hover:bg-gray-900 text-gray-300 rounded-lg border border-gray-700 transition-all duration-300 hover:border-gray-600 flex items-center gap-2 text-sm"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Clear Search Button - Only shown when searching on mobile */}
          {isSearching && (
            <button
              onClick={clearFilters}
              className="w-full sm:w-auto px-4 py-2.5 bg-black hover:bg-gray-900 text-gray-300 rounded-lg border border-gray-800 transition-all duration-300 hover:border-gray-700 flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              <span>Clear Search</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Render Search Results
  const renderSearchResults = () => {
    if (!isSearching || searchLoading) return null;

    const totalResults = searchResults.brands.length + searchResults.motorcycles.length + searchResults.products.length;

    if (totalResults === 0 && searchTerm.trim() !== "") {
      return (
        <div className="bg-gradient-to-b from-gray-900 to-black rounded-xl sm:rounded-2xl border border-gray-800 p-6 sm:p-8 md:p-12 text-center shadow-xl">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-gray-900 to-black mb-4 sm:mb-6 shadow-lg">
            <Search className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-600" />
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">
            No results found
          </h3>
          <p className="text-gray-400 mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed text-sm sm:text-base">
            No brands, motorcycles, or products match your search for "{searchTerm}". Try different keywords.
          </p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-500/25 text-sm sm:text-base"
          >
            Clear Search
          </button>
        </div>
      );
    }

    return (
      <SearchResultSection
        results={searchResults}
        onBrandClick={handleBrandClick}
        onMotorcycleClick={handleMotorcycleClick}
        onProductClick={handleProductClick}
        searchTerm={searchTerm}
      />
    );
  };

  // Render Categories or Products
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64 sm:h-96">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-gray-700 border-t-red-500 animate-spin mx-auto mb-3 sm:mb-4"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FolderTree className="w-6 h-6 sm:w-8 sm:h-8 text-red-400 animate-pulse" />
              </div>
            </div>
            <p className="text-gray-400 mt-3 sm:mt-4 text-sm sm:text-base">Loading categories...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-gradient-to-b from-gray-900 to-black p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-red-800/50 shadow-lg">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
            </div>
            <div>
              <p className="text-red-300 font-medium text-base sm:text-lg">{error}</p>
              <button
                onClick={fetchCategories}
                className="text-red-400 hover:text-red-300 text-xs sm:text-sm mt-1 sm:mt-2 flex items-center gap-1 transition-colors group"
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 group-hover:rotate-180 transition-transform" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (filteredCategories.length === 0 && !viewingProducts && !isSearching) {
      return (
        <div className="bg-gradient-to-b from-gray-900 to-black p-6 sm:p-8 md:p-12 text-center border border-gray-700 rounded-xl sm:rounded-2xl shadow-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-gray-900 to-black mb-4 sm:mb-6 shadow-lg">
            <FolderTree className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-600" />
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">
            No categories found
          </h3>
          <p className="text-gray-400 mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed text-sm sm:text-base">
            {filters.search
              ? "No categories match your search. Try different keywords or clear the search."
              : "No categories available at the moment. Please check back later."}
          </p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-500/25 text-sm sm:text-base"
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
            setIsSearching(false);
          }}
          loading={productsLoading}
        />
      );
    }

    if (isSearching) {
      return (
        <div>
          {searchLoading ? (
            <div className="flex justify-center items-center h-64 sm:h-96">
              <div className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-gray-700 border-t-blue-500 animate-spin mx-auto mb-3 sm:mb-4"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Search className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 animate-pulse" />
                  </div>
                </div>
                <p className="text-gray-400 mt-3 sm:mt-4 text-sm sm:text-base">Searching for "{searchTerm}"...</p>
              </div>
            </div>
          ) : (
            renderSearchResults()
          )}
        </div>
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
      {/* Mobile Filter Overlay */}
      {renderMobileFilters()}

      {/* Hero Section */}
      {renderHeroBanner()}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* Controls */}
        {renderControls()}

        {/* Content */}
        {renderContent()}

        {/* Help Section */}
        <div className="mt-8 sm:mt-12 md:mt-16 pt-6 sm:pt-8 md:pt-12 border-t border-gray-800/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Need Help?</h3>
              <p className="text-gray-400 max-w-lg text-sm sm:text-base">
                Can't find what you're looking for? Our team is here to help you find the perfect motorcycle parts.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => navigate('/contact')}
                className="w-full sm:w-auto px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Users className="w-4 h-4" />
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;