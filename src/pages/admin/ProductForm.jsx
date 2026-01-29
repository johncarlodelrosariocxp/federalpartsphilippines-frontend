// src/pages/admin/ProductForm.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productAPI, categoryAPI } from "../../services/api";
import {
  Save,
  Upload,
  Package,
  Tag,
  Hash,
  Weight,
  Ruler,
  Star,
  AlertCircle,
  CheckCircle,
  Trash2,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown,
  X,
  Loader2,
  Eye,
  Plus,
  Folder,
} from "lucide-react";

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [imageUploading, setImageUploading] = useState(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState(null);

  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    categories: [],
    images: [],
    stock: 0,
    sku: "",
    weight: "",
    dimensions: "",
    specifications: [],
    featured: false,
    isActive: true,
  });

  const [newSpec, setNewSpec] = useState({ key: "", value: "" });

  // Fallback image
  const fallbackImage = `data:image/svg+xml,${encodeURIComponent(`
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#F3F4F6"/>
      <rect x="50" y="50" width="100" height="70" rx="8" fill="#E5E7EB"/>
      <rect x="75" y="85" width="50" height="4" rx="2" fill="#9CA3AF"/>
      <rect x="85" y="95" width="30" height="3" rx="1.5" fill="#9CA3AF"/>
      <circle cx="100" cy="140" r="15" fill="#D1D5DB"/>
      <text x="100" y="145" font-family="Arial, sans-serif" font-size="12" fill="#6B7280" text-anchor="middle" alignment-baseline="middle">No Image</text>
    </svg>
  `)}`;

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      console.log("Fetching categories...");
      const response = await categoryAPI.getAllCategories({ active: true });
      
      console.log("Categories response:", response);
      
      if (response?.success && Array.isArray(response.categories)) {
        setCategories(response.categories);
      } else if (Array.isArray(response)) {
        setCategories(response);
      } else if (response?.data && Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        console.warn("No categories found or unexpected format:", response);
        setCategories([]);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    }
  };

  const fetchProduct = async () => {
    try {
      setInitialLoading(true);
      setError("");

      console.log(`Fetching product with ID: ${id}`);
      const response = await productAPI.getProductById(id);
      
      console.log("Product API response:", response);

      let productData = null;

      // Handle different response formats
      if (response?.success && response.product) {
        productData = response.product;
      } else if (response?.data?.product) {
        productData = response.data.product;
      } else if (response?.data && !response.product) {
        productData = response.data;
      } else if (response?.product) {
        productData = response.product;
      } else if (response?._id) {
        productData = response;
      } else {
        console.error("Unexpected response format:", response);
        throw new Error("Unexpected response format from server");
      }

      if (!productData) {
        throw new Error("Product data not found in response");
      }

      console.log("Product data to process:", productData);

      // Handle specifications - always ensure it's an array
      let specificationsArray = [];
      if (productData.specifications) {
        if (typeof productData.specifications === 'object' && !Array.isArray(productData.specifications)) {
          specificationsArray = Object.entries(productData.specifications).map(([key, value]) => ({
            key,
            value: String(value)
          }));
        } else if (Array.isArray(productData.specifications)) {
          specificationsArray = productData.specifications;
        }
      }

      // Handle category - support both single category and multiple categories
      let categoryId = "";
      let categoriesArray = [];
      
      if (productData.category) {
        if (typeof productData.category === "string") {
          categoryId = productData.category;
          categoriesArray = [productData.category];
        } else if (productData.category._id) {
          categoryId = productData.category._id;
          categoriesArray = [productData.category._id];
        }
      }
      
      // Handle multiple categories
      if (productData.categories && Array.isArray(productData.categories)) {
        categoriesArray = productData.categories.map(cat => {
          if (typeof cat === "string") return cat;
          if (cat._id) return cat._id;
          if (cat.id) return cat.id;
          return null;
        }).filter(Boolean);
        
        if (categoriesArray.length > 0 && !categoryId) {
          categoryId = categoriesArray[0];
        }
      }

      // Handle images - ensure array format
      let productImages = [];
      if (productData.images && Array.isArray(productData.images)) {
        productImages = productData.images.filter(img => img && img.trim() !== "");
      } else if (productData.image) {
        if (typeof productData.image === "string" && productData.image.trim()) {
          productImages = [productData.image];
        }
      }

      const productState = {
        name: productData.name || "",
        description: productData.description || "",
        price: productData.price?.toString() || "0",
        category: categoryId,
        categories: categoriesArray,
        images: productImages,
        stock: productData.stock || 0,
        sku: productData.sku || "",
        weight: productData.weight || "",
        dimensions: productData.dimensions || "",
        specifications: specificationsArray,
        featured: productData.featured || false,
        isActive: productData.isActive !== undefined ? productData.isActive : true,
      };

      console.log("Setting product state:", productState);
      setProduct(productState);

    } catch (err) {
      console.error("Error fetching product:", err);
      setError(`Failed to load product: ${err.message}`);
    } finally {
      setInitialLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!product.name.trim()) {
      errors.name = "Product name is required";
    }
    
    if (!product.description.trim()) {
      errors.description = "Description is required";
    }
    
    const price = parseFloat(product.price);
    if (isNaN(price) || price <= 0) {
      errors.price = "Valid price is required (must be greater than 0)";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct({
      ...product,
      [name]: type === "checkbox" ? checked : value,
    });
    
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setProduct({
      ...product,
      [name]: value === "" ? (name === "stock" ? 0 : "") : value,
    });
  };

  // Category selection
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setProduct({
      ...product,
      category: categoryId,
    });
  };

  // Add multiple categories
  const addCategory = () => {
    if (product.category && !product.categories.includes(product.category)) {
      setProduct({
        ...product,
        categories: [...product.categories, product.category],
        category: "", // Clear selection after adding
      });
    }
  };

  // Remove category from the list - FIXED
  const removeCategory = (categoryIdToRemove) => {
    console.log("Removing category:", categoryIdToRemove);
    console.log("Current categories:", product.categories);
    
    const updatedCategories = product.categories.filter(
      categoryId => categoryId !== categoryIdToRemove
    );
    
    console.log("Updated categories:", updatedCategories);
    
    setProduct({
      ...product,
      categories: updatedCategories
    });
  };

  // Clear all categories
  const clearAllCategories = () => {
    setProduct({
      ...product,
      categories: []
    });
  };

  // Specifications functions
  const addSpecification = () => {
    if (newSpec.key.trim() && newSpec.value.trim()) {
      setProduct({
        ...product,
        specifications: [...product.specifications, { ...newSpec }]
      });
      setNewSpec({ key: "", value: "" });
    }
  };

  const removeSpecification = (index) => {
    const newSpecs = [...product.specifications];
    newSpecs.splice(index, 1);
    setProduct({
      ...product,
      specifications: newSpecs
    });
  };

  const updateSpecification = (index, field, value) => {
    const newSpecs = [...product.specifications];
    newSpecs[index][field] = value;
    setProduct({
      ...product,
      specifications: newSpecs
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setError("");
    setSuccess("");

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      setError("Please select valid image files (max 5MB each)");
      e.target.value = "";
      return;
    }

    const totalImages = product.images.length + validFiles.length;
    if (totalImages > 10) {
      setError(
        `You can only upload up to 10 images. You already have ${product.images.length} images.`
      );
      e.target.value = "";
      return;
    }

    try {
      setImageUploading(true);

      const base64Images = await Promise.all(
        validFiles.map(async (file) => {
          try {
            const base64 = await convertFileToBase64(file);
            return {
              name: file.name,
              type: file.type,
              size: file.size,
              base64: base64,
              preview: URL.createObjectURL(file),
              isLocal: true,
            };
          } catch (err) {
            console.error("Error converting file to base64:", err);
            return null;
          }
        })
      );

      const validBase64Images = base64Images.filter(img => img !== null);

      setProduct((prev) => ({
        ...prev,
        images: [...prev.images, ...validBase64Images],
      }));

      setSuccess(
        `Added ${validBase64Images.length} image${
          validBase64Images.length > 1 ? "s" : ""
        } for preview`
      );

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error adding images:", err);
      setError(err.message || "Failed to add images. Please try again.");
    } finally {
      setImageUploading(false);
      e.target.value = "";
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const removeImage = (index) => {
    const image = product.images[index];

    if (image && image.isLocal && image.preview) {
      URL.revokeObjectURL(image.preview);
    }

    const newImages = [...product.images];
    newImages.splice(index, 1);
    setProduct({
      ...product,
      images: newImages,
    });
  };

  const reorderImages = (fromIndex, toIndex) => {
    const newImages = [...product.images];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    setProduct({
      ...product,
      images: newImages,
    });
  };

  const getImageDisplayUrl = (image) => {
    if (!image) {
      return fallbackImage;
    }

    if (typeof image === "string") {
      if (
        image.startsWith("http://") ||
        image.startsWith("https://") ||
        image.startsWith("blob:") ||
        image.startsWith("data:")
      ) {
        return image;
      }
      return image;
    }

    if (image && typeof image === "object") {
      if (image.preview) {
        return image.preview;
      }
      if (image.base64) {
        return image.base64;
      }
      if (image.url) {
        return image.url;
      }
    }

    return fallbackImage;
  };

  const isLocalImage = (image) => {
    if (!image) return false;

    if (typeof image === "string") {
      return image.startsWith("blob:") || image.startsWith("data:");
    }

    if (image && typeof image === "object") {
      return image.isLocal === true;
    }

    return false;
  };

  const showImagePreview = (image, index) => {
    const url = getImageDisplayUrl(image);
    setSelectedImagePreview({
      url,
      isLocal: isLocalImage(image),
      name: typeof image === 'object' ? image.name : `Image ${index + 1}`,
      index
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFormErrors({});
    
    if (!validateForm()) {
      setError("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
      // Convert specifications array to object
      const specificationsObj = {};
      product.specifications.forEach((spec) => {
        if (spec.key && spec.key.trim() && spec.value && spec.value.trim()) {
          specificationsObj[spec.key.trim()] = spec.value.trim();
        }
      });

      // Prepare images
      const localImages = product.images.filter(img => isLocalImage(img));
      const existingImages = product.images.filter(img => !isLocalImage(img));

      // Prepare image data
      const allImages = [
        ...existingImages.map(img => {
          if (typeof img === 'string') {
            if (img.includes('/uploads/products/')) {
              return img.split('/').pop();
            }
            return img;
          }
          return img;
        }).filter(img => img),
        ...localImages.map(img => img.base64).filter(base64 => base64)
      ];

      // Prepare product data - send both single category and multiple categories
      const productData = {
        name: product.name.trim(),
        description: product.description.trim(),
        price: parseFloat(product.price),
        stock: parseInt(product.stock, 10) || 0,
        sku: product.sku.trim() || "",
        weight: product.weight.trim() || "",
        dimensions: product.dimensions.trim() || "",
        featured: Boolean(product.featured),
        isActive: Boolean(product.isActive),
        specifications: Object.keys(specificationsObj).length > 0 ? specificationsObj : {},
      };

      // Add category (single) for backward compatibility
      if (product.category && product.category.trim() !== '') {
        productData.category = product.category;
      }

      // Add multiple categories if available (prefer this over single category)
      if (product.categories.length > 0) {
        productData.categories = product.categories;
      }

      // Add images if any
      if (allImages.length > 0) {
        productData.images = allImages;
      }

      console.log("Submitting product data:", productData);

      let response;
      if (isEditMode) {
        response = await productAPI.updateProduct(id, productData);
      } else {
        response = await productAPI.createProduct(productData);
      }

      console.log("API Response:", response);

      if (response?.success) {
        const message = isEditMode
          ? "Product updated successfully!"
          : "Product created successfully!";
        setSuccess(message);

        setTimeout(() => {
          navigate("/admin/products");
        }, 1500);
      } else {
        throw new Error(response?.message || "Failed to save product");
      }
    } catch (err) {
      console.error("Error saving product:", err);
      setError(err.message || "Failed to save product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c._id === categoryId || c.id === categoryId);
    return category ? category.name : "Unknown Category";
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading product data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? "Edit Product" : "Create New Product"}
            </h1>
            <p className="text-gray-600 mt-2">
              {isEditMode
                ? "Update product details below"
                : "Fill in the details to create a new product"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X className="h-5 w-5 mr-2" />
            Cancel
          </button>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImagePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{selectedImagePreview.name}</h3>
                <p className="text-sm text-gray-500">
                  {selectedImagePreview.isLocal ? 'Local Preview' : 'Server Image'} • Image {selectedImagePreview.index + 1}
                </p>
              </div>
              <button
                onClick={() => setSelectedImagePreview(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-gray-100">
              <img
                src={selectedImagePreview.url}
                alt="Preview"
                className="max-w-full max-h-[70vh] object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = fallbackImage;
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Success and Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Images Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-6">
            <ImageIcon className="h-6 w-6 text-gray-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">
              Product Images
            </h2>
          </div>

          <div className="text-sm text-gray-500 mb-4">
            {product.images.length}/10 images • {product.images.filter(img => isLocalImage(img)).length} new
          </div>

          {/* Images Grid */}
          {product.images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
              {product.images.map((img, index) => {
                const imageUrl = getImageDisplayUrl(img);
                const isLocal = isLocalImage(img);

                return (
                  <div key={index} className="relative group">
                    <div 
                      className="aspect-square w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50 cursor-pointer"
                      onClick={() => showImagePreview(img, index)}
                    >
                      <img
                        src={imageUrl}
                        alt={`Product ${index + 1}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = fallbackImage;
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => showImagePreview(img, index)}
                        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                        title="Preview image"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        title="Remove image"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => reorderImages(index, index - 1)}
                          className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-800 transition-colors"
                          title="Move up"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                      )}
                      {index < product.images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => reorderImages(index, index + 1)}
                          className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-800 transition-colors"
                          title="Move down"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {isLocal && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 text-xs bg-green-500 text-white rounded-full">
                          New
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded truncate text-center">
                        {index + 1}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Upload Button */}
              {product.images.length < 10 && (
                <label className="cursor-pointer">
                  <div className="aspect-square w-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    {imageUploading ? (
                      <Loader2 className="h-8 w-8 text-blue-500 mb-2 animate-spin" />
                    ) : (
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    )}
                    <span className="text-sm text-gray-600">
                      {imageUploading ? "Uploading..." : "Add Image"}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">Max 5MB</span>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={imageUploading || loading}
                  />
                </label>
              )}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg mb-6">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No images uploaded</h3>
              <p className="text-gray-500 mb-4">
                Add product images to help customers see what they're buying
              </p>
              <label className="cursor-pointer">
                <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Images
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={imageUploading || loading}
                />
              </label>
              <p className="text-xs text-gray-500 mt-3">Up to 10 images • Max 5MB each</p>
            </div>
          )}
        </div>

        {/* Basic Information Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-6">
            <Package className="h-6 w-6 text-gray-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">
              Basic Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={product.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter product name"
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
              )}
            </div>

            {/* Single Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Category
              </label>
              <select
                name="category"
                value={product.category}
                onChange={handleCategoryChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id || category.id} value={category._id || category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              
              {/* Add to multiple categories button */}
              {product.category && !product.categories.includes(product.category) && (
                <button
                  type="button"
                  onClick={addCategory}
                  className="mt-2 inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  <Plus className="h-3 w-3" />
                  Add to categories list
                </button>
              )}
            </div>

            {/* Selected Categories Display */}
            {product.categories.length > 0 && (
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Selected Categories ({product.categories.length})
                  </label>
                  {product.categories.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAllCategories}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                  {product.categories.map((categoryId) => {
                    const categoryName = getCategoryName(categoryId);
                    return (
                      <div
                        key={categoryId}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        <Folder className="h-3 w-3" />
                        <span>{categoryName}</span>
                        <button
                          type="button"
                          onClick={() => removeCategory(categoryId)}
                          className="ml-1 text-blue-700 hover:text-red-700 transition-colors"
                          title={`Remove ${categoryName}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  These categories will be assigned to the product
                </p>
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={product.description}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.description
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Enter product description"
              />
              {formErrors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Pricing & Inventory Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-6">
            <Tag className="h-6 w-6 text-gray-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">
              Pricing & Inventory
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (PHP) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  ₱
                </span>
                <input
                  type="number"
                  name="price"
                  value={product.price}
                  onChange={handleNumberChange}
                  step="0.01"
                  min="0"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.price ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="0.00"
                />
              </div>
              {formErrors.price && (
                <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  name="stock"
                  value={product.stock}
                  onChange={handleNumberChange}
                  min="0"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU
              </label>
              <input
                type="text"
                name="sku"
                value={product.sku}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="SKU-001"
              />
            </div>
          </div>
        </div>

        {/* Specifications Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-6">
            <Ruler className="h-6 w-6 text-gray-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">
              Specifications
            </h2>
          </div>

          {/* Add Specification Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <input
                type="text"
                value={newSpec.key}
                onChange={(e) =>
                  setNewSpec({ ...newSpec, key: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Specification name (e.g., Color)"
              />
            </div>
            <div>
              <input
                type="text"
                value={newSpec.value}
                onChange={(e) =>
                  setNewSpec({ ...newSpec, value: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Value (e.g., Red)"
              />
            </div>
            <div>
              <button
                type="button"
                onClick={addSpecification}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={!newSpec.key.trim() || !newSpec.value.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Specification
              </button>
            </div>
          </div>

          {/* Specifications List */}
          {product.specifications.length > 0 ? (
            <div className="space-y-3">
              {product.specifications.map((spec, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <input
                        type="text"
                        value={spec.key}
                        onChange={(e) =>
                          updateSpecification(index, "key", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Key"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) =>
                          updateSpecification(index, "value", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Value"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    className="p-1 text-red-500 hover:text-red-700"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No specifications added yet.</p>
              <p className="text-sm mt-1">
                Add specifications like color, size, material, etc. (Optional)
              </p>
            </div>
          )}
        </div>

        {/* Additional Details Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-6">
            <Weight className="h-6 w-6 text-gray-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">
              Additional Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight
              </label>
              <input
                type="text"
                name="weight"
                value={product.weight}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 1.5 kg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensions
              </label>
              <input
                type="text"
                name="dimensions"
                value={product.dimensions}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 10x20x30 cm"
              />
            </div>
          </div>
        </div>

        {/* Status & Actions Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-6">
            <Star className="h-6 w-6 text-gray-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">
              Status & Actions
            </h2>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={product.featured}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="featured" className="ml-2 text-gray-700">
                  Mark as featured product
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={product.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="ml-2 text-gray-700">
                  Product is active
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => navigate("/admin/products")}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || imageUploading}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditMode ? "Update Product" : "Create Product"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;