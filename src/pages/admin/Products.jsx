// src/pages/admin/Products.js - COMPLETE FIXED VERSION
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productAPI, categoryAPI } from "../../services/api";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Package,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Filter,
  MoreVertical,
  Star,
  Archive,
  TrendingUp,
  BarChart3,
  Box,
  Tag,
  DollarSign,
  Hash,
  Image as ImageIcon,
} from "lucide-react";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([
    { _id: "all", name: "All Categories" },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    featured: 0,
    outOfStock: 0,
    lowStock: 0,
    totalValue: 0,
  });
  const [bulkAction, setBulkAction] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("table");

  // Simple fallback image
  const createFallbackImage = () => {
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#F3F4F6"/>
        <text x="100" y="100" font-family="Arial" font-size="16" fill="#9CA3AF" text-anchor="middle" alignment-baseline="middle">No Image</text>
      </svg>
    `)}`;
  };

  const fallbackImageUrl = createFallbackImage();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterProducts();
    calculateStats();
  }, [
    searchTerm,
    selectedCategory,
    statusFilter,
    featuredFilter,
    stockFilter,
    sortBy,
    sortOrder,
    products,
  ]);

  // Get image URL - SIMPLIFIED
  const getProductImageUrl = (imagePath) => {
    // If no image path, return fallback
    if (!imagePath || 
        imagePath === "undefined" || 
        imagePath === "null" || 
        imagePath.trim() === "") {
      return fallbackImageUrl;
    }

    // If it's already a full URL or data URL, return as-is
    if (
      imagePath.startsWith("http://") ||
      imagePath.startsWith("https://") ||
      imagePath.startsWith("blob:") ||
      imagePath.startsWith("data:")
    ) {
      return imagePath;
    }

    // If it's a filename, construct URL
    const baseUrl = "https://federalpartsphilippines-backend.onrender.com";
    return `${baseUrl}/uploads/products/${imagePath}`;
  };

  // Get first product image
  const getFirstProductImage = (product) => {
    if (!product) return fallbackImageUrl;

    let images = [];

    if (Array.isArray(product.images) && product.images.length > 0) {
      // Filter valid images
      images = product.images.filter(img => 
        img && img.trim() !== "" && img !== "undefined" && img !== "null"
      );
    } else if (product.image && product.image.trim() !== "") {
      images = [product.image];
    }

    if (images.length === 0) {
      return fallbackImageUrl;
    }

    const firstImage = images[0];
    return getProductImageUrl(firstImage);
  };

  // Handle image loading errors
  const handleImageError = (e) => {
    e.target.src = fallbackImageUrl;
    e.target.onerror = null;
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await productAPI.getAllProducts({
        page: 1,
        limit: 100,
      });

      console.log("Products API Response:", response);

      let productsData = [];

      if (response?.success && response.products) {
        productsData = response.products;
      } else if (Array.isArray(response)) {
        productsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        productsData = response.data;
      }

      if (Array.isArray(productsData)) {
        // Process products to ensure images are properly formatted
        const processedProducts = productsData.map(product => ({
          ...product,
          images: Array.isArray(product.images) 
            ? product.images.filter(img => img && img.trim() !== "")
            : [],
          stock: product.stock || 0,
          price: product.price || 0,
          isActive: product.isActive !== undefined ? product.isActive : true,
          featured: product.featured || false
        }));

        setProducts(processedProducts);
        console.log(`Loaded ${processedProducts.length} products`);
      } else {
        setError("Failed to load products. Invalid response format.");
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(`Error loading products: ${err.message}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      let categoriesData = [];

      if (response?.success && response.categories) {
        categoriesData = response.categories;
      } else if (Array.isArray(response)) {
        categoriesData = response;
      }

      if (Array.isArray(categoriesData)) {
        const activeCategories = categoriesData.filter((cat) => cat.isActive);
        setCategories([
          { _id: "all", name: "All Categories" },
          ...activeCategories,
        ]);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([{ _id: "all", name: "All Categories" }]);
    }
  };

  const calculateStats = () => {
    if (!Array.isArray(filteredProducts)) {
      setStats({
        total: 0,
        active: 0,
        featured: 0,
        outOfStock: 0,
        lowStock: 0,
        totalValue: 0,
      });
      return;
    }

    const total = filteredProducts.length;
    const active = filteredProducts.filter((p) => p.isActive).length;
    const featured = filteredProducts.filter((p) => p.featured).length;
    const outOfStock = filteredProducts.filter((p) => p.stock === 0).length;
    const lowStock = filteredProducts.filter(
      (p) => p.stock > 0 && p.stock <= 10
    ).length;
    const totalValue = filteredProducts.reduce(
      (sum, p) => sum + (p.price || 0) * (p.stock || 0),
      0
    );

    setStats({
      total,
      active,
      featured,
      outOfStock,
      lowStock,
      totalValue,
    });
  };

  const filterProducts = () => {
    if (!Array.isArray(products)) {
      setFilteredProducts([]);
      return;
    }

    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          (product.name && product.name.toLowerCase().includes(term)) ||
          (product.description &&
            product.description.toLowerCase().includes(term)) ||
          (product.sku && product.sku.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category?._id === selectedCategory
      );
    }

    // Status filter
    if (statusFilter === "active") {
      filtered = filtered.filter((product) => product.isActive);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((product) => !product.isActive);
    }

    // Featured filter
    if (featuredFilter === "featured") {
      filtered = filtered.filter((product) => product.featured);
    } else if (featuredFilter === "not-featured") {
      filtered = filtered.filter((product) => !product.featured);
    }

    // Stock filter
    if (stockFilter === "in_stock") {
      filtered = filtered.filter((product) => product.stock > 10);
    } else if (stockFilter === "low_stock") {
      filtered = filtered.filter(
        (product) => product.stock > 0 && product.stock <= 10
      );
    } else if (stockFilter === "out_of_stock") {
      filtered = filtered.filter((product) => product.stock === 0);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "category") {
        aValue = a.category?.name || "";
        bValue = b.category?.name || "";
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  // Pagination
  const currentProducts = Array.isArray(filteredProducts)
    ? filteredProducts.slice(
        (currentPage - 1) * productsPerPage,
        currentPage * productsPerPage
      )
    : [];

  const totalPages = Math.ceil(
    (Array.isArray(filteredProducts) ? filteredProducts.length : 0) /
      productsPerPage
  );

  const getStatusColor = (product) => {
    if (!product?.isActive) return "bg-gray-100 text-gray-800";
    if (product?.stock === 0) return "bg-red-100 text-red-800";
    if (product?.stock <= 10) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusText = (product) => {
    if (!product?.isActive) return "Inactive";
    if (product?.stock === 0) return "Out of Stock";
    if (product?.stock <= 10) return "Low Stock";
    return "In Stock";
  };

  const getStatusIcon = (product) => {
    if (!product?.isActive) return <Archive className="w-4 h-4" />;
    if (product?.stock === 0) return <XCircle className="w-4 h-4" />;
    if (product?.stock <= 10) return <AlertCircle className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await productAPI.deleteProduct(id);

      if (response?.success) {
        setProducts(products.filter((product) => product._id !== id));
        setSuccess("Product deleted successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Failed to delete product. Please try again.");
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      setError(`Failed to delete product: ${err.message}`);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(currentProducts.map((p) => p._id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (id) => {
    setSelectedProducts((prev) =>
      prev.includes(id)
        ? prev.filter((productId) => productId !== id)
        : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;

    if (
      !window.confirm(`Delete ${selectedProducts.length} selected products?`)
    ) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const deletePromises = selectedProducts.map((id) =>
        productAPI.deleteProduct(id)
      );

      const results = await Promise.allSettled(deletePromises);

      const successfulDeletes = results.filter(
        (result) => result.status === "fulfilled" && result.value?.success
      ).length;

      fetchProducts();
      setSelectedProducts([]);

      if (successfulDeletes === selectedProducts.length) {
        setSuccess(`${selectedProducts.length} products deleted successfully!`);
      } else {
        setSuccess(
          `${successfulDeletes} out of ${selectedProducts.length} products deleted successfully. Some deletions may have failed.`
        );
      }

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error in bulk delete:", err);
      setError(`Failed to delete products: ${err.message}`);
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedProducts.length === 0 || !bulkAction) return;

    try {
      setError("");
      setSuccess("");

      let updateData = {};
      let actionMessage = "";

      switch (bulkAction) {
        case "feature":
          updateData = { featured: true };
          actionMessage = "Marked as featured";
          break;
        case "unfeature":
          updateData = { featured: false };
          actionMessage = "Removed from featured";
          break;
        case "activate":
          updateData = { isActive: true };
          actionMessage = "Activated";
          break;
        case "deactivate":
          updateData = { isActive: false };
          actionMessage = "Deactivated";
          break;
        case "stock":
          const stockValue = prompt("Enter stock quantity:");
          if (stockValue === null || stockValue === "") return;
          const stockNum = parseInt(stockValue);
          if (isNaN(stockNum) || stockNum < 0) {
            alert("Please enter a valid non-negative number");
            return;
          }
          updateData = { stock: stockNum };
          actionMessage = "Stock updated";
          break;
        default:
          return;
      }

      const updatePromises = selectedProducts.map((id) =>
        productAPI.updateProduct(id, updateData)
      );

      const results = await Promise.allSettled(updatePromises);

      const successfulUpdates = results.filter(
        (result) => result.status === "fulfilled" && result.value?.success
      ).length;

      fetchProducts();
      setSelectedProducts([]);
      setBulkAction("");

      if (successfulUpdates === selectedProducts.length) {
        setSuccess(
          `${
            selectedProducts.length
          } products ${actionMessage.toLowerCase()} successfully!`
        );
      } else {
        setSuccess(
          `${successfulUpdates} out of ${selectedProducts.length} products updated successfully. Some updates may have failed.`
        );
      }

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error in bulk update:", err);
      setError(`Failed to update products: ${err.message}`);
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      setError("");
      setSuccess("");

      const product = products.find((p) => p._id === id);
      if (!product) {
        setError("Product not found");
        return;
      }

      const response = await productAPI.updateProduct(id, {
        featured: !product.featured,
      });

      if (response?.success) {
        setProducts(
          products.map((product) =>
            product._id === id
              ? { ...product, featured: !product.featured }
              : product
          )
        );
        setSuccess(
          `Product ${
            !product.featured ? "featured" : "unfeatured"
          } successfully!`
        );
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Failed to update product feature status");
      }
    } catch (err) {
      console.error("Error toggling featured:", err);
      setError(`Failed to update: ${err.message}`);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      setError("");
      setSuccess("");

      const product = products.find((p) => p._id === id);
      if (!product) {
        setError("Product not found");
        return;
      }

      const response = await productAPI.updateProduct(id, {
        isActive: !product.isActive,
      });

      if (response?.success) {
        setProducts(
          products.map((product) =>
            product._id === id
              ? { ...product, isActive: !product.isActive }
              : product
          )
        );
        setSuccess(
          `Product ${
            !product.isActive ? "activated" : "deactivated"
          } successfully!`
        );
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Failed to update product status");
      }
    } catch (err) {
      console.error("Error toggling active:", err);
      setError(`Failed to update: ${err.message}`);
    }
  };

  const handleExportProducts = async () => {
    try {
      setError("");
      setSuccess("");

      // Create CSV data
      const headers = [
        "ID",
        "Name",
        "SKU",
        "Category",
        "Price",
        "Stock",
        "Status",
        "Featured",
        "Created At"
      ];

      const csvData = filteredProducts.map(product => [
        product._id,
        `"${product.name || ''}"`,
        product.sku || '',
        product.category?.name || '',
        product.price || 0,
        product.stock || 0,
        product.isActive ? 'Active' : 'Inactive',
        product.featured ? 'Yes' : 'No',
        product.createdAt || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess("Products exported successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error exporting products:", err);
      setError(`Export failed: ${err.message}`);
    }
  };

  const handleRefresh = () => {
    fetchProducts();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? "↑" : "↓";
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(price || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Products Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your products, inventory, and stock levels
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleExportProducts}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Success!</span>
            <span>{success}</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">
                Total Products
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.total.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-200 rounded-xl">
              <Package className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Active</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.active.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-200 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800">Featured</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.featured.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-yellow-200 rounded-xl">
              <Star className="w-6 h-6 text-yellow-700" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.outOfStock.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-red-200 rounded-xl">
              <AlertCircle className="w-6 h-6 text-red-700" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-800">Low Stock</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.lowStock.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-orange-200 rounded-xl">
              <TrendingUp className="w-6 h-6 text-orange-700" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800">
                Inventory Value
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatPrice(stats.totalValue)}
              </p>
            </div>
            <div className="p-3 bg-purple-200 rounded-xl">
              <BarChart3 className="w-6 h-6 text-purple-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Search Products
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, SKU, or description..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Featured Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Featured
              </label>
              <select
                value={featuredFilter}
                onChange={(e) => setFeaturedFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="featured">Featured</option>
                <option value="not-featured">Not Featured</option>
              </select>
            </div>

            {/* Stock Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Stock Status
              </label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Stock</option>
                <option value="in_stock">In Stock (&gt;10)</option>
                <option value="low_stock">Low Stock (1-10)</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="createdAt">Date Created</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="stock">Stock</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>

            {/* View Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                View Mode
              </label>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("table")}
                  className={`flex-1 px-4 py-2 text-sm font-medium ${
                    viewMode === "table"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex-1 px-4 py-2 text-sm font-medium ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Grid
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg font-bold">
                {selectedProducts.length}
              </div>
              <div className="text-gray-700">
                <span className="font-bold">
                  product{selectedProducts.length !== 1 ? "s" : ""} selected
                </span>
                <p className="text-sm text-gray-600 mt-1">
                  Select an action to apply to all selected products
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[180px]"
              >
                <option value="">Bulk Actions</option>
                <option value="feature">Mark as Featured</option>
                <option value="unfeature">Remove from Featured</option>
                <option value="activate">Activate</option>
                <option value="deactivate">Deactivate</option>
                <option value="stock">Update Stock</option>
                <option value="delete">Delete Selected</option>
              </select>
              <button
                onClick={
                  bulkAction === "delete" ? handleBulkDelete : handleBulkUpdate
                }
                disabled={!bulkAction}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                Apply
              </button>
              <button
                onClick={() => setSelectedProducts([])}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table/Grid */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * productsPerPage + 1} to{" "}
              {Math.min(currentPage * productsPerPage, filteredProducts.length)}{" "}
              of {filteredProducts.length} products
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          </div>
        </div>

        {/* Table View */}
        {viewMode === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left w-12">
                    <input
                      type="checkbox"
                      checked={
                        currentProducts.length > 0 &&
                        selectedProducts.length === currentProducts.length
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-2">
                      Product
                      <span className="text-blue-600">
                        {getSortIcon("name")}
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("price")}
                  >
                    <div className="flex items-center gap-2">
                      Price
                      <span className="text-blue-600">
                        {getSortIcon("price")}
                      </span>
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("stock")}
                  >
                    <div className="flex items-center gap-2">
                      Stock
                      <span className="text-blue-600">
                        {getSortIcon("stock")}
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <Package className="w-16 h-16 mb-4 text-gray-400" />
                        <p className="text-xl font-medium text-gray-900">
                          No products found
                        </p>
                        <p className="text-gray-600 mt-2 max-w-md">
                          {searchTerm ||
                          selectedCategory !== "all" ||
                          statusFilter !== "all"
                            ? "Try adjusting your search filters"
                            : "No products available. Add your first product!"}
                        </p>
                        {!searchTerm &&
                          selectedCategory === "all" &&
                          statusFilter === "all" && (
                            <Link
                              to="/admin/products/new"
                              className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              Add Your First Product
                            </Link>
                          )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentProducts.map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product._id)}
                          onChange={() => handleSelectProduct(product._id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200 group-hover:border-blue-200 transition-colors">
                            <img
                              src={getFirstProductImage(product)}
                              alt={product.name}
                              className="w-14 h-14 object-cover"
                              onError={handleImageError}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-gray-900 truncate max-w-xs">
                                {product.name}
                              </p>
                              {product.featured && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full flex-shrink-0">
                                  <Star className="w-3 h-3" />
                                  Featured
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                              <span>SKU: {product.sku || "N/A"}</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Created: {formatDate(product.createdAt)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 max-w-xs truncate">
                          {product.category?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-lg">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              product.stock === 0
                                ? "bg-red-500"
                                : product.stock <= 10
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                          ></div>
                          <div>
                            <span className="font-bold text-gray-900">
                              {product.stock || 0}
                            </span>
                            <div className="text-xs text-gray-500">
                              {product.stock === 0
                                ? "Out of stock"
                                : product.stock <= 10
                                ? "Low stock"
                                : "In stock"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${getStatusColor(
                            product
                          )}`}
                        >
                          {getStatusIcon(product)}
                          {getStatusText(product)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/admin/products/edit/${product._id}`}
                            className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-blue-100 hover:border-blue-200"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/product/${product._id}`}
                            target="_blank"
                            className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-100 hover:border-gray-200"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleToggleFeatured(product._id)}
                            className={`p-2.5 rounded-xl transition-colors border ${
                              product.featured
                                ? "text-yellow-600 hover:bg-yellow-50 border-yellow-100 hover:border-yellow-200"
                                : "text-gray-400 hover:bg-gray-100 border-gray-100 hover:border-gray-200"
                            }`}
                            title={
                              product.featured
                                ? "Remove from featured"
                                : "Mark as featured"
                            }
                          >
                            <Star
                              className={`w-4 h-4 ${
                                product.featured ? "fill-yellow-500" : ""
                              }`}
                            />
                          </button>
                          <button
                            onClick={() => handleToggleActive(product._id)}
                            className={`p-2.5 rounded-xl transition-colors border ${
                              product.isActive
                                ? "text-green-600 hover:bg-green-50 border-green-100 hover:border-green-200"
                                : "text-red-600 hover:bg-red-50 border-red-100 hover:border-red-200"
                            }`}
                            title={product.isActive ? "Deactivate" : "Activate"}
                          >
                            {product.isActive ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <Archive className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-100 hover:border-red-200"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View */
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentProducts.length === 0 ? (
                <div className="col-span-full py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Package className="w-16 h-16 mb-4 text-gray-400" />
                    <p className="text-xl font-medium text-gray-900">
                      No products found
                    </p>
                    <p className="text-gray-600 mt-2">
                      Try adjusting your search filters or add a new product.
                    </p>
                  </div>
                </div>
              ) : (
                currentProducts.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-shadow group"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square bg-gray-100">
                      <img
                        src={getFirstProductImage(product)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={handleImageError}
                      />
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.featured && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full">
                            <Star className="w-3 h-3" />
                            Featured
                          </span>
                        )}
                        {!product.isActive && (
                          <span className="px-3 py-1 text-xs font-bold bg-gray-600 text-white rounded-full">
                            Inactive
                          </span>
                        )}
                        {product.stock === 0 && (
                          <span className="px-3 py-1 text-xs font-bold bg-red-500 text-white rounded-full">
                            Out of Stock
                          </span>
                        )}
                      </div>
                      {/* Quick Actions */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleToggleFeatured(product._id)}
                          className="p-2 bg-white rounded-full shadow-lg hover:bg-yellow-50"
                          title={product.featured ? "Unfeature" : "Feature"}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              product.featured
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-400"
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => handleToggleActive(product._id)}
                          className="p-2 bg-white rounded-full shadow-lg hover:bg-green-50"
                          title={product.isActive ? "Deactivate" : "Activate"}
                        >
                          {product.isActive ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Archive className="w-4 h-4 text-red-500" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 truncate">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 truncate">
                            {product.category?.name || "Uncategorized"}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product._id)}
                          onChange={() => handleSelectProduct(product._id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-5 w-5"
                        />
                      </div>

                      {/* Price */}
                      <div className="mt-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      </div>

                      {/* Stock */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                product.stock === 0
                                  ? "bg-red-500"
                                  : product.stock <= 10
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                            ></div>
                            <span className="text-sm font-medium">
                              {product.stock} in stock
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            SKU: {product.sku || "N/A"}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-6 flex items-center gap-2">
                        <Link
                          to={`/admin/products/edit/${product._id}`}
                          className="flex-1 text-center bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          Edit
                        </Link>
                        <Link
                          to={`/product/${product._id}`}
                          target="_blank"
                          className="flex-1 text-center border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Pagination */}
        {filteredProducts.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-sm text-gray-700">
                Showing {(currentPage - 1) * productsPerPage + 1} to{" "}
                {Math.min(
                  currentPage * productsPerPage,
                  filteredProducts.length
                )}{" "}
                of {filteredProducts.length} products
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-3.5 py-2 rounded-lg transition-colors ${
                        currentPage === pageNumber
                          ? "bg-blue-600 text-white font-bold"
                          : "border border-gray-300 hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="px-2 text-gray-500">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-3.5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2.5 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;