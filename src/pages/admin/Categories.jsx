// src/pages/admin/Categories.js - COMPLETE FIXED VERSION
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  FolderTree,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Layers,
  BarChart3,
  Grid3x3,
  ListTree,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
} from "lucide-react";
import { categoryAPI } from "../../services/api";

const Categories = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // States
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [showInactive, setShowInactive] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    withProducts: 0,
    nested: 0,
  });

  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Check for success message from navigation
  useEffect(() => {
    if (location.state && location.state.success) {
      setSuccess(location.state.success);
      setTimeout(() => setSuccess(""), 3000);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Load saved preferences
  useEffect(() => {
    const savedViewMode = localStorage.getItem("categoryViewMode");
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }

    const savedShowInactive = localStorage.getItem("showInactiveCategories");
    if (savedShowInactive) {
      try {
        setShowInactive(JSON.parse(savedShowInactive));
      } catch (e) {
        console.error("Error parsing showInactiveCategories:", e);
      }
    }
  }, []);

  // Fetch categories on component mount
  useEffect(() => {
    fetchAllCategories();
  }, []);

  // Filter and sort categories when dependencies change
  useEffect(() => {
    filterAndSortCategories();
  }, [
    searchTerm,
    categories,
    sortBy,
    sortOrder,
    showInactive,
    expandedCategories,
  ]);

  // Save view mode preference
  useEffect(() => {
    localStorage.setItem("categoryViewMode", viewMode);
  }, [viewMode]);

  // Save filter preference
  useEffect(() => {
    localStorage.setItem(
      "showInactiveCategories",
      JSON.stringify(showInactive)
    );
  }, [showInactive]);

  const fetchAllCategories = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Fetching categories...");
      
      const response = await categoryAPI.getAllCategories();

      console.log("Categories API response:", response);

      let categoriesData = [];
      if (response) {
        // Handle different response structures
        if (Array.isArray(response)) {
          categoriesData = response;
        } else if (response.success && Array.isArray(response.data)) {
          categoriesData = response.data;
        } else if (Array.isArray(response.data)) {
          categoriesData = response.data;
        } else if (Array.isArray(response.categories)) {
          categoriesData = response.categories;
        } else if (Array.isArray(response.brands)) {
          categoriesData = response.brands;
        }

        console.log("Processed categories data:", categoriesData);
        
        // Sort categories by name for better display
        categoriesData.sort((a, b) => {
          const nameA = a.name ? a.name.toLowerCase() : '';
          const nameB = b.name ? b.name.toLowerCase() : '';
          return nameA.localeCompare(nameB);
        });

        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        calculateStats(categoriesData);
      } else {
        console.warn("No response from categories API");
        setCategories([]);
        calculateStats([]);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories. Please try again.");
      setCategories([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (categoriesData) => {
    if (!Array.isArray(categoriesData)) {
      setStats({
        total: 0,
        active: 0,
        inactive: 0,
        withProducts: 0,
        nested: 0,
      });
      return;
    }

    const flatCategories = flattenCategories(categoriesData);
    const activeCount = flatCategories.filter((cat) => cat.isActive).length;
    const withProductsCount = flatCategories.filter(
      (cat) => (cat.productCount || 0) > 0
    ).length;
    const nestedCount = flatCategories.filter((cat) => cat.level > 0).length;

    setStats({
      total: flatCategories.length,
      active: activeCount,
      inactive: flatCategories.length - activeCount,
      withProducts: withProductsCount,
      nested: nestedCount,
    });
  };

  const filterAndSortCategories = useCallback(() => {
    let filtered = flattenCategories(categories);

    filtered = filtered.filter((category) => {
      const matchesSearch =
        searchTerm === "" ||
        (category.name &&
          category.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (category.description &&
          category.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));

      const matchesStatus = showInactive || category.isActive;

      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.name ? a.name.toLowerCase() : "";
          bValue = b.name ? b.name.toLowerCase() : "";
          break;
        case "productCount":
          aValue = a.productCount || 0;
          bValue = b.productCount || 0;
          break;
        case "createdAt":
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        default:
          aValue = a.name ? a.name.toLowerCase() : "";
          bValue = b.name ? b.name.toLowerCase() : "";
      }

      return sortOrder === "asc"
        ? aValue > bValue
          ? 1
          : -1
        : aValue < bValue
        ? 1
        : -1;
    });

    setFilteredCategories(filtered);
    setCurrentPage(1);
  }, [categories, searchTerm, sortBy, sortOrder, showInactive]);

  const flattenCategories = (catList, level = 0, parentId = null) => {
    if (!Array.isArray(catList)) return [];

    let flatList = [];
    catList.forEach((category) => {
      const flatCategory = {
        ...category,
        _id: category._id || category.id,
        level,
        parentId,
        hasChildren: category.children && category.children.length > 0,
        productCount: category.productCount || 0,
        motorcycleCount: category.motorcycleCount || category.productCount || 0,
        name: category.name || "Unnamed Category",
        description: category.description || "",
        isActive: category.isActive !== false,
        image: category.image || "",
      };

      flatList.push(flatCategory);

      if (
        category.children &&
        category.children.length > 0 &&
        expandedCategories.has(flatCategory._id)
      ) {
        flatList = flatList.concat(
          flattenCategories(category.children, level + 1, flatCategory._id)
        );
      }
    });

    return flatList;
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        console.log("Deleting category:", id);
        const response = await categoryAPI.deleteCategory(id);
        
        if (response && response.success) {
          // Remove category from state
          setCategories(prevCategories => {
            const removeCategory = (catList) => {
              return catList.filter((category) => {
                if (category._id === id || category.id === id) return false;
                if (category.children) {
                  category.children = removeCategory(category.children);
                }
                return true;
              });
            };
            return removeCategory([...prevCategories]);
          });
          
          setSuccess("Category deleted successfully!");
          setSelectedCategories(prev => prev.filter((catId) => catId !== id));
          setTimeout(() => setSuccess(""), 3000);
        } else {
          setError(response?.message || "Failed to delete category");
          setTimeout(() => setError(""), 3000);
        }
      } catch (err) {
        console.error("Error deleting category:", err);
        setError("Failed to delete category. Please try again.");
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      console.log("Toggling category status:", id, "from", currentActive, "to", !currentActive);
      const response = await categoryAPI.updateCategory(id, {
        isActive: !currentActive,
      });
      
      if (response && response.success) {
        // Update category in state
        setCategories(prevCategories => {
          const updateCategoryInTree = (catList) => {
            return catList.map((category) => {
              if (category._id === id || category.id === id) {
                return { ...category, isActive: !currentActive };
              }
              if (category.children) {
                return {
                  ...category,
                  children: updateCategoryInTree(category.children),
                };
              }
              return category;
            });
          };
          return updateCategoryInTree([...prevCategories]);
        });
        
        setSuccess(
          `Category ${
            !currentActive ? "activated" : "deactivated"
          } successfully!`
        );
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response?.message || "Failed to update category");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      console.error("Error toggling category status:", err);
      setError("Failed to update category. Please try again.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleSelectCategory = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === filteredCategories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(filteredCategories.map((cat) => cat._id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedCategories.length === 0) {
      setError("Please select categories and choose an action");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      let successMessage = "";
      
      switch (bulkAction) {
        case "activate":
          await Promise.all(
            selectedCategories.map((id) =>
              categoryAPI.updateCategory(id, { isActive: true })
            )
          );
          successMessage = `${selectedCategories.length} categories activated`;
          break;

        case "deactivate":
          await Promise.all(
            selectedCategories.map((id) =>
              categoryAPI.updateCategory(id, { isActive: false })
            )
          );
          successMessage = `${selectedCategories.length} categories deactivated`;
          break;

        case "delete":
          if (window.confirm(`Delete ${selectedCategories.length} categories? This action cannot be undone.`)) {
            await Promise.all(
              selectedCategories.map((id) => categoryAPI.deleteCategory(id))
            );
            successMessage = `${selectedCategories.length} categories deleted`;
          } else {
            return;
          }
          break;

        case "export":
          exportCategories();
          return;
          
        default:
          setError("Invalid bulk action selected");
          setTimeout(() => setError(""), 3000);
          return;
      }

      // Refresh categories after bulk action
      await fetchAllCategories();
      setSelectedCategories([]);
      setBulkAction("");
      setSuccess(successMessage);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error performing bulk action:", err);
      setError("Failed to perform bulk action. Please try again.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const exportCategories = () => {
    if (!Array.isArray(filteredCategories) || filteredCategories.length === 0) {
      setError("No categories to export");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const dataToExport = filteredCategories
      .filter(
        (cat) =>
          selectedCategories.includes(cat._id) ||
          selectedCategories.length === 0
      )
      .map((cat) => ({
        Name: cat.name || "",
        Description: cat.description || "",
        "Product Count": cat.productCount || 0,
        Status: cat.isActive ? "Active" : "Inactive",
        "Created Date": cat.createdAt ? new Date(cat.createdAt).toLocaleDateString() : "",
        "Has Image": cat.image ? "Yes" : "No",
      }));

    if (dataToExport.length === 0) {
      setError("No data to export");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const csv = [
      Object.keys(dataToExport[0]).join(","),
      ...dataToExport.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `categories-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setSuccess(`Exported ${dataToExport.length} categories`);
    setTimeout(() => setSuccess(""), 3000);
  };

  const toggleExpandCategory = (id) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCategories.slice(startIndex, endIndex);
  }, [filteredCategories, currentPage, itemsPerPage]);

  const renderCategoryTree = (categoryList, level = 0) => {
    if (!Array.isArray(categoryList) || categoryList.length === 0) return null;

    return categoryList.map((category) => (
      <div key={category._id} className="space-y-2">
        <div
          className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
            selectedCategories.includes(category._id)
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div style={{ paddingLeft: `${level * 24}px` }} className="flex items-center gap-2 flex-1 min-w-0">
              {category.hasChildren && (
                <button
                  onClick={() => toggleExpandCategory(category._id)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                >
                  {expandedCategories.has(category._id) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              )}
              {!category.hasChildren && <div className="w-6"></div>}
              
              <button
                onClick={() => handleSelectCategory(category._id)}
                className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
              >
                {selectedCategories.includes(category._id) ? (
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                ) : (
                  <Square className="w-4 h-4 text-gray-400" />
                )}
              </button>
              
              {/* Category Image */}
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                {category.image ? (
                  <img
                    src={categoryAPI.getImageUrl ? categoryAPI.getImageUrl(category.image) : category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      const fallbackDiv = document.createElement("div");
                      fallbackDiv.className = `w-full h-full rounded flex items-center justify-center ${
                        category.isActive
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`;
                      fallbackDiv.innerHTML = `
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                        </svg>
                      `;
                      e.target.parentNode.appendChild(fallbackDiv);
                    }}
                  />
                ) : (
                  <div
                    className={`w-full h-full flex items-center justify-center ${
                      category.isActive
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <FolderTree className="w-4 h-4" />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col min-w-0">
                <span className="font-medium text-gray-900 truncate">
                  {category.name}
                </span>
                {category.description && (
                  <span className="text-sm text-gray-500 truncate">
                    {category.description}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="ml-auto flex items-center gap-3 flex-shrink-0">
            <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full whitespace-nowrap">
              {category.productCount || 0} products
            </span>
            <div className="flex items-center gap-2">
              <Link
                to={`/admin/categories/edit/${category._id}`}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </Link>
              <button
                onClick={() =>
                  handleToggleActive(category._id, category.isActive)
                }
                className={`p-2 rounded-lg transition-colors ${
                  category.isActive
                    ? "text-green-600 hover:bg-green-50"
                    : "text-red-600 hover:bg-red-50"
                }`}
                title={category.isActive ? "Deactivate" : "Activate"}
              >
                {category.isActive ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {category.children &&
          category.children.length > 0 &&
          expandedCategories.has(category._id) &&
          renderCategoryTree(category.children, level + 1)}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admin
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Categories Management</h1>
              <p className="text-gray-600">Manage your product categories</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={exportCategories}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={fetchAllCategories}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <Link
                to="/admin/categories/new"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Category
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Categories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-2 flex gap-2">
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                {stats.active} active
              </span>
              <span className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                {stats.inactive} inactive
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Categories</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.active}
                </p>
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">With Products</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.withProducts}
                </p>
              </div>
              <Layers className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.total > 0 ? Math.round((stats.withProducts / stats.total) * 100) : 0}% have products
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sub-categories</p>
                <p className="text-2xl font-bold text-amber-600">
                  {stats.nested}
                </p>
              </div>
              <FolderTree className="w-8 h-8 text-amber-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.total > 0 ? Math.round((stats.nested / stats.total) * 100) : 0}% are nested
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError("")}
              className="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>{success}</span>
            </div>
            <button
              onClick={() => setSuccess("")}
              className="mt-2 text-sm text-green-600 hover:text-green-800"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search categories by name or description..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Filter & Sort */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowInactive(!showInactive)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    showInactive
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  }`}
                >
                  {showInactive ? "All" : "Active Only"}
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name">Sort by Name</option>
                  <option value="productCount">Sort by Product Count</option>
                  <option value="createdAt">Sort by Date Added</option>
                </select>
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title={sortOrder === "asc" ? "Sort Descending" : "Sort Ascending"}
                >
                  {sortOrder === "asc" ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                title="Grid View"
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                title="List View"
              >
                <ListTree className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("tree")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "tree"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                title="Tree View"
              >
                <FolderTree className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedCategories.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSelectAll}
                    className="p-1 hover:bg-blue-100 rounded transition-colors"
                    title={
                      selectedCategories.length === filteredCategories.length
                        ? "Deselect All"
                        : "Select All"
                    }
                  >
                    {selectedCategories.length === filteredCategories.length ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <span className="font-medium text-blue-800">
                    {selectedCategories.length} category(ies) selected
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Bulk Actions</option>
                    <option value="activate">Activate Selected</option>
                    <option value="deactivate">Deactivate Selected</option>
                    <option value="delete">Delete Selected</option>
                    <option value="export">Export Selected</option>
                  </select>
                  <button
                    onClick={handleBulkAction}
                    disabled={!bulkAction}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => setSelectedCategories([])}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {viewMode === "tree" ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Category Tree View
                </h2>
                <p className="text-sm text-gray-600">
                  Click arrows to expand/collapse categories
                </p>
              </div>
              <button
                onClick={() => {
                  setExpandedCategories(new Set());
                }}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Collapse All
              </button>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {categories.length > 0 ? (
                renderCategoryTree(categories)
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FolderTree className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No categories found. Add your first category!</p>
                  <Link
                    to="/admin/categories/new"
                    className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Add Category
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Categories Display */}
            {filteredCategories.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <FolderTree className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No categories found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filters
                </p>
                <Link
                    to="/admin/categories/new"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Add Category
                  </Link>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedCategories.map((category) => (
                  <div
                    key={category._id}
                    className={`bg-white rounded-lg border hover:shadow-md transition-all duration-200 ${
                      selectedCategories.includes(category._id)
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <button
                            onClick={() => handleSelectCategory(category._id)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                            title={
                              selectedCategories.includes(category._id)
                                ? "Deselect"
                                : "Select"
                            }
                          >
                            {selectedCategories.includes(category._id) ? (
                              <CheckSquare className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          {/* Category Image */}
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            {category.image ? (
                              <img
                                src={categoryAPI.getImageUrl ? categoryAPI.getImageUrl(category.image) : category.image}
                                alt={category.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  const fallbackDiv = document.createElement("div");
                                  fallbackDiv.className = "w-full h-full bg-blue-100 flex items-center justify-center";
                                  fallbackDiv.innerHTML = `
                                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                                    </svg>
                                  `;
                                  e.target.parentNode.appendChild(fallbackDiv);
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                                <FolderTree className="w-6 h-6 text-blue-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {category.name}
                              </h3>
                              {category.level > 0 && (
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded whitespace-nowrap">
                                  Level {category.level}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {category.productCount || 0} products
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handleToggleActive(category._id, category.isActive)
                          }
                          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                            category.isActive
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }`}
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </button>
                      </div>

                      {category.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {category.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/admin/categories/edit/${category._id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(category._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <Link
                          to={`/shop?category=${category._id}`}
                          className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          View Products →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List View
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="pl-6 pr-3 py-3 text-left">
                          <button
                            onClick={handleSelectAll}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title={
                              selectedCategories.length === filteredCategories.length
                                ? "Deselect All"
                                : "Select All"
                            }
                          >
                            {selectedCategories.length === filteredCategories.length ? (
                              <CheckSquare className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Products
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Level
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedCategories.map((category) => (
                        <tr
                          key={category._id}
                          className={`hover:bg-gray-50 transition-colors ${
                            selectedCategories.includes(category._id)
                              ? "bg-blue-50"
                              : ""
                          }`}
                        >
                          <td className="pl-6 pr-3 py-4">
                            <button
                              onClick={() => handleSelectCategory(category._id)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                              {selectedCategories.includes(category._id) ? (
                                <CheckSquare className="w-5 h-5 text-blue-600" />
                              ) : (
                                <Square className="w-5 h-5 text-gray-400" />
                              )}
                            </button>
                          </td>
                          <td className="px-3 py-4">
                            <div className="flex items-center gap-3">
                              {/* Category Image */}
                              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                {category.image ? (
                                  <img
                                    src={categoryAPI.getImageUrl ? categoryAPI.getImageUrl(category.image) : category.image}
                                    alt={category.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <div
                                    className={`w-full h-full flex items-center justify-center ${
                                      category.isActive
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    <FolderTree className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {category.name}
                                </div>
                                {category.description && (
                                  <div className="text-sm text-gray-500 truncate max-w-xs">
                                    {category.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              {category.productCount || 0}
                            </span>
                          </td>
                          <td className="px-3 py-4">
                            <button
                              onClick={() =>
                                handleToggleActive(
                                  category._id,
                                  category.isActive
                                )
                              }
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                category.isActive
                                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                                  : "bg-red-100 text-red-800 hover:bg-red-200"
                              }`}
                            >
                              {category.isActive ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="px-3 py-4">
                            <span className="text-sm text-gray-600">
                              {category.level || 0}
                            </span>
                          </td>
                          <td className="px-3 py-4">
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/admin/categories/edit/${category._id}`}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleDelete(category._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination */}
            {filteredCategories.length > itemsPerPage && (
              <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredCategories.length)} to{" "}
                      {Math.min(currentPage * itemsPerPage, filteredCategories.length)} of {filteredCategories.length} categories
                    </span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="12">12 per page</option>
                      <option value="24">24 per page</option>
                      <option value="48">48 per page</option>
                      <option value="96">96 per page</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Previous Page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-lg font-medium transition-colors ${
                            currentPage === pageNum
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Next Page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Categories;