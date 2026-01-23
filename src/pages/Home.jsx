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
  const [categoryView, setCategoryView] = useState("grid"); // "grid" or "list"

  // Fetch categories on component mount and when retryCount changes
  useEffect(() => {
    fetchCategories();
  }, [retryCount]);

  // Fetch products for each category when categories change
  useEffect(() => {
    if (categories.length > 0) {
      fetchCategoryProducts();
    }
  }, [categories]);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      setApiStatus("pending");
      console.log("Fetching categories...");

      // Try different approaches to get categories
      let categoriesData = [];
      let isFallback = false;

      try {
        // First, check if API is reachable
        const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const healthCheck = await fetch(`${API_BASE_URL}/api/health`);
        
        if (!healthCheck.ok) {
          throw new Error("API not reachable");
        }

        // Approach 1: Use categoryAPI service
        const response = await categoryAPI.getAll();
        console.log("API Response:", response);

        // Parse response based on different possible structures
        if (response?.success && response.data) {
          categoriesData = response.data;
        } else if (response?.data && Array.isArray(response.data)) {
          categoriesData = response.data;
        } else if (response?.categories && Array.isArray(response.categories)) {
          categoriesData = response.categories;
        } else if (Array.isArray(response)) {
          categoriesData = response;
        } else if (response?.success === false && response.message) {
          throw new Error(response.message);
        } else {
          throw new Error("Invalid response format");
        }

        setApiStatus("success");
        setUsingFallback(false);
      } catch (apiError) {
        console.log("API approach failed, trying fallback...", apiError);
        
        // Approach 2: Direct fetch to categories endpoint
        try {
          const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
          const fallbackResponse = await fetch(`${API_BASE_URL}/api/categories`);
          
          if (!fallbackResponse.ok) {
            throw new Error(`HTTP ${fallbackResponse.status}`);
          }
          
          const data = await fallbackResponse.json();
          
          if (data?.success && data.data) {
            categoriesData = data.data;
          } else if (Array.isArray(data)) {
            categoriesData = data;
          } else if (data?.categories) {
            categoriesData = data.categories;
          } else {
            throw new Error("Invalid fallback response");
          }
          
          setApiStatus("success");
          setUsingFallback(false);
        } catch (fetchError) {
          console.log("Fallback also failed:", fetchError);
          // Use hardcoded categories as last resort
          categoriesData = getHardcodedCategories();
          isFallback = true;
          setApiStatus("error");
          setUsingFallback(true);
        }
      }

      console.log("Processed categories data:", categoriesData);

      // Process categories with images and subcategories
      const processedCategories = categoriesData
        .filter(cat => cat && cat.name)
        .map((cat) => {
          const categoryName = cat.name || "Unnamed Category";
          const icon = getCategoryIcon(categoryName);
          const image = getCategoryImage(cat);
          const slug = cat.slug || categoryName.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "") || "category";
          const categoryId = cat._id || Math.random().toString(36).substr(2, 9);
          
          // Get subcategories from the category data
          const subcategories = cat.subcategories || cat.subCategories || 
                              (cat.children && Array.isArray(cat.children) ? cat.children : []);
          
          // Process subcategories if they exist
          const processedSubcategories = Array.isArray(subcategories) 
            ? subcategories
                .filter(sub => sub && sub.name)
                .map(sub => ({
                  _id: sub._id || Math.random().toString(36).substr(2, 9),
                  name: sub.name || "Unnamed Subcategory",
                  slug: sub.slug || sub.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, ""),
                  productCount: sub.productCount || sub.count || 0
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
            description: cat.description || "",
            subcategories: processedSubcategories,
            subcategoryCount: processedSubcategories.length,
            originalData: cat
          };
        })
        .slice(0, 6);

      console.log("Final processed categories:", processedCategories);
      setCategories(processedCategories);
      
      if (processedCategories.length > 0) {
        toast.success(`Loaded ${processedCategories.length} categories`);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
      setApiStatus("error");

      // Use hardcoded categories as fallback with subcategories
      const hardcodedCategories = getHardcodedCategories();
      const processedHardcoded = hardcodedCategories.map((cat, index) => ({
        _id: `hardcoded-${index}`,
        ...cat,
        icon: getCategoryIcon(cat.name),
        image: cat.image,
        slug: cat.slug,
        title: cat.name,
        count: cat.count,
        description: cat.description,
        subcategories: cat.subcategories || [],
        subcategoryCount: cat.subcategories?.length || 0,
        isFallback: true
      }));

      setCategories(processedHardcoded);
      setUsingFallback(true);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchCategoryProducts = async () => {
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
        
        if (category.isFallback || category.isDemo) {
          // Use demo products for fallback categories
          products = getDemoProductsForCategory(category.slug);
        } else {
          // Try to fetch products from API
          try {
            const response = await productAPI.getProductsByCategory(category._id, { limit: 3 });
            if (response.success && response.products) {
              products = response.products.slice(0, 3);
            } else {
              // If API fails, use demo products
              products = getDemoProductsForCategory(category.slug);
            }
          } catch (error) {
            console.error(`Error fetching products for category ${category.name}:`, error);
            products = getDemoProductsForCategory(category.slug);
          }
        }

        newCategoryProducts[category._id] = products;
        newLoadingProducts[category._id] = false;
        
        // Update state for this category
        setCategoryProducts(prev => ({
          ...prev,
          [category._id]: products
        }));
        setLoadingProducts(prev => ({
          ...prev,
          [category._id]: false
        }));
        
      } catch (error) {
        console.error(`Error processing category ${category.name}:`, error);
        newLoadingProducts[category._id] = false;
        setLoadingProducts(prev => ({
          ...prev,
          [category._id]: false
        }));
      }
    }
  };

  

  // Hardcoded fallback categories with subcategories
  const getHardcodedCategories = () => {
    return [
      {
        name: "Engine Parts",
        count: "42 items",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop",
        slug: "engine-parts",
        description: "High-performance engine components and parts",
        subcategories: [
          { name: "Pistons", slug: "pistons", count: 8 },
          { name: "Cylinders", slug: "cylinders", count: 6 },
          { name: "Crankshafts", slug: "crankshafts", count: 4 },
          { name: "Valves", slug: "valves", count: 12 }
        ]
      },
      {
        name: "Brake Systems",
        count: "28 items",
        image: "https://images.unsplash.com/photo-1558981806-ec527fa0b4c9?w=400&h=200&fit=crop",
        slug: "brake-systems",
        description: "Complete brake systems and components",
        subcategories: [
          { name: "Brake Pads", slug: "brake-pads", count: 10 },
          { name: "Brake Discs", slug: "brake-discs", count: 6 },
          { name: "Brake Calipers", slug: "brake-calipers", count: 5 },
          { name: "Brake Lines", slug: "brake-lines", count: 7 }
        ]
      },
      {
        name: "Tires & Wheels",
        count: "15 items",
        image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=400&h=200&fit=crop",
        slug: "tires-wheels",
        description: "Tires and wheels for all motorcycle types",
        subcategories: [
          { name: "Sport Tires", slug: "sport-tires", count: 5 },
          { name: "Off-road Tires", slug: "offroad-tires", count: 4 },
          { name: "Alloy Wheels", slug: "alloy-wheels", count: 3 },
          { name: "Spoked Wheels", slug: "spoked-wheels", count: 3 }
        ]
      },
      {
        name: "Electrical",
        count: "36 items",
        image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=200&fit=crop",
        slug: "electrical",
        description: "Electrical components and systems",
        subcategories: [
          { name: "Batteries", slug: "batteries", count: 8 },
          { name: "Alternators", slug: "alternators", count: 6 },
          { name: "Lighting", slug: "lighting", count: 12 },
          { name: "Wiring Harnesses", slug: "wiring-harnesses", count: 10 }
        ]
      },
      {
        name: "Suspension",
        count: "24 items",
        image: "https://images.unsplash.com/photo-1566473359723-7e3e4d6c8c1b?w=400&h=200&fit=crop",
        slug: "suspension",
        description: "Shock absorbers and suspension parts",
        subcategories: [
          { name: "Front Forks", slug: "front-forks", count: 8 },
          { name: "Rear Shocks", slug: "rear-shocks", count: 6 },
          { name: "Swingarms", slug: "swingarms", count: 4 },
          { name: "Suspension Springs", slug: "suspension-springs", count: 6 }
        ]
      },
      {
        name: "Accessories",
        count: "58 items",
        image: "https://images.unsplash.com/photo-1580261450035-4d4f04b7b4c5?w=400&h=200&fit=crop",
        slug: "accessories",
        description: "Motorcycle accessories and tools",
        subcategories: [
          { name: "Handlebars", slug: "handlebars", count: 12 },
          { name: "Seats", slug: "seats", count: 8 },
          { name: "Luggage", slug: "luggage", count: 15 },
          { name: "Tools", slug: "tools", count: 23 }
        ]
      }
    ];
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

  // Helper function to get appropriate image based on category
  const getCategoryImage = (category) => {
    // If category has image property and it's a valid string
    if (category?.image && typeof category.image === 'string' && category.image.trim() !== '') {
      // Check if it's already a full URL
      if (category.image.startsWith("http")) {
        return category.image;
      }
      
      // If it's a relative path that starts with /
      if (category.image.startsWith("/")) {
        const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        return `${API_BASE_URL}${category.image}`;
      }
      
      // If it's just a filename, construct the full URL
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      return `${API_BASE_URL}/uploads/categories/${category.image}`;
    }

    // If category has imageUrl property
    if (category?.imageUrl && typeof category.imageUrl === 'string' && category.imageUrl.trim() !== '') {
      if (category.imageUrl.startsWith("http")) {
        return category.imageUrl;
      }
      
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      return `${API_BASE_URL}${category.imageUrl}`;
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
    } else {
      toast.error("Maximum retry attempts reached. Using fallback data.");
      const hardcodedCategories = getHardcodedCategories();
      const processed = hardcodedCategories.map((cat, index) => ({
        _id: `hardcoded-${index}`,
        ...cat,
        icon: getCategoryIcon(cat.name),
        image: cat.image,
        slug: cat.slug,
        title: cat.name,
        count: cat.count,
        description: cat.description,
        subcategories: cat.subcategories || [],
        subcategoryCount: cat.subcategories?.length || 0,
        isFallback: true
      }));
      setCategories(processed);
      setUsingFallback(true);
    }
  };

  const handleUseDemoData = () => {
    const hardcodedCategories = getHardcodedCategories();
    const processed = hardcodedCategories.map((cat, index) => ({
      _id: `demo-${index}`,
      ...cat,
      icon: getCategoryIcon(cat.name),
      image: cat.image,
      slug: cat.slug,
      title: cat.name,
      count: cat.count,
      description: cat.description,
      subcategories: cat.subcategories || [],
      subcategoryCount: cat.subcategories?.length || 0,
      isDemo: true
    }));
    setCategories(processed);
    setUsingFallback(true);
    toast.success("Using demo categories");
  };

  // Handle category click
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
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
    
    // If not, get demo products
    return getDemoProductsForCategory(selectedCategory.slug);
  };

  // Product Card Component
  const ProductCard = ({ product }) => {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [imageError, setImageError] = useState(false);
    
    const finalPrice = product.discountedPrice && product.discountedPrice < product.price 
      ? product.discountedPrice 
      : product.price;
    
    const discountPercentage = product.discountedPrice && product.discountedPrice < product.price
      ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
      : 0;
    
    const mainImage = product.images?.[0] || 
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop";

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
        to={`/product/${product._id}`}
        className="block group h-full"
      >
        <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl overflow-hidden border border-gray-800 hover:border-red-500 transition-all duration-300 hover:shadow-2xl h-full flex flex-col">
          {/* Product Image Container */}
          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
            <img
              src={imageError ? "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop" : mainImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={handleImageError}
            />
            
            {/* Discount Badge */}
            {discountPercentage > 0 && (
              <div className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                -{discountPercentage}% OFF
              </div>
            )}
            
            
            
            {/* Quick View Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
            
            </div>
          </div>
          
          {/* Product Info */}
          <div className="p-4 flex-1 flex flex-col">
            {/* Category */}
            <div className="text-xs text-gray-400 mb-1">
              {product.category?.name }
            </div>
            
            {/* Product Name */}
            <h3 className="font-bold text-white mb-2 line-clamp-1 group-hover:text-red-400 transition-colors text-base">
              {product.name}
            </h3>
            
            {/* Description */}
            <p className="text-sm text-gray-300 mb-3 line-clamp-2 flex-1">
              {product.description}
            </p>
            
           
            
          </div>
        </div>
      </Link>
    );
  };

  // List View Product Card Component
  const ListProductCard = ({ product }) => {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [imageError, setImageError] = useState(false);
    
    const finalPrice = product.discountedPrice && product.discountedPrice < product.price 
      ? product.discountedPrice 
      : product.price;
    
    const discountPercentage = product.discountedPrice && product.discountedPrice < product.price
      ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
      : 0;
    
    const mainImage = product.images?.[0] || 
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop";

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
        to={`/product/${product._id}`}
        className="block group"
      >
        <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl overflow-hidden border border-gray-800 hover:border-red-500 transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col md:flex-row">
            {/* Product Image */}
            <div className="md:w-1/4 relative">
              <div className="relative h-48 md:h-full overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                <img
                  src={imageError ? "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop" : mainImage}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={handleImageError}
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
                      {formatPrice(finalPrice)}
                    </span>
                    {discountPercentage > 0 && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(product.price)}
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

  // Category Card Component - SIMPLIFIED VERSION
  const CategoryCard = ({ category, index }) => {
    const [imgError, setImgError] = useState(false);
    const IconComponent = category.icon || FolderTree;

    const handleImageError = () => {
      setImgError(true);
    };

    // Get final image URL
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
      return category.image;
    };

    return (
      <div
        className="animate-fade-up animate-on-visible"
        style={{ animationDelay: `${index * 100 + 300}ms` }}
      >
        <button
          onClick={() => handleCategoryClick(category)}
          className="w-full bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl overflow-hidden shadow-lg border border-gray-800 hover:border-red-500 transition-all duration-300 hover:shadow-xl group cursor-pointer"
        >
          {/* Simple Image Container */}
          <div className="relative h-48 overflow-hidden">
            <img
              src={getFinalImageUrl()}
              alt={category.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
              onError={handleImageError}
            />
            
            {/* Category Count Badge */}
            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <span className="text-xs font-medium text-white">
                {category.count || "0 items"}
              </span>
            </div>
            
            {/* Category Name - Centered */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-4">
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                  {category.title}
                </h3>
                <p className="text-gray-200 text-sm max-w-xs mx-auto line-clamp-2">
                  {category.description}
                </p>
              </div>
            </div>
            
            {/* Subcategories Indicator */}
            {category.subcategories && category.subcategories.length > 0 && (
              <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span className="text-xs text-gray-300">
                  {category.subcategories.length} subcategories
                </span>
              </div>
            )}
          </div>
        </button>
      </div>
    );
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
                          {selectedCategory.count} • {selectedCategory.description}
                        </p>
                      </div>
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
                          <Link
                            key={sub._id || idx}
                            to={`/products?category=${selectedCategory.slug}&subcategory=${sub.slug}`}
                            className="px-3 py-1.5 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-gray-300 hover:text-white text-sm rounded-lg border border-gray-700 hover:border-red-500 transition-all"
                          >
                            {sub.name} ({sub.count || 0})
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Products Grid/List */}
                {categoryView === "grid" ? (
                  /* CHANGED HERE: grid-cols-2 for mobile view of products */
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {getProductsForSelectedCategory().map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getProductsForSelectedCategory().map((product) => (
                      <ListProductCard key={product._id} product={product} />
                    ))}
                  </div>
                )}

                {/* View All Button */}
                <div className="text-center mt-12">
                  <Link
                    to={`/products?category=${selectedCategory.slug}`}
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 border border-gray-800 hover:border-red-500/30 shadow-lg"
                  >
                    <span>View All {selectedCategory.title} Products</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ) : (
              /* Categories Grid View */
              <div>
                {/* Categories Grid - CHANGED HERE: grid-cols-2 for mobile */}
                {categoriesLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={index}
                        className="category-skeleton h-[250px] animate-fade-up animate-on-visible"
                        style={{ animationDelay: `${index * 100 + 300}ms` }}
                      />
                    ))}
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-16">
                    <FolderTree className="w-24 h-24 text-gray-600 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-3">
                      No Categories Available
                    </h3>
                    <p className="text-gray-400 mb-8 max-w-md mx-auto">
                      {retryCount > 0
                        ? "Unable to fetch categories. Please check your backend connection or use demo data."
                        : "Categories will appear here once they are added to the system."}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <button
                        onClick={handleRetry}
                        disabled={retryCount >= 3}
                        className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all ${
                          retryCount >= 3
                            ? "bg-gray-800 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700 hover:scale-105"
                        }`}
                      >
                        <RefreshCw className={`w-4 h-4 ${retryCount >= 3 ? "" : "animate-spin"}`} />
                        {retryCount >= 3 ? "Max Retries Reached" : `Try Again (${retryCount}/3)`}
                      </button>
                      
                      <button
                        onClick={handleUseDemoData}
                        className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-all hover:scale-105"
                      >
                        Use Demo Categories
                      </button>
                      
                      <Link
                        to="/admin/categories"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all hover:scale-105"
                      >
                        Add Categories
                      </Link>
                    </div>
                    
                    {retryCount > 0 && (
                      <div className="mt-8 p-4 bg-gray-900/50 rounded-lg max-w-lg mx-auto">
                        <h4 className="text-white font-semibold mb-2">Troubleshooting Tips:</h4>
                        <ul className="text-sm text-gray-400 space-y-1">
                          <li>• Check if your backend server is running</li>
                          <li>• Verify the API endpoint: {import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/categories</li>
                          <li>• Ensure CORS is properly configured on the backend</li>
                          <li>• Check browser console for detailed error messages</li>
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* CHANGED HERE: grid-cols-2 for mobile view */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categories.map((category, index) => (
                        <CategoryCard key={category._id} category={category} index={index} />
                      ))}
                    </div>

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

                    {/* Demo Data Notice */}
                    {usingFallback && (
                      <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                          <div>
                            <p className="text-yellow-500 font-medium">
                              Showing demo categories with products
                            </p>
                            <p className="text-yellow-400/80 text-sm mt-1">
                              Real categories and products will load automatically when API connection is restored.
                              <button 
                                onClick={handleRetry}
                                className="ml-2 underline hover:text-yellow-300 transition-colors"
                              >
                                Retry connection
                              </button>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
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