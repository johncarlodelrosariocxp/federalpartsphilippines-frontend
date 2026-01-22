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
  ChevronRight,
} from "lucide-react";
import { categoryAPI } from "../services/api";
import { toast } from "react-hot-toast";

const Home = () => {
  const sectionRefs = useRef([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [retryCount, setRetryCount] = useState(0);
  const [apiStatus, setApiStatus] = useState("pending"); // pending, success, error
  const [usingFallback, setUsingFallback] = useState(false);

  // Fetch categories on component mount and when retryCount changes
  useEffect(() => {
    fetchCategories();
  }, [retryCount]);

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
        .filter(cat => cat && cat.name) // Filter out invalid categories
        .map((cat) => {
          const categoryName = cat.name || "Unnamed Category";
          const icon = getCategoryIcon(categoryName);
          const image = getCategoryImage(cat);
          const slug = cat.slug || categoryName.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "") || "category";
          
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
                .slice(0, 4) // Limit to 4 subcategories for display
            : [];

          return {
            _id: cat._id || Math.random().toString(36).substr(2, 9),
            name: categoryName,
            icon: icon,
            count: `${cat.productCount || cat.count || cat.items || 0} items`,
            image: image,
            slug: slug,
            title: categoryName,
            description: cat.description || "",
            subcategories: processedSubcategories,
            subcategoryCount: processedSubcategories.length,
            originalData: cat // Keep original data for debugging
          };
        })
        .slice(0, 6); // Take only first 6 categories for display

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
    if (name.includes("engine")) return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop";
    if (name.includes("brake")) return "https://images.unsplash.com/photo-1558981806-ec527fa0b4c9?w=400&h=200&fit=crop";
    if (name.includes("tire") || name.includes("wheel")) return "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=400&h=200&fit=crop";
    if (name.includes("suspension")) return "https://images.unsplash.com/photo-1566473359723-7e3e4d6c8c1b?w=400&h=200&fit=crop";
    if (name.includes("electrical") || name.includes("battery") || name.includes("light")) return "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=200&fit=crop";
    if (name.includes("accessory") || name.includes("tool")) return "https://images.unsplash.com/photo-1580261450035-4d4f04b7b4c5?w=400&h=200&fit=crop";
    if (name.includes("exhaust")) return "https://images.unsplash.com/photo-1558981806-ec527fa0b4c9?w=400&h=200&fit=crop";

    // Default motorcycle parts image
    return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop";
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
      subcategories: cat.subcategories || [],
      subcategoryCount: cat.subcategories?.length || 0,
      isDemo: true
    }));
    setCategories(processed);
    setUsingFallback(true);
    toast.success("Using demo categories");
  };

  // Category Card Component
  const CategoryCard = ({ category, index }) => {
    const [imgError, setImgError] = useState(false);
    const IconComponent = category.icon || FolderTree;

    const handleImageError = () => {
      console.log(`Image failed to load for ${category.title}`);
      setImgError(true);
    };

    // Get final image URL
    const getFinalImageUrl = () => {
      if (imgError) {
        // Use fallback image based on category name
        const name = (category.title || "").toLowerCase();
        if (name.includes("engine")) return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop";
        if (name.includes("brake")) return "https://images.unsplash.com/photo-1558981806-ec527fa0b4c9?w=400&h=200&fit=crop";
        if (name.includes("tire") || name.includes("wheel")) return "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=400&h=200&fit=crop";
        return "https://images.unsplash.com/photo-1566473359723-7e3e4d6c8c1b?w=400&h=200&fit=crop";
      }
      return category.image;
    };

    return (
      <div
        className="animate-fade-up animate-on-visible"
        style={{ animationDelay: `${index * 100 + 300}ms` }}
      >
        <Link
          to={`/categories/${category.slug}`}
          className="group block bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-800"
        >
          <div className="relative h-48 overflow-hidden">
            <img
              src={getFinalImageUrl()}
              alt={category.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
              onError={handleImageError}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            
            {/* Fallback badge */}
            {(category.isFallback || category.isDemo) && (
              <div className="absolute top-3 right-3 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                Demo
              </div>
            )}
            
            {/* Subcategory count badge */}
            {category.subcategoryCount > 0 && (
              <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {category.subcategoryCount} Subcategories
              </div>
            )}
          </div>
          
          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-600/10 rounded-lg">
                  <IconComponent className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="font-bold text-white text-lg group-hover:text-red-400 transition-colors">
                  {category.title}
                </h3>
              </div>
            </div>
            
            <p className="text-sm text-gray-400 mb-3">
              {category.count}
            </p>
            
            {category.description && (
              <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                {category.description}
              </p>
            )}
            
            {/* Subcategories Section */}
            {category.subcategories && category.subcategories.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Subcategories
                  </h4>
                  <span className="text-xs text-gray-500">
                    {category.subcategories.length} shown
                  </span>
                </div>
                <div className="space-y-1">
                  {category.subcategories.map((sub, idx) => (
                    <div 
                      key={sub._id || idx}
                      className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-gray-800/50 transition-colors group/sub"
                    >
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-3 h-3 text-gray-500 group-hover/sub:text-red-500 transition-colors" />
                        <span className="text-sm text-gray-300 group-hover/sub:text-white transition-colors">
                          {sub.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {sub.productCount || sub.count || 0} items
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
         
          </div>
        </Link>
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

      {/* Hero Section with black background */}
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

      {/* Categories Section with black background */}
      <section
        ref={(el) => (sectionRefs.current[0] = el)}
        id="categories"
        className="py-16 bg-black"
      >
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header with API Status */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <h2 className="font-bebas text-4xl md:text-5xl text-white mb-2 animate-fade-up animate-on-visible">
                Product Categories
              </h2>
            
            </div>
            
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 animate-fade-up animate-on-visible"
            >
              View All Categories
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Categories Grid */}
          {categoriesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="category-skeleton h-80 animate-fade-up animate-on-visible"
                  style={{ animationDelay: `${index * 100 + 300}ms` }}
                />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16">
              <FolderTree className="w-24 h-24 mx-auto mb-6" />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {categories.map((category, index) => (
                  <CategoryCard key={category._id} category={category} index={index} />
                ))}
              </div>

              {/* Demo Data Notice */}
              {usingFallback && (
                <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                    <div>
                      <p className="text-yellow-500 font-medium">
                        Showing demo categories with subcategories
                      </p>
                      <p className="text-yellow-400/80 text-sm mt-1">
                        Real categories will load automatically when API connection is restored.
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

              {/* View All Button for Mobile */}
              <div className="mt-12 text-center lg:hidden">
                <Link
                  to="/categories"
                  className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 border border-gray-800"
                >
                  View All Categories
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* About Section with black background */}
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