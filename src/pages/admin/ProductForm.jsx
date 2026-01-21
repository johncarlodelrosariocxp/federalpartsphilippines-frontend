// src/pages/admin/ProductForm.jsx - FIXED VERSION
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  productAPI,
  categoryAPI,
  getImageUrl,
  getFullImageUrl,
} from "../../services/api";
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
  const [imageUploading, setImageUploading] = useState(false);

  // Simple SVG fallback image
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
      const response = await categoryAPI.getAll({ active: true });

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
        }

        if (Array.isArray(categoriesData)) {
          const activeCategories = categoriesData.filter((cat) =>
            cat.isActive !== undefined ? cat.isActive : true
          );
          setCategories(activeCategories);
        } else {
          console.warn("Unexpected categories data format:", response);
          setCategories([]);
        }
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

      let productData = {};

      if (response) {
        // Handle different response structures
        if (response.success && response.data) {
          productData = response.data;
        } else if (response._id) {
          productData = response;
        } else if (response.product) {
          productData = response.product;
        } else if (response.data) {
          productData = response.data;
        }

        console.log("Product Data:", productData);

        const specs = productData.specifications || {};
        const specArray = Object.keys(specs).map((key) => ({
          key,
          value: specs[key],
        }));

        let categoryId = "";
        if (productData.category) {
          if (typeof productData.category === "string") {
            categoryId = productData.category;
          } else if (productData.category._id) {
            categoryId = productData.category._id;
          } else if (productData.category.id) {
            categoryId = productData.category.id;
          }
        }

        // Handle images
        let productImages = [];
        if (productData.images && Array.isArray(productData.images)) {
          productImages = [...productData.images];
        } else if (productData.image) {
          productImages = [productData.image];
        }

        setProduct({
          name: productData.name || "",
          description: productData.description || "",
          price: productData.price?.toString() || "",
          category: categoryId,
          images: productImages,
          stock: productData.stock || 0,
          sku: productData.sku || "",
          weight: productData.weight || "",
          dimensions: productData.dimensions || "",
          specifications: productData.specifications || {},
          featured: productData.featured || false,
          isActive:
            productData.isActive !== undefined ? productData.isActive : true,
        });

        setSpecifications(specArray);
      } else {
        throw new Error("No response received from server");
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
    
    // Name is required
    if (!product.name.trim()) {
      errors.name = "Product name is required";
    }
    
    // Description is required
    if (!product.description.trim()) {
      errors.description = "Description is required";
    }
    
    // Price is required and must be valid
    if (!product.price || parseFloat(product.price) <= 0) {
      errors.price = "Valid price is required (must be greater than 0)";
    }
    
    // Category is NOT required
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct({
      ...product,
      [name]: type === "checkbox" ? checked : value,
    });
    
    // Clear error for this field when user starts typing
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
      const parsedValue = name.includes("price")
        ? parseFloat(value)
        : parseInt(value, 10);
      setProduct({
        ...product,
        [name]: isNaN(parsedValue) ? "" : parsedValue,
      });
    }
    
    // Clear error for this field when user starts typing
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

      // Create local URLs for preview immediately
      const newImagePreviews = validFiles.map((file) => {
        const localUrl = URL.createObjectURL(file);
        return {
          url: localUrl,
          isLocal: true,
          file: file,
          name: file.name,
          isNew: true,
          base64: null,
        };
      });

      // Convert files to base64 for storage
      const imagesWithBase64 = await Promise.all(
        newImagePreviews.map(async (img) => {
          try {
            const base64 = await convertFileToBase64(img.file);
            return {
              ...img,
              base64: base64,
            };
          } catch (err) {
            console.error("Error converting file to base64:", err);
            return img;
          }
        })
      );

      // Add previews to state
      setProduct((prev) => ({
        ...prev,
        images: [...prev.images, ...imagesWithBase64],
      }));

      setSuccess(
        `Added ${validFiles.length} image${
          validFiles.length > 1 ? "s" : ""
        } for preview`
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

  // Helper function to convert file to base64
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

    // Clean up blob URL if it's a local image
    if (
      image &&
      typeof image === "object" &&
      image.isLocal &&
      image.url &&
      image.url.startsWith("blob:")
    ) {
      URL.revokeObjectURL(image.url);
    }

    // Remove from local state
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

  // Get image display URL
  const getImageDisplayUrl = (image) => {
    if (!image) {
      return fallbackImage;
    }

    // Case 1: It's already a valid URL or data URL
    if (typeof image === "string") {
      // Check if it's a full URL, blob, or data URL
      if (
        image.startsWith("http://") ||
        image.startsWith("https://") ||
        image.startsWith("blob:") ||
        image.startsWith("data:")
      ) {
        return image;
      }

      // For absolute paths starting with /
      if (image.startsWith("/")) {
        // Use getFullImageUrl for uploads path
        if (image.startsWith("/uploads/")) {
          return getFullImageUrl(image);
        }

        // Try to use getImageUrl
        const urlFromService = getImageUrl(image, "products");
        if (urlFromService && urlFromService !== image) {
          return urlFromService;
        }

        // Fallback: Construct URL manually
        const baseUrl =
          import.meta.env.VITE_API_URL?.replace("/api", "") ||
          "http://localhost:5000";
        return `${baseUrl}${image}`;
      }

      // For filenames
      const baseUrl =
        import.meta.env.VITE_API_URL?.replace("/api", "") ||
        "http://localhost:5000";
      let fullUrl;
      if (baseUrl.endsWith("/")) {
        fullUrl = `${baseUrl}uploads/products/${image}`;
      } else {
        fullUrl = `${baseUrl}/uploads/products/${image}`;
      }
      return fullUrl;
    }

    // Case 2: It's an object (local image during upload)
    if (image && typeof image === "object") {
      if (image.url) {
        return getImageDisplayUrl(image.url);
      }
      if (image.base64) {
        return image.base64;
      }
      if (image.filename) {
        return getImageDisplayUrl(image.filename);
      }
      if (image.path) {
        return getImageDisplayUrl(image.path);
      }
      if (image.isLocal && image.url) {
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
      return (
        image.isLocal === true ||
        (image.url && image.url.startsWith("blob:")) ||
        (image.url && image.url.startsWith("data:"))
      );
    }

    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFormErrors({});
    
    // Validate form
    if (!validateForm()) {
      setError("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
      // Prepare specifications object - FIXED: Ensure it's a proper object
      const specs = {};
      specifications.forEach((spec) => {
        if (spec.key && spec.key.trim() && spec.value && spec.value.trim()) {
          specs[spec.key.trim()] = spec.value.trim();
        }
      });

      // Prepare images - handle both new (base64) and existing (filename) images
      const finalImages = [];
      for (const img of product.images) {
        if (typeof img === "string") {
          // If it's already a string (filename), use it as is
          finalImages.push(img);
        } else if (img && typeof img === "object") {
          if (img.base64) {
            // New image: send base64
            finalImages.push(img.base64);
          } else if (img.filename) {
            // Existing image: send filename
            finalImages.push(img.filename);
          } else if (typeof img === "string" && img.includes("data:image")) {
            // If it's already a base64 string
            finalImages.push(img);
          }
        }
      }

      // Prepare product data
      const productData = {
        name: product.name.trim(),
        description: product.description.trim(),
        price: parseFloat(product.price),
        images: finalImages,
        stock: parseInt(product.stock, 10) || 0,
        sku: product.sku.trim() || undefined,
        weight: product.weight.trim() || undefined,
        dimensions: product.dimensions.trim() || undefined,
        featured: product.featured,
        isActive: product.isActive,
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
              const imageUrl = getImageDisplayUrl(img);

              return (
                <div key={index} className="relative group">
                  <div className="aspect-square w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
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
                  {isLocalImage(img) && (
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
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Add Image</span>
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
              • New images (marked with green "New" badge) will be converted to
              base64 format and saved with the product
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