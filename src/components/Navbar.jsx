import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Search,
  ChevronDown,
  Package,
  Settings,
  LogOut,
} from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = false;
  const isAdmin = false;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        setIsUserMenuOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "Categories", path: "/categories" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-lg py-3"
          : "bg-white border-b border-gray-100 py-4"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <Link
            to="/"
            className="flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-lg p-1"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-all duration-300">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent">
                Federal Parts
              </span>
              <span className="text-xs text-gray-500 font-medium tracking-wide">
                PRECISION AUTOMOTIVE
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-sm font-medium transition-all duration-300 relative after:absolute after:bottom-0 after:left-1/2 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-blue-600 after:to-indigo-600 after:transition-all after:duration-300 hover:after:w-full hover:after:left-0 ${
                  location.pathname === item.path
                    ? "text-gray-900 after:w-full after:left-0"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Search - Desktop */}
            <div className="hidden md:block relative">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search parts & accessories..."
                  className="pl-10 pr-4 py-2 w-56 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 transition-all duration-300"
                />
              </form>
            </div>

            {/* Search - Mobile Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-gray-600" />
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors group"
              onClick={() => setIsMenuOpen(false)}
            >
              <ShoppingCart className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
              <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                3
              </span>
            </Link>

            {/* User / Auth */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center border border-blue-200">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-medium text-gray-900">John Doe</p>
                      <p className="text-xs text-gray-500">john@example.com</p>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-3 text-gray-400" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-3 text-gray-400" />
                      My Profile
                    </Link>

                    <Link
                      to="/orders"
                      className="flex items-center px-4 py-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Package className="w-4 h-4 mr-3 text-gray-400" />
                      My Orders
                    </Link>

                    <hr className="my-2 border-gray-100" />

                    <button
                      onClick={() => {
                        // Logout logic
                        setIsUserMenuOpen(false);
                        navigate("/login");
                      }}
                      className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="md:hidden mt-4 animate-in fade-in duration-200">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search parts & accessories..."
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30"
                autoFocus
              />
            </form>
          </div>
        )}

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="lg:hidden mt-6 pb-4 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block px-4 py-3 text-base font-medium rounded-lg transition-all ${
                    location.pathname === item.path
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile Auth Actions */}
            {!isLoggedIn && (
              <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
                <Link
                  to="/login"
                  className="block w-full text-center px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block w-full text-center px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
