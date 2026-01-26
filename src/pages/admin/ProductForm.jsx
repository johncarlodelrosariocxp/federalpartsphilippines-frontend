// src/pages/admin/ProductForm.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productAPI, categoryAPI, uploadImage } from "../../services/api";
import {
  Save,
  Upload,
  Package,
  Tag,
  DollarSign,
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
  const [newImages, setNewImages] = useState([]);

  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    images: [],
    stock: 0,
    sku: "",
    weight: "",
    dimensions: "",
    specifications: {},
    featured: false,
    isActive: true,
  });

  const [specifications, setSpecifications] = useState([]);
  const [newSpec, setNewSpec] = useState({ key: "", value: "" });

  // Generate fallback SVG image
  const createFallbackImage = () => {
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#F3F4F6"/>
        <path d="M60 70L140 130M140 70L60 130M140 50L180 90M180 50L140 90" stroke="#D1D5DB" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M40 40H160V160H40V40Z" stroke="#D1D5DB" stroke-width="4"/>
        <text x="100" y="100" font-family="Arial" font-size="16" fill="#9CA3AF" text-anchor="middle" alignment-baseline="middle">No Image</text>
      </svg>
    `)}`;
  };

  const fallbackImage = createFallbackImage();

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAllCategories({ active: true });
      
      if (response?.success && response.categories) {
        setCategories(response.categories);
      } else if (Array.isArray(response)) {
        setCategories(response);
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

      const response = await productAPI.getProductById(id);
      console.log("Product API Response:", response);

      if (response?.success && response.product) {
        const productData = response.product;
        
        // Parse specifications
        const specs = productData.specifications || {};
        const specArray = Object.entries(specs).map(([key, value]) => ({
          key,
          value: String(value)
        }));

        // Handle images - ensure they're properly formatted
        let productImages = [];
        if (productData.images && Array.isArray(productData.images)) {
          productImages = productData.images.map((img) => {
            if (typeof img === "string") {
              return img;
            } else if (img?.url) {
              return img.url;
            }
            return String(img);
          }).filter(img => img && img !== "null" && img !== "undefined");
        }

        setProduct({
          name: productData.name || "",
          description: productData.description || "",
          price: productData.price?.toString() || "0",
          category: productData.category?._id || productData.category || "",
          images: productImages,
          stock: productData.stock || 0,
          sku: productData.sku || "",
          weight: productData.weight || "",
          dimensions: productData.dimensions || "",
          specifications: productData.specifications || {},
          featured: productData.featured || false,
          isActive: productData.isActive !== undefined ? productData.isActive : true,
        });

        setSpecifications(specArray);
      } else {
        setError("Failed to load product: Invalid response");
      }
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
    
    if (!product.price || parseFloat(product.price) <= 0) {
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
    if (value === "") {
      setProduct({
        ...product,
        [name]: name === "stock" ? 0 : "",
      });
    } else {
      const parsedValue = parseFloat(value);
      setProduct({
        ...product,
        [name]: isNaN(parsedValue) ? "" : parsedValue,
      });
    }
    
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const addSpecification = () => {
    if (newSpec.key.trim() && newSpec.value.trim()) {
      setSpecifications([...specifications, { ...newSpec }]);
      setNewSpec({ key: "", value: "" });
    }
  };

  const removeSpecification = (index) => {
    const newSpecs = [...specifications];
    newSpecs.splice(index, 1);
    setSpecifications(newSpecs);
  };

  const updateSpecification = (index, field, value) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
  };

  const moveSpecification = (fromIndex, toIndex) => {
    const newSpecs = [...specifications];
    const [removed] = newSpecs.splice(fromIndex, 1);
    newSpecs.splice(toIndex, 0, removed);
    setSpecifications(newSpecs);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setError("");
    setSuccess("");

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        setError(`File ${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`Image ${file.name} should be less than 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
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

      // Create local URLs for preview
      const newImagePreviews = validFiles.map((file) => {
        const localUrl = URL.createObjectURL(file);
        return {
          file,
          preview: localUrl,
          name: file.name,
          size: file.size,
        };
      });

      // Add to new images array (will be uploaded when form is submitted)
      setNewImages([...newImages, ...newImagePreviews]);

      // Add previews to product images for display
      setProduct((prev) => ({
        ...prev,
        images: [...prev.images, ...newImagePreviews.map(img => img.preview)],
      }));

      setSuccess(
        `Added ${validFiles.length} image${
          validFiles.length > 1 ? "s" : ""
        } for preview. Images will be uploaded when you save.`
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Error adding images:", err);
      setError(err.message || "Failed to add images. Please try again.");
    } finally {
      setImageUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (index) => {
    const imageToRemove = product.images[index];
    
    // Check if it's a local preview image
    if (imageToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove);
      
      // Remove from newImages array if it exists there
      const newImgIndex = newImages.findIndex(img => img.preview === imageToRemove);
      if (newImgIndex !== -1) {
        const updatedNewImages = [...newImages];
        updatedNewImages.splice(newImgIndex, 1);
        setNewImages(updatedNewImages);
      }
    }
    
    // Remove from product images
    const newImagesArray = [...product.images];
    newImagesArray.splice(index, 1);
    setProduct({
      ...product,
      images: newImagesArray,
    });
  };

  const reorderImages = (fromIndex, toIndex) => {
    const newImagesArray = [...product.images];
    const [removed] = newImagesArray.splice(fromIndex, 1);
    newImagesArray.splice(toIndex, 0, removed);
    setProduct({
      ...product,
      images: newImagesArray,
    });
  };

  // Upload all new images and get their URLs
  const uploadNewImages = async () => {
    if (newImages.length === 0) return [];

    const uploadedImageUrls = [];
    
    for (const img of newImages) {
      try {
        console.log("Uploading image:", img.name);
        const uploadResponse = await uploadImage(img.file, "product");
        
        if (uploadResponse.success && uploadResponse.image) {
          // The backend returns the image path/URL
          const imageUrl = uploadResponse.image.url || uploadResponse.image.path || uploadResponse.image;
          uploadedImageUrls.push(imageUrl);
          console.log("Image uploaded successfully:", imageUrl);
        } else {
          console.error("Failed to upload image:", uploadResponse.message);
          throw new Error(`Failed to upload ${img.name}: ${uploadResponse.message}`);
        }
      } catch (err) {
        console.error("Error uploading image:", err);
        throw new Error(`Failed to upload ${img.name}: ${err.message}`);
      }
    }
    
    return uploadedImageUrls;
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
      // Prepare specifications object
      const specs = {};
      specifications.forEach((spec) => {
        if (spec.key && spec.key.trim() && spec.value && spec.value.trim()) {
          specs[spec.key.trim()] = spec.value.trim();
        }
      });

      // Upload new images if any
      let uploadedImageUrls = [];
      if (newImages.length > 0) {
        setSuccess("Uploading images...");
        uploadedImageUrls = await uploadNewImages();
      }

      // Combine existing images (filter out blob URLs) with newly uploaded images
      const existingImages = product.images.filter(img => 
        !img.startsWith('blob:') && !img.startsWith('data:')
      );
      const allImages = [...existingImages, ...uploadedImageUrls];

      // Prepare product data
      const productData = {
        name: product.name.trim(),
        description: product.description.trim(),
        price: parseFloat(product.price),
        stock: parseInt(product.stock, 10) || 0,
        sku: product.sku.trim() || undefined,
        weight: product.weight.trim() || undefined,
        dimensions: product.dimensions.trim() || undefined,
        featured: product.featured,
        isActive: product.isActive,
        images: allImages,
      };

      // Only include category if it's selected
      if (product.category) {
        productData.category = product.category;
      }

      // Only include specifications if there are any
      if (Object.keys(specs).length > 0) {
        productData.specifications = specs;
      }

      console.log("Submitting product data:", productData);

      let response;
      if (isEditMode) {
        response = await productAPI.updateProduct(id, productData);
      } else {
        response = await productAPI.createProduct(productData);
      }

      console.log("Save response:", response);

      if (response?.success) {
        setSuccess(
          isEditMode
            ? "Product updated successfully!"
            : "Product created successfully!"
        );

        // Clear new images array
        setNewImages([]);

        // Navigate after successful save
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

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
            <p className="text-sm text-gray-500 mt-1">
              Fields marked with * are required
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <X className="h-5 w-5 mr-1" />
            Close
          </button>
        </div>
      </div>

      {/* Success and Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Images Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <ImageIcon className="h-6 w-6 text-gray-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">
                Product Images
              </h2>
            </div>
            <span className="text-sm text-gray-500">
              {product.images.length}/10 images
            </span>
          </div>

          {/* Images Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
            {product.images.map((img, index) => {
              const isLocal = img.startsWith('blob:') || img.startsWith('data:');
              
              return (
                <div key={index} className="relative group">
                  <div className="aspect-square w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                    <img
                      src={img}
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

          <div className="text-sm text-gray-600">
            <p className="mb-2">
              • The first image will be used as the main product image
            </p>
            <p>
              • New images (marked with green "New" badge) will be uploaded when you save
            </p>
          </div>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={product.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Category (Optional)</option>
                {categories.map((category) => (
                  <option
                    key={category._id || category.id}
                    value={category._id || category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

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
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400">
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
                onKeyPress={(e) => {
                  if (
                    e.key === "Enter" &&
                    newSpec.key.trim() &&
                    newSpec.value.trim()
                  ) {
                    addSpecification();
                  }
                }}
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
                onKeyPress={(e) => {
                  if (
                    e.key === "Enter" &&
                    newSpec.key.trim() &&
                    newSpec.value.trim()
                  ) {
                    addSpecification();
                  }
                }}
              />
            </div>
            <div>
              <button
                type="button"
                onClick={addSpecification}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!newSpec.key.trim() || !newSpec.value.trim()}
              >
                Add Specification
              </button>
            </div>
          </div>

          {/* Specifications List */}
          {specifications.length > 0 ? (
            <div className="space-y-3">
              {specifications.map((spec, index) => (
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
                  <div className="flex items-center space-x-2">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => moveSpecification(index, index - 1)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                        title="Move up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                    )}
                    {index < specifications.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveSpecification(index, index + 1)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                        title="Move down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeSpecification(index)}
                      className="p-1 text-red-500 hover:text-red-700"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
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

            <div className="md:col-span-3">
              <div className="text-sm text-gray-600">
                <p>
                  • Weight and dimensions help customers understand the product
                  size (Optional)
                </p>
                <p>
                  • These details are displayed on the product page for better
                  customer experience
                </p>
              </div>
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