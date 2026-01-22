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

// Main Category Picture Component
const MainCategoryPicture = ({ 
  category, 
  onViewSubCategories, 
  onViewProducts, 
  isExpanded
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageUrl = getImageUrl(category.image || category.imageUrl);
  const hasSubCategories = category.children && category.children.length > 0;

  return (
    <div className="relative group">
      {/* Category Picture */}
      <div
        className={`relative w-full aspect-square overflow-hidden rounded-xl border transition-all duration-500 ${
          isExpanded 
            ? 'border-blue-500 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/20' 
            : 'border-gray-700 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => hasSubCategories && onViewSubCategories(category._id)}
      >
        {/* Image Container */}
        <div className="w-full h-full overflow-hidden bg-black">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={category.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-black">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-3 shadow-lg">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <span className="text-sm font-medium text-blue-300 text-center px-2">
                {category.name}
              </span>
            </div>
          )}
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <div className="text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="font-bold text-lg mb-2">{category.name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-black/70 backdrop-blur-sm px-2.5 py-1.5 rounded-full border border-white/10">
                  {category.productCount || 0} products
                </span>
                {hasSubCategories && (
                  <span className="text-xs bg-blue-600/80 backdrop-blur-sm px-2.5 py-1.5 rounded-full border border-blue-500/30 flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    {category.children.length} subs
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Expand Indicator */}
        {hasSubCategories && (
          <div className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            isExpanded 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50 rotate-180' 
              : 'bg-black/80 backdrop-blur-sm text-white group-hover:bg-blue-600 group-hover:shadow-lg group-hover:shadow-blue-500/30'
          }`}>
            <ChevronsDown className="w-4 h-4" />
          </div>
        )}
        
        {/* Category Type Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 text-xs font-semibold bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full shadow">
            Main
          </span>
        </div>
      </div>
      
      {/* Category Name Below */}
      <div className="mt-3 px-1">
        <h3 className="font-semibold text-white text-sm truncate">{category.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-gray-400">{category.productCount || 0} products</p>
          {hasSubCategories && (
            <p className="text-xs text-blue-400 flex items-center gap-1">
              <Layers className="w-3 h-3" />
              {category.children.length} subs
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-category Picture Component
const SubCategoryPicture = ({ 
  subCategory, 
  onViewProducts,
  parentCategory 
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const imageUrl = getImageUrl(subCategory.image || subCategory.imageUrl);

  return (
    <div 
      className="group cursor-pointer relative"
      onClick={() => onViewProducts(subCategory._id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-square rounded-xl overflow-hidden border border-gray-700/50 group-hover:border-purple-500/70 transition-all duration-300 bg-black shadow-md group-hover:shadow-xl group-hover:shadow-purple-500/20">
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
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-2 shadow-lg">
              <FolderOpen className="w-7 h-7 text-white" />
            </div>
            <span className="text-sm font-medium text-purple-300 text-center px-2">
              {subCategory.name}
            </span>
          </div>
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <div className="text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <h4 className="font-bold text-base mb-1">{subCategory.name}</h4>
            <p className="text-xs text-gray-300 line-clamp-2 mb-2">
              {subCategory.description || 'No description'}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full">
                {subCategory.productCount || 0} products
              </span>
              <div className="flex items-center gap-1 text-purple-300">
                <ArrowRight className="w-3 h-3" />
                <span className="text-xs font-medium">View Products</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Name below for non-hover state */}
      <div className="mt-3 text-center px-1">
        <h4 className="font-medium text-white text-sm truncate">{subCategory.name}</h4>
        <p className="text-xs text-gray-400 mt-0.5">{subCategory.productCount || 0} products</p>
      </div>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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

  return (
    <div 
      className="group bg-black rounded-xl border border-gray-700 overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => window.open(`/products/${product._id}`, '_blank')}
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
          <div className="text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="font-bold text-lg mb-2">{product.name}</h3>
            <p className="text-xs text-gray-300 line-clamp-2 mb-3">
              {product.description || 'No description available'}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10">
                {product.category?.name || 'Uncategorized'}
              </span>
              <button className="text-xs bg-gradient-to-r from-blue-600 to-blue-500 text-white px-3 py-1.5 rounded-full flex items-center gap-1 group-hover:scale-105 transition-transform">
                View Details
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-4 bg-black">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-white text-sm line-clamp-1">{product.name}</h3>
          <span className="font-bold text-blue-300">${product.price || 0}</span>
        </div>
        
        <p className="text-xs text-gray-400 line-clamp-2 mb-3">
          {product.shortDescription || product.description || 'No description available'}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-current" />
            <span className="text-xs text-gray-300">{product.rating || '4.5'}</span>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Package className="w-3 h-3" />
            <span>{product.stock || 0} in stock</span>
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
      {/* Connector line */}
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-gradient-to-b from-green-500 to-transparent"></div>
      
      {/* Main container */}
      <div className="relative bg-black rounded-2xl border border-gray-700/70 shadow-xl overflow-hidden">
        {/* Decorative gradient border */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-blue-500/5 to-transparent pointer-events-none"></div>
        
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
                  <span className="text-sm text-green-300 bg-green-900/20 px-3 py-1 rounded-full border border-green-700/30">
                    Total Value: ${products.reduce((sum, p) => sum + (p.price || 0), 0)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2.5 text-gray-400 hover:text-white hover:bg-black rounded-xl border border-gray-700 transition-all hover:border-gray-600"
                title="Close products view"
              >
                <ChevronsUp className="w-5 h-5" />
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
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Product Summary</h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400 bg-black px-3 py-1 rounded-full border border-gray-700">
                  Average Price: ${(products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length).toFixed(2)}
                </span>
                <span className="text-sm text-blue-300 bg-blue-900/20 px-3 py-1 rounded-full border border-blue-700/30">
                  In Stock: {products.filter(p => p.stock > 0).length}
                </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-black hover:bg-gray-900 text-gray-300 rounded-lg border border-gray-700 transition-all duration-300 hover:border-gray-600 flex items-center gap-2"
              >
                <ChevronsUp className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Categories</span>
              </button>
              
              <button
                onClick={() => window.open(`/products?category=${category?._id}`, '_blank')}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="text-sm font-medium">View All in Store</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Expanded Sub-categories Section
const ExpandedSubCategoriesSection = ({ 
  category, 
  onViewProducts,
  onClose,
  onViewAllProducts 
}) => {
  if (!category.children || category.children.length === 0) return null;

  return (
    <div className="mt-6 mb-8 relative">
      {/* Connector line from main category */}
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-gradient-to-b from-blue-500 to-transparent"></div>
      
      {/* Main container */}
      <div className="relative bg-black rounded-2xl border border-gray-700/70 shadow-xl overflow-hidden">
        {/* Decorative gradient border */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-transparent pointer-events-none"></div>
        
        {/* Header */}
        <div className="relative p-6 border-b border-gray-700/50 bg-black">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl"></div>
                
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  <span className="text-purple-400">{category.name}</span>
                </h2>
                <div className="flex items-center gap-3 mt-1">
                 
                 
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => onViewAllProducts(category._id)}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 flex items-center gap-2 group"
              >
                <Package className="w-4 h-4" />
                <span className="font-medium">View All Products</span>
              </button>
              <button
                onClick={onClose}
                className="p-2.5 text-gray-400 hover:text-white hover:bg-black rounded-xl border border-gray-700 transition-all hover:border-gray-600"
                title="Collapse sub-categories"
              >
                <ChevronsUp className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Sub-categories Grid */}
        <div className="p-6 bg-black">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {category.children.map((subCategory) => (
              <div key={subCategory._id} className="relative">
                <SubCategoryPicture
                  subCategory={subCategory}
                  onViewProducts={onViewProducts}
                  parentCategory={category}
                />
                {subCategory.featured && (
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full shadow flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Featured
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700/50 bg-black">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Quick Actions</h3>
              <p className="text-sm text-gray-400">Explore more options below</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onViewAllProducts(category._id)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                <span className="text-sm font-medium">All Products</span>
              </button>
              
              <button
                onClick={onClose}
                className="px-4 py-2 bg-black hover:bg-gray-900 text-gray-300 rounded-lg border border-gray-700 transition-all duration-300 hover:border-gray-600 flex items-center gap-2"
              >
                <ChevronsUp className="w-4 h-4" />
                <span className="text-sm font-medium">Collapse</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Category List Item Component
const CategoryListItem = ({ 
  category, 
  onViewProducts, 
  onViewSubCategories, 
  viewSubCategories,
  viewProducts,
  products,
  productsLoading
}) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = getImageUrl(category.image || category.imageUrl);
  const isMainCategory = !category.parentCategory;
  const hasSubCategories = category.children && category.children.length > 0;

  return (
    <div className={`bg-black rounded-xl border p-6 transition-all duration-300 ${
      viewSubCategories === category._id || viewProducts === category._id
        ? 'border-blue-500/50 shadow-lg shadow-blue-500/10' 
        : 'border-gray-700 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5'
    }`}>
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-xl blur-xl"></div>
          <div className="relative w-20 h-20 rounded-xl bg-black border overflow-hidden shadow-lg">
            {!imageError && imageUrl ? (
              <img
                src={imageUrl}
                alt={category.name}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black">
                {isMainCategory ? (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-white">{category.name}</h3>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                  isMainCategory 
                    ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 border border-blue-500/30'
                    : 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-300 border border-purple-500/30'
                }`}>
                  {isMainCategory ? 'Main' : 'Sub'}
                </span>
                {category.featured && (
                  <span className="px-2.5 py-1 text-xs font-semibold bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 border border-amber-500/30 rounded-full flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Featured
                  </span>
                )}
              </div>
              {category.description && (
                <p className="text-gray-400 text-sm line-clamp-2">{category.description}</p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black rounded-lg border border-gray-700">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-white">
                  {category.productCount || 0}
                </span>
              </div>
              {hasSubCategories && isMainCategory && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900/20 rounded-lg border border-blue-700/30">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-300">
                    {category.children.length}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-black text-sm text-gray-300 rounded-lg border border-gray-700">
                <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                Quality
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-black text-sm text-gray-300 rounded-lg border border-gray-700">
                <Truck className="w-3.5 h-3.5 text-blue-400" />
                Fast Delivery
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewProducts(category._id)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="font-medium">View Products</span>
              </button>
              {hasSubCategories && isMainCategory && (
                <button
                  onClick={() => onViewSubCategories(category._id)}
                  className="px-4 py-2 bg-black hover:bg-gray-900 text-gray-300 rounded-lg border border-gray-700 transition-all duration-300 hover:border-gray-600 flex items-center gap-2"
                >
                  <Layers className="w-4 h-4" />
                  <span className="font-medium">View Subs</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Show Sub-categories if expanded */}
      {isMainCategory && hasSubCategories && viewSubCategories === category._id && (
        <div className="mt-6 pt-6 border-t border-gray-700/30">
          <ExpandedSubCategoriesSection
            category={category}
            onViewProducts={onViewProducts}
            onClose={() => onViewSubCategories(null)}
            onViewAllProducts={onViewProducts}
          />
        </div>
      )}
      
      {/* Show Products if expanded */}
      {viewProducts === category._id && (
        <div className="mt-6 pt-6 border-t border-gray-700/30">
          <ProductsSection
            products={products}
            category={category}
            onClose={() => onViewProducts(null)}
            loading={productsLoading}
          />
        </div>
      )}
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
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [viewingProducts, setViewingProducts] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  
  // Filters from URL
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    type: searchParams.get("type") || "main", // main, sub, all
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
        children: [], // Initialize children array
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
          // Add as child to parent
          if (categoryMap[category.parentCategory]) {
            categoryMap[category.parentCategory].children.push(categoryNode);
          }
        } else {
          // Add as root category
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

  // Fetch products for a specific category - UPDATED TO USE REAL API
  const fetchCategoryProducts = async (categoryId) => {
    try {
      setProductsLoading(true);
      setProducts([]);
      
      // Use the productAPI from the services
      const response = await productAPI.getProductsByCategory(categoryId, {
        limit: 50, // Fetch more products
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
      
      // Get the category to find all sub-categories
      const category = allCategories.find(cat => cat._id === categoryId);
      
      if (category && category.children && category.children.length > 0) {
        // Get products from all sub-categories
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
        
        // Remove duplicates
        const uniqueProducts = Array.from(new Map(allProducts.map(product => [product._id, product])).values());
        setProducts(uniqueProducts);
        toast.success(`Loaded ${uniqueProducts.length} products from all sub-categories`);
      } else {
        // If no sub-categories, get products directly from the category
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

  const handleViewSubCategories = (categoryId) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
      setViewingProducts(null);
    } else {
      setExpandedCategory(categoryId);
      setViewingProducts(null);
    }
  };

  const handleViewProducts = async (categoryId) => {
    if (viewingProducts === categoryId) {
      setViewingProducts(null);
      setProducts([]);
    } else {
      setViewingProducts(categoryId);
      setExpandedCategory(null);
      
      // Check if it's a main category
      const category = allCategories.find(cat => cat._id === categoryId);
      if (category && !category.parentCategory) {
        // Main category - fetch products from all sub-categories
        await fetchMainCategoryProducts(categoryId);
      } else {
        // Sub-category - fetch products directly
        await fetchCategoryProducts(categoryId);
      }
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
    setExpandedCategory(null);
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

  // Find the category currently showing products
  const currentCategoryWithProducts = viewingProducts 
    ? allCategories.find(cat => cat._id === viewingProducts)
    : null;

  // Hero Banner - Updated with the specified image
  const renderHeroBanner = () => (
    <div className="relative pt-20 pb-16 overflow-hidden bg-black">
      {/* Banner Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/newbanner/destktop website Federal (Category).png"
          alt="Federal Parts - Categories"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay for better text readability */}
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

  // Controls Section
  const renderControls = () => (
    <div className="bg-black rounded-2xl border border-gray-700 p-6 mb-8 shadow-lg">
      
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

    if (viewMode === "grid") {
      return (
        <div className="space-y-8">
          {!viewingProducts ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredCategories.map((category) => (
                  <div key={category._id} className="relative">
                    <MainCategoryPicture
                      category={category}
                      onViewSubCategories={handleViewSubCategories}
                      onViewProducts={handleViewProducts}
                      isExpanded={expandedCategory === category._id}
                    />
                  </div>
                ))}
              </div>
              
              {/* Render expanded sub-categories sections after the grid */}
              {filteredCategories
                .filter(category => expandedCategory === category._id && category.children && category.children.length > 0)
                .map((category) => (
                  <div key={`expanded-${category._id}`} className="mt-4">
                    <ExpandedSubCategoriesSection
                      category={category}
                      onViewProducts={handleViewProducts}
                      onClose={() => handleViewSubCategories(null)}
                      onViewAllProducts={handleViewProducts}
                    />
                  </div>
                ))}
              
              {/* Render products section if viewing products */}
              {viewingProducts && currentCategoryWithProducts && (
                <div className="mt-6">
                  <ProductsSection
                    products={products}
                    category={currentCategoryWithProducts}
                    onClose={() => setViewingProducts(null)}
                    loading={productsLoading}
                  />
                </div>
              )}
            </>
          ) : (
            // Show products in grid view
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="space-y-6">
          {filteredCategories.map((category) => (
            <CategoryListItem
              key={category._id}
              category={category}
              onViewProducts={handleViewProducts}
              onViewSubCategories={handleViewSubCategories}
              viewSubCategories={expandedCategory}
              viewProducts={viewingProducts}
              products={viewingProducts === category._id ? products : []}
              productsLoading={viewingProducts === category._id && productsLoading}
            />
          ))}
        </div>
      );
    }
  };

  // Featured Categories Section (only when not viewing products)
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
              <h2 className="text-2xl font-bold text-white">Featured Main Categories</h2>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredCategories.map((category) => (
            <div
              key={category._id}
              className="bg-black rounded-xl border border-gray-700 p-6 hover:border-blue-500/50 transition-all duration-300 group hover:shadow-xl hover:shadow-blue-500/10"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-lg blur-xl"></div>
                  <div className="relative w-16 h-16 rounded-lg bg-black border border-gray-700 flex items-center justify-center shadow-lg">
                    <Crown className="w-8 h-8 text-blue-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                      {category.name}
                    </h3>
                 
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-gray-400 bg-black px-3 py-1 rounded-full border border-gray-700">
                      {category.productCount || 0} products
                    </p>
                    {category.children && category.children.length > 0 && (
                      <p className="text-sm text-blue-300 bg-blue-900/20 px-3 py-1 rounded-full border border-blue-700/30">
                        {category.children.length} 
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {category.description && (
                <p className="text-gray-300 mb-5 text-sm line-clamp-2 leading-relaxed">
                  {category.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleViewProducts(category._id)}
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium group"
                >
                  Shop Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                {category.children && category.children.length > 0 && (
                  <button
                    onClick={() => handleViewSubCategories(category._id)}
                    className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium group"
                  >
                    <Layers className="w-4 h-4" />
                    View Subs
                  </button>
                )}
              </div>
            </div>
          ))}
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
                <button
                  onClick={() => window.open('/store', '_blank')}
                  className="px-6 py-3 bg-black hover:bg-gray-900 text-gray-300 rounded-lg border border-gray-700 transition-all duration-300 hover:border-gray-600 flex items-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  Visit Store
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