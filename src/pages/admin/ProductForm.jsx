// src/pages/admin/ProductForm.jsx - FINAL FIXED VERSION WITH IMAGE UPLOAD
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productAPI, categoryAPI } from "../../services/api";
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
  const [newImageFiles, setNewImageFiles] = useState([]);

  // Generate fallback SVG image
  const createFallbackImage = () => {
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#F3F4F6"/>
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
      } else if (response?.data && Array.isArray(response.data)) {
        setCategories(response.data);
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

      // Create blob URLs for preview
      const newImages = validFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        isNew: true
      }));

      // Add to new image files
      setNewImageFiles(prev => [...prev, ...newImages]);

      // Add preview URLs to product images for display
      const previewUrls = newImages.map(img => img.preview);
      setProduct(prev => ({
        ...prev,
        images: [...prev.images, ...previewUrls]
      }));

      setSuccess(
        `Added ${validFiles.length} image${
          validFiles.length > 1 ? "s" : ""
        } for preview. Images will be converted to base64 when you save.`
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
    
    // Check if it's a blob URL (new image)
    if (imageToRemove && imageToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove);
      
      // Remove from newImageFiles
      const newImgIndex = newImageFiles.findIndex(img => img.preview === imageToRemove);
      if (newImgIndex !== -1) {
        const updatedNewImages = [...newImageFiles];
        updatedNewImages.splice(newImgIndex, 1);
        setNewImageFiles(updatedNewImages);
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
    
    // Also reorder newImageFiles if needed
    if (newImageFiles.length > 0) {
      const newFilesArray = [...newImageFiles];
      const [removedFile] = newFilesArray.splice(fromIndex, 1);
      newFilesArray.splice(toIndex, 0, removedFile);
      setNewImageFiles(newFilesArray);
    }
  };

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = error => reject(error);
    });
  };

  // Optimize base64 image by reducing quality for large images
  const optimizeBase64Image = async (base64Data, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Data;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Resize if too large
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to JPEG with quality setting
        const optimizedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(optimizedBase64);
      };
      img.onerror = () => resolve(base64Data); // Return original if optimization fails
    });
  };

  // Handle form submission
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

      // Separate existing images (URLs) from new blob URLs
      const existingImages = product.images.filter(img => 
        img && !img.startsWith('blob:') && !img.startsWith('data:image/svg+xml')
      );

      // Convert new image files to optimized base64
      const newImageBase64 = [];
      for (const imgFile of newImageFiles) {
        try {
          console.log(`Converting ${imgFile.file.name} to base64...`);
          const base64 = await fileToBase64(imgFile.file);
          
          // Optimize image to reduce size
          const optimizedBase64 = await optimizeBase64Image(base64);
          
          // Check if base64 is too large (over 1MB)
          const base64Size = (optimizedBase64.length * 3) / 4; // Approximate size in bytes
          if (base64Size > 1024 * 1024) { // 1MB
            console.warn(`Image ${imgFile.file.name} is large (${Math.round(base64Size/1024)}KB), compressing further...`);
            const moreOptimized = await optimizeBase64Image(base64, 800, 0.7);
            newImageBase64.push(moreOptimized);
          } else {
            newImageBase64.push(optimizedBase64);
          }
          
          console.log(`Successfully converted ${imgFile.file.name} to base64`);
        } catch (err) {
          console.error("Error converting file to base64:", err);
          throw new Error(`Failed to process image: ${imgFile.file.name}. Please use a different image.`);
        }
      }

      // Prepare product data
      const productData = {
        name: product.name.trim(),
        description: product.description.trim(),
        price: parseFloat(product.price),
        stock: parseInt(product.stock, 10) || 0,
        sku: product.sku.trim() || '',
        weight: product.weight.trim() || '',
        dimensions: product.dimensions.trim() || '',
        featured: product.featured,
        isActive: product.isActive,
        specifications: Object.keys(specs).length > 0 ? specs : undefined,
      };

      // Only include category if it's selected
      if (product.category) {
        productData.category = product.category;
      }

      // Handle images: combine existing and new
      if (existingImages.length > 0 || newImageBase64.length > 0) {
        productData.images = [
          ...existingImages,
          ...newImageBase64
        ];
      }

      console.log("Submitting product data:", {
        ...productData,
        existingImageCount: existingImages.length,
        newBase64ImageCount: newImageBase64.length,
        totalImages: productData.images?.length || 0
      });

      let response;
      if (isEditMode) {
        console.log(`Updating product ${id}...`);
        response = await productAPI.updateProduct(id, productData);
      } else {
        console.log("Creating new product...");
        response = await productAPI.createProduct(productData);
      }

      console.log("Save response:", response);

      if (response?.success) {
        // Clean up blob URLs
        newImageFiles.forEach(img => {
          if (img.preview && img.preview.startsWith('blob:')) {
            URL.revokeObjectURL(img.preview);
          }
        });
        
        setNewImageFiles([]);
        
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
              const isNew = img && img.startsWith('blob:');
              const isFirst = index === 0;
              
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
                  {isFirst && (
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
                        Main
                      </span>
                    </div>
                  )}
                  {isNew && (
                    <div className="absolute top-2 right-2">
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
                    <>
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Add Image</span>
                      <span className="text-xs text-gray-500 mt-1">Max 5MB</span>
                    </>
                  )}
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

          <div className="text-sm text-gray-600 space-y-1">
            <p className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              <strong>The first image</strong> will be used as the main product image
            </p>
            <p className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <strong>New images</strong> (with green "New" badge) will be converted to base64 format
            </p>
            <p className="flex items-center text-blue-600 font-medium mt-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              <strong>Base64 Processing:</strong> All new images are converted to base64 format and sent to the backend for processing and storage
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