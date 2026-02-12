import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  productAPI,
  formatPrice,
  calculateDiscountPercentage,
  getImageUrl,
} from "../services/api";
import {
  Star,
  Package,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Home,
  Loader2,
  X,
  ZoomIn,
  ZoomOut,
  CheckCircle,
  ExternalLink,
  ArrowLeft,
  ShieldCheck,
  Headphones,
  FileText,
  ChevronDown,
  ChevronUp,
  Zap,
  Globe,
  Clock,
  Award,
  Users,
} from "lucide-react";
import ProductCard from "../components/ProductCard";

// Image component with enhanced error handling
const ProductDetailImage = ({ src, alt, className = "", onClick = null }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    console.warn(`Failed to load product detail image: ${src}`);
    setImageError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const imageUrl = getImageUrl(src);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse rounded-lg" />
      )}
      <img
        src={imageError ? "/images/product-placeholder.jpg" : imageUrl}
        alt={alt}
        className={`${className} ${
          isLoading ? "opacity-0" : "opacity-100"
        } transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
        decoding="async"
        onClick={onClick}
        style={isLoading ? { visibility: "hidden" } : {}}
      />
    </div>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("description");
  const [imageZoom, setImageZoom] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const imageRef = useRef(null);
  const zoomRef = useRef(null);

  useEffect(() => {
    console.log("ProductDetail mounted with ID:", id);

    if (!id || id === "undefined" || id === "null") {
      console.error("Invalid product ID detected");
      setError(
        "Invalid product ID. Please return to shop and select a valid product."
      );
      setLoading(false);
      return;
    }

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (imageZoom && zoomRef.current && imageRef.current) {
      const handleMouseMove = (e) => {
        if (!imageRef.current || !zoomRef.current) return;

        const { left, top, width, height } =
          imageRef.current.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;

        zoomRef.current.style.backgroundPosition = `${x}% ${y}%`;
      };

      document.addEventListener("mousemove", handleMouseMove);
      return () => document.removeEventListener("mousemove", handleMouseMove);
    }
  }, [imageZoom]);

  const fetchProduct = async () => {
    console.log("Fetching product with ID:", id);

    try {
      setLoading(true);
      setError("");

      if (!id || id === "undefined" || id === "null") {
        throw new Error("Invalid product ID");
      }

      const response = await productAPI.getProductById(id);

      console.log("API Response:", response);

      if (!response) {
        throw new Error("No response from server");
      }

      let productData = {};

      // Handle different response structures
      if (response.success && response.data) {
        productData = response.data;
      } else if (response._id) {
        productData = response;
      } else if (response.product) {
        productData = response.product;
      } else if (response.data) {
        productData = response.data;
      } else {
        productData = response;
      }

      // Validate product data
      if (!productData || !productData._id) {
        console.error("Invalid product data received:", productData);
        throw new Error("Product data is incomplete or invalid");
      }

      console.log("Valid product data received:", {
        id: productData._id,
        name: productData.name,
        images: productData.images?.length || 0,
        imageUrl: getImageUrl(productData.images?.[0]),
      });

      setProduct(productData);

      // Fetch related products
      if (productData.category) {
        const categoryId = productData.category._id || productData.category;
        if (categoryId && categoryId !== "undefined") {
          fetchRelatedProducts(categoryId);
        }
      }
    } catch (err) {
      console.error("Error in fetchProduct:", err);

      let errorMessage = "Failed to load product. Please try again.";
      if (err.message.includes("Invalid product ID")) {
        errorMessage =
          "Invalid product ID. Please return to shop and select a valid product.";
      } else if (err.message.includes("Product not found")) {
        errorMessage =
          "Product not found. It may have been removed or is unavailable.";
      } else if (
        err.message.includes("Network Error") ||
        err.message.includes("Failed to fetch")
      ) {
        errorMessage =
          "Cannot connect to server. Please check your internet connection and try again.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (categoryId) => {
    try {
      const response = await productAPI.getProductsByCategory(categoryId, {
        limit: 4,
        exclude: id,
      });

      let products = [];

      if (response) {
        if (response.success && response.data) {
          products = response.data;
        } else if (Array.isArray(response)) {
          products = response;
        } else if (response.products) {
          products = response.products;
        } else if (response.data && Array.isArray(response.data)) {
          products = response.data;
        }

        const filteredProducts = products
          .filter((p) => p && p._id && p._id !== id)
          .slice(0, 4);

        console.log(`Found ${filteredProducts.length} related products`);
        setRelatedProducts(filteredProducts);
      }
    } catch (err) {
      console.error("Error fetching related products:", err);
    }
  };

  const handleImageClick = (index) => {
    setSelectedImage(index);
    setImageZoom(false);
  };

  const handleImageZoomToggle = () => {
    setImageZoom(!imageZoom);
  };

  const getDiscountPercentage = () => {
    if (!product?.discountedPrice || !product?.price) return 0;
    if (product.discountedPrice >= product.price) return 0;
    return calculateDiscountPercentage(product.price, product.discountedPrice);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 pt-24 px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    console.log("Rendering error state. Error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 pt-24 px-4">
        <div className="text-center max-w-md w-full">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-400 mb-6">
            {error || "The product you're looking for doesn't exist."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
            <Link
              to="/shop"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 flex items-center justify-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const discountPercentage = getDiscountPercentage();
  const hasDiscount = discountPercentage > 0;

  // Safely get images array
  const productImages = product.images || [];

  return (
    <div className="min-h-screen bg-gray-900 pt-24">
      {/* Image Zoom Modal */}
      {imageZoom && productImages.length > 0 && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setImageZoom(false)}
              className="p-2 bg-gray-800/90 backdrop-blur-sm rounded-full hover:bg-gray-700/90 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          <div className="relative w-full h-full max-w-7xl max-h-[90vh] p-4">
            <ProductDetailImage
              src={productImages[selectedImage]}
              alt={product.name}
              className="w-full h-full object-contain"
            />

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {productImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleImageClick(index)}
                  className={`w-3 h-3 rounded-full ${
                    selectedImage === index ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-400 overflow-x-auto">
            <Link
              to="/"
              className="hover:text-blue-400 flex items-center gap-1 whitespace-nowrap"
            >
              <Home className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <Link
              to="/shop"
              className="hover:text-blue-400 whitespace-nowrap"
            >
              Shop
            </Link>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            {product.category && (
              <>
                <Link
                  to={`/category/${product.category._id || product.category}`}
                  className="hover:text-blue-400 whitespace-nowrap"
                >
                  {typeof product.category === "object"
                    ? product.category.name || "Category"
                    : "Category"}
                </Link>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              </>
            )}
            <span className="text-white font-medium whitespace-nowrap truncate max-w-[120px] sm:max-w-xs">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
          {/* Product Main Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 xl:gap-12 p-4 sm:p-6 md:p-8">
            {/* Images Section */}
            <div>
              {/* Main Image with Zoom */}
              <div className="relative">
                <div
                  ref={imageRef}
                  className="relative aspect-square bg-gray-900 rounded-lg sm:rounded-xl overflow-hidden mb-3 sm:mb-4 cursor-zoom-in"
                  onClick={handleImageZoomToggle}
                >
                  <ProductDetailImage
                    src={productImages[selectedImage] || productImages[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Zoom Indicator */}
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageZoomToggle();
                      }}
                      className="p-1.5 sm:p-2 bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-gray-700 transition-colors"
                    >
                      {imageZoom ? (
                        <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
                      ) : (
                        <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
                      )}
                    </button>
                  </div>

                  {/* Zoom Preview */}
                  {imageZoom && (
                    <div
                      ref={zoomRef}
                      className="absolute inset-0 bg-no-repeat bg-[length:200%]"
                      style={{
                        backgroundImage: `url(${getImageUrl(
                          productImages[selectedImage] || productImages[0]
                        )})`,
                      }}
                    />
                  )}
                </div>

                {/* Thumbnails */}
                {productImages.length > 1 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
                    {productImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => handleImageClick(index)}
                        className={`aspect-square rounded-md sm:rounded-lg overflow-hidden border transition-all ${
                          selectedImage === index
                            ? "border-blue-500 ring-1 sm:ring-2 ring-blue-900"
                            : "border-gray-700 hover:border-gray-600"
                        }`}
                      >
                        <ProductDetailImage
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div>
              {/* Back Button */}
              <div className="mb-4 sm:mb-6">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  Back
                </button>
              </div>

              {/* Product Title and Basic Info */}
              <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  {product.brand && (
                    <span className="text-blue-400 font-medium text-sm sm:text-base">
                      {product.brand}
                    </span>
                  )}
                </div>
              </div>

              {/* Demo/Showcase Info */}
              <div className="space-y-4 sm:space-y-6">
                {/* Contact/Info Section */}
                <div className="bg-gray-900/50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-700">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">
                    Product Showcase Information
                  </h3>
                  <p className="text-gray-400 text-sm sm:text-base mb-3 sm:mb-4">
                    This product is part of our demonstration catalog. For more
                    information about this product or to see it in person,
                    please contact us.
                  </p>
                </div>

                {/* Showcase Badges */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-700">
                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-900 rounded-lg">
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                    <div>
                      <div className="font-medium text-white text-sm sm:text-base">
                        Quality Assurance
                      </div>
                      <div className="text-xs text-gray-400">
                        Premium quality
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-900 rounded-lg">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                    <div>
                      <div className="font-medium text-white text-sm sm:text-base">
                        Expert Support
                      </div>
                      <div className="text-xs text-gray-400">
                        Specialists available
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-900 rounded-lg">
                    <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                    <div>
                      <div className="font-medium text-white text-sm sm:text-base">
                        Global Reach
                      </div>
                      <div className="text-xs text-gray-400">
                        Available worldwide
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-900 rounded-lg">
                    <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                    <div>
                      <div className="font-medium text-white text-sm sm:text-base">
                        Contact Sales
                      </div>
                      <div className="text-xs text-gray-400">
                        Available for demos
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section - Only Description */}
          <div className="border-t border-gray-700">
            <div className="border-b border-gray-700">
              <nav className="-mb-px flex space-x-4 sm:space-x-8 px-4 sm:px-6 md:px-8">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`py-3 sm:py-4 px-1 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === "description"
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-400 hover:border-gray-600"
                  }`}
                >
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                  Description
                </button>
              </nav>
            </div>

            <div className="p-4 sm:p-6 md:p-8">
              <div className="space-y-4 sm:space-y-6">
                <div className="prose prose-invert max-w-none text-sm sm:text-base">
                  {product.longDescription ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: product.longDescription,
                      }}
                    />
                  ) : product.description ? (
                    <div className="space-y-3 sm:space-y-4">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                        Product Details
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12">
                      <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 mx-auto mb-3 sm:mb-4" />
                      <p className="text-gray-500">No description available.</p>
                    </div>
                  )}
                </div>

                {product.features && product.features.length > 0 && (
                  <div className="bg-gray-900 rounded-lg sm:rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">
                      Key Features
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 sm:gap-3">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300 text-sm sm:text-base">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 sm:mt-12">
            <div className="flex items-center justify-between mb-4 sm:mb-8">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                Similar Products
              </h2>
              <Link
                to="/shop"
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm sm:text-base"
              >
                View All
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct._id}
                  product={relatedProduct}
                  isClickable={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Additional Back Button at Bottom */}
        <div className="mt-6 sm:mt-8 flex justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            Back to Previous Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;