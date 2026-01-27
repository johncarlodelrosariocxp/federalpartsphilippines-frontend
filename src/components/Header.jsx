// src/components/Header.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Search, ShoppingCart, User, Home, ShoppingBag, Grid, Info, Phone, LogOut } from "lucide-react";
import { productAPI, cartAPI, authAPI } from "../services/api";
import debounce from "lodash/debounce";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showHeader, setShowHeader] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [activeNav, setActiveNav] = useState("/");
  const headerRef = useRef(null);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Update active nav based on location
  useEffect(() => {
    setActiveNav(location.pathname);
    // Scroll to top when route changes
    window.scrollTo(0, 0);
  }, [location]);

  // Initialize cart count and user
  useEffect(() => {
    const cart = cartAPI.getCart();
    setCartCount(cart.count);
    
    const checkAuth = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        if (response.success && response.user) {
          setUser(response.user);
        }
      } catch (error) {
        console.log("User not authenticated");
      }
    };
    
    checkAuth();
  }, []);

  // Handle scroll for header show/hide
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 10);

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowHeader(false);
      } else if (currentScrollY < lastScrollY) {
        setShowHeader(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Fetch search suggestions
  const fetchSearchSuggestions = useCallback(
    debounce(async (query) => {
      if (!query.trim() || query.length < 2) {
        setSearchSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        setIsSearching(true);
        const response = await productAPI.searchProducts(query, {
          limit: 8,
          fields: "name,images,price,discountedPrice,sku"
        });

        if (response.success && response.products) {
          setSearchSuggestions(response.products.slice(0, 6));
          setShowSuggestions(true);
        } else {
          setSearchSuggestions([]);
        }
      } catch (error) {
        console.error("Error fetching search suggestions:", error);
        setSearchSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchSearchSuggestions(query);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMenuOpen && !e.target.closest(".mobile-menu")) {
        setIsMenuOpen(false);
      }
      
      if (showSuggestions && suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen, showSuggestions]);

  // Close menus on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        setShowSuggestions(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Handle search form submission
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    
    try {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowSuggestions(false);
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle quick search click - DIRECT NAVIGATION TO PRODUCT DETAIL
  const handleQuickSearch = (product) => {
    if (product._id) {
      // Navigate directly to product detail page
      navigate(`/product/${product._id}`);
    } else {
      setSearchQuery(product.name);
      searchInputRef.current?.focus();
    }
    setSearchQuery("");
    setShowSuggestions(false);
    setIsMenuOpen(false);
  };

  // Handle view all search results
  const handleViewAllResults = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setIsMenuOpen(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Quick search categories
  const quickSearchCategories = [
    { name: "Brake Pads", category: "brake-system", icon: "🔧" },
    { name: "Oil Filter", category: "engine", icon: "⚙️" },
    { name: "Spark Plugs", category: "ignition", icon: "⚡" },
    { name: "Battery", category: "electrical", icon: "🔋" },
    { name: "Tires", category: "wheels-tires", icon: "🚗" },
    { name: "Air Filter", category: "engine", icon: "💨" },
    { name: "Wiper Blades", category: "exterior", icon: "🌧️" },
    { name: "Headlights", category: "lighting", icon: "💡" }
  ];

  const handleQuickCategorySearch = (category) => {
    navigate(`/category/${category}`);
    setIsMenuOpen(false);
  };

  // Mobile bottom navigation items
  const mobileNavItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Shop", path: "/shop", icon: ShoppingBag },
    { name: "Categories", path: "/categories", icon: Grid },
    { name: "About", path: "/about", icon: Info },
    { name: "Contact", path: "/contact", icon: Phone },
  ];

  // Desktop navigation items
  const desktopNavItems = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "Categories", path: "/categories" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  // Enhanced search input handlers
  const handleSearchFocus = () => {
    if (searchQuery.length >= 2 && searchSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSearchBlur = (e) => {
    // Delay hiding suggestions to allow click on suggestion items
    if (!suggestionsRef.current?.contains(e.relatedTarget)) {
      setTimeout(() => setShowSuggestions(false), 200);
    }
  };

  return (
    <>
      {/* Main Header - Hidden on mobile except for search */}
      <header
        ref={headerRef}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ease-in-out ${
          showHeader ? "translate-y-0" : "-translate-y-full"
        } ${
          scrolled
            ? "bg-[#cc0000]/95 backdrop-blur-md shadow-lg"
            : "bg-[#cc0000]"
        } hidden lg:block`}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-2">
            {/* Desktop Logo */}
            <Link
              to="/"
              className="flex items-center group focus:outline-none"
            >
              <div className="relative">
                <img
                  src="/federalfinallogo.jpg"
                  alt="Federal Parts Logo"
                  className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 object-contain transition-transform duration-300 group-hover:scale-105 -mt-12 -mb-12 md:-mt-16 md:-mb-16 lg:-mt-20 lg:-mb-20"
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="flex items-center space-x-4">
              {desktopNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "text-white bg-white/30"
                        : "text-white/90 hover:text-white hover:bg-white/15"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Right Actions - Cart and account removed */}
            <div className="flex items-center space-x-4">
              {/* Desktop Search */}
              <div className="relative" ref={suggestionsRef}>
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/80" />
                  <input
                    type="text"
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                    placeholder="Search parts"
                    className="pl-10 pr-4 py-2 w-48 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/20 border-white/30 text-white placeholder-white/60"
                  />
                  
                  {/* Search Suggestions Dropdown */}
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-200">
                      <div className="max-h-96 overflow-y-auto">
                        {searchSuggestions.map((product, index) => (
                          <button
                            key={product._id || index}
                            type="button"
                            onClick={() => handleQuickSearch(product)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center space-x-3 group"
                          >
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded group-hover:scale-105 transition-transform"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                                <ShoppingBag className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate group-hover:text-[#cc0000] transition-colors">
                                {product.name}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                {product.discountedPrice ? (
                                  <>
                                    <span className="text-sm font-semibold text-[#cc0000]">
                                      {formatPrice(product.discountedPrice)}
                                    </span>
                                    <span className="text-xs text-gray-500 line-through">
                                      {formatPrice(product.price)}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-sm font-semibold text-gray-900">
                                    {formatPrice(product.price)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                              View Product
                            </div>
                          </button>
                        ))}
                        
                        {searchQuery.trim() && (
                          <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
                            <button
                              type="button"
                              onClick={handleViewAllResults}
                              className="text-sm font-semibold text-[#cc0000] hover:text-[#ff3333] w-full text-left flex items-center justify-between"
                            >
                              <span>View all results for "{searchQuery}"</span>
                              <Search className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Top Search Bar - Always visible */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#cc0000] px-4 py-2 shadow-lg">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <Link to="/" className="flex items-center h-full">
            <img
              src="/federalfinallogo.jpg"
              alt="Federal Parts Logo"
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Search Bar */}
          <div className="flex-1 mx-4 max-w-md" ref={suggestionsRef}>
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/80" />
              <input
                type="text"
                ref={searchInputRef}
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                placeholder="Search parts..."
                className="w-full pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/20 border border-white/30 text-white placeholder-white/60"
              />
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-200">
                  <div className="max-h-80 overflow-y-auto">
                    {searchSuggestions.slice(0, 4).map((product, index) => (
                      <button
                        key={product._id || index}
                        type="button"
                        onClick={() => handleQuickSearch(product)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center space-x-3 group"
                      >
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-[#cc0000] transition-colors">
                            {product.name}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            {product.discountedPrice ? (
                              <span className="text-sm font-semibold text-[#cc0000]">
                                {formatPrice(product.discountedPrice)}
                              </span>
                            ) : (
                              <span className="text-sm font-semibold text-gray-900">
                                {formatPrice(product.price)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          View →
                        </div>
                      </button>
                    ))}
                    
                    {searchQuery.trim() && (
                      <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
                        <button
                          type="button"
                          onClick={handleViewAllResults}
                          className="text-sm font-semibold text-[#cc0000] hover:text-[#ff3333] w-full text-left"
                        >
                          View all results for "{searchQuery}"
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar - Fixed at bottom with red color */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#cc0000] border-t border-[#b30000] shadow-[0_-2px_10px_rgba(0,0,0,0.2)]">
        <div className="flex items-center justify-around px-2 py-3">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.path;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-all ${
                  isActive 
                    ? "bg-white/30 text-white" 
                    : "text-white/90 hover:text-white hover:bg-white/15"
                }`}
                onClick={() => {
                  setActiveNav(item.path);
                  window.scrollTo(0, 0);
                }}
              >
                <Icon className="w-6 h-6" />
                <span className={`text-xs mt-1 font-medium ${
                  isActive ? "text-white font-semibold" : "text-white/90"
                }`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Full-screen Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm">
          <div className="flex flex-col h-full pt-16 pb-24 px-4">
            {/* Close Button */}
            <button
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-white"
            >
              <X className="w-6 h-6" />
            </button>

            {/* User Info */}
            <div className="mb-8 p-4 bg-white/10 rounded-xl">
              {user ? (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{user.name}</h3>
                      <p className="text-white/70 text-sm">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="mt-4 flex items-center text-white/80 hover:text-white"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center justify-center py-3 bg-[#cc0000] text-white rounded-lg font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-5 h-5 mr-2" />
                  Sign In / Register
                </Link>
              )}
            </div>

            {/* Menu Links - Cart and account removed from mobile menu */}
            <div className="space-y-1">
              {[
                { name: "Home", path: "/", icon: Home },
                { name: "Shop", path: "/shop", icon: ShoppingBag },
                { name: "Categories", path: "/categories", icon: Grid },
                { name: "About", path: "/about", icon: Info },
                { name: "Contact", path: "/contact", icon: Phone },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.path;
                
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-[#cc0000] text-white"
                        : "text-white hover:bg-white/10"
                    }`}
                    onClick={() => {
                      setIsMenuOpen(false);
                      setActiveNav(item.path);
                      window.scrollTo(0, 0);
                    }}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Popular Categories */}
            <div className="mt-8">
              <h4 className="text-white font-semibold mb-3">Popular Categories</h4>
              <div className="grid grid-cols-2 gap-2">
                {quickSearchCategories.map((category, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleQuickCategorySearch(category.category)}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors flex items-center"
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-auto pt-6 border-t border-white/20">
              <div className="text-white/80 text-center">
                <p className="text-sm font-semibold">Federal Parts</p>
                <p className="text-xs mt-1 text-white/60">Auto Parts Specialist</p>
                <p className="text-xs mt-1 text-white/60">Mon-Fri: 8AM-6PM</p>
                <p className="text-xs mt-1 text-white/60">📞 (02) 1234-5678</p>
                <p className="text-xs mt-2 text-white/40">© 2024 Federal Parts</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Padding for mobile content (accounting for top search bar and bottom nav) */}
      <div className="lg:hidden pt-14 pb-1"></div>
    </>
  );
};

export default Header;