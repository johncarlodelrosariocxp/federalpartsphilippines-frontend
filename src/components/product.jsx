// src/components/product.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../services/api";
import {
  ShoppingCart,
  Heart,
  Eye,
  Star,
  StarHalf,
  Package,
  Check,
  AlertCircle,
  TrendingUp,
  Tag,
  Share2,
  ChevronRight,
  Truck,
  Shield,
  RotateCcw,
  ExternalLink,
} from "lucide-react";

const Product = ({
  product,
  variant = "default", // default, horizontal, compact, detailed, card
  showActions = true,
  onViewDetails,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  onCompare,
  className = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Helper functions
  const getMainImage = () => {
    if (!product?.images || product.images.length === 0) {
      return "/images/product-placeholder.jpg";
    }

    // Handle different image formats
    const image = product.images[imageIndex];
    if (typeof image === "string") {
      if (image.startsWith("blob:") || image.startsWith("data:")) {
        return image;
      }
      // Check if it's a relative path
      if (!image.startsWith("http") && !image.startsWith("/")) {
        return `/uploads/products/${image}`;
      }
      return image;
    } else if (image && typeof image === "object") {
      return image.url || image.filename || image;
    }
    return "/images/product-placeholder.jpg";
  };

  const getFinalPrice = () => {
    if (!product?.price) return 0;
    return product.discountedPrice && product.discountedPrice < product.price
      ? product.discountedPrice
      : product.price;
  };

  const hasDiscount = () => {
    return (
      product?.discountedPrice &&
      product.discountedPrice < product.price &&
      product.price > 0
    );
  };

  const getDiscountPercentage = () => {
    if (!hasDiscount()) return 0;
    return Math.round(
      ((product.price - product.discountedPrice) / product.price) * 100
    );
  };

  const getStockStatus = () => {
    if (!product?.isActive) return { text: "Inactive", color: "gray" };
    if (product.stock === 0) return { text: "Out of Stock", color: "red" };
    if (product.stock <= 10) return { text: "Low Stock", color: "yellow" };
    return { text: "In Stock", color: "green" };
  };

  const renderRating = () => {
    if (!product?.rating) return null;

    const rating = product.rating || 0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        <div className="flex">
          {[...Array(fullStars)].map((_, i) => (
            <Star
              key={`full-${i}`}
              className="w-4 h-4 fill-yellow-400 text-yellow-400"
            />
          ))}
          {hasHalfStar && (
            <StarHalf className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          )}
          {[...Array(emptyStars)].map((_, i) => (
            <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
          ))}
        </div>
        <span className="text-sm text-gray-600 ml-1">
          {rating.toFixed(1)} ({product.reviewCount || 0})
        </span>
      </div>
    );
  };

  const renderBadges = () => {
    const badges = [];
    const stockStatus = getStockStatus();

    // Discount badge
    if (hasDiscount()) {
      badges.push(
        <div
          key="discount"
          className="absolute top-3 left-3 px-3 py-1.5 bg-red-500 text-white text-sm font-bold rounded-lg shadow-lg z-10"
        >
          -{getDiscountPercentage()}% OFF
        </div>
      );
    }

    // New badge (within 7 days)
    if (product.createdAt) {
      const createdDate = new Date(product.createdAt);
      const daysSinceCreation = Math.floor(
        (new Date() - createdDate) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceCreation <= 7) {
        badges.push(
          <div
            key="new"
            className="absolute top-3 right-3 px-3 py-1.5 bg-green-500 text-white text-sm font-bold rounded-lg shadow-lg z-10"
          >
            NEW
          </div>
        );
      }
    }

    // Featured badge
    if (product.featured) {
      badges.push(
        <div
          key="featured"
          className="absolute top-12 left-3 px-3 py-1.5 bg-yellow-500 text-white text-sm font-bold rounded-lg shadow-lg z-10 flex items-center gap-1"
        >
          <Star className="w-3 h-3" />
          FEATURED
        </div>
      );
    }

    // Best seller badge
    if (product.bestSeller) {
      badges.push(
        <div
          key="best-seller"
          className="absolute top-12 right-3 px-3 py-1.5 bg-purple-500 text-white text-sm font-bold rounded-lg shadow-lg z-10 flex items-center gap-1"
        >
          <TrendingUp className="w-3 h-3" />
          BEST SELLER
        </div>
      );
    }

    return badges;
  };

  // Click Handlers
  const handleViewDetails = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (onViewDetails) {
      onViewDetails(product);
    } else {
      // Default behavior - navigate to product page
      window.location.href = `/product/${product._id}`;
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (onAddToCart) {
      onAddToCart(product, quantity);
    } else {
      console.log("Add to cart:", product, "Quantity:", quantity);
      // Show success message
      alert(`${product.name} added to cart!`);
    }
  };

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsWishlisted(!isWishlisted);
    if (onAddToWishlist) {
      onAddToWishlist(product, !isWishlisted);
    } else {
      const action = !isWishlisted ? "added to" : "removed from";
      console.log(`${product.name} ${action} wishlist`);
    }
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (onQuickView) {
      onQuickView(product);
    } else {
      console.log("Quick view:", product);
    }
  };

  const handleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (onCompare) {
      onCompare(product);
    } else {
      console.log("Add to compare:", product);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 99) {
      setQuantity(value);
    }
  };

  const handleQuantityIncrease = () => {
    if (quantity < 99) setQuantity(quantity + 1);
  };

  const handleQuantityDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const productUrl = `${window.location.origin}/product/${product._id}`;
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description?.substring(0, 100),
        url: productUrl,
      });
    } else {
      navigator.clipboard.writeText(productUrl);
      alert("Product link copied to clipboard!");
    }
  };

  const handleImageClick = (index) => {
    setImageIndex(index);
  };

  // Variant Renderers
  const renderDefault = () => (
    <div
      className={`group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewDetails}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <img
          src={getMainImage()}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isHovered ? "scale-110" : "scale-100"
          }`}
          loading="lazy"
        />

        {renderBadges()}

        {/* Quick Actions */}
        <div
          className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          }`}
        >
          <button
            onClick={handleAddToWishlist}
            className={`p-2.5 rounded-full shadow-lg backdrop-blur-sm ${
              isWishlisted
                ? "bg-red-500 text-white"
                : "bg-white/90 text-gray-700 hover:bg-white"
            }`}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`}
            />
          </button>

          <button
            onClick={handleQuickView}
            className="p-2.5 rounded-full shadow-lg bg-white/90 text-gray-700 hover:bg-white backdrop-blur-sm"
            title="Quick view"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={handleCompare}
            className="p-2.5 rounded-full shadow-lg bg-white/90 text-gray-700 hover:bg-white backdrop-blur-sm"
            title="Compare"
          >
            <Package className="w-4 h-4" />
          </button>
        </div>

        {/* Stock Status */}
        <div className="absolute bottom-3 left-3">
          <span
            className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
              getStockStatus().color === "green"
                ? "bg-green-500 text-white"
                : getStockStatus().color === "yellow"
                ? "bg-yellow-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {getStockStatus().text}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="mb-2">
          {product.category && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {product.category.name}
            </span>
          )}
        </div>

        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {renderRating()}

        {/* Price */}
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(getFinalPrice())}
            </span>
            {hasDiscount() && (
              <>
                <span className="text-base text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Add to Cart Button */}
        {showActions && (
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || !product.isActive}
            className={`w-full mt-4 px-4 py-2.5 rounded-lg font-medium transition-all ${
              product.stock === 0 || !product.isActive
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"
            }`}
          >
            {product.stock === 0 ? (
              <span className="flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Out of Stock
              </span>
            ) : !product.isActive ? (
              "Product Inactive"
            ) : (
              <span className="flex items-center justify-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );

  const renderHorizontal = () => (
    <div
      className={`group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer ${className}`}
      onClick={handleViewDetails}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="sm:w-1/3 relative">
          <div className="aspect-square sm:aspect-auto sm:h-full">
            <img
              src={getMainImage()}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          {hasDiscount() && (
            <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
              -{getDiscountPercentage()}%
            </div>
          )}
        </div>

        {/* Content */}
        <div className="sm:w-2/3 p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              {product.category && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {product.category.name}
                </span>
              )}
            </div>
            <button
              onClick={handleAddToWishlist}
              className={`p-1.5 rounded-full ${
                isWishlisted
                  ? "text-red-500"
                  : "text-gray-400 hover:text-red-500"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`}
              />
            </button>
          </div>

          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          {renderRating()}

          <div className="mt-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(getFinalPrice())}
              </span>
              {hasDiscount() && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
          </div>

          {product.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {product.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  getStockStatus().color === "green"
                    ? "bg-green-500"
                    : getStockStatus().color === "yellow"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              />
              <span className="text-sm text-gray-600">
                {getStockStatus().text}
              </span>
            </div>

            {showActions && (
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || !product.isActive}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  product.stock === 0 || !product.isActive
                    ? "bg-gray-100 text-gray-500"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompact = () => (
    <div
      className={`group bg-white rounded-lg border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer ${className}`}
      onClick={handleViewDetails}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Image */}
        <div className="w-16 h-16 flex-shrink-0">
          <img
            src={getMainImage()}
            alt={product.name}
            className="w-full h-full object-cover rounded"
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
            {product.name}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-bold text-gray-900">
              {formatPrice(getFinalPrice())}
            </span>
            {hasDiscount() && (
              <span className="text-xs text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          {product.category && (
            <span className="text-xs text-gray-500 mt-1 block">
              {product.category.name}
            </span>
          )}
        </div>

        {/* Quick Action */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0 || !product.isActive}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderDetailed = () => (
    <div
      className={`bg-white rounded-2xl overflow-hidden shadow-lg ${className}`}
    >
      <div
        className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer"
        onClick={handleViewDetails}
      >
        <img
          src={getMainImage()}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {renderBadges()}

        <div className="absolute bottom-4 left-4 right-4">
          <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
            {product.name}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-white">
              {formatPrice(getFinalPrice())}
            </span>
            {hasDiscount() && (
              <span className="text-xl text-white/80 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                getStockStatus().color === "green"
                  ? "bg-green-500"
                  : getStockStatus().color === "yellow"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            />
            <span className="font-medium text-gray-700">
              {getStockStatus().text}
            </span>
            {product.stock > 0 && (
              <span className="text-sm text-gray-500">
                • {product.stock} available
              </span>
            )}
          </div>

          {renderRating()}
        </div>

        {product.description && (
          <p className="text-gray-600 mb-6">{product.description}</p>
        )}

        {/* Features */}
        {product.specifications && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(product.specifications)
                .slice(0, 4)
                .map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">
                      {key}: {value}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
            <button
              onClick={handleQuantityDecrease}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
            >
              −
            </button>
            <input
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              min="1"
              max="99"
              className="w-12 text-center bg-transparent border-none focus:outline-none"
            />
            <button
              onClick={handleQuantityIncrease}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || !product.isActive}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
          >
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>

          <button
            onClick={handleAddToWishlist}
            className={`p-3 rounded-lg ${
              isWishlisted
                ? "bg-red-50 text-red-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Heart
              className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`}
            />
          </button>

          <button
            onClick={handleShare}
            className="p-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-green-600" />
            <div>
              <div className="text-sm font-medium">Free Shipping</div>
              <div className="text-xs text-gray-500">Over $100</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-sm font-medium">1 Year Warranty</div>
              <div className="text-xs text-gray-500">Quality Guaranteed</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-purple-600" />
            <div>
              <div className="text-sm font-medium">30-Day Returns</div>
              <div className="text-xs text-gray-500">Easy Returns</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-600" />
            <div>
              <div className="text-sm font-medium">In Stock</div>
              <div className="text-xs text-gray-500">Ready to Ship</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCard = () => (
    <div
      className={`bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 cursor-pointer ${className}`}
      onClick={handleViewDetails}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {product.category && (
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
                {product.category.name}
              </span>
            )}
            {product.featured && (
              <span className="px-3 py-1 bg-yellow-50 text-yellow-600 text-xs font-bold rounded-full flex items-center gap-1">
                <Star className="w-3 h-3" />
                Featured
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {product.name}
          </h3>
        </div>

        <button
          onClick={handleAddToWishlist}
          className={`p-2 rounded-full ${
            isWishlisted
              ? "bg-red-50 text-red-600"
              : "bg-gray-100 text-gray-400 hover:text-red-500"
          }`}
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Image */}
      <div className="relative h-48 mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        <img
          src={getMainImage()}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {hasDiscount() && (
          <div className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white font-bold rounded-lg shadow-lg">
            SAVE {getDiscountPercentage()}%
          </div>
        )}
      </div>

      {/* Price & Rating */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-3xl font-bold text-gray-900">
            {formatPrice(getFinalPrice())}
          </div>
          {hasDiscount() && (
            <div className="text-sm text-gray-500 line-through">
              {formatPrice(product.price)}
            </div>
          )}
        </div>
        {renderRating()}
      </div>

      {/* Description */}
      {product.description && (
        <p className="text-gray-600 mb-6 line-clamp-2">{product.description}</p>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-sm text-gray-500">Stock</div>
          <div
            className={`text-lg font-bold ${
              product.stock > 10
                ? "text-green-600"
                : product.stock > 0
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {product.stock || 0}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-sm text-gray-500">Status</div>
          <div
            className={`text-sm font-bold ${
              getStockStatus().color === "green"
                ? "text-green-600"
                : getStockStatus().color === "yellow"
                ? "text-yellow-600"
                : "text-gray-600"
            }`}
          >
            {getStockStatus().text}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-sm text-gray-500">SKU</div>
          <div className="text-sm font-bold text-gray-900">
            {product.sku || "N/A"}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0 || !product.isActive}
          className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${
            product.stock === 0 || !product.isActive
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg"
          }`}
        >
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>

        <button
          onClick={handleQuickView}
          className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Eye className="w-5 h-5" />
        </button>

        <button
          onClick={handleViewDetails}
          className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-1"
        >
          <span>View</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // Render based on variant
  switch (variant) {
    case "horizontal":
      return renderHorizontal();
    case "compact":
      return renderCompact();
    case "detailed":
      return renderDetailed();
    case "card":
      return renderCard();
    default:
      return renderDefault();
  }
};

export default Product;
