import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Star, StarHalf, Eye } from "lucide-react";
import {
  getImageUrl,
} from "../services/api";

// Image component with error handling
const ProductImage = ({ src, alt, className = "" }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    console.warn(`Failed to load image: ${src}`);
    setImageError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const imageUrl = getImageUrl(src);

  if (imageError) {
    return (
      <div
        className={`${className} bg-gray-800 flex items-center justify-center`}
      >
        <div className="text-center">
          <div className="text-gray-500 mb-2">⚠️</div>
          <div className="text-xs text-gray-400">Image not available</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div
          className={`${className} bg-gray-800 animate-pulse absolute inset-0`}
        />
      )}
      <img
        src={imageUrl}
        alt={alt}
        className={`${className} ${
          isLoading ? "opacity-0" : "opacity-100"
        } transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
        decoding="async"
      />
    </>
  );
};

const ProductCard = ({
  product,
  variant = "default",
  isClickable = true,
  onQuickView,
  onWishlistToggle,
  className = "",
  showCategory = true,
  showRating = true,
  showActions = false,
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (!product) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 animate-pulse">
        <div className="aspect-square bg-gray-700 rounded mb-4"></div>
        <div className="h-4 bg-gray-700 rounded mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-2/3 mb-3"></div>
        <div className="h-6 bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  const {
    _id,
    name,
    description,
    images,
    category,
    brand,
    rating,
    reviewCount,
    isActive,
    isFeatured,
    isNew,
  } = product;

  const getRatingStars = (rating) => {
    if (!rating) return null;

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            className="w-3 h-3 fill-yellow-400 text-yellow-400"
          />
        ))}
        {hasHalfStar && (
          <StarHalf className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-3 h-3 text-gray-600" />
        ))}
      </div>
    );
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newWishlistStatus = !isWishlisted;
    setIsWishlisted(newWishlistStatus);
    if (onWishlistToggle) {
      onWishlistToggle(product, newWishlistStatus);
    }
  };

  const mainImage = images?.[0] || null;
  const secondaryImage = images?.[1] || mainImage;

  // Wrapper component for clickable/non-clickable variants
  const CardWrapper = ({ children }) => {
    if (!isClickable) {
      return <div className={`block ${className}`}>{children}</div>;
    }
    return (
      <Link to={`/product/${_id}`} className={`block ${className}`}>
        {children}
      </Link>
    );
  };

  // Compact variant
  if (variant === "compact") {
    return (
      <CardWrapper>
        <div className="bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 hover:shadow-lg transition-all duration-200 overflow-hidden group">
          <div className="relative aspect-square overflow-hidden bg-gray-900">
            <ProductImage
              src={mainImage}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {isNew && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded">
                  NEW
                </span>
              )}
            </div>
          </div>

          <div className="p-3">
            {showCategory && category && (
              <div className="text-xs text-gray-400 mb-1 truncate">
                {typeof category === "object" ? category.name : category}
              </div>
            )}

            <h3
              className="font-medium text-white mb-2 line-clamp-1 hover:text-white transition-colors"
              title={name}
            >
              {name}
            </h3>

            <div className="flex items-center justify-between">
              {showRating && rating && (
                <div className="flex items-center gap-1">
                  {getRatingStars(rating)}
                  <span className="text-xs text-gray-400">
                    ({reviewCount || 0})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardWrapper>
    );
  }

  // Grid variant
  if (variant === "grid") {
    return (
      <CardWrapper>
        <div className="bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 hover:shadow-lg transition-all duration-200 overflow-hidden group">
          <div className="relative aspect-square overflow-hidden bg-gray-900">
            <div className="relative h-full">
              <ProductImage
                src={mainImage}
                alt={name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {secondaryImage !== mainImage && (
                <ProductImage
                  src={secondaryImage}
                  alt={name}
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              )}
            </div>

            {/* Quick actions */}
            {showActions && (
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex gap-1">
                  <button
                    onClick={handleQuickView}
                    className="p-2 bg-gray-800/95 backdrop-blur-sm text-gray-200 rounded-full shadow-lg hover:bg-gray-700 hover:text-white transition-all"
                    title="Quick view"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleWishlistToggle}
                    className="p-2 bg-gray-800/95 backdrop-blur-sm text-gray-200 rounded-full shadow-lg hover:bg-gray-700 hover:text-white transition-all"
                    title="Add to wishlist"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isWishlisted ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="p-4">
            {/* Category */}
            {showCategory && category && (
              <div className="text-xs font-medium text-gray-400 mb-1">
                {typeof category === "object" ? category.name : category}
              </div>
            )}

            {/* Product name */}
            <h3
              className="font-semibold text-white mb-2 line-clamp-2 hover:text-white transition-colors"
              title={name}
            >
              {name}
            </h3>

            {/* Description */}
            {description && (
              <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </div>
      </CardWrapper>
    );
  }

  // List variant
  if (variant === "list") {
    return (
      <CardWrapper>
        <div className="bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 hover:shadow-lg transition-all duration-200 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Image section */}
            <div className="md:w-1/3 relative">
              <div className="aspect-square md:aspect-auto md:h-full bg-gray-900">
                <ProductImage
                  src={mainImage}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Content section */}
            <div className="md:w-2/3 p-4">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    {showCategory && category && (
                      <div className="text-xs font-medium text-gray-400 mb-1">
                        {typeof category === "object"
                          ? category.name
                          : category}
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-white mb-2 hover:text-white transition-colors">
                      {name}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                {description && (
                  <p className="text-sm text-gray-300 mb-4 flex-grow">
                    {description.length > 120
                      ? `${description.substring(0, 120)}...`
                      : description}
                  </p>
                )}

                {/* Rating */}
                <div className="flex items-center justify-between mb-4">
                  {showRating && rating && (
                    <div className="flex items-center gap-2">
                      {getRatingStars(rating)}
                      <span className="text-xs text-gray-400">
                        ({reviewCount || 0})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardWrapper>
    );
  }

  // Default variant
  return (
    <CardWrapper>
      <div
        className="bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 hover:shadow-lg transition-all duration-200 overflow-hidden group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-square overflow-hidden bg-gray-900">
          {/* Main image */}
          <div className="relative h-full">
            <ProductImage
              src={mainImage}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Secondary image on hover */}
            {secondaryImage !== mainImage && (
              <ProductImage
                src={secondaryImage}
                alt={name}
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            )}
          </div>

          {/* Quick actions */}
          {showActions && (
            <div
              className={`absolute bottom-3 left-1/2 transform -translate-x-1/2 transition-all duration-200 ${
                isHovered
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2"
              }`}
            >
              <div className="flex gap-1">
                <button
                  onClick={handleQuickView}
                  className="p-2 bg-gray-800/95 backdrop-blur-sm text-gray-200 rounded-full shadow-lg hover:bg-gray-700 hover:text-white transition-all"
                  title="Quick view"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={handleWishlistToggle}
                  className="p-2 bg-gray-800/95 backdrop-blur-sm text-gray-200 rounded-full shadow-lg hover:bg-gray-700 hover:text-white transition-all"
                  title="Add to wishlist"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isWishlisted ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          {/* Product name */}
          <h3 className="font-semibold text-white mb-2 line-clamp-2 hover:text-white transition-colors">
            {name}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-sm text-gray-300 mb-3 line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>
    </CardWrapper>
  );
};

export default ProductCard;