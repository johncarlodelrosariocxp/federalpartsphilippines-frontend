// src/components/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Search, Factory } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showHeader, setShowHeader] = useState(true);
  const [isHomePage, setIsHomePage] = useState(false);
  const headerRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on the homepage
  useEffect(() => {
    setIsHomePage(location.pathname === "/");
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Check if scrolled more than 10px for styling
      setScrolled(currentScrollY > 10);

      // Show/hide header logic
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling DOWN and past 100px - hide header
        setShowHeader(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling UP - show header
        setShowHeader(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMenuOpen && !e.target.closest(".mobile-menu")) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // Close menus on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsMenuOpen(false);
    }
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "Brands", path: "/brands" },
    { name: "Categories", path: "/categories" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  // Determine if we're in transparent mode (homepage + not scrolled)
  const isTransparentMode = isHomePage && !scrolled;

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ease-in-out ${
        showHeader ? "translate-y-0" : "-translate-y-full"
      } ${
        isTransparentMode
          ? "bg-transparent py-3"
          : scrolled
          ? "bg-[#cc0000]/95 backdrop-blur-md shadow-lg py-1"
          : "bg-[#cc0000] py-2"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between">
          {/* Logo - Same logo in both modes but with drop shadow in transparent mode */}
          <Link
            to="/"
            className="flex items-center group focus:outline-none"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="relative">
              {/* Logo image - Same in both modes */}
              <img
                src="/federalfinallogo.jpg"
                alt="Federal Parts Logo"
                className={`w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 object-contain transition-transform duration-300 group-hover:scale-105 -mt-12 -mb-12 md:-mt-16 md:-mb-16 lg:-mt-20 lg:-mb-20 ${
                  isTransparentMode ? "drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]" : ""
                }`}
              />
              <div className="absolute -inset-5 md:-inset-6 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300"></div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`text-base font-semibold transition-all duration-200 relative px-4 py-2.5 rounded-lg flex items-center ${
                    isActive
                      ? "text-white bg-white/30 shadow-lg"
                      : isTransparentMode
                      ? "text-white hover:text-white hover:bg-white/20 hover:shadow-md drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                      : "text-white/95 hover:text-white hover:bg-white/15 hover:shadow-md"
                  }`}
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  <span className="relative z-10">{item.name}</span>
                  {isActive && (
                    <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-lg"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Search - Desktop */}
            <div className="hidden md:flex relative">
              <form onSubmit={handleSearch} className="relative">
                <Search
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    isTransparentMode ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" : "text-white/80"
                  }`}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search parts & brands..."
                  className={`pl-12 pr-5 py-2.5 w-56 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all ${
                    isTransparentMode
                      ? "bg-white/20 border-white/40 text-white placeholder-white/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                      : "bg-white/20 border-white/30 text-white placeholder-white/60"
                  }`}
                />
              </form>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden p-2.5 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 ${
                isTransparentMode
                  ? "bg-white/20 hover:bg-white/30 drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                  : "hover:bg-white/25"
              }`}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className={`w-6 h-6 ${isTransparentMode ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" : "text-white"}`} />
              ) : (
                <Menu className={`w-6 h-6 ${isTransparentMode ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" : "text-white"}`} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className={`lg:hidden mt-4 pb-4 animate-in fade-in slide-in-from-top-4 duration-200 mobile-menu ${
            isTransparentMode ? "bg-white/10 backdrop-blur-sm rounded-xl p-4" : ""
          }`}>
            {/* Mobile Search in Menu */}
            <div className="mb-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isTransparentMode ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" : "text-white/70"
                }`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search parts & brands..."
                  className={`w-full pl-12 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-white/60 ${
                    isTransparentMode
                      ? "bg-white/20 border border-white/40 drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                      : "bg-white/20 border border-white/30"
                  }`}
                  autoFocus
                />
              </form>
            </div>

            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`block px-4 py-3 text-base font-semibold rounded-lg transition-all flex items-center ${
                      isActive
                        ? "text-[#cc0000] bg-white shadow-md"
                        : isTransparentMode
                        ? "text-white hover:text-white hover:bg-white/25 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
                        : "text-white hover:text-white hover:bg-white/20"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Additional mobile menu content */}
            <div className="mt-6 pt-4 border-t border-white/20">
              <div className="text-white/80 text-center">
                <p className="text-xs">Federal Parts - Your Automotive Specialist</p>
                <p className="text-xs mt-1 text-white/60">Open Mon-Fri: 8AM-6PM</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;