// src/pages/admin/CategoryForm.js - FIXED VERSION WITH PROPER parentCategory HANDLING
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { categoryAPI, productAPI, getImageUrl } from "../../services/api";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle,
  FolderTree,
  ChevronDown,
  ChevronUp,
  Upload,
  X,
  Image as ImageIcon,
  Camera,
  Trash2,
  Package,
  Link as LinkIcon,
  ExternalLink,
  Plus,
  Search,
  Loader2,
  Edit,
  Check,
  XCircle,
  RefreshCw,
  Star,
  TrendingUp,
  Clock,
  BarChart3,
  DollarSign,
  Eye,
  Grid3x3,
  List,
} from "lucide-react";

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const fileInputRef = useRef(null);
  const searchInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [allCategories, setAllCategories] = useState([]);
  const [showParentDropdown, setShowParentDropdown] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showImageRemoveConfirm, setShowImageRemoveConfirm] = useState(false);

  // Product linking states
  const [linkedProducts, setLinkedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingAllProducts, setLoadingAllProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [productFilter, setProductFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showLinkProductsModal, setShowLinkProductsModal] = useState(false);
  const [linkingProducts, setLinkingProducts] = useState(false);
  const [unlinkingProducts, setUnlinkingProducts] = useState(false);

  const [productStats, setProductStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    featured: 0,
    outOfStock: 0,
    lowStock: 0,
    totalValue: 0,
    avgPrice: 0,
  });

  const [category, setCategory] = useState({
    name: "",
    description: "",
    isActive: true,
    parentCategory: null,
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    order: 0,
    image: "",
  });

  // Initial data loading
  useEffect(() => {
    if (isEditMode) {
      fetchCategory();
      fetchLinkedProducts();
    }
    fetchAllCategories();
  }, [id]);

  // Fetch all products when modal opens
  useEffect(() => {
    if (showLinkProductsModal && allProducts.length === 0) {
      fetchAllProducts();
    }
  }, [showLinkProductsModal]);

  // Update filtered products when filters change
  useEffect(() => {
    if (showLinkProductsModal) {
      filterProducts();
    }
  }, [searchQuery, productFilter, sortBy, sortOrder, allProducts, showLinkProductsModal]);

  // Filter products for linking modal
  const filterProducts = () => {
    try {
      let filtered = [...allProducts];
      
      // Filter out already linked products
      if (linkedProducts.length > 0) {
        const linkedProductIds = new Set(linkedProducts.map(p => p._id));
        filtered = filtered.filter(product => !linkedProductIds.has(product._id));
      }
      
      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(product => {
          const matchesName = product.name?.toLowerCase().includes(query);
          const matchesSKU = product.sku?.toLowerCase().includes(query);
          const matchesDescription = product.description?.toLowerCase().includes(query);
          return matchesName || matchesSKU || matchesDescription;
        });
      }
      
      // Apply status filter
      if (productFilter !== "all") {
        filtered = filtered.filter(product => {
          if (!product) return false;
          
          switch(productFilter) {
            case "active": 
              return product.isActive === true;
            case "inactive": 
              return product.isActive === false;
            case "featured": 
              return product.featured === true;
            case "lowStock": 
              return product.stock > 0 && product.stock <= 10;
            case "outOfStock": 
              return product.stock === 0;
            default: 
              return true;
          }
        });
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        switch(sortBy) {
          case "price":
            aValue = a.price || 0;
            bValue = b.price || 0;
            break;
          case "stock":
            aValue = a.stock || 0;
            bValue = b.stock || 0;
            break;
          case "date":
            aValue = new Date(a.createdAt || 0);
            bValue = new Date(b.createdAt || 0);
            break;
          case "name":
          default:
            aValue = a.name?.toLowerCase() || "";
            bValue = b.name?.toLowerCase() || "";
            break;
        }
        
        if (sortOrder === "desc") {
          return aValue < bValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
      
      setFilteredProducts(filtered);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error filtering products:", err);
      setFilteredProducts([]);
    }
  };

  // Fetch category details
  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getCategoryById(id);

      if (response?.success && response.category) {
        const categoryData = response.category;
        
        setCategory({
          name: categoryData.name || "",
          description: categoryData.description || "",
          isActive: categoryData.isActive !== undefined ? categoryData.isActive : true,
          parentCategory: categoryData.parentCategory || null,
          seoTitle: categoryData.seoTitle || "",
          seoDescription: categoryData.seoDescription || "",
          seoKeywords: categoryData.seoKeywords || "",
          order: categoryData.order || 0,
          image: categoryData.image || "",
        });

        // Set image preview
        if (categoryData.image) {
          const fullImageUrl = getImageUrl(categoryData.image, "categories");
          setImagePreview(fullImageUrl || "");
        } else {
          setImagePreview("");
        }
      } else {
        setError(response?.message || "Failed to load category");
      }
    } catch (err) {
      console.error("Error fetching category:", err);
      setError(`Failed to load category: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all categories for parent selection
  const fetchAllCategories = async () => {
    try {
      const response = await categoryAPI.getAllCategories();
      
      if (response?.success && response.categories) {
        const filteredCategories = response.categories.filter(cat => cat._id !== id);
        setAllCategories(filteredCategories);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setAllCategories([]);
    }
  };

  // Fetch all products for linking
  const fetchAllProducts = async () => {
    try {
      setLoadingAllProducts(true);
      
      const response = await productAPI.getAllProducts({ limit: 1000 });
      
      if (response?.success && response.products) {
        setAllProducts(response.products || []);
        setFilteredProducts(response.products || []);
      } else {
        setAllProducts([]);
        setFilteredProducts([]);
      }
    } catch (err) {
      console.error("Error fetching all products:", err);
      setAllProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoadingAllProducts(false);
    }
  };

  // Fetch products linked to this category
  const fetchLinkedProducts = async () => {
    if (!id) return;
    
    try {
      setLoadingProducts(true);
      
      const response = await productAPI.getProductsByCategory(id, { limit: 1000 });
      
      if (response?.success && response.products) {
        setLinkedProducts(response.products);
        
        // Calculate stats
        const total = response.products.length;
        const active = response.products.filter(p => p.isActive).length;
        const inactive = response.products.filter(p => !p.isActive).length;
        const featured = response.products.filter(p => p.featured).length;
        const outOfStock = response.products.filter(p => p.stock === 0).length;
        const lowStock = response.products.filter(p => p.stock > 0 && p.stock <= 10).length;
        const totalValue = response.products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);
        const avgPrice = total > 0 ? response.products.reduce((sum, p) => sum + (p.price || 0), 0) / total : 0;
        
        setProductStats({
          total,
          active,
          inactive,
          featured,
          outOfStock,
          lowStock,
          totalValue,
          avgPrice,
        });
      } else {
        setLinkedProducts([]);
      }
    } catch (err) {
      console.error("Error fetching linked products:", err);
      setLinkedProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Handle product search
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  // Handle product selection
  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const selectAllProducts = () => {
    const currentPageProductIds = currentProducts.map(p => p._id);
    if (selectedProducts.length === currentPageProductIds.length) {
      setSelectedProducts(prev => prev.filter(id => !currentPageProductIds.includes(id)));
    } else {
      setSelectedProducts(prev => {
        const newSelection = [...prev];
        currentPageProductIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  // Link products to category
  const linkProductsToCategory = async (productIds) => {
    if (!id || !productIds.length) return;
    
    try {
      setLinkingProducts(true);
      setError("");
      setSuccess("");
      
      const updatePromises = productIds.map(async (productId) => {
        try {
          const productToUpdate = allProducts.find(p => p._id === productId);
          if (!productToUpdate) return { success: false, productId };
          
          const updateData = {
            ...productToUpdate,
            category: id,
          };
          
          const response = await productAPI.updateProduct(productId, updateData);
          return { success: true, productId, response };
        } catch (err) {
          console.error(`Error updating product ${productId}:`, err);
          return { success: false, productId, error: err.message };
        }
      });
      
      const results = await Promise.allSettled(updatePromises);
      
      const successful = results.filter(r => 
        r.status === 'fulfilled' && r.value.success
      ).length;
      
      const failed = results.filter(r => 
        r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)
      ).length;
      
      // Refresh data
      await fetchLinkedProducts();
      await fetchAllProducts();
      
      if (successful > 0) {
        setSuccess(`${successful} product(s) linked to category successfully!`);
      }
      
      if (failed > 0) {
        setError(`${failed} product(s) failed to link. Please try again.`);
      }
      
      setSelectedProducts([]);
      setShowLinkProductsModal(false);
      setSearchQuery("");
      
      setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
    } catch (err) {
      console.error("Error linking products:", err);
      setError("Failed to link products. Please try again.");
    } finally {
      setLinkingProducts(false);
    }
  };

  // Unlink products from category
  const unlinkProductsFromCategory = async (productIds) => {
    if (!id || !productIds.length) return;
    
    try {
      setUnlinkingProducts(true);
      setError("");
      setSuccess("");
      
      const updatePromises = productIds.map(async (productId) => {
        try {
          const productToUpdate = allProducts.find(p => p._id === productId);
          if (!productToUpdate) return { success: false, productId };
          
          const updateData = {
            ...productToUpdate,
            category: null
          };
          
          const response = await productAPI.updateProduct(productId, updateData);
          return { success: true, productId, response };
        } catch (err) {
          console.error(`Error updating product ${productId}:`, err);
          return { success: false, productId, error: err.message };
        }
      });
      
      const results = await Promise.allSettled(updatePromises);
      
      const successful = results.filter(r => 
        r.status === 'fulfilled' && r.value.success
      ).length;
      
      const failed = results.filter(r => 
        r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)
      ).length;
      
      // Refresh data
      await fetchLinkedProducts();
      await fetchAllProducts();
      
      if (successful > 0) {
        setSuccess(`${successful} product(s) unlinked from category successfully!`);
      }
      
      if (failed > 0) {
        setError(`${failed} product(s) failed to unlink. Please try again.`);
      }
      
      setSelectedProducts([]);
      
      setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
    } catch (err) {
      console.error("Error unlinking products:", err);
      setError("Failed to unlink products. Please try again.");
    } finally {
      setUnlinkingProducts(false);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Format price
  const formatPrice = (price) => {
    if (!price && price !== 0) return "₱0.00";
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  // Get product image URL
  const getProductImageUrl = (product) => {
    if (!product?.images || !Array.isArray(product.images) || product.images.length === 0) {
      return "/placeholder.jpg";
    }
    
    const imageUrl = product.images[0];
    return getImageUrl(imageUrl, "products") || "/placeholder.jpg";
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCategory({
      ...category,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseInt(value) || 0
          : value,
    });

    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: "",
      });
    }
    setError("");
  };

  const handleSelectParent = (parentId) => {
    setCategory({
      ...category,
      parentCategory: parentId === category.parentCategory ? null : parentId,
    });
    setShowParentDropdown(false);
    setError("");
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset errors
    setError("");
    setValidationErrors({});

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];

    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPEG, PNG, WebP, GIF, or SVG)");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Set the file
    setImageFile(file);
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setImageFile(null);
    setCategory(prev => ({
      ...prev,
      image: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setShowImageRemoveConfirm(false);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!category.name.trim()) {
      errors.name = "Category name is required";
    } else if (category.name.trim().length > 100) {
      errors.name = "Category name cannot exceed 100 characters";
    }

    if (category.description.length > 500) {
      errors.description = "Description cannot exceed 500 characters";
    }

    if (category.seoTitle.length > 60) {
      errors.seoTitle = "SEO title cannot exceed 60 characters";
    }

    if (category.seoDescription.length > 160) {
      errors.seoDescription = "SEO description cannot exceed 160 characters";
    }

    if (category.seoKeywords.length > 200) {
      errors.seoKeywords = "SEO keywords cannot exceed 200 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ========== FIXED: Handle form submission - PROPERLY FIXED VERSION ==========
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setValidationErrors({});

    if (!validateForm()) {
      const firstError = Object.keys(validationErrors)[0];
      if (firstError) {
        const element = document.querySelector(`[name="${firstError}"]`);
        if (element) {
          element.focus();
        }
      }
      return;
    }

    setSaving(true);

    try {
      let response;
      
      if (imageFile) {
        // Use FormData for file upload
        const formData = new FormData();

        // Append all category data
        formData.append('name', category.name.trim());
        formData.append('description', category.description.trim());
        formData.append('isActive', category.isActive.toString());
        formData.append('order', (category.order || 0).toString());
        formData.append('seoTitle', category.seoTitle.trim());
        formData.append('seoDescription', category.seoDescription.trim());
        formData.append('seoKeywords', category.seoKeywords.trim());
        
        // FIXED: Only append parentCategory if it exists and is a string
        if (category.parentCategory && typeof category.parentCategory === 'string' && category.parentCategory.trim() !== '') {
          formData.append('parentCategory', category.parentCategory);
        }
        
        // Append image
        formData.append("image", imageFile);

        if (isEditMode) {
          response = await categoryAPI.updateCategory(id, formData);
        } else {
          response = await categoryAPI.createCategory(formData);
        }
      } else {
        // Use regular JSON for non-image updates
        const categoryData = {
          name: category.name.trim(),
          description: category.description.trim(),
          isActive: category.isActive,
          order: category.order || 0,
          seoTitle: category.seoTitle.trim(),
          seoDescription: category.seoDescription.trim(),
          seoKeywords: category.seoKeywords.trim(),
        };

        // FIXED: Only add parentCategory if it exists and is a valid string
        if (category.parentCategory && typeof category.parentCategory === 'string' && category.parentCategory.trim() !== '') {
          categoryData.parentCategory = category.parentCategory;
        }

        // If editing and there's existing image, include it
        if (isEditMode && category.image && !imageFile) {
          categoryData.image = category.image;
        }

        if (isEditMode) {
          response = await categoryAPI.updateCategory(id, categoryData);
        } else {
          response = await categoryAPI.createCategory(categoryData);
        }
      }

      if (response?.success) {
        const successMessage = isEditMode
          ? "Category updated successfully!"
          : "Category created successfully!";

        setSuccess(successMessage);

        // Navigate back after a delay
        setTimeout(() => {
          navigate("/admin/categories", {
            state: {
              success: successMessage,
              timestamp: Date.now(),
            },
          });
        }, 1500);
      } else {
        const errorMessage =
          response?.message || "Unknown error occurred";

        if (errorMessage.toLowerCase().includes("required") && errorMessage.toLowerCase().includes("name")) {
          setValidationErrors({ name: "Category name is required" });
        } else if (errorMessage.toLowerCase().includes("unique") || errorMessage.toLowerCase().includes("exists")) {
          setValidationErrors({ name: "Category name already exists" });
        } else {
          setError(errorMessage);
        }
      }
    } catch (err) {
      console.error("❌ Error saving category:", err);
      let errorMsg = "Failed to save category. Please try again.";

      if (err.message) {
        errorMsg = err.message;
      }

      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }

      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };
  // ========== END OF FIXED SUBMISSION FUNCTION ==========

  // Navigate to view all products in this category
  const viewAllProducts = () => {
    navigate(`/admin/products?category=${id}`);
  };

  // Navigate to create a new product in this category
  const createProductInCategory = () => {
    navigate(`/admin/products/new?category=${id}`);
  };

  const flattenCategoriesForSelect = (categories, level = 0) => {
    if (!Array.isArray(categories)) return [];

    let flatList = [];

    categories.forEach((cat) => {
      if (cat._id !== id) {
        flatList.push({
          ...cat,
          level,
          disabled: false,
        });

        if (cat.children && cat.children.length > 0) {
          flatList = flatList.concat(
            flattenCategoriesForSelect(cat.children, level + 1)
          );
        }
      }
    });

    return flatList;
  };

  const getParentCategoryName = () => {
    if (!category.parentCategory) return "None (Root Category)";

    const findCategory = (categories, id) => {
      if (!Array.isArray(categories)) return null;

      for (const cat of categories) {
        if (cat._id === id) return cat.name;
        if (cat.children) {
          const found = findCategory(cat.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    return findCategory(allCategories, category.parentCategory) || "Unknown";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading category...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin/categories")}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Categories
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? "Edit Category" : "Add New Category"}
              </h1>
              <p className="text-gray-600">
                {isEditMode
                  ? "Update your product category details and linked products"
                  : "Create a new product category"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/admin/categories")}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="categoryForm"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEditMode ? "Update Category" : "Create Category"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Error</span>
              <button
                onClick={() => setError("")}
                className="ml-auto text-sm text-red-600 hover:text-red-800"
              >
                Dismiss
              </button>
            </div>
            <div className="mt-2 text-sm text-red-600">{error}</div>
            {Object.keys(validationErrors).length > 0 && (
              <ul className="mt-2 text-sm text-red-600 space-y-1">
                {Object.entries(validationErrors).map(
                  ([field, errorMsg]) =>
                    errorMsg && (
                      <li key={field} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
                        <span>{errorMsg}</span>
                      </li>
                    )
                )}
              </ul>
            )}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          </div>
        )}

        {/* Product Linking Section (Only in Edit Mode) */}
        {isEditMode && (
          <div className="mb-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <LinkIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Linked Products Management
                  </h2>
                  <p className="text-sm text-gray-600">
                    Manage products associated with this category
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    fetchLinkedProducts();
                    fetchAllProducts();
                    setSuccess("Products refreshed!");
                    setTimeout(() => setSuccess(""), 2000);
                  }}
                  className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  title="Refresh products"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                <button
                  onClick={() => {
                    setShowLinkProductsModal(true);
                    setTimeout(() => {
                      if (searchInputRef.current) {
                        searchInputRef.current.focus();
                      }
                    }, 100);
                  }}
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Link Products
                </button>
                <button
                  onClick={createProductInCategory}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <Package className="w-4 h-4" />
                  Add New Product
                </button>
                <button
                  onClick={viewAllProducts}
                  className="inline-flex items-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  View All
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Product Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-xl font-bold text-gray-900">
                      {productStats.total}
                    </p>
                  </div>
                  <Package className="w-6 h-6 text-gray-500" />
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600">Active</p>
                    <p className="text-xl font-bold text-green-700">
                      {productStats.active}
                    </p>
                  </div>
                  <Check className="w-6 h-6 text-green-500" />
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600">Featured</p>
                    <p className="text-xl font-bold text-yellow-700">
                      {productStats.featured}
                    </p>
                  </div>
                  <Star className="w-6 h-6 text-yellow-500" />
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600">Out of Stock</p>
                    <p className="text-xl font-bold text-red-700">
                      {productStats.outOfStock}
                    </p>
                  </div>
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600">Low Stock</p>
                    <p className="text-xl font-bold text-orange-700">
                      {productStats.lowStock}
                    </p>
                  </div>
                  <TrendingUp className="w-6 h-6 text-orange-500" />
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600">Inactive</p>
                    <p className="text-xl font-bold text-blue-700">
                      {productStats.inactive}
                    </p>
                  </div>
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600">Total Value</p>
                    <p className="text-xl font-bold text-purple-700">
                      ₱{(productStats.totalValue || 0).toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-6 h-6 text-purple-500" />
                </div>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-indigo-600">Avg Price</p>
                    <p className="text-xl font-bold text-indigo-700">
                      ₱{(productStats.avgPrice || 0).toFixed(2)}
                    </p>
                  </div>
                  <BarChart3 className="w-6 h-6 text-indigo-500" />
                </div>
              </div>
            </div>

            {/* Products Display */}
            {loadingProducts ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading products...</p>
              </div>
            ) : linkedProducts.length > 0 ? (
              <>
                {/* View Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 ${viewMode === "grid" ? "bg-blue-50 text-blue-600" : "bg-white text-gray-600"}`}
                      >
                        <Grid3x3 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 ${viewMode === "list" ? "bg-blue-50 text-blue-600" : "bg-white text-gray-600"}`}
                      >
                        <List className="w-5 h-5" />
                      </button>
                    </div>
                    <span className="text-sm text-gray-600">
                      Showing {linkedProducts.length} product(s)
                    </span>
                  </div>
                </div>

                {/* Grid View */}
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {linkedProducts.map((product) => (
                      <div key={product._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                        <div className="relative">
                          {/* Product Image */}
                          <div className="aspect-square bg-gray-100 overflow-hidden">
                            <img
                              src={getProductImageUrl(product)}
                              alt={product.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.src = "/placeholder.jpg";
                              }}
                            />
                          </div>
                          
                          {/* Status Badges */}
                          <div className="absolute top-3 right-3 flex flex-col gap-1">
                            {product.featured && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                              </span>
                            )}
                            {product.isActive ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Check className="w-3 h-3 mr-1" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <XCircle className="w-3 h-3 mr-1" />
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Product Info */}
                        <div className="p-4">
                          <div className="mb-3">
                            <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                            <p className="text-sm text-gray-500 truncate">{product.sku || "No SKU"}</p>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold text-gray-900">
                                {formatPrice(product.price)}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                product.stock > 10 
                                  ? "bg-green-100 text-green-800"
                                  : product.stock > 0
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}>
                                {product.stock || 0} in stock
                              </span>
                            </div>
                            
                            {product.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {product.description}
                              </p>
                            )}
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                              className="flex-1 inline-flex items-center justify-center gap-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => unlinkProductsFromCategory([product._id])}
                              className="flex-1 inline-flex items-center justify-center gap-1 bg-red-50 text-red-700 px-3 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors"
                            >
                              <X className="w-4 h-4" />
                              Unlink
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* List View */
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Product</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Price</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Stock</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {linkedProducts.map((product) => (
                          <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                  <img
                                    src={getProductImageUrl(product)}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.src = "/placeholder.jpg";
                                    }}
                                  />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{product.name}</p>
                                  <p className="text-sm text-gray-500">{product.sku || "No SKU"}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <span className="font-medium text-gray-900">
                                  {formatPrice(product.price)}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                product.stock > 10 
                                  ? "bg-green-100 text-green-800"
                                  : product.stock > 0
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}>
                                {product.stock || 0} in stock
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col gap-1">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  product.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}>
                                  {product.isActive ? "Active" : "Inactive"}
                                </span>
                                {product.featured && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Featured
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                                  className="text-gray-600 hover:text-gray-700 p-1"
                                  title="Edit Product"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => unlinkProductsFromCategory([product._id])}
                                  className="text-red-600 hover:text-red-700 p-1"
                                  title="Unlink from Category"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products linked yet</h3>
                <p className="text-gray-600 mb-6">Start by linking products to this category</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => {
                      setShowLinkProductsModal(true);
                      setTimeout(() => {
                        if (searchInputRef.current) {
                          searchInputRef.current.focus();
                        }
                      }, 100);
                    }}
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Link Existing Products
                  </button>
                  <button
                    onClick={createProductInCategory}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Product
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Category Form */}
        <form id="categoryForm" onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <ImageIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Category Image
                </h2>
                <p className="text-sm text-gray-600">
                  Upload a representative image for this category
                </p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Image Preview Section */}
              <div className="lg:w-1/3">
                <div className="space-y-4">
                  <div
                    className={`aspect-square rounded-xl border-2 ${
                      imagePreview
                        ? "border-gray-200"
                        : "border-dashed border-gray-300 hover:border-blue-400"
                    } overflow-hidden bg-gray-50 transition-all duration-300 cursor-pointer group`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <div className="relative w-full h-full">
                        <img
                          src={imagePreview}
                          alt="Category preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error("Image failed to load:", e);
                            e.target.style.display = "none";
                            const fallback = document.createElement("div");
                            fallback.className =
                              "w-full h-full bg-blue-100 flex items-center justify-center";
                            fallback.innerHTML = `
                              <div class="text-center">
                                <svg class="w-16 h-16 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                                </svg>
                                <p class="text-sm text-blue-800">Image failed to load</p>
                              </div>
                            `;
                            e.target.parentNode.appendChild(fallback);
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Camera className="w-10 h-10 text-white" />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowImageRemoveConfirm(true);
                          }}
                          className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                          <Upload className="w-8 h-8 text-blue-400" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">
                            Click to upload image
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, WebP up to 5MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {imagePreview && (
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setShowImageRemoveConfirm(true)}
                        className="text-sm text-red-600 hover:text-red-700 inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove Image
                      </button>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              {/* Image Info Section */}
              <div className="lg:w-2/3 space-y-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-2">
                    Image Requirements
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>
                        Recommended size: 600×600 pixels (1:1 aspect ratio)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Supported formats: JPEG, PNG, WebP, GIF, SVG</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Maximum file size: 5MB</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>
                        Image will be displayed on category cards and pages
                      </span>
                    </li>
                  </ul>
                </div>

                {imageFile && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-green-800">
                            Image Ready
                          </p>
                          <p className="text-sm text-green-700">
                            {imageFile.name}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                        {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Basic Information Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FolderTree className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Category Information
                </h2>
                <p className="text-sm text-gray-600">
                  Enter basic details about the category
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Category Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={category.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    validationErrors.name
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="e.g., Electronics, Clothing, Home Decor"
                  required
                  maxLength={100}
                />
                <div className="flex justify-between items-center mt-2">
                  {validationErrors.name ? (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.name}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      This will be displayed as the category title
                    </p>
                  )}
                  <span className="text-xs text-gray-500">
                    {category.name.length}/100
                  </span>
                </div>
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={category.description}
                  onChange={handleChange}
                  rows="4"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    validationErrors.description
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="Describe what products this category contains..."
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-2">
                  {validationErrors.description ? (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.description}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Optional. Brief description for users
                    </p>
                  )}
                  <span className="text-xs text-gray-500">
                    {category.description.length}/500
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Parent Category Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Category
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowParentDropdown(!showParentDropdown)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left bg-white flex items-center justify-between hover:border-gray-400 transition-colors"
                    >
                      <span className="truncate text-gray-700">
                        {getParentCategoryName()}
                      </span>
                      {showParentDropdown ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>

                    {showParentDropdown && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowParentDropdown(false)}
                        />
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                          <div className="p-2 space-y-1">
                            <button
                              type="button"
                              onClick={() => handleSelectParent(null)}
                              className={`w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                                !category.parentCategory
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "text-gray-700"
                              }`}
                            >
                              <div className="font-medium">
                                None (Root Category)
                              </div>
                              <div className="text-xs text-gray-500">
                                Create as top-level category
                              </div>
                            </button>
                            {flattenCategoriesForSelect(allCategories).map(
                              (cat) => (
                                <button
                                  key={cat._id}
                                  type="button"
                                  onClick={() => handleSelectParent(cat._id)}
                                  disabled={cat.disabled}
                                  className={`w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                                    category.parentCategory === cat._id
                                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                                      : "text-gray-700"
                                  } ${
                                    cat.disabled
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                  style={{
                                    paddingLeft: `${cat.level * 24 + 16}px`,
                                  }}
                                >
                                  <div className="font-medium">{cat.name}</div>
                                  {cat.description && (
                                    <div className="text-xs text-gray-500 truncate">
                                      {cat.description}
                                    </div>
                                  )}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Select a parent category to create a sub-category
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Order Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      name="order"
                      value={category.order}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors hover:border-gray-400"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Lower numbers appear first
                    </p>
                  </div>

                  {/* Status Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={category.isActive}
                        onChange={handleChange}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div>
                        <label
                          htmlFor="isActive"
                          className="block text-sm font-medium text-gray-900"
                        >
                          Active
                        </label>
                        <p className="text-xs text-gray-500">
                          {category.isActive
                            ? "Visible to customers"
                            : "Hidden from store"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SEO Information Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                SEO Settings
              </h2>
              <p className="text-sm text-gray-600">
                Optimize this category for search engines
              </p>
            </div>

            <div className="space-y-6">
              {/* SEO Title Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Title
                </label>
                <input
                  type="text"
                  name="seoTitle"
                  value={category.seoTitle}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    validationErrors.seoTitle
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="Best [Category Name] - Shop Online"
                  maxLength={60}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    Recommended: 50-60 characters
                  </p>
                  <span className="text-xs text-gray-500">
                    {category.seoTitle.length}/60
                  </span>
                </div>
              </div>

              {/* SEO Description Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Description
                </label>
                <textarea
                  name="seoDescription"
                  value={category.seoDescription}
                  onChange={handleChange}
                  rows="3"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    validationErrors.seoDescription
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="Shop the best collection of [Category Name] with free shipping and great deals..."
                  maxLength={160}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    Recommended: 150-160 characters
                  </p>
                  <span className="text-xs text-gray-500">
                    {category.seoDescription.length}/160
                  </span>
                </div>
              </div>

              {/* SEO Keywords Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Keywords
                </label>
                <input
                  type="text"
                  name="seoKeywords"
                  value={category.seoKeywords}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    validationErrors.seoKeywords
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="keyword1, keyword2, keyword3"
                  maxLength={200}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    Separate keywords with commas
                  </p>
                  <span className="text-xs text-gray-500">
                    {category.seoKeywords.length}/200
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/admin/categories")}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[140px]"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEditMode ? "Update Category" : "Create Category"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Link Products Modal */}
      {showLinkProductsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <LinkIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Link Products to Category
                    </h3>
                    <p className="text-sm text-gray-600">
                      Select products to link to "{category.name}"
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowLinkProductsModal(false);
                    setSelectedProducts([]);
                    setSearchQuery("");
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Search and Filters */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="Search products by name, SKU, or description..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={productFilter}
                      onChange={(e) => setProductFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Products</option>
                      <option value="active">Active Only</option>
                      <option value="inactive">Inactive Only</option>
                      <option value="featured">Featured</option>
                      <option value="lowStock">Low Stock</option>
                      <option value="outOfStock">Out of Stock</option>
                    </select>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="name">Sort by Name</option>
                      <option value="price">Sort by Price</option>
                      <option value="stock">Sort by Stock</option>
                      <option value="date">Sort by Date</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </button>
                  </div>
                </div>
                
                {/* Selection Info */}
                {selectedProducts.length > 0 && (
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-700">
                      {selectedProducts.length} product(s) selected
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedProducts([])}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Clear Selection
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Products List */}
              <div className="flex-1 overflow-y-auto p-4">
                {loadingAllProducts ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-600">Loading products...</span>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600">
                      {allProducts.length === 0 
                        ? "No products found in the system. Please add products first."
                        : "No products available to link. All products may already be linked to this category."}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Try a different search term or filter</p>
                    {allProducts.length === 0 && (
                      <button
                        onClick={createProductInCategory}
                        className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Create New Product
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedProducts.length === currentProducts.length && currentProducts.length > 0}
                          onChange={selectAllProducts}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">
                          Select all on this page ({currentProducts.length} products)
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        Page {currentPage} of {totalPages} ({filteredProducts.length} total)
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentProducts.map((product) => (
                        <div
                          key={product._id}
                          className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                            selectedProducts.includes(product._id)
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200"
                          }`}
                          onClick={() => toggleProductSelection(product._id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                                <img
                                  src={getProductImageUrl(product)}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = "/placeholder.jpg";
                                  }}
                                />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium text-gray-900 truncate">
                                    {product.name}
                                  </h4>
                                  <p className="text-sm text-gray-500 truncate">
                                    {product.sku || "No SKU"}
                                  </p>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={selectedProducts.includes(product._id)}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    toggleProductSelection(product._id);
                                  }}
                                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                              </div>
                              <div className="mt-2 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-gray-900">
                                    {formatPrice(product.price)}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    product.stock > 10
                                      ? "bg-green-100 text-green-800"
                                      : product.stock > 0
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}>
                                    {product.stock || 0} in stock
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    product.isActive
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}>
                                    {product.isActive ? "Active" : "Inactive"}
                                  </span>
                                  {product.featured && (
                                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                                      Featured
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-6 flex justify-center">
                        <nav className="flex items-center gap-1">
                          <button
                            onClick={() => paginate(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                          >
                            Previous
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
                                onClick={() => paginate(pageNum)}
                                className={`px-3 py-1 border rounded-lg ${
                                  currentPage === pageNum
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                          <button
                            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                          >
                            Next
                          </button>
                        </nav>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    <p>
                      Showing {Math.min(filteredProducts.length, indexOfFirstItem + 1)}-
                      {Math.min(filteredProducts.length, indexOfLastItem)} of {filteredProducts.length} products
                    </p>
                    {selectedProducts.length > 0 && (
                      <p className="font-medium text-blue-700">
                        {selectedProducts.length} product(s) selected for linking
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowLinkProductsModal(false);
                        setSelectedProducts([]);
                        setSearchQuery("");
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => linkProductsToCategory(selectedProducts)}
                      disabled={selectedProducts.length === 0 || linkingProducts}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {linkingProducts ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Linking...
                        </span>
                      ) : (
                        `Link ${selectedProducts.length} Product(s)`
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Image Confirmation Modal */}
      {showImageRemoveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Remove Image
                </h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to remove this image?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowImageRemoveConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
              >
                Remove Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryForm;