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
  Menu,
  X,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const itemsPerPage = 8;

  // Get API base URL
  const getApiBaseUrl = () => {
    return "https://federalpartsphilippines-backend.onrender.com";
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

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileMenuOpen(false);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      setApiStatus("pending");
      console.log("🔄 Fetching categories...");

      let categoriesData = [];
      
      try {
        console.log("📡 Using categoryAPI service...");
        const response = await categoryAPI.getAll();
        console.log("📥 categoryAPI response:", response);
        
        if (response?.success && response.data) {
          categoriesData = response.data;
        } else if (response?.success && response.categories) {
          categoriesData = response.categories;
        } else if (response?.data && Array.isArray(response.data)) {
          categoriesData = response.data;
        } else if (response?.categories && Array.isArray(response.categories)) {
          categoriesData = response.categories;
        } else if (Array.isArray(response)) {
          categoriesData = response;
        } else {
          console.warn("Unexpected response format:", response);
          throw new Error("Invalid response from categoryAPI");
        }
        
        setApiStatus("success");
        setUsingFallback(false);
        
      } catch (apiError) {
        console.error("❌ categoryAPI failed:", apiError);
        
        try {
          console.log("🔄 Trying direct fetch as fallback...");
          const API_BASE_URL = getApiBaseUrl();
          const response = await fetch(`${API_BASE_URL}/api/categories`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            mode: 'cors',
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data = await response.json();
          console.log("📥 Direct fetch response:", data);

          if (data?.success && data.data) {
            categoriesData = data.data;
          } else if (data?.data && Array.isArray(data.data)) {
            categoriesData = data.data;
          } else if (data?.categories && Array.isArray(data.categories)) {
            categoriesData = data.categories;
          } else if (Array.isArray(data)) {
            categoriesData = data;
          }
          
          setApiStatus("success");
          setUsingFallback(true);
          
        } catch (fetchError) {
          console.error("❌ Direct fetch also failed:", fetchError);
          throw new Error("All API methods failed");
        }
      }

      console.log("✅ Processed categories data:", categoriesData);

      const processedCategories = categoriesData
        .filter(cat => cat && cat.name)
        .filter(cat => {
          const categoryName = cat.name || "";
          const lowerName = categoryName.toLowerCase();
          return !lowerName.includes("yamaha") && 
                 !lowerName.includes("suzuki") && 
                 !lowerName.includes("honda");
        })
        .map((cat) => {
          const categoryName = cat.name || "Unnamed Category";
          const icon = getCategoryIcon(categoryName);
          const image = getCategoryImage(cat);
          const slug = cat.slug || categoryName.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "") || "category";
          const categoryId = cat._id || cat.id || `cat-${Math.random().toString(36).substr(2, 9)}`;
          
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
                .slice(0, 3)
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

      console.log("✅ Final processed categories (filtered):", processedCategories);
      setCategories(processedCategories);
      
      if (processedCategories.length > 0) {
        toast.success(`✅ Loaded ${processedCategories.length} categories`);
      } else {
        toast.info("ℹ️ No categories found");
      }
    } catch (error) {
      console.error("❌ Error in fetchCategories:", error);
      setApiStatus("error");
      setUsingFallback(false);
      toast.error(`❌ Failed to load categories: ${error.message}`);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchCategoryProducts = async () => {
    if (categories.length === 0) return;

    const newCategoryProducts = {};
    const newLoadingProducts = {};

    categories.forEach(category => {
      newLoadingProducts[category._id] = true;
    });
    setLoadingProducts(newLoadingProducts);

    for (const category of categories) {
      try {
        console.log(`🔄 Fetching products for category: ${category.name} (ID: ${category._id})`);
        
        let products = [];
        
        try {
          console.log(`📡 Method 1: Using productAPI.getProductsByCategory with ID: ${category._id}`);
          const response = await productAPI.getProductsByCategory(category._id);
          console.log(`📥 Products response for ${category.name}:`, response);
          
          if (response?.success && response.products) {
            products = response.products;
          } else if (response?.success && response.data) {
            products = response.data;
          } else if (response?.data && Array.isArray(response.data)) {
            products = response.data;
          } else if (Array.isArray(response)) {
            products = response;
          } else if (response?.products) {
            products = response.products;
          }
          
          console.log(`✅ Method 1 found ${products.length} products for ${category.name}`);
          
          if (products.length === 0 && category.slug) {
            console.log(`📡 Method 1a: Trying with slug: ${category.slug}`);
            try {
              const slugResponse = await productAPI.getProductsByCategory(category.slug);
              if (slugResponse?.success && slugResponse.products) {
                products = slugResponse.products;
                console.log(`✅ Method 1a found ${products.length} products using slug`);
              }
            } catch (slugError) {
              console.log(`❌ Method 1a failed:`, slugError);
            }
          }
        } catch (apiError) {
          console.error(`❌ API error for category ${category.name}:`, apiError);
          
          try {
            const API_BASE_URL = getApiBaseUrl();
            console.log(`📡 Method 2: Trying direct fetch for ${category.name}`);
            
            const endpoints = [
              `${API_BASE_URL}/api/products?category=${category._id}`,
              `${API_BASE_URL}/api/products?categoryId=${category._id}`,
              `${API_BASE_URL}/api/products?category=${category.slug}`,
              `${API_BASE_URL}/api/categories/${category._id}/products`,
              `${API_BASE_URL}/api/categories/${category.slug}/products`
            ];
            
            for (const endpoint of endpoints) {
              try {
                console.log(`🔄 Trying endpoint: ${endpoint}`);
                const response = await fetch(endpoint, {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                  },
                  mode: 'cors',
                });
                
                if (response.ok) {
                  const data = await response.json();
                  console.log(`📥 Direct fetch response from ${endpoint}:`, data);
                  
                  if (data?.products) {
                    products = data.products;
                    console.log(`✅ Found ${products.length} products from ${endpoint}`);
                    break;
                  } else if (data?.data) {
                    products = data.data;
                    console.log(`✅ Found ${products.length} products from ${endpoint}`);
                    break;
                  } else if (Array.isArray(data)) {
                    products = data;
                    console.log(`✅ Found ${products.length} products from ${endpoint}`);
                    break;
                  }
                }
              } catch (endpointError) {
                console.log(`❌ Endpoint ${endpoint} failed:`, endpointError.message);
                continue;
              }
            }
          } catch (directError) {
            console.error(`❌ Direct fetch also failed:`, directError);
          }
        }

        const processedProducts = products.map(product => {
          let mainImage = "";
          
          if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            mainImage = product.images[0];
          } else if (product.image) {
            mainImage = product.image;
          } else if (product.imageUrl) {
            mainImage = product.imageUrl;
          } else if (product.thumbnail) {
            mainImage = product.thumbnail;
          }
          
          let finalImageUrl = mainImage;
          if (mainImage && !mainImage.startsWith("http") && !mainImage.startsWith("data:")) {
            const API_BASE_URL = getApiBaseUrl();
            if (mainImage.startsWith("/uploads/")) {
              finalImageUrl = `${API_BASE_URL}${mainImage}`;
            } else if (mainImage.startsWith("/")) {
              finalImageUrl = `${API_BASE_URL}${mainImage}`;
            } else {
              finalImageUrl = `${API_BASE_URL}/uploads/products/${mainImage}`;
            }
          }
          
          if (!finalImageUrl || finalImageUrl.trim() === '') {
            finalImageUrl = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop";
          }
          
          return {
            _id: product._id || product.id || `prod-${Math.random().toString(36).substr(2, 9)}`,
            name: product.name || "Unnamed Product",
            description: product.description || "No description available",
            price: product.price || 0,
            discountedPrice: product.discountedPrice || product.discountPrice || null,
            rating: product.rating || product.averageRating || 4.0,
            reviewCount: product.reviewCount || product.reviews || 0,
            stock: product.stock || product.quantity || Math.floor(Math.random() * 50) + 1,
            images: [finalImageUrl],
            image: finalImageUrl,
            category: product.category || { name: category.name, _id: category._id }
          };
        });

        if (processedProducts.length > 0) {
          newCategoryProducts[category._id] = processedProducts;
          console.log(`✅ Loaded ${processedProducts.length} products for ${category.name}`);
        } else {
          newCategoryProducts[category._id] = [];
          console.log(`⚠️ No products found for ${category.name}`);
        }
        
        newLoadingProducts[category._id] = false;
        
      } catch (error) {
        console.error(`❌ Error processing category ${category.name}:`, error);
        newCategoryProducts[category._id] = [];
        newLoadingProducts[category._id] = false;
      }
    }

    setCategoryProducts(newCategoryProducts);
    setLoadingProducts(newLoadingProducts);
    
    console.log("✅ Updated categoryProducts:", newCategoryProducts);
  };

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

  const getCategoryImage = (category) => {
    if (category?.image && typeof category.image === 'string' && category.image.trim() !== '') {
      if (category.image.startsWith("http")) {
        return category.image;
      }
      
      const API_BASE_URL = getApiBaseUrl();
      if (category.image.startsWith("/uploads/")) {
        return `${API_BASE_URL}${category.image}`;
      } else if (category.image.startsWith("/")) {
        return `${API_BASE_URL}${category.image}`;
      } else {
        return `${API_BASE_URL}/uploads/categories/${category.image}`;
      }
    }

    if (category?.imageUrl && typeof category.imageUrl === 'string' && category.imageUrl.trim() !== '') {
      if (category.imageUrl.startsWith("http")) {
        return category.imageUrl;
      }
      
      const API_BASE_URL = getApiBaseUrl();
      return `${API_BASE_URL}${category.imageUrl.startsWith("/") ? "" : "/"}${category.imageUrl}`;
    }

    const name = (category?.name || "").toLowerCase();
    if (name.includes("engine")) return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop";
    if (name.includes("brake")) return "https://images.unsplash.com/photo-1558981806-ec527fa0b4c9?w=400&h=250&fit=crop";
    if (name.includes("tire") || name.includes("wheel")) return "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=400&h=250&fit=crop";
    if (name.includes("suspension")) return "https://images.unsplash.com/photo-1566473359723-7e3e4d6c8c1b?w=400&h=250&fit=crop";
    if (name.includes("electrical") || name.includes("battery") || name.includes("light")) return "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=250&fit=crop";
    if (name.includes("accessory") || name.includes("tool")) return "https://images.unsplash.com/photo-1580261450035-4d4f04b7b4c5?w=400&h=250&fit=crop";
    if (name.includes("exhaust")) return "https://images.unsplash.com/photo-1558981806-ec527fa0b4c9?w=400&h=250&fit=crop";

    return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop";
  };

  // Animation observer function
  const observeSectionAnimations = (section) => {
    if (!section) return;
    
    const animatedElements = section.querySelectorAll('[data-animate]');
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target;
            const delay = element.getAttribute('data-delay') || '0ms';
            
            setTimeout(() => {
              element.style.opacity = '1';
              element.style.transform = 'translateY(0)';
            }, parseInt(delay));
            
            observer.unobserve(element);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );
    
    animatedElements.forEach(element => {
      observer.observe(element);
    });
  };

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("section-visible");
            observeSectionAnimations(entry.target);
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

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    if (sectionRefs.current[0]) {
      sectionRefs.current[0].scrollIntoView({ behavior: 'smooth' });
    }
    
    if (!categoryProducts[category._id]) {
      fetchProductsForCategory(category);
    }
  };

  const fetchProductsForCategory = async (category) => {
    if (!category) return;
    
    try {
      console.log(`🔄 Fetching products for clicked category: ${category.name}`);
      
      setLoadingProducts(prev => ({
        ...prev,
        [category._id]: true
      }));
      
      let products = [];
      
      try {
        const response = await productAPI.getProductsByCategory(category._id);
        
        if (response?.success && response.products) {
          products = response.products;
        } else if (response?.success && response.data) {
          products = response.data;
        } else if (response?.data && Array.isArray(response.data)) {
          products = response.data;
        } else if (Array.isArray(response)) {
          products = response;
        }
      } catch (apiError) {
        console.error(`❌ API error:`, apiError);
        
        try {
          const API_BASE_URL = getApiBaseUrl();
          const response = await fetch(
            `${API_BASE_URL}/api/products?category=${category._id}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              mode: 'cors',
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data?.products) {
              products = data.products;
            } else if (data?.data) {
              products = data.data;
            }
          }
        } catch (fetchError) {
          console.error(`❌ Direct fetch error:`, fetchError);
        }
      }

      const processedProducts = products.map(product => {
        let mainImage = "";
        
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
          mainImage = product.images[0];
        } else if (product.image) {
          mainImage = product.image;
        } else if (product.imageUrl) {
          mainImage = product.imageUrl;
        }
        
        let finalImageUrl = mainImage;
        if (mainImage && !mainImage.startsWith("http") && !mainImage.startsWith("data:")) {
          const API_BASE_URL = getApiBaseUrl();
          if (mainImage.startsWith("/uploads/")) {
            finalImageUrl = `${API_BASE_URL}${mainImage}`;
          } else if (mainImage.startsWith("/")) {
            finalImageUrl = `${API_BASE_URL}${mainImage}`;
          } else {
            finalImageUrl = `${API_BASE_URL}/uploads/products/${mainImage}`;
          }
        }
        
        if (!finalImageUrl || finalImageUrl.trim() === '') {
          finalImageUrl = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop";
        }
        
        return {
          _id: product._id || product.id || `prod-${Math.random().toString(36).substr(2, 9)}`,
          name: product.name || "Unnamed Product",
          description: product.description || "No description available",
          price: product.price || 0,
          discountedPrice: product.discountedPrice || product.discountPrice || null,
          rating: product.rating || product.averageRating || 4.0,
          reviewCount: product.reviewCount || product.reviews || 0,
          stock: product.stock || product.quantity || Math.floor(Math.random() * 50) + 1,
          images: [finalImageUrl],
          image: finalImageUrl,
          category: product.category || { name: category.name, _id: category._id }
        };
      });

      setCategoryProducts(prev => ({
        ...prev,
        [category._id]: processedProducts
      }));
      
      console.log(`✅ Loaded ${processedProducts.length} products for ${category.name}`);
      
    } catch (error) {
      console.error(`❌ Error fetching products for ${category.name}:`, error);
      toast.error(`Failed to load products for ${category.name}`);
    } finally {
      setLoadingProducts(prev => ({
        ...prev,
        [category._id]: false
      }));
    }
  };

  const clearSelectedCategory = () => {
    setSelectedCategory(null);
  };

  const getProductsForSelectedCategory = () => {
    if (!selectedCategory) return [];
    
    if (categoryProducts[selectedCategory._id]) {
      return categoryProducts[selectedCategory._id];
    }
    
    return [];
  };

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

  const ProductCard = ({ product }) => {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [imageError, setImageError] = useState(false);
    
    const finalPrice = product.discountedPrice && product.discountedPrice < product.price 
      ? product.discountedPrice 
      : product.price;
    
    const discountPercentage = product.discountedPrice && product.discountedPrice < product.price
      ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
      : 0;
    
    const getProductImage = () => {
      if (imageError) {
        return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop";
      }
      
      const mainImage = product.images?.[0] || product.image || product.imageUrl || product.thumbnail;
      
      if (!mainImage) {
        return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop";
      }
      
      if (mainImage.startsWith("http") || mainImage.startsWith("data:")) {
        return mainImage;
      }
      
      const API_BASE_URL = getApiBaseUrl();
      if (mainImage.startsWith("/uploads/")) {
        return `${API_BASE_URL}${mainImage}`;
      } else if (mainImage.startsWith("/")) {
        return `${API_BASE_URL}${mainImage}`;
      } else {
        return `${API_BASE_URL}/uploads/products/${mainImage}`;
      }
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
          <div className="relative h-40 sm:h-48 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
            <img
              src={getProductImage()}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={handleImageError}
              loading="lazy"
            />
          </div>
          
          <div className="p-3 sm:p-4 flex-1 flex flex-col">
            <div className="text-xs text-gray-400 mb-1 truncate">
              {product.category?.name || "Motorcycle Parts"}
            </div>
            
            <h3 className="font-bold text-white mb-2 line-clamp-1 group-hover:text-red-400 transition-colors text-sm sm:text-base">
              {product.name}
            </h3>
            
            <p className="text-xs sm:text-sm text-gray-300 mb-2 sm:mb-3 line-clamp-2 flex-1">
              {product.description}
            </p>
          </div>
        </div>
      </Link>
    );
  };

  const ListProductCard = ({ product }) => {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [imageError, setImageError] = useState(false);
    
    const finalPrice = product.discountedPrice && product.discountedPrice < product.price 
      ? product.discountedPrice 
      : product.price;
    
    const discountPercentage = product.discountedPrice && product.discountedPrice < product.price
      ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
      : 0;
    
    const getProductImage = () => {
      if (imageError) {
        return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop";
      }
      
      const mainImage = product.images?.[0] || product.image || product.imageUrl || product.thumbnail;
      
      if (!mainImage) {
        return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop";
      }
      
      if (mainImage.startsWith("http") || mainImage.startsWith("data:")) {
        return mainImage;
      }
      
      const API_BASE_URL = getApiBaseUrl();
      if (mainImage.startsWith("/uploads/")) {
        return `${API_BASE_URL}${mainImage}`;
      } else if (mainImage.startsWith("/")) {
        return `${API_BASE_URL}${mainImage}`;
      } else {
        return `${API_BASE_URL}/uploads/products/${mainImage}`;
      }
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
            <div className="md:w-1/4 relative">
              <div className="relative h-48 md:h-full overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                <img
                  src={getProductImage()}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={handleImageError}
                  loading="lazy"
                />
                
                {discountPercentage > 0 && (
                  <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-lg">
                    -{discountPercentage}% OFF
                  </div>
                )}
              </div>
            </div>
            
            <div className="md:w-3/4 p-4 md:p-6 flex flex-col justify-between">
              <div>
                <div className="text-xs text-gray-400 mb-2">
                  {product.category?.name || "Motorcycle Parts"}
                </div>
                
                <h3 className="font-bold text-white text-base md:text-lg mb-2 line-clamp-1 group-hover:text-red-400 transition-colors">
                  {product.name}
                </h3>
                
                <p className="text-gray-300 text-sm md:text-base mb-3 md:mb-4 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 md:mb-4">
                  <div className="flex items-center gap-2">
                    {getRatingStars(product.rating)}
                    <span className="text-xs md:text-sm text-gray-400">
                      ({product.reviewCount || 0} reviews)
                    </span>
                  </div>
                  <div className={`text-xs md:text-sm font-medium px-2 py-1 md:px-3 md:py-1 rounded-full ${
                    product.stock > 10 ? 'bg-green-500/20 text-green-400' : 
                    product.stock > 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 pt-3 md:pt-4 border-t border-gray-800">
                <div>
                  <div className="flex items-baseline gap-2 md:gap-3">
                    <span className="text-lg md:text-xl font-bold text-white">
                      {formatPrice ? formatPrice(finalPrice) : `₱${finalPrice?.toLocaleString() || '0'}`}
                    </span>
                    {discountPercentage > 0 && (
                      <span className="text-xs md:text-sm text-gray-400 line-through">
                        {formatPrice ? formatPrice(product.price) : `₱${product.price?.toLocaleString() || '0'}`}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toast.success("Added to cart!");
                    }}
                    className="flex-1 sm:flex-none px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs md:text-sm font-medium rounded-lg transition-all transform hover:scale-105"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toast.success("Quick view coming soon!");
                    }}
                    className="flex-1 sm:flex-none px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white text-xs md:text-sm font-medium rounded-lg border border-gray-700 hover:border-red-500 transition-all"
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

  const CategoryCard = ({ category, index }) => {
    const [imgError, setImgError] = useState(false);

    const handleImageError = () => {
      setImgError(true);
    };

    const getFinalImageUrl = () => {
      if (imgError) {
        const name = (category.title || "").toLowerCase();
        if (name.includes("engine")) return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop";
        if (name.includes("brake")) return "https://images.unsplash.com/photo-1558981806-ec527fa0b4c9?w=400&h=250&fit=crop";
        if (name.includes("tire") || name.includes("wheel")) return "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=400&h=250&fit=crop";
        if (name.includes("suspension")) return "https://images.unsplash.com/photo-1566473359723-7e3e4d6c8c1b?w=400&h=250&fit=crop";
        if (name.includes("electrical") || name.includes("battery") || name.includes("light")) return "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=250&fit=crop";
        return "https://images.unsplash.com/photo-1580261450035-4d4f04b7b4c5?w=400&h=250&fit=crop";
      }
      
      if (category.image && category.image.trim() !== '') {
        if (category.image.startsWith("http")) {
          return category.image;
        }
        
        const API_BASE_URL = getApiBaseUrl();
        if (category.image.startsWith("/uploads/")) {
          return `${API_BASE_URL}${category.image}`;
        } else if (category.image.startsWith("/")) {
          return `${API_BASE_URL}${category.image}`;
        } else {
          return `${API_BASE_URL}/uploads/categories/${category.image}`;
        }
      }
      
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
          className="w-full rounded-xl overflow-hidden shadow-lg  hover:border-red-500 transition-all duration-300 hover:shadow-xl group cursor-pointer h-56 sm:h-64 flex flex-col"
        >
          <div className="relative h-40 sm:h-48 overflow-hidden flex-1">
            <img
              src={getFinalImageUrl()}
              alt={category.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
              onError={handleImageError}
            />
          </div>
          
          <div className="bg-[#cc0000] px-2 sm:px-3 py-2 flex items-center justify-center border-t border-gray-800">
  <span className="text-xs text-gray-300 truncate px-1">
    {category.title}
  </span>
</div>
        </button>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 md:hidden">
          <div className="p-4">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

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
              transform: translateY(20px);
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
          
          /* Scroll-dependent animation styles */
          [data-animate] {
            transition: opacity 0.7s ease-out, transform 0.7s ease-out;
            will-change: opacity, transform;
          }
          
          /* Delay classes for staggered animations */
          .delay-150 {
            transition-delay: 150ms !important;
          }
          
          .delay-200 {
            transition-delay: 200ms !important;
          }
          
          .delay-300 {
            transition-delay: 300ms !important;
          }
          
          .delay-400 {
            transition-delay: 400ms !important;
          }
          
          .delay-500 {
            transition-delay: 500ms !important;
          }
          
          .delay-600 {
            transition-delay: 600ms !important;
          }
          
          @media (max-width: 640px) {
            .text-5xl {
              font-size: 2.5rem !important;
            }
            .text-6xl {
              font-size: 3rem !important;
            }
            .text-4xl {
              font-size: 2rem !important;
            }
            .container {
              padding-left: 1rem !important;
              padding-right: 1rem !important;
            }
          }
        `}
      </style>

      {/* Hero Section - Show banner at real/original size on mobile */}
      <section className="relative w-full overflow-hidden bg-black mt-0 pt-0">
        <div className="relative w-full">
          <img
            src="/banner/banner.jpg"
            alt="Federal Parts Banner"
            className="w-full h-auto max-w-full block"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://images.unsplash.com/photo-1566473359723-7e3e4d6c8c1b?w=1200&h=800&fit=crop";
            }}
          />
          <div className="absolute inset-0 bg-black/10 sm:bg-transparent"></div>
        </div>
      </section>

            {/* Categories Section */}
<section
  ref={(el) => (sectionRefs.current[0] = el)}
  className="py-8 sm:py-16 bg-black overflow-hidden relative"
>
  {/* Background subtle gradient animation */}
  <div className="absolute inset-0 bg-gradient-to-b from-gray-900/20 via-black to-black pointer-events-none"></div>
  
  <div className="container mx-auto px-3 sm:px-4 max-w-7xl relative z-10">
    <div 
      className="text-center mb-8 sm:mb-12"
      data-aos="fade-up"
      data-aos-duration="800"
      data-aos-easing="ease-out-cubic"
      data-aos-once="true"
      data-aos-offset="200"
      data-aos-anchor-placement="top-bottom"
    >
      <h2 
        className="font-bebas text-3xl sm:text-4xl md:text-5xl text-[#cc0000] mb-2 sm:mb-3 relative inline-block"
        data-aos="fade-up"
        data-aos-delay="100"
        data-aos-duration="700"
        data-aos-easing="ease-out-back"
      >
        Product Categories
        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all duration-700" 
              data-aos="width-expand"
              data-aos-delay="400"
              data-aos-duration="800"
              data-aos-easing="ease-out-cubic"></span>
      </h2>
      <p 
        className="text-gray-400 text-sm sm:text-lg max-w-2xl mx-auto px-2 relative"
        data-aos="fade-up"
        data-aos-delay="200"
        data-aos-duration="700"
        data-aos-easing="ease-out-cubic"
      >
        <span className="relative inline-block">
          Browse our premium motorcycle parts organized by category
          <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-red-500/50 to-transparent group-hover:w-full transition-all duration-500"
                data-aos="width-expand"
                data-aos-delay="500"
                data-aos-duration="700"></span>
        </span>
      </p>
    </div>

    <div 
      data-aos="fade-in" 
      data-aos-duration="1000"
      data-aos-delay="300"
      data-aos-easing="ease-out-cubic"
      data-aos-offset="150"
    >
      {selectedCategory ? (
        <div className="relative">
          {/* Animated background elements */}
          <div className="absolute -top-10 -left-10 w-20 h-20 bg-red-500/5 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/5 rounded-full blur-xl animate-pulse delay-1000"></div>
          
          <div className="relative mb-6 sm:mb-8">
            <div 
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6 p-4 sm:p-6 bg-gradient-to-br from-gray-900/50 to-black/50 rounded-xl border border-gray-800/50 backdrop-blur-sm"
              data-aos="slide-down"
              data-aos-duration="600"
              data-aos-easing="ease-out-back"
              data-aos-offset="100"
              data-aos-anchor-placement="top-bottom"
            >
              <div 
                className="flex items-center gap-3 sm:gap-4"
                data-aos="slide-right"
                data-aos-delay="100"
                data-aos-duration="500"
                data-aos-easing="ease-out-back"
              >
                <button
                  onClick={clearSelectedCategory}
                  className="p-2 sm:p-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-xl border border-gray-700 hover:border-red-500 transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-lg hover:shadow-red-500/20 group"
                  title="Back to Categories"
                  data-aos="zoom-in"
                  data-aos-delay="50"
                  data-aos-duration="400"
                >
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 rotate-180 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                </button>
                <div 
                  data-aos="slide-right" 
                  data-aos-delay="150"
                  data-aos-duration="500"
                  data-aos-easing="ease-out-back"
                  className="relative"
                >
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {selectedCategory.title}
                  </h3>
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 group-hover:w-full transition-all duration-700"
                       data-aos="width-expand"
                       data-aos-delay="300"
                       data-aos-duration="800"></div>
                </div>
              </div>
              
           
            </div>
            
            {selectedCategory.subcategories && selectedCategory.subcategories.length > 0 && (
              <div 
                className="mb-4 sm:mb-6 p-4 bg-gray-900/30 rounded-xl border border-gray-800/30 backdrop-blur-sm"
                data-aos="fade-up"
                data-aos-delay="250"
                data-aos-duration="600"
                data-aos-offset="50"
                data-aos-anchor-placement="top-bottom"
              >
                <h4 
                  className="text-xs sm:text-sm font-medium text-gray-400 mb-3 sm:mb-4 uppercase tracking-wider flex items-center gap-2"
                  data-aos="fade-down"
                  data-aos-delay="200"
                  data-aos-duration="500"
                >
                  <span className="w-1 h-4 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></span>
                  Popular Subcategories
                </h4>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {selectedCategory.subcategories.map((sub, idx) => (
                    <button
                      key={sub._id || idx}
                      onClick={() => toast.success(`Filtering by ${sub.name}`)}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-gray-800/80 to-gray-900/80 hover:from-gray-700/80 hover:to-gray-800/80 text-gray-300 hover:text-white text-xs sm:text-sm rounded-lg border border-gray-700/50 hover:border-red-500 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-md hover:shadow-red-500/10 group"
                      data-aos="zoom-in"
                      data-aos-delay={250 + idx * 60}
                      data-aos-duration="400"
                      data-aos-easing="ease-out-back"
                    >
                      <span className="relative z-10">
                        {sub.name} 
                        <span className="ml-1.5 px-1.5 py-0.5 bg-gray-900/50 rounded text-xs">
                          {sub.count || 0}
                        </span>
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {loadingProducts[selectedCategory._id] ? (
            <div 
              className="text-center py-12 sm:py-16 relative"
              data-aos="fade-up"
              data-aos-duration="600"
              data-aos-offset="100"
              data-aos-anchor-placement="top-bottom"
            >
              {/* Animated dots background */}
              <div className="absolute inset-0 overflow-hidden">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-red-500/20 rounded-full animate-pulse"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.2}s`
                    }}
                  ></div>
                ))}
              </div>
              
              <div 
                data-aos="zoom-in" 
                data-aos-duration="800"
                data-aos-easing="ease-out-back"
                className="relative"
              >
                <div className="relative inline-block">
                  <Loader className="w-12 h-12 sm:w-16 sm:h-16 animate-spin text-red-500 mx-auto mb-4 sm:mb-6" />
                  <div className="absolute inset-0 animate-ping opacity-20">
                    <Loader className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto" />
                  </div>
                </div>
                <p 
                  className="text-gray-400 text-sm sm:text-base relative"
                  data-aos="fade-up"
                  data-aos-delay="300"
                  data-aos-duration="500"
                >
                  <span className="inline-block animate-pulse">
                    Loading products<span className="animate-pulse">.</span><span className="animate-pulse delay-100">.</span><span className="animate-pulse delay-200">.</span>
                  </span>
                </p>
              </div>
            </div>
          ) : getProductsForSelectedCategory().length > 0 ? (
            categoryView === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {getProductsForSelectedCategory().map((product, index) => (
                  <div
                    key={product._id || product.id || `product-${index}`}
                    data-aos="fade-up"
                    data-aos-delay={Math.floor(index / 4) * 100 + (index % 4) * 50}
                    data-aos-duration="600"
                    data-aos-easing="ease-out-cubic"
                    data-aos-once="true"
                    data-aos-offset="100"
                    data-aos-anchor-placement="top-bottom"
                    className="transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-red-500/10"
                  >
                    <div className="relative overflow-hidden rounded-xl group">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <ProductCard product={product} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {getProductsForSelectedCategory().map((product, index) => (
                  <div
                    key={product._id || product.id || `product-${index}`}
                    data-aos="slide-right"
                    data-aos-delay={index * 80}
                    data-aos-duration="500"
                    data-aos-easing="ease-out-cubic"
                    data-aos-once="true"
                    data-aos-offset="100"
                    data-aos-anchor-placement="top-bottom"
                    className="transform transition-all duration-500 hover:-translate-x-2 hover:shadow-xl hover:shadow-red-500/10 rounded-xl overflow-hidden"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <ListProductCard product={product} />
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div 
              className="text-center py-12 sm:py-16 relative overflow-hidden"
              data-aos="fade-up"
              data-aos-duration="700"
              data-aos-offset="100"
              data-aos-anchor-placement="top-bottom"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 via-transparent to-blue-500/5 opacity-50"></div>
              
              <div 
                data-aos="zoom-in" 
                data-aos-duration="800"
                data-aos-easing="ease-out-back"
                className="relative"
              >
                <FolderTree className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mx-auto mb-4 sm:mb-6 animate-pulse" />
              </div>
              <h4 
                className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 relative"
                data-aos="fade-up"
                data-aos-delay="200"
                data-aos-duration="600"
              >
                No Products Found
              </h4>
              <p 
                className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8 max-w-md mx-auto px-4 relative"
                data-aos="fade-up"
                data-aos-delay="300"
                data-aos-duration="600"
              >
                There are no products available in this category yet. 
                Please check back later or browse other categories.
              </p>
              <div 
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center relative"
                data-aos="fade-up"
                data-aos-delay="400"
                data-aos-duration="600"
              >
                <button
                  onClick={() => {
                    fetchProductsForCategory(selectedCategory);
                    toast.success("Refreshing products...");
                  }}
                  className="px-4 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-red-500/30 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base group"
                  data-aos="zoom-in"
                  data-aos-delay="450"
                  data-aos-duration="400"
                >
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin group-hover:animate-spin" />
                  Refresh Products
                </button>
                <button
                  onClick={clearSelectedCategory}
                  className="px-4 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-gray-500/20 text-sm sm:text-base"
                  data-aos="zoom-in"
                  data-aos-delay="500"
                  data-aos-duration="400"
                >
                  Browse Other Categories
                </button>
              </div>
            </div>
          )}

          {!loadingProducts[selectedCategory._id] && getProductsForSelectedCategory().length > 0 && (
            <div 
              className="mt-6 sm:mt-8 text-center relative"
              data-aos="fade-up"
              data-aos-delay="500"
              data-aos-duration="600"
              data-aos-offset="50"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-900/50 to-black/50 rounded-full border border-gray-800/50 backdrop-blur-sm">
                <p className="text-gray-400 text-xs sm:text-sm">
                  Showing <span className="text-white font-semibold">{getProductsForSelectedCategory().length}</span> products in <span className="text-red-400 font-semibold">{selectedCategory.title}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          {/* Animated background grid */}
          <div className="absolute inset-0 opacity-5">
            <div className="grid grid-cols-8 gap-4 h-full">
              {Array.from({ length: 48 }).map((_, i) => (
                <div 
                  key={i} 
                  className="bg-gradient-to-br from-gray-800 to-transparent rounded-lg animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                ></div>
              ))}
            </div>
          </div>
          
          {categoriesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 relative">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="category-skeleton h-56 sm:h-64 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl relative overflow-hidden"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  data-aos-duration="500"
                  data-aos-once="true"
                  data-aos-offset="100"
                  data-aos-anchor-placement="top-bottom"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-800/50 to-transparent -translate-x-full animate-shimmer"></div>
                </div>
              ))}
            </div>
          ) : apiStatus === "error" ? (
            <div 
              className="text-center py-12 sm:py-16 relative overflow-hidden"
              data-aos="fade-up"
              data-aos-duration="700"
              data-aos-offset="100"
              data-aos-anchor-placement="top-bottom"
            >
              {/* Error animation background */}
              <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 via-transparent to-red-500/5"></div>
              
              <div 
                data-aos="zoom-in" 
                data-aos-duration="800"
                data-aos-easing="ease-out-back"
                className="relative"
              >
                <AlertCircle className="w-20 h-20 sm:w-24 sm:h-24 text-red-500 mx-auto mb-4 sm:mb-6 animate-bounce" />
              </div>
              <h3 
                className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3 relative"
                data-aos="fade-up"
                data-aos-delay="200"
                data-aos-duration="600"
              >
                Connection Error
              </h3>
              <p 
                className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8 max-w-md mx-auto px-4 relative"
                data-aos="fade-up"
                data-aos-delay="300"
                data-aos-duration="600"
              >
                Unable to connect to the server. Please check your backend connection.
              </p>
              
              <div 
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center relative"
                data-aos="fade-up"
                data-aos-delay="400"
                data-aos-duration="600"
              >
                <button
                  onClick={() => {
                    setRetryCount(0);
                    fetchCategories();
                  }}
                  className="px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl font-medium flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-red-500/30 text-sm sm:text-base w-full sm:w-auto group"
                  data-aos="zoom-in"
                  data-aos-delay="450"
                  data-aos-duration="400"
                >
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin group-hover:animate-spin" />
                  Reset & Retry
                </button>
                
                <button
                  onClick={() => {
                    const backendUrl = getApiBaseUrl();
                    window.open(`${backendUrl}/api/categories`, '_blank');
                    toast.info(`Opening categories endpoint in new tab`);
                  }}
                  className="px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-blue-500/30 text-sm sm:text-base w-full sm:w-auto"
                  data-aos="zoom-in"
                  data-aos-delay="500"
                  data-aos-duration="400"
                >
                  Test Endpoint
                </button>
              </div>
              
              <div 
                className="mt-8 sm:mt-10 p-4 sm:p-6 bg-gradient-to-br from-gray-900/50 to-black/50 rounded-xl border border-gray-800/50 backdrop-blur-sm max-w-lg mx-auto text-left relative overflow-hidden"
                data-aos="fade-up"
                data-aos-delay="550"
                data-aos-duration="600"
              >
                {/* Background animation */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
                
             
                <ul className="text-xs sm:text-sm text-gray-400 space-y-2 relative">
                  {[
                    "• Ensure your backend server is running on Render",
                    "• Check the API endpoint: https://federalpartsphilippines-backend.onrender.com/api/categories",
                    "• Verify CORS is enabled on the backend",
                    "• Check browser console for detailed error messages"
                  ].map((tip, idx) => (
                    <li 
                      key={idx}
                      data-aos="fade-right"
                      data-aos-delay={650 + idx * 50}
                      data-aos-duration="500"
                      className="flex items-start gap-2 group hover:text-gray-300 transition-colors duration-300"
                    >
                      <span className="w-1 h-1 bg-gray-600 rounded-full mt-2 group-hover:bg-red-500 transition-colors duration-300"></span>
                      {tip}
                    </li>
                  ))}
                </ul>
                <div 
                  className="mt-4 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg backdrop-blur-sm"
                  data-aos="fade-up"
                  data-aos-delay="850"
                  data-aos-duration="500"
                >
                  <p className="text-yellow-500 text-xs sm:text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
                    <strong>Backend URL:</strong> {getApiBaseUrl()}
                  </p>
                </div>
              </div>
            </div>
          ) : categories.length === 0 ? (
            <div 
              className="text-center py-12 sm:py-16 relative overflow-hidden"
              data-aos="fade-up"
              data-aos-duration="700"
              data-aos-offset="100"
              data-aos-anchor-placement="top-bottom"
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-4 gap-8 h-full">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <FolderTree 
                      key={i} 
                      className="w-8 h-8 text-gray-600"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
              
              <div 
                data-aos="zoom-in" 
                data-aos-duration="800"
                data-aos-easing="ease-out-back"
                className="relative"
              >
                <FolderTree className="w-20 h-20 sm:w-24 sm:h-24 text-gray-500 mx-auto mb-4 sm:mb-6 animate-pulse" />
              </div>
              <h3 
                className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3 relative"
                data-aos="fade-up"
                data-aos-delay="200"
                data-aos-duration="600"
              >
                No Categories Available
              </h3>
              <p 
                className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8 max-w-md mx-auto px-4 relative"
                data-aos="fade-up"
                data-aos-delay="300"
                data-aos-duration="600"
              >
                No categories found in the database. Please add categories through the admin panel.
              </p>
              
              <div 
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center relative"
                data-aos="fade-up"
                data-aos-delay="400"
                data-aos-duration="600"
              >
                <button
                  onClick={() => {
                    setRetryCount(0);
                    fetchCategories();
                  }}
                  className="px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl font-medium flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-red-500/30 text-sm sm:text-base w-full sm:w-auto group"
                  data-aos="zoom-in"
                  data-aos-delay="450"
                  data-aos-duration="400"
                >
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin group-hover:animate-spin" />
                  Refresh
                </button>
                
                <Link
                  to="/admin/categories"
                  className="px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-blue-500/30 text-sm sm:text-base w-full sm:w-auto text-center group"
                  data-aos="zoom-in"
                  data-aos-delay="500"
                  data-aos-duration="400"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Add Categories</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 relative">
                {visibleCategories.map((category, index) => (
                  <div
                    key={category._id}
                    data-aos="fade-up"
                    data-aos-delay={Math.floor(index / 4) * 100 + (index % 4) * 50}
                    data-aos-duration="600"
                    data-aos-easing="ease-out-cubic"
                    data-aos-once="true"
                    data-aos-offset="100"
                    data-aos-anchor-placement="top-bottom"
                    className="transform transition-all duration-500 hover:-translate-y-2"
                  >
                    <div className="relative overflow-hidden rounded-xl group">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 via-red-500/5 to-blue-500/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <CategoryCard category={category} index={index} />
                    </div>
                  </div>
                ))}
              </div>

              {categories.length > itemsPerPage && (
                <div 
                  className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 p-4 sm:p-6 bg-gradient-to-r from-gray-900/50 to-black/50 rounded-xl border border-gray-800/50 backdrop-blur-sm"
                  data-aos="fade-up"
                  data-aos-delay="300"
                  data-aos-duration="600"
                  data-aos-offset="50"
                  data-aos-anchor-placement="top-bottom"
                >
                  <div 
                    className="text-gray-400 text-xs sm:text-sm order-2 sm:order-1"
                    data-aos="fade-right"
                    data-aos-delay="350"
                    data-aos-duration="500"
                  >
                    Showing <span className="text-white font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                    <span className="text-white font-semibold">{Math.min(currentPage * itemsPerPage, categories.length)}</span> of{" "}
                    <span className="text-red-400 font-semibold">{categories.length}</span> categories
                  </div>
                  
                  <div className="flex items-center gap-2 sm:gap-3 order-1 sm:order-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`p-2 sm:p-3 rounded-xl border transition-all duration-300 hover:scale-110 active:scale-95 ${
                        currentPage === 1
                          ? "border-gray-800 text-gray-600 cursor-not-allowed"
                          : "border-gray-700 text-gray-300 hover:border-red-500 hover:text-white hover:bg-gray-800/50 hover:shadow-lg hover:shadow-red-500/20"
                      }`}
                      data-aos="flip-left"
                      data-aos-delay="400"
                      data-aos-duration="500"
                      data-aos-easing="ease-out-back"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    
                    <div className="flex items-center gap-1 sm:gap-2">
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
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 text-xs sm:text-sm font-medium ${
                              currentPage === pageNum
                                ? "bg-gradient-to-r from-red-600 to-red-700 text-white scale-105 shadow-lg shadow-red-500/30"
                                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                            }`}
                            data-aos="flip-up"
                            data-aos-delay={450 + i * 50}
                            data-aos-duration="400"
                            data-aos-easing="ease-out-back"
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`p-2 sm:p-3 rounded-xl border transition-all duration-300 hover:scale-110 active:scale-95 ${
                        currentPage === totalPages
                          ? "border-gray-800 text-gray-600 cursor-not-allowed"
                          : "border-gray-700 text-gray-300 hover:border-red-500 hover:text-white hover:bg-gray-800/50 hover:shadow-lg hover:shadow-red-500/20"
                      }`}
                      data-aos="flip-right"
                      data-aos-delay="550"
                      data-aos-duration="500"
                      data-aos-easing="ease-out-back"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
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

      {/* About Section with scroll-dependent animations */}
      <section
        ref={(el) => {
          sectionRefs.current[1] = el;
          if (el) observeSectionAnimations(el);
        }}
        className="py-8 sm:py-16 bg-black"
      >
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="font-bebas text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#cc0000] mb-3 sm:mb-4 px-2 opacity-0 translate-y-8 transition-all duration-700 ease-out" 
                data-animate="fade-up">
              Quality you can Trust. Price You Can Afford.
            </h2>
            <p className="text-gray-300 text-sm sm:text-lg max-w-3xl mx-auto px-2 opacity-0 translate-y-8 transition-all duration-700 ease-out delay-150" 
               data-animate="fade-up">
              Experience the perfect balance of premium quality and exceptional value with Federal Parts - where trust meets affordability.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
            <h2 className="font-bebas text-2xl sm:text-3xl md:text-4xl text-[#cc0000] mb-4 sm:mb-6 opacity-0 translate-y-8 transition-all duration-700 ease-out delay-200" 
                  data-animate="slide-down">
                About Federal Parts
              </h2>
              <p className="text-gray-300 text-sm sm:text-base mb-6 sm:mb-8 opacity-0 translate-y-8 transition-all duration-700 ease-out delay-300" 
                 data-animate="slide-down">
                Cutting-edge innovative technology Federal Parts is one of the brands of motorcycle spare parts marketed by PT Astra Otoparts Tbk's Domestic business unit. Consumers in Indonesia can easily obtain Federal Parts products due to the extensive marketing network, which includes 50 main dealers, 23 sales offices, and nearly 10,000 shops or workshops. In addition, Federal Parts is well known for its quality because it is manufactured according to OEM (Original Equipment Manufacturer) standards and is suitable for all motorcycle brands circulating in Indonesia, such as Honda, Kawasaki, Suzuki, and Yamaha. It is also supported by the large variety of products offered. Federal Parts is always committed to providing added value for consumers by continuously launching spare parts with the latest technology at affordable prices without compromising quality.
              </p>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-900/50 rounded-lg hover:bg-gray-800 transition-colors border border-gray-800 opacity-0 translate-y-8 transition-all duration-700 ease-out delay-400" 
                     data-animate="fade-up">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base">
                      Japanese-level Engineering
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                      Precision engineering meets world-class quality standards
                    </p>
                  </div>
                </div>
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-900/50 rounded-lg hover:bg-gray-800 transition-colors border border-gray-800 opacity-0 translate-y-8 transition-all duration-700 ease-out delay-500" 
                     data-animate="fade-up">
                  <Target className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base">Indonesia-DNA</h4>
                    <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                      Locally manufactured, nationally trusted
                    </p>
                  </div>
                </div>
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-900/50 rounded-lg hover:bg-gray-800 transition-colors border border-gray-800 opacity-0 translate-y-8 transition-all duration-700 ease-out delay-600" 
                     data-animate="fade-up">
                  <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base">
                      China-level Affordability
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                      Competitive pricing without compromising on quality
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-8 lg:mt-0">
              <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-800 opacity-0 translate-y-8 transition-all duration-700 ease-out delay-400" 
                   data-animate="fade-up">
                <img
                  src="/newbanner/Desktop (about federal parts.png"
                  alt="About Federal Parts"
                  className="w-full h-auto"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/wmremove-transformed (1).png";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;