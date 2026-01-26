import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Flame,
  Shield,
  ArrowRight,
  Settings,
  Disc,
  Circle,
  Cable,
  Wrench,
  Target,
  TrendingDown,
  FolderTree,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Star,
  Heart,
  Grid,
  List,
  Loader,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { categoryAPI, productAPI, getImageUrl, formatPrice } from "../services/api";
import { toast } from "react-hot-toast";

const Home = () => {
  const sectionRefs = useRef([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [retryCount, setRetryCount] = useState(0);
  const [apiStatus, setApiStatus] = useState("pending");
  const [usingFallback, setUsingFallback] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryView, setCategoryView] = useState("grid");
  const [visibleCategories, setVisibleCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Get API base URL - FIXED VERSION
  const getApiBaseUrl = () => {
    let baseUrl = import.meta.env.VITE_API_URL || "https://federalpartsphilippines-backend.onrender.com";
    
    // Clean the URL
    baseUrl = baseUrl.trim();
    baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    
    // If URL already ends with /api, remove it (we'll add it back later)
    if (baseUrl.endsWith('/api')) {
      baseUrl = baseUrl.slice(0, -4); // Remove '/api'
    }
    
    return baseUrl;
  };

  // Get API endpoint for categories
  const getCategoriesEndpoint = () => {
    const baseUrl = getApiBaseUrl();
    return `${baseUrl}/api/categories`;
  };

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Update visible categories when categories or page changes
  useEffect(() => {
    if (categories.length > 0) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setVisibleCategories(categories.slice(startIndex, endIndex));
    }
  }, [categories, currentPage]);

  // Fetch products for each category when categories change
  useEffect(() => {
    if (categories.length > 0 && !categoriesLoading) {
      fetchCategoryProducts();
    }
  }, [categories, categoriesLoading]);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      setApiStatus("pending");
      console.log("Fetching categories...");

      let categoriesData = [];
      const categoriesEndpoint = getCategoriesEndpoint();
      
      console.log("Fetching from:", categoriesEndpoint);

      try {
        // Try direct fetch first
        const response = await fetch(categoriesEndpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Response error:", errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log("API Response data:", data);

        // Parse different response formats
        if (data?.success && data.data) {
          categoriesData = data.data;
        } else if (data?.data && Array.isArray(data.data)) {
          categoriesData = data.data;
        } else if (data?.categories && Array.isArray(data.categories)) {
          categoriesData = data.categories;
        } else if (Array.isArray(data)) {
          categoriesData = data;
        } else if (data?.success === false) {
          throw new Error(data.message || "API returned error");
        } else {
          console.warn("Unexpected response format:", data);
          categoriesData = [];
        }

        setApiStatus("success");
        setUsingFallback(false);
        
      } catch (fetchError) {
        console.error("Direct fetch failed:", fetchError);
        
        // Try using categoryAPI service as fallback
        try {
          console.log("Trying categoryAPI service...");
          const response = await categoryAPI.getAll();
          console.log("categoryAPI response:", response);
          
          if (response?.success && response.data) {
            categoriesData = response.data;
          } else if (response?.data && Array.isArray(response.data)) {
            categoriesData = response.data;
          } else if (Array.isArray(response)) {
            categoriesData = response;
          } else {
            throw new Error("Invalid response from categoryAPI");
          }
          
          setApiStatus("success");
          setUsingFallback(false);
        } catch (apiError) {
          console.error("categoryAPI also failed:", apiError);
          throw new Error("All API methods failed");
        }
      }

      console.log("Processed categories data:", categoriesData);

      // Process categories
      const processedCategories = categoriesData
        .filter(cat => cat && cat.name)
        .map((cat) => {
          const categoryName = cat.name || "Unnamed Category";
          const icon = getCategoryIcon(categoryName);
          const image = getCategoryImage(cat);
          const slug = cat.slug || categoryName.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "") || "category";
          const categoryId = cat._id || cat.id || `cat-${Math.random().toString(36).substr(2, 9)}`;
          
          // Get subcategories
          const subcategories = cat.subcategories || cat.subCategories || [];
          
          const processedSubcategories = Array.isArray(subcategories) 
            ? subcategories
                .filter(sub => sub && sub.name)
                .map(sub => ({
                  _id: sub._id || sub.id || `sub-${Math.random().toString(36).substr(2, 9)}`,
                  name: sub.name || "Unnamed Subcategory",
                  slug: sub.slug || sub.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, ""),
                  count: sub.productCount || sub.count || 0
                }))
                .slice(0, 4)
            : [];

          return {
            _id: categoryId,
            name: categoryName,
            icon: icon,
            count: `${cat.productCount || cat.count || cat.items || 0} items`,
            image: image,
            slug: slug,
            title: categoryName,
            description: cat.description || `Browse our ${categoryName} collection`,
            subcategories: processedSubcategories,
            subcategoryCount: processedSubcategories.length,
            originalData: cat
          };
        });

      console.log("Final processed categories:", processedCategories);
      setCategories(processedCategories);
      
      if (processedCategories.length > 0) {
        toast.success(`Loaded ${processedCategories.length} categories`);
      } else {
        toast.info("No categories found");
      }
    } catch (error) {
      console.error("Error in fetchCategories:", error);
      
      // Show error and let user retry
      setApiStatus("error");
      setUsingFallback(false);
      toast.error(`Failed to load categories: ${error.message}`);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchCategoryProducts = async () => {
    if (categories.length === 0) return;

    const newCategoryProducts = {};
    const newLoadingProducts = {};

    // Initialize loading states
    categories.forEach(category => {
      newLoadingProducts[category._id] = true;
    });
    setLoadingProducts(newLoadingProducts);

    // Fetch products for each category
    for (const category of categories) {
      try {
        console.log(`Fetching products for category: ${category.name}`);
        
        let products = [];
        
        // Try to fetch products from API
        try {
          const response = await productAPI.getProductsByCategory(category._id);
          console.log(`Products response for ${category.name}:`, response);
          
          // Parse different response formats
          if (response?.success && response.products) {
            products = response.products;
          } else if (response?.data && Array.isArray(response.data)) {
            products = response.data;
          } else if (Array.isArray(response)) {
            products = response;
          } else if (response?.success && response.data?.products) {
            products = response.data.products;
          } else {
            console.warn(`No products found for category ${category.name}`);
            products = [];
          }
        } catch (error) {
          console.error(`API error for category ${category.name}:`, error);
          products = [];
        }

        // Process products - DYNAMIC: Only process if products exist
        const processedProducts = products.map(product => {
          // Get the main image - handle multiple formats
          let mainImage = "";
          
          if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            // If images array exists and has items
            mainImage = product.images[0];
          } else if (product.image) {
            // If single image field exists
            mainImage = product.image;
          } else if (product.imageUrl) {
            // If imageUrl field exists
            mainImage = product.imageUrl;
          } else if (product.thumbnail) {
            // If thumbnail field exists
            mainImage = product.thumbnail;
          }
          
          // Convert relative path to absolute URL if needed
          let finalImageUrl = mainImage;
          if (mainImage && !mainImage.startsWith("http") && !mainImage.startsWith("data:")) {
            if (mainImage.startsWith("/")) {
              const API_BASE_URL = getApiBaseUrl();
              // Remove any double slashes
              const cleanPath = mainImage.replace(/^\/+/, '');
              finalImageUrl = `${API_BASE_URL}/${cleanPath}`;
            } else {
              const API_BASE_URL = getApiBaseUrl();
              finalImageUrl = `${API_BASE_URL}/uploads/products/${mainImage}`;
            }
          }
          
          // Fallback if no image
          if (!finalImageUrl || finalImageUrl.trim() === '') {
            finalImageUrl = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop";
          }
          
          return {
            ...product,
            price: product.price || 0,
            discountedPrice: product.discountedPrice || product.discountPrice || null,
            rating: product.rating || product.averageRating || 4.0,
            reviewCount: product.reviewCount || product.reviews || 0,
            stock: product.stock || product.quantity || Math.floor(Math.random() * 50) + 1,
            images: [finalImageUrl], // Always ensure images array has at least one valid URL
            image: finalImageUrl, // Also set single image field
            category: product.category || { name: category.name }
          };
        });

        // DYNAMIC: Only set products if API returns them
        if (processedProducts.length > 0) {
          newCategoryProducts[category._id] = processedProducts;
          console.log(`Loaded ${processedProducts.length} real products for ${category.name}`);
        } else {
          newCategoryProducts[category._id] = []; // Empty array if no products
          console.log(`No real products found for ${category.name}`);
        }
        
        newLoadingProducts[category._id] = false;
        
      } catch (error) {
        console.error(`Error processing category ${category.name}:`, error);
        // DYNAMIC: Don't create mock products, just set empty array
        newCategoryProducts[category._id] = [];
        newLoadingProducts[category._id] = false;
      }
    }

    // Update state once
    setCategoryProducts(newCategoryProducts);
    setLoadingProducts(newLoadingProducts);
  };

  // Helper function to get appropriate icon based on category name
  const getCategoryIcon = (categoryName) => {
    if (!categoryName) return FolderTree;

    const name = categoryName.toLowerCase();
    if (name.includes("engine") || name.includes("motor")) return Settings;
    if (name.includes("brake")) return Disc;
    if (name.includes("tire") || name.includes("wheel")) return Circle;
    if (name.includes("suspension") || name.includes("shock")) return TrendingDown;
    if (name.includes("electrical") || name.includes("battery") || name.includes("light")) return Cable;
    if (name.includes("accessory") || name.includes("tool")) return Wrench;
    if (name.includes("exhaust") || name.includes("muffler")) return Flame;
    return FolderTree;
  };

  // Helper function to get appropriate image based on category - FIXED VERSION
  const getCategoryImage = (category) => {
    // If category has image property and it's a valid string
    if (category?.image && typeof category.image === 'string' && category.image.trim() !== '') {
      // Check if it's already a full URL
      if (category.image.startsWith("http")) {
        return category.image;
      }
      
      // If it's a relative path that starts with /
      if (category.image.startsWith("/")) {
        const API_BASE_URL = getApiBaseUrl();
        // Remove any double slashes
        const cleanPath = category.image.replace(/^\/+/, '');
        return `${API_BASE_URL}/${cleanPath}`;
      }
      
      // If it's just a filename, construct the full URL
      const API_BASE_URL = getApiBaseUrl();
      return `${API_BASE_URL}/uploads/categories/${category.image}`;
    }

    // If category has imageUrl property
    if (category?.imageUrl && typeof category.imageUrl === 'string' && category.imageUrl.trim() !== '') {
      if (category.imageUrl.startsWith("http")) {
        return category.imageUrl;
      }
      
      const API_BASE_URL = getApiBaseUrl();
      // Remove any double slashes
      const cleanPath = category.imageUrl.replace(/^\/+/, '');
      return `${API_BASE_URL}/${cleanPath}`;
    }

    // Fallback to Unsplash image based on category name
    const name = (category?.name || "").toLowerCase();
    if (name.includes("engine")) return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop";
    if (name.includes("brake")) return "https://images.unsplash.com/photo-1558981806-ec527fa0b4c9?w=400&h=250&fit=crop";
    if (name.includes("tire") || name.includes("wheel")) return "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=400&h=250&fit=crop";
    if (name.includes("suspension")) return "https://images.unsplash.com/photo-1566473359723-7e3e4d6c8c1b?w=400&h=250&fit=crop";
    if (name.includes("electrical") || name.includes("battery") || name.includes("light")) return "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=250&fit=crop";
    if (name.includes("accessory") || name.includes("tool")) return "https://images.unsplash.com/photo-1580261450035-4d4f04b7b4c5?w=400&h=250&fit=crop";
    if (name.includes("exhaust")) return "https://images.unsplash.com/photo-1558981806-ec527fa0b4c9?w=400&h=250&fit=crop";

    // Default motorcycle parts image
    return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop";
  };

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("section-visible");
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount((prev) => prev + 1);
      fetchCategories();
    } else {
      toast.error("Maximum retry attempts reached. Please check your backend connection.");
    }
  };

  // Handle category click
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    // Scroll to top of category section
    if (sectionRefs.current[0]) {
      sectionRefs.current[0].scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Clear selected category
  const clearSelectedCategory = () => {
    setSelectedCategory(null);
  };

  // Get products for selected category
  const getProductsForSelectedCategory = () => {
    if (!selectedCategory) return [];
    
    // Check if we have cached products for this category
    if (categoryProducts[selectedCategory._id]) {
      return categoryProducts[selectedCategory._id];
    }
    
    return [];
  };

  // Pagination handlers
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Product Card Component - ONLY RENDERS IF PRODUCT EXISTS
  const ProductCard = ({ product }) => {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [imageError, setImageError] = useState(false);
    
    const finalPrice = product.discountedPrice && product.discountedPrice < product.price 
      ? product.discountedPrice 
      : product.price;
    
    const discountPercentage = product.discountedPrice && product.discountedPrice < product.price
      ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
      : 0;
    
    // Get product image with proper URL handling - FIXED VERSION
    const getProductImage = () => {
      if (imageError) {
        return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop";
      }
      
      // Check multiple image sources
      const mainImage = product.images?.[0] || product.image || product.imageUrl || product.thumbnail;
      
      if (!mainImage) {
        return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop";
      }
      
      // If it's already a full URL or data URL
      if (mainImage.startsWith("http") || mainImage.startsWith("data:")) {
        return mainImage;
      }
      
      // If it's a relative path
      if (mainImage.startsWith("/")) {
        const API_BASE_URL = getApiBaseUrl();
        // Remove any double slashes
        const cleanPath = mainImage.replace(/^\/+/, '');
        return `${API_BASE_URL}/${cleanPath}`;
      }
      
      // If it's just a filename
      const API_BASE_URL = getApiBaseUrl();
      return `${API_BASE_URL}/uploads/products/${mainImage}`;
    };

    const handleImageError = () => {
      setImageError(true);
    };

    const getRatingStars = (rating) => {
      if (!rating) return null;
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      
      return (
        <div className="flex items-center">
          {[...Array(fullStars)].map((_, i) => (
            <Star key={`full-${i}`} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          ))}
          {hasHalfStar && <StarHalf className="w-3 h-3 fill-yellow-400 text-yellow-400" />}
        </div>
      );
    };

    const handleWishlistClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsWishlisted(!isWishlisted);
      toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
    };

    return (
      <Link
        to={`/product/${product._id || product.id}`}
        className="block group h-full"
      >
        <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl overflow-hidden border border-gray-800 hover:border-red-500 transition-all duration-300 hover:shadow-2xl h-full flex flex-col">
          {/* Product Image Container */}
          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
            <img
              src={getProductImage()}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={handleImageError}
              loading="lazy"
            />
            
            {/* Discount Badge */}
            {discountPercentage > 0 && (
              <div className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                -{discountPercentage}% OFF
              </div>
            )}
            
            {/* Wishlist Button */}
            <button
              onClick={handleWishlistClick}
              className="absolute top-3 right-3 p-2 bg-black/70 backdrop-blur-sm rounded-full hover:bg-red-600 transition-colors"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-300'}`} />
            </button>
            
            {/* Quick View Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toast.success("Quick view coming soon!");
                }}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm font-medium rounded-lg transition-all transform hover:scale-105"
              >
                Quick View
              </button>
            </div>
          </div>
          
          {/* Product Info */}
          <div className="p-4 flex-1 flex flex-col">
            {/* Category */}
            <div className="text-xs text-gray-400 mb-1">
              {product.category?.name || "Motorcycle Parts"}
            </div>
            
            {/* Product Name */}
            <h3 className="font-bold text-white mb-2 line-clamp-1 group-hover:text-red-400 transition-colors text-base">
              {product.name}
            </h3>
            
            {/* Description */}
            <p className="text-sm text-gray-300 mb-3 line-clamp-2 flex-1">
              {product.description}
            </p>
            
            {/* Rating and Stock */}
            <div className="flex items-center justify-between mb-4">
              {getRatingStars(product.rating)}
              <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                product.stock > 10 ? 'bg-green-500/20 text-green-400' : 
                product.stock > 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                'bg-red-500/20 text-red-400'
              }`}>
                {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
              </div>
            </div>
            
            {/* Price */}
            <div className="mt-auto">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-white">
                  {formatPrice ? formatPrice(finalPrice) : `₱${finalPrice?.toLocaleString() || '0'}`}
                </span>
                {discountPercentage > 0 && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice ? formatPrice(product.price) : `₱${product.price?.toLocaleString() || '0'}`}
                  </span>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toast.success("Added to cart!");
                }}
                className="w-full mt-3 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium rounded-lg transition-all transform hover:scale-[1.02] border border-gray-700 hover:border-red-500"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  // List View Product Card Component - ONLY RENDERS IF PRODUCT EXISTS
  const ListProductCard = ({ product }) => {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [imageError, setImageError] = useState(false);
    
    const finalPrice = product.discountedPrice && product.discountedPrice < product.price 
      ? product.discountedPrice 
      : product.price;
    
    const discountPercentage = product.discountedPrice && product.discountedPrice < product.price
      ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
      : 0;
    
    // Get product image with proper URL handling - FIXED VERSION
    const getProductImage = () => {
      if (imageError) {
        return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop";
      }
      
      // Check multiple image sources
      const mainImage = product.images?.[0] || product.image || product.imageUrl || product.thumbnail;
      
      if (!mainImage) {
        return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop";
      }
      
      // If it's already a full URL or data URL
      if (mainImage.startsWith("http") || mainImage.startsWith("data:")) {
        return mainImage;
      }
      
      // If it's a relative path
      if (mainImage.startsWith("/")) {
        const API_BASE_URL = getApiBaseUrl();
        // Remove any double slashes
        const cleanPath = mainImage.replace(/^\/+/, '');
        return `${API_BASE_URL}/${cleanPath}`;
      }
      
      // If it's just a filename
      const API_BASE_URL = getApiBaseUrl();
      return `${API_BASE_URL}/uploads/products/${mainImage}`;
    };

    const handleImageError = () => {
      setImageError(true);
    };

    const getRatingStars = (rating) => {
      if (!rating) return null;
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      
      return (
        <div className="flex items-center">
          {[...Array(fullStars)].map((_, i) => (
            <Star key={`full-${i}`} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          ))}
          {hasHalfStar && <StarHalf className="w-3 h-3 fill-yellow-400 text-yellow-400" />}
        </div>
      );
    };

    return (
      <Link
        to={`/product/${product._id || product.id}`}
        className="block group"
      >
        <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl overflow-hidden border border-gray-800 hover:border-red-500 transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col md:flex-row">
            {/* Product Image */}
            <div className="md:w-1/4 relative">
              <div className="relative h-48 md:h-full overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                <img
                  src={getProductImage()}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={handleImageError}
                  loading="lazy"
                />
                
                {/* Discount Badge */}
                {discountPercentage > 0 && (
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    -{discountPercentage}% OFF
                  </div>
                )}
              </div>
            </div>
            
            {/* Product Info */}
            <div className="md:w-3/4 p-6 flex flex-col justify-between">
              <div>
                {/* Category */}
                <div className="text-xs text-gray-400 mb-2">
                  {product.category?.name || "Motorcycle Parts"}
                </div>
                
                {/* Product Name */}
                <h3 className="font-bold text-white text-lg mb-2 line-clamp-1 group-hover:text-red-400 transition-colors">
                  {product.name}
                </h3>
                
                {/* Description */}
                <p className="text-gray-300 mb-4 line-clamp-2">
                  {product.description}
                </p>
                
                {/* Rating and Stock */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {getRatingStars(product.rating)}
                    <span className="text-sm text-gray-400">
                      ({product.reviewCount || 0} reviews)
                    </span>
                  </div>
                  <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                    product.stock > 10 ? 'bg-green-500/20 text-green-400' : 
                    product.stock > 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                  </div>
                </div>
              </div>
              
              {/* Price and Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-800">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-xl font-bold text-white">
                      {formatPrice ? formatPrice(finalPrice) : `₱${finalPrice?.toLocaleString() || '0'}`}
                    </span>
                    {discountPercentage > 0 && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice ? formatPrice(product.price) : `₱${product.price?.toLocaleString() || '0'}`}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toast.success("Added to cart!");
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm font-medium rounded-lg transition-all transform hover:scale-105"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toast.success("Quick view coming soon!");
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white text-sm font-medium rounded-lg border border-gray-700 hover:border-red-500 transition-all"
                  >
                    Quick View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  // StarHalf component for ratings
  const StarHalf = ({ className }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
    >
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

  // New Compact Category Card Component - FIXED WITH CLICK HANDLER
  const CategoryCard = ({ category, index }) => {
    const [imgError, setImgError] = useState(false);

    const handleImageError = () => {
      setImgError(true);
    };

    // Get final image URL - FIXED VERSION
    const getFinalImageUrl = () => {
      if (imgError) {
        // Use fallback image based on category name
        const name = (category.title || "").toLowerCase();
        if (name.includes("engine")) return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop";
        if (name.includes("brake")) return "https://images.unsplash.com/photo-1558981806-ec527fa0b4c9?w=400&h=250&fit=crop";
        if (name.includes("tire") || name.includes("wheel")) return "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=400&h=250&fit=crop";
        if (name.includes("suspension")) return "https://images.unsplash.com/photo-1566473359723-7e3e4d6c8c1b?w=400&h=250&fit=crop";
        if (name.includes("electrical") || name.includes("battery") || name.includes("light")) return "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=250&fit=crop";
        return "https://images.unsplash.com/photo-1580261450035-4d4f04b7b4c5?w=400&h=250&fit=crop";
      }
      
      // Use the image from category data
      if (category.image && category.image.trim() !== '') {
        // If it's already a full URL, return it
        if (category.image.startsWith("http")) {
          return category.image;
        }
        
        // If it's a relative path
        if (category.image.startsWith("/")) {
          const API_BASE_URL = getApiBaseUrl();
          // Remove any double slashes
          const cleanPath = category.image.replace(/^\/+/, '');
          return `${API_BASE_URL}/${cleanPath}`;
        }
        
        // If it's just a filename
        const API_BASE_URL = getApiBaseUrl();
        return `${API_BASE_URL}/uploads/categories/${category.image}`;
      }
      
      // Fallback to category-based image
      const name = (category.title || "").toLowerCase();
      if (name.includes("engine")) return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop";
      if (name.includes("brake")) return "https://images.unsplash.com/photo-1558981806-ec527fa0b4c9?w=400&h=250&fit=crop";
      if (name.includes("tire") || name.includes("wheel")) return "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=400&h=250&fit=crop";
      if (name.includes("suspension")) return "https://images.unsplash.com/photo-1566473359723-7e3e4d6c8c1b?w=400&h=250&fit=crop";
      if (name.includes("electrical") || name.includes("battery") || name.includes("light")) return "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=250&fit=crop";
      return "https://images.unsplash.com/photo-1580261450035-4d4f04b7b4c5?w=400&h=250&fit=crop";
    };

    return (
      <div
        className="animate-fade-up animate-on-visible"
        style={{ animationDelay: `${index * 100 + 300}ms` }}
      >
        <button
          onClick={() => handleCategoryClick(category)}
          className="w-full bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl overflow-hidden shadow-lg border border-gray-800 hover:border-red-500 transition-all duration-300 hover:shadow-xl group cursor-pointer h-64 flex flex-col"
        >
          {/* Simple Image Container - Takes most of the space */}
          <div className="relative h-48 overflow-hidden flex-1">
            <img
              src={getFinalImageUrl()}
              alt={category.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
              onError={handleImageError}
            />
            
            {/* Category Name Overlay - Small at bottom */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3">
              <div className="text-center">
                <h3 className="text-sm font-semibold text-white truncate">
                  {category.title}
                </h3>
                <p className="text-xs text-gray-300 mt-0.5">
                  {category.count || "0 items"}
                </p>
              </div>
            </div>
          </div>
          
          {/* Simple bottom bar with just the name */}
          <div className="bg-gray-900 px-3 py-2 flex items-center justify-center border-t border-gray-800">
            <span className="text-xs text-gray-300 truncate">
              {category.title}
            </span>
          </div>
        </button>
      </div>
    );
  };

  // Get the correct API endpoint for troubleshooting display
  const getApiEndpoint = () => {
    return getCategoriesEndpoint();
  };

  return (
    <>
      {/* Animation Styles */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fade-in {
            animation: fadeIn 1s ease forwards;
          }
          
          .animate-fade-up {
            animation: fadeInUp 0.8s ease forwards;
            opacity: 0;
          }
          
          .animate-slide-down {
            animation: slideDown 0.8s ease forwards;
            opacity: 0;
          }
          
          .animate-on-visible {
            opacity: 0;
            animation-play-state: paused;
          }
          
          .section-visible .animate-on-visible {
            opacity: 1 !important;
            animation-play-state: running !important;
          }
          
          .category-skeleton {
            background: linear-gradient(90deg, #1f2937 25%, #374151 50%, #1f2937 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
            border-radius: 0.75rem;
          }
          
          @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          
          .line-clamp-1 {
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
          }
          
          .line-clamp-2 {
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
          }
        `}
      </style>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <img
            src="/banner/FRONT PAGE.jpg"
            alt="Federal Parts Banner"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://images.unsplash.com/photo-1566473359723-7e3e4d6c8c1b?w=1200&h=800&fit=crop";
            }}
          />
        </div>
      </section>

      {/* Categories Section */}
      <section
        ref={(el) => (sectionRefs.current[0] = el)}
        className="py-16 bg-gradient-to-b from-black to-gray-900"
      >
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Section Header */}
          <div className="text-center mb-12 animate-fade-up animate-on-visible">
            <h2 className="font-bebas text-4xl md:text-5xl text-white mb-3">
              Product Categories
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Browse our premium motorcycle parts organized by category
            </p>
          </div>

          {/* Main Content */}
          <div className="animate-fade-in">
            {selectedCategory ? (
              /* Category Products View */
              <div>
                {/* Category Header */}
                <div className="mb-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={clearSelectedCategory}
                        className="p-2 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-lg border border-gray-700 hover:border-red-500 transition-all"
                        title="Back to Categories"
                      >
                        <ArrowRight className="w-5 h-5 text-gray-400 rotate-180" />
                      </button>
                      <div>
                        <h3 className="text-2xl font-bold text-white">
                          {selectedCategory.title}
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">
                          {getProductsForSelectedCategory().length} products • {selectedCategory.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* View Toggle Buttons */}
                    <div className="flex items-center gap-2 bg-gradient-to-r from-gray-900 to-black p-1 rounded-lg border border-gray-800">
                      <button
                        onClick={() => setCategoryView("grid")}
                        className={`p-2 rounded-md transition-all ${categoryView === "grid" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white"}`}
                        title="Grid View"
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCategoryView("list")}
                        className={`p-2 rounded-md transition-all ${categoryView === "list" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white"}`}
                        title="List View"
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Subcategories */}
                  {selectedCategory.subcategories && selectedCategory.subcategories.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
                        Popular Subcategories
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCategory.subcategories.map((sub, idx) => (
                          <button
                            key={sub._id || idx}
                            onClick={() => toast.success(`Filtering by ${sub.name}`)}
                            className="px-3 py-1.5 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-gray-300 hover:text-white text-sm rounded-lg border border-gray-700 hover:border-red-500 transition-all"
                          >
                            {sub.name} ({sub.count || 0})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Products Grid/List - DYNAMIC: Only shows if products exist */}
                {loadingProducts[selectedCategory._id] ? (
                  <div className="text-center py-12">
                    <Loader className="w-8 h-8 animate-spin text-red-500 mx-auto mb-4" />
                    <p className="text-gray-400">Loading products...</p>
                  </div>
                ) : getProductsForSelectedCategory().length > 0 ? (
                  categoryView === "grid" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {getProductsForSelectedCategory().map((product) => (
                        <ProductCard key={product._id || product.id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {getProductsForSelectedCategory().map((product) => (
                        <ListProductCard key={product._id || product.id} product={product} />
                      ))}
                    </div>
                  )
                ) : (
                  /* Empty State for Products - Only shows when NO products exist */
                  <div className="text-center py-12">
                    <FolderTree className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-white mb-2">No Products Found</h4>
                    <p className="text-gray-400 mb-6">
                      There are no products available in this category yet. 
                      Please check back later or browse other categories.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => {
                          fetchCategoryProducts();
                          toast.success("Refreshing products...");
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Refresh Products
                      </button>
                      <button
                        onClick={clearSelectedCategory}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                      >
                        Browse Other Categories
                      </button>
                    </div>
                  </div>
                )}

                {/* Product Count Display - Only shows if products exist */}
                {!loadingProducts[selectedCategory._id] && getProductsForSelectedCategory().length > 0 && (
                  <div className="mt-6 text-center">
                    <p className="text-gray-400 text-sm">
                      Showing {getProductsForSelectedCategory().length} products in {selectedCategory.title}
                    </p>
                  </div>
                )}

                {/* View All Button - Only shows if products exist */}
                {!loadingProducts[selectedCategory._id] && getProductsForSelectedCategory().length > 0 && (
                  <div className="text-center mt-12">
                    <Link
                      to={`/products?category=${selectedCategory.slug}`}
                      className="inline-flex items-center gap-3 bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 border border-gray-800 hover:border-red-500/30 shadow-lg"
                    >
                      <span>View All {selectedCategory.title} Products ({getProductsForSelectedCategory().length})</span>
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              /* Categories Grid View - UPDATED FOR JUST PICTURES */
              <div>
                {/* Categories Grid - 8 items visible */}
                {categoriesLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <div
                        key={index}
                        className="category-skeleton h-64 animate-fade-up animate-on-visible"
                        style={{ animationDelay: `${index * 100 + 300}ms` }}
                      />
                    ))}
                  </div>
                ) : apiStatus === "error" ? (
                  <div className="text-center py-16">
                    <AlertCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Connection Error
                    </h3>
                    <p className="text-gray-400 mb-8 max-w-md mx-auto">
                      Unable to connect to the server. Please check your backend connection.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <button
                        onClick={() => {
                          // Reset retry count and retry
                          setRetryCount(0);
                          fetchCategories();
                        }}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium flex items-center gap-2 transition-all hover:scale-105"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Reset & Retry
                      </button>
                      
                      <button
                        onClick={() => {
                          // Test the endpoint directly
                          const endpoint = getApiEndpoint();
                          window.open(endpoint, '_blank');
                          toast.info(`Opening endpoint in new tab: ${endpoint}`);
                        }}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all hover:scale-105"
                      >
                        Test Endpoint
                      </button>
                    </div>
                    
                    <div className="mt-8 p-4 bg-gray-900/50 rounded-lg max-w-lg mx-auto">
                      <h4 className="text-white font-semibold mb-2">Troubleshooting Tips:</h4>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Ensure your backend server is running</li>
                        <li>• Check the API endpoint: <code className="bg-gray-800 px-2 py-1 rounded">{getApiEndpoint()}</code></li>
                        <li>• Verify CORS is enabled on the backend</li>
                        <li>• Check browser console for detailed error messages</li>
                        <li>• Make sure your backend has the /api/categories endpoint</li>
                      </ul>
                      <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                        <p className="text-yellow-500 text-sm">
                          <strong>Environment Variable:</strong> {import.meta.env.VITE_API_URL || "Not set"}
                        </p>
                        <p className="text-yellow-500 text-sm mt-1">
                          <strong>Calculated Base URL:</strong> {getApiBaseUrl()}
                        </p>
                        <p className="text-yellow-500 text-sm mt-1">
                          <strong>Full Endpoint:</strong> {getApiEndpoint()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-16">
                    <FolderTree className="w-24 h-24 text-gray-600 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-3">
                      No Categories Available
                    </h3>
                    <p className="text-gray-400 mb-8 max-w-md mx-auto">
                      No categories found in the database. Please add categories through the admin panel.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <button
                        onClick={() => {
                          setRetryCount(0);
                          fetchCategories();
                        }}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium flex items-center gap-2 transition-all hover:scale-105"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                      </button>
                      
                      <Link
                        to="/admin/categories"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all hover:scale-105"
                      >
                        Add Categories
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Categories Grid - Showing 8 items */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                      {visibleCategories.map((category, index) => (
                        <CategoryCard key={category._id} category={category} index={index} />
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {categories.length > itemsPerPage && (
                      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-gray-400 text-sm">
                          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                          {Math.min(currentPage * itemsPerPage, categories.length)} of {categories.length} categories
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-lg border transition-all ${
                              currentPage === 1
                                ? "border-gray-800 text-gray-600 cursor-not-allowed"
                                : "border-gray-700 text-gray-300 hover:border-red-500 hover:text-white hover:bg-gray-800"
                            }`}
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }
                              
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => goToPage(pageNum)}
                                  className={`w-8 h-8 rounded-lg transition-all ${
                                    currentPage === pageNum
                                      ? "bg-red-600 text-white"
                                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>
                          
                          <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-lg border transition-all ${
                              currentPage === totalPages
                                ? "border-gray-800 text-gray-600 cursor-not-allowed"
                                : "border-gray-700 text-gray-300 hover:border-red-500 hover:text-white hover:bg-gray-800"
                            }`}
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* View All Categories Button */}
                    <div className="mt-12 text-center">
                      <Link
                        to="/products"
                        className="inline-flex items-center gap-3 bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 border border-gray-800 hover:border-red-500/30 shadow-lg"
                      >
                        <span>Browse All Categories & Products</span>
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </div>

                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        ref={(el) => (sectionRefs.current[1] = el)}
        className="py-16 bg-black"
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12 animate-fade-up animate-on-visible">
            <h2 className="font-bebas text-5xl md:text-6xl text-white mb-4">
              Quality you can Trust. Price You Can Afford.
            </h2>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Experience the perfect balance of premium quality and exceptional value with Federal Parts - where trust meets affordability.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-down animate-on-visible">
              <h2 className="font-bebas text-4xl text-white mb-6">
                About Federal Parts
              </h2>
              <p className="text-gray-300 mb-8">
                Cutting-edge innovative technology Federal Parts is one of the brands of motorcycle spare parts marketed by PT Astra Otoparts Tbk's Domestic business unit. Consumers in Indonesia can easily obtain Federal Parts products due to the extensive marketing network, which includes 50 main dealers, 23 sales offices, and nearly 10,000 shops or workshops. In addition, Federal Parts is well known for its quality because it is manufactured according to OEM (Original Equipment Manufacturer) standards and is suitable for all motorcycle brands circulating in Indonesia, such as Honda, Kawasaki, Suzuki, and Yamaha. It is also supported by the large variety of products offered. Federal Parts is always committed to providing added value for consumers by continuously launching spare parts with the latest technology at affordable prices without compromising quality.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-lg hover:bg-gray-800 transition-colors animate-fade-up animate-on-visible border border-gray-800">
                  <Shield className="w-8 h-8 text-red-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-white">
                      Japanese-level Engineering
                    </h4>
                    <p className="text-sm text-gray-400">
                      Precision engineering meets world-class quality standards
                    </p>
                  </div>
                </div>
                <div 
                  className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-lg hover:bg-gray-800 transition-colors animate-fade-up animate-on-visible border border-gray-800"
                  style={{ animationDelay: "200ms" }}
                >
                  <Target className="w-8 h-8 text-red-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-white">Indonesia-DNA</h4>
                    <p className="text-sm text-gray-400">
                      Locally manufactured, nationally trusted
                    </p>
                  </div>
                </div>
                <div 
                  className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-lg hover:bg-gray-800 transition-colors animate-fade-up animate-on-visible border border-gray-800"
                  style={{ animationDelay: "300ms" }}
                >
                  <TrendingDown className="w-8 h-8 text-red-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-white">
                      China-level Affordability
                    </h4>
                    <p className="text-sm text-gray-400">
                      Competitive pricing without compromising on quality
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative animate-fade-up animate-on-visible">
              <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-800">
                <img
                  src="/wmremove-transformed (1).png"
                  alt="Motorcycle parts"
                  className="w-full h-auto"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1621422206586-8b4e69e4b8a1?w=600&h=400&fit=crop";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <div className="p-6">
                    <h3 className="font-bebas text-3xl text-white mb-2">
                      Trusted by Riders Nationwide
                    </h3>
                    <p className="text-gray-200">
                      Quality parts for every motorcycle, everywhere in Indonesia
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;