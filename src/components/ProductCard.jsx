// src/components/ProductCard.jsx - SIMPLE WORKING VERSION
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Star, Eye, ShoppingCart } from "lucide-react";
import { toast } from "react-hot-toast";

// StarHalf component
const StarHalf = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24">
    <defs>
      <linearGradient id="half">
        <stop offset="50%" stopColor="currentColor" />
        <stop offset="50%" stopColor="transparent" stopOpacity="1" />
      </linearGradient>
    </defs>
    <polygon
      points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"
      fill="url(#half)"
    />
  </svg>
);

// Simple image URL helper
const getImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string' || imagePath.trim() === "") {
    return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop";
  }
  
  if (imagePath.startsWith("http") || imagePath.startsWith("data:") || imagePath.startsWith("blob:")) {
    return imagePath;
  }
  
  const baseUrl = "https://federalpartsphilippines-backend.onrender.com";
  
  // Clean the path
  let cleanPath = imagePath.trim();
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1);
  }
  
  if (cleanPath.startsWith('uploads/')) {
    return `${baseUrl}/${cleanPath}`;
  }
  
  return `${baseUrl}/uploads/products/${cleanPath}`;
};

const ProductCard = ({ 
  product, 
  variant = "grid",
  isClickable = true,
  className = "",
  showCategory = true,
  showRating = true,
  showActions = true,
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  if (!product) {
    return (
      <div className={`bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl border border-gray-800 ${className}`}>
        <div className="h-48 bg-gray-800 animate-pulse"></div>
        <div className="p-4">
          <div className="h-4 bg-gray-800 rounded mb-2 w-1/3"></div>
          <div className="h-6 bg-gray-800 rounded mb-3 w-2/3"></div>
          <div className="h-4 bg-gray-800 rounded mb-4 w-full"></div>
          <div className="flex items-center justify-between">
            <div className="h-8 bg-gray-800 rounded w-20"></div>
            <div className="h-10 bg-gray-800 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  const {
    _id,
    name = "Product",
    description = "",
    price = 0,
    discountedPrice,
    images = [],
    category = {},
    rating = 0,
    reviewCount = 0,
    stock = 0,
    isNew = false,
    isFeatured = false,
  } = product;

  // Get main image
  useEffect(() => {
    if (Array.isArray(images) && images.length > 0) {
      const firstImage = images[0];
      setImageUrl(getImageUrl(firstImage));
    } else {
      setImageUrl(getImageUrl(""));
    }
  }, [images]);

  // Calculate prices
  const finalPrice = discountedPrice && discountedPrice < price ? discountedPrice : price;
  const discountPercentage = discountedPrice && discountedPrice < price
    ? Math.round(((price - discountedPrice) / price) * 100)
    : 0;
  const hasDiscount = discountPercentage > 0;

  // Get category name
  const categoryName = category?.name || "Motorcycle Parts";

  // Format price
  const formatPrice = (price) => {
    const num = Number(price);
    if (isNaN(num)) return '₱0.00';
    return `₱${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Rating stars
  const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarHalf key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="w-3 h-3 text-gray-600" />);
      }
    }
    
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  // Event handlers
  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success("Quick view coming soon!");
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success(`${name} added to cart!`);
  };

  // Card wrapper
  const CardWrapper = ({ children }) => {
    if (!isClickable || !_id) {
      return <div className={`block ${className}`}>{children}</div>;
    }
    return (
      <Link to={`/product/${_id}`} className={`block ${className}`}>
        {children}
      </Link>
    );
  };

  // GRID VARIANT
  if (variant === "grid") {
    return (
      <CardWrapper>
        <div 
          className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl overflow-hidden border border-gray-800 hover:border-red-500 transition-all duration-300 hover:shadow-xl h-full flex flex-col group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* IMAGE */}
          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop";
              }}
            />
            
            {/* BADGES */}
            {hasDiscount && (
              <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                -{discountPercentage}%
              </div>
            )}
            {isNew && !hasDiscount && (
              <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                NEW
              </div>
            )}
            {isFeatured && !isNew && !hasDiscount && (
              <div className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                FEATURED
              </div>
            )}
            
            {/* ACTIONS */}
            {showActions && (
              <div className={`absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2 transition-all duration-200 ${
                isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}>
                <button
                  onClick={handleQuickView}
                  className="p-2 bg-black/80 rounded-full hover:bg-gray-700 transition-colors"
                  title="Quick View"
                >
                  <Eye className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={handleWishlistClick}
                  className="p-2 bg-black/80 rounded-full hover:bg-red-600 transition-colors"
                  title="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-white"}`} />
                </button>
              </div>
            )}
          </div>
          
          {/* INFO */}
          <div className="p-4 flex-1 flex flex-col">
            {showCategory && (
              <div className="text-xs text-gray-400 mb-1">{categoryName}</div>
            )}
            
            <h3 className="font-bold text-white mb-2 line-clamp-1">{name}</h3>
            
            {description && (
              <p className="text-sm text-gray-300 mb-3 line-clamp-2 flex-1">{description}</p>
            )}
            
            <div className="flex items-center justify-between mb-4">
              {showRating && (
                <div className="flex items-center gap-1">
                  {getRatingStars(rating)}
                  {reviewCount > 0 && (
                    <span className="text-xs text-gray-400 ml-1">({reviewCount})</span>
                  )}
                </div>
              )}
              <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                stock > 10 ? "bg-green-500/20 text-green-400" :
                stock > 0 ? "bg-yellow-500/20 text-yellow-400" :
                "bg-red-500/20 text-red-400"
              }`}>
                {stock > 10 ? "In Stock" : stock > 0 ? "Low Stock" : "Out of Stock"}
              </div>
            </div>
            
            <div className="mt-auto">
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-lg font-bold text-white">
                  {formatPrice(finalPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(price)}
                  </span>
                )}
              </div>
              <button
                onClick={handleAddToCart}
                className="w-full py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium rounded-lg transition-all border border-gray-700 hover:border-red-500 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </CardWrapper>
    );
  }

  // LIST VARIANT
  if (variant === "list") {
    return (
      <CardWrapper>
        <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl overflow-hidden border border-gray-800 hover:border-red-500 transition-all duration-300">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/4">
              <div className="h-48 md:h-full bg-gradient-to-br from-gray-800 to-gray-900">
                <img
                  src={imageUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop";
                  }}
                />
              </div>
            </div>
            
            <div className="md:w-3/4 p-6 flex flex-col justify-between">
              <div>
                {showCategory && (
                  <div className="text-xs text-gray-400 mb-2">{categoryName}</div>
                )}
                
                <h3 className="font-bold text-white text-lg mb-2">{name}</h3>
                
                {description && (
                  <p className="text-gray-300 mb-4 line-clamp-2">{description}</p>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  {showRating && (
                    <div className="flex items-center gap-2">
                      {getRatingStars(rating)}
                      {reviewCount > 0 && (
                        <span className="text-sm text-gray-400">({reviewCount})</span>
                      )}
                    </div>
                  )}
                  <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                    stock > 10 ? "bg-green-500/20 text-green-400" :
                    stock > 0 ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-red-500/20 text-red-400"
                  }`}>
                    {stock > 10 ? "In Stock" : stock > 0 ? "Low Stock" : "Out of Stock"}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-800">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-xl font-bold text-white">
                      {formatPrice(finalPrice)}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(price)}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                  <button
                    onClick={handleQuickView}
                    className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white text-sm font-medium rounded-lg border border-gray-700 hover:border-red-500 transition-all flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Quick View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardWrapper>
    );
  }

  return null;
};

ProductCard.defaultProps = {
  variant: "grid",
  isClickable: true,
  showCategory: true,
  showRating: true,
  showActions: true,
  className: ""
};

export default ProductCard;