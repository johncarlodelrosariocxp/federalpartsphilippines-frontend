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
} from "lucide-react";
import { categoryAPI } from "../services/api";
import { toast } from "react-hot-toast";

const Home = () => {
  const sectionRefs = useRef([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      console.log("Fetching categories...");

      // Try different approaches to get categories
      let categoriesData = [];

      try {
        // Approach 1: Direct API call
        const response = await categoryAPI.getAll();
        console.log("API Response:", response);

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
        console.log("First approach failed, trying fallback...", apiError);

        // Approach 2: Try with direct axios call
        try {
          const API_BASE_URL =
            import.meta.env.VITE_API_URL || "http://localhost:5000/api";
          const fallbackResponse = await fetch(`${API_BASE_URL}/categories`);
          const data = await fallbackResponse.json();

          if (data?.success && data.data) {
            categoriesData = data.data;
          } else if (Array.isArray(data)) {
            categoriesData = data;
          }
        } catch (fetchError) {
          console.log("Fallback also failed:", fetchError);
          // Use hardcoded categories as last resort
          categoriesData = getHardcodedCategories();
        }
      }

      console.log("Processed categories data:", categoriesData);

      // Process categories with images
      const processedCategories = categoriesData
        .map((cat) => ({
          _id: cat._id || Math.random().toString(36).substr(2, 9),
          name: cat.name || "Unnamed Category",
          icon: getCategoryIcon(cat.name),
          count: `${cat.productCount || cat.count || 0} items`,
          image: getCategoryImage(cat),
          slug:
            cat.slug ||
            cat.name?.toLowerCase().replace(/\s+/g, "-") ||
            "category",
          title: cat.name || "Category",
          description: cat.description || "",
        }))
        .slice(0, 5); // Take only first 5 categories for display

      console.log("Final processed categories:", processedCategories);
      setCategories(processedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");

      // Use hardcoded categories as fallback
      const hardcodedCategories = getHardcodedCategories();
      const processedHardcoded = hardcodedCategories.map((cat, index) => ({
        _id: `hardcoded-${index}`,
        ...cat,
        icon: getCategoryIcon(cat.name),
        image: cat.image,
        slug: cat.slug,
        title: cat.name,
        count: cat.count,
      }));

      setCategories(processedHardcoded);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Hardcoded fallback categories
  const getHardcodedCategories = () => {
    return [
      {
        name: "Engine Parts",
        count: "42 items",
        image:
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=160&fit=crop",
        slug: "engine-parts",
        description: "High-performance engine components and parts",
      },
      {
        name: "Brakes",
        count: "28 items",
        image:
          "https://images.unsplash.com/photo-1558981806-ec527fa0b4c9?w=400&h=160&fit=crop",
        slug: "brakes",
        description: "Brake systems and components",
      },
      {
        name: "Tires",
        count: "15 items",
        image:
          "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=400&h=160&fit=crop",
        slug: "tires",
        description: "Tires and wheels for all motorcycle types",
      },
      {
        name: "Electrical",
        count: "36 items",
        image:
          "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=160&fit=crop",
        slug: "electrical",
        description: "Electrical components and systems",
      },
      {
        name: "Accessories",
        count: "58 items",
        image:
          "https://images.unsplash.com/photo-1580261450035-4d4f04b7b4c5?w=400&h=160&fit=crop",
        slug: "accessories",
        description: "Motorcycle accessories and tools",
      },
    ];
  };

  // Helper function to get appropriate icon based on category name
  const getCategoryIcon = (categoryName) => {
    if (!categoryName) return FolderTree;

    const name = categoryName.toLowerCase();
    if (name.includes("engine") || name.includes("motor")) return Settings;
    if (name.includes("brake")) return Disc;
    if (name.includes("tire") || name.includes("wheel")) return Circle;
    if (
      name.includes("electrical") ||
      name.includes("battery") ||
      name.includes("light")
    )
      return Cable;
    if (name.includes("accessory") || name.includes("tool")) return Wrench;
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

    // Fallback to hardcoded image based on name
    const name = (category?.name || "").toLowerCase();
    if (name.includes("engine"))
      return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=160&fit=crop";
    if (name.includes("brake"))
      return "https://images.unsplash.com/photo-1558981806-ec527fa0b4c9?w=400&h=160&fit=crop";
    if (name.includes("tire") || name.includes("wheel"))
      return "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=400&h=160&fit=crop";
    if (
      name.includes("electrical") ||
      name.includes("battery") ||
      name.includes("light")
    )
      return "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=160&fit=crop";
    if (name.includes("accessory") || name.includes("tool"))
      return "https://images.unsplash.com/photo-1580261450035-4d4f04b7b4c5?w=400&h=160&fit=crop";

    // Default image
    return "https://images.unsplash.com/photo-1566473359723-7e3e4d6c8c1b?w=400&h=160&fit=crop";
  };

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
    setRetryCount((prev) => prev + 1);
    fetchCategories();
  };

  const animationStyles = `
    <style>
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
      
      @keyframes slideLeft {
        from {
          opacity: 0;
          transform: translateX(50px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes slideRight {
        from {
          opacity: 0;
          transform: translateX(-50px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(1.1);
        }
        to {
          opacity: 1;
          transform: scale(1);
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
      
      .animate-slide-left {
        animation: slideLeft 0.8s ease forwards;
        opacity: 0;
      }
      
      .animate-slide-right {
        animation: slideRight 0.8s ease forwards;
        opacity: 0;
      }
      
      .animate-scale-in {
        animation: scaleIn 1.2s ease forwards;
        opacity: 0;
      }
      
      .delay-100 {
        animation-delay: 100ms;
      }
      
      .delay-200 {
        animation-delay: 200ms;
      }
      
      .delay-300 {
        animation-delay: 300ms;
      }
      
      .delay-400 {
        animation-delay: 400ms;
      }
      
      .delay-500 {
        animation-delay: 500ms;
      }
      
      .delay-600 {
        animation-delay: 600ms;
      }
      
      .delay-700 {
        animation-delay: 700ms;
      }
      
      .delay-800 {
        animation-delay: 800ms;
      }
      
      .card-hover {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      
      .card-hover:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 40px rgba(220, 38, 38, 0.2);
      }
      
      .btn-primary {
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      
      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(220, 38, 38, 0.3);
      }
      
      .btn-secondary {
        transition: all 0.3s ease;
      }
      
      .btn-secondary:hover {
        transform: translateY(-2px);
      }
      
      .section-visible .animate-on-visible {
        opacity: 1 !important;
        animation-play-state: running !important;
      }
      
      .animate-on-visible {
        opacity: 0;
        animation-play-state: paused;
      }
      
      .text-bg-overlay {
        background: rgba(0, 0, 0, 0.6);
        padding: 2rem;
        border-radius: 1rem;
        backdrop-filter: blur(4px);
      }
      
      .glow-border {
        position: relative;
        border: 2px solid transparent;
        background: linear-gradient(45deg, #1f2937, #111827) padding-box,
                    linear-gradient(45deg, #dc2626, #7c2d12, #dc2626) border-box;
        animation: border-glow 3s ease-in-out infinite alternate;
      }
      
      @keyframes border-glow {
        0% {
          box-shadow: 0 0 10px rgba(220, 38, 38, 0.3);
        }
        100% {
          box-shadow: 0 0 20px rgba(220, 38, 38, 0.6), 0 0 40px rgba(220, 38, 38, 0.2);
        }
      }
      
      /* Container custom styles */
      .container-custom {
        max-width: 1280px;
        margin: 0 auto;
        padding: 0 1rem;
      }
      
      .section-padding {
        padding: 5rem 0;
      }

      /* Loading and error states */
      .loading-skeleton {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(288px, 1fr));
        gap: 1.5rem;
        padding: 1rem 0;
      }
      
      .product-card-skeleton {
        background: linear-gradient(90deg, #2d3748 25%, #374151 50%, #2d3748 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        border-radius: 0.75rem;
        height: 400px;
      }
      
      @keyframes loading {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }
      
      .error-message {
        background-color: rgba(220, 38, 38, 0.1);
        border: 1px solid rgba(220, 38, 38, 0.3);
        border-radius: 0.5rem;
        padding: 1rem;
        margin: 2rem 0;
      }
      
      /* About section highlights */
      .highlight-card {
        transition: all 0.3s ease;
        border-left: 4px solid transparent;
      }
      
      .highlight-card:hover {
        transform: translateX(5px);
        border-left-color: #dc2626;
        background: linear-gradient(90deg, rgba(220, 38, 38, 0.1) 0%, rgba(31, 41, 55, 0.8) 100%);
      }
      
      .quality-tagline {
        background: linear-gradient(90deg, #dc2626, #7c2d12);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-weight: bold;
        letter-spacing: 0.05em;
      }
      
      /* Category loading skeleton */
      .category-skeleton {
        background: linear-gradient(90deg, #2d3748 25%, #374151 50%, #2d3748 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        border-radius: 0.75rem;
        min-height: 200px;
      }
      
      /* Image styles */
      .category-image {
        width: 100%;
        height: 160px;
        object-fit: cover;
        transition: transform 0.5s ease;
      }
      
      .category-image:hover {
        transform: scale(1.05);
      }
      
      /* Responsive adjustments */
      @media (max-width: 768px) {
        .section-padding {
          padding: 3rem 0;
        }
        
        .container-custom {
          padding: 0 1rem;
        }
        
        .loading-skeleton {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .category-image {
          height: 140px;
        }
      }
      
      @media (max-width: 640px) {
        .loading-skeleton {
          grid-template-columns: 1fr;
        }
        
        .category-image {
          height: 120px;
        }
      }
    </style>
  `;

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: animationStyles }} />

      {/* Hero Section - Banner only */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
        id="categories"
        className="section-padding bg-gradient-to-b from-gray-900 to-black"
      >
        <div className="container-custom">
          <div className="flex justify-between items-center mb-12">
            <h2 className="font-bebas text-4xl text-white animate-fade-up delay-100 animate-on-visible">
              Product Categories
            </h2>
            <Link
              to="/categories"
              className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-2 animate-fade-up delay-200 animate-on-visible"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map((index) => (
                <div
                  key={index}
                  className="animate-fade-up animate-on-visible category-skeleton"
                  style={{ animationDelay: `${index * 100 + 300}ms` }}
                >
                  <div className="relative h-32 bg-gray-700 rounded-t-xl"></div>
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gray-600 rounded-full"></div>
                      <div className="h-4 bg-gray-600 rounded w-24"></div>
                    </div>
                    <div className="mt-2 h-3 bg-gray-600 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <FolderTree className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No categories available
              </h3>
              <p className="text-gray-400 mb-6">
                {retryCount > 0
                  ? "Still unable to fetch categories. Please check your backend connection."
                  : "Categories will be displayed here once they are added."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleRetry}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium inline-flex items-center gap-2 justify-center"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again ({retryCount})
                </button>
                <button
                  onClick={() => {
                    const hardcodedCategories = getHardcodedCategories();
                    const processed = hardcodedCategories.map((cat, index) => ({
                      _id: `hardcoded-${index}`,
                      ...cat,
                      icon: getCategoryIcon(cat.name),
                      image: cat.image,
                      slug: cat.slug,
                      title: cat.name,
                      count: cat.count,
                    }));
                    setCategories(processed);
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Use Demo Categories
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {categories.map((category, index) => (
                  <div
                    key={category._id || index}
                    className="animate-fade-up animate-on-visible"
                    style={{ animationDelay: `${index * 100 + 300}ms` }}
                  >
                    <Link
                      to={`/categories/${category.slug}`}
                      className="group rounded-xl shadow-lg overflow-hidden  block transition-all duration-300"
                    >
                      <div className="relative h-20overflow-hidden">
                        <img
                          src={category.image}
                          alt={category.title}
                          className="category-image w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                          onError={(e) => {
                            console.error(`Failed to load image for ${category.title}:`, category.image);
                            e.target.onerror = null;
                            // Fallback to default image based on category name
                            const name = (category.title || "").toLowerCase();
                            if (name.includes("engine")) {
                              e.target.src = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=160&fit=crop";
                            } else if (name.includes("brake")) {
                              e.target.src = "https://images.unsplash.com/photo-1558981806-ec527fa0b4c9?w=400&h=160&fit=crop";
                            } else if (name.includes("tire") || name.includes("wheel")) {
                              e.target.src = "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=400&h=160&fit=crop";
                            } else if (name.includes("electrical") || name.includes("battery") || name.includes("light")) {
                              e.target.src = "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=160&fit=crop";
                            } else if (name.includes("accessory") || name.includes("tool")) {
                              e.target.src = "https://images.unsplash.com/photo-1580261450035-4d4f04b7b4c5?w=400&h=160&fit=crop";
                            } else {
                              e.target.src = "https://images.unsplash.com/photo-1566473359723-7e3e4d6c8c1b?w=400&h=160&fit=crop";
                            }
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-3">
                          
                          <h3 className="font-bold text-white">
                            {category.title}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">
                          {category.count}
                        </p>
                        {category.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              {/* Show message if using hardcoded categories */}
              {categories.some((cat) => cat._id.includes("hardcoded")) && (
                <div className="mt-4 text-center">
                  <p className="text-yellow-500 text-sm">
                    Showing demo categories. Real categories will load when API is connected.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* About Section */}
      <section
        ref={(el) => (sectionRefs.current[1] = el)}
        className="section-padding bg-gradient-to-b from-black to-gray-900"
      >
        <div className="container-custom">
          <div className="text-center mb-12 animate-fade-up animate-on-visible">
            <h2 className="font-bebas text-5xl md:text-6xl text-white mb-4">
              Quality you can Trust. Price You Can Afford.
            </h2>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Experience the perfect balance of premium quality and exceptional value with Federal Parts - where trust meets affordability.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-left animate-on-visible">
              <h2 className="font-bebas text-4xl text-white mb-6">
                About Federal Parts
              </h2>
              <p className="text-gray-300 mb-8">
                Cutting-edge innovative technology Federal Parts is one of the brands of motorcycle spare parts marketed by PT Astra Otoparts Tbk's Domestic business unit. Consumers in Indonesia can easily obtain Federal Parts products due to the extensive marketing network, which includes 50 main dealers, 23 sales offices, and nearly 10,000 shops or workshops. In addition, Federal Parts is well known for its quality because it is manufactured according to OEM (Original Equipment Manufacturer) standards and is suitable for all motorcycle brands circulating in Indonesia, such as Honda, Kawasaki, Suzuki, and Yamaha. It is also supported by the large variety of products offered. Federal Parts is always committed to providing added value for consumers by continuously launching spare parts with the latest technology at affordable prices without compromising quality.
              </p>

              <div className="space-y-4">
                <div
                  style={{ animationDelay: "100ms" }}
                  className="highlight-card flex items-center gap-4 p-4 bg-gray-800 rounded-lg animate-fade-up animate-on-visible"
                >
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
                  style={{ animationDelay: "200ms" }}
                  className="highlight-card flex items-center gap-4 p-4 bg-gray-800 rounded-lg animate-fade-up animate-on-visible"
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
                  style={{ animationDelay: "300ms" }}
                  className="highlight-card flex items-center gap-4 p-4 bg-gray-800 rounded-lg animate-fade-up animate-on-visible"
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

            <div className="relative animate-slide-right animate-on-visible">
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
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