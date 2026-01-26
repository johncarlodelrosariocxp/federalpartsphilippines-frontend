// src/pages/admin/ProductForm.jsx - FIXED UPLOAD VERSION
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
  ImagePlus,
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
  const [uploadProgress, setUploadProgress] = useState(0);

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
  const [existingImages, setExistingImages] = useState([]);

  // Create fallback image
  const getFallbackImage = () => {
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#F3F4F6"/>
        <rect x="50" y="50" width="100" height="100" fill="#E5E7EB"/>
        <circle cx="100" cy="80" r="20" fill="#9CA3AF"/>
        <rect x="70" y="110" width="60" height="20" rx="10" fill="#9CA3AF"/>
        <text x="100" y="180" font-family="Arial" font-size="14" fill="#6B7280" text-anchor="middle" alignment-baseline="middle">No Image</text>
      </svg>
    `)}`;
  };

  // Get proper image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath || 
        imagePath === "undefined" || 
        imagePath === "null" || 
        imagePath.trim() === "") {
      return getFallbackImage();
    }

    // If it's already a full URL or data URI, return as-is
    if (
      imagePath.startsWith("http://") ||
      imagePath.startsWith("https://") ||
      imagePath.startsWith("blob:") ||
      imagePath.startsWith("data:")
    ) {
      return imagePath;
    }

    // If it starts with /uploads
    if (imagePath.startsWith("/uploads/")) {
      return `https://federalpartsphilippines-backend.onrender.com${imagePath}`;
    }
    
    // If it's just a filename
    if (imagePath.includes(".")) {
      return `https://federalpartsphilippines-backend.onrender.com/uploads/products/${imagePath}`;
    }
    
    // Default fallback
    return getFallbackImage();
  };

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
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories");
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

        // Process images - ensure they're properly formatted URLs
        let productImages = [];
        let existingImageUrls = [];
        
        if (productData.images && Array.isArray(productData.images)) {
          productImages = productData.images
            .map((img) => {
              if (typeof img === "string" && img.trim() !== "") {
                const url = getImageUrl(img);
                existingImageUrls.push(url);
                return url;
              } else if (img?.url) {
                const url = getImageUrl(img.url);
                existingImageUrls.push(url);
                return url;
              }
              return null;
            })
            .filter(img => img !== null);
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
        setExistingImages(existingImageUrls);
        
        console.log("Loaded product:", productData.name);
        console.log("Images loaded:", productImages.length);
      } else {
        setError("Failed to load product: Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      setError(`Failed to load product: ${err.message || "Network error"}`);
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
    if (!product.price || isNaN(price) || price <= 0) {
      errors.price = "Valid price is required (must be greater than 0)";
    }
    
    // Validate stock
    const stock = parseInt(product.stock, 10);
    if (isNaN(stock) || stock < 0) {
      errors.stock = "Valid stock quantity is required";
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
        [name]: "",
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

    // Validate files
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        setError(`File ${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        setError(`Image ${file.name} should be less than 5MB (current: ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }

    const totalImages = product.images.length + validFiles.length;
    if (totalImages > 20) {
      setError(
        `You can only upload up to 20 images. You already have ${product.images.length} images.`
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
        isNew: true,
        name: file.name,
        size: file.size
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
        } for preview.`
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
    } else {
      // It's an existing image - remove from existingImages
      const existingImgIndex = existingImages.indexOf(imageToRemove);
      if (existingImgIndex !== -1) {
        const updatedExisting = [...existingImages];
        updatedExisting.splice(existingImgIndex, 1);
        setExistingImages(updatedExisting);
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

  // Compress image function
  const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to JPEG with quality setting
          canvas.toBlob(
            (blob) => {
              if (blob) {
                // Check if compressed size is acceptable
                if (blob.size > 2 * 1024 * 1024) { // If still > 2MB, compress more
                  const newQuality = Math.max(0.3, quality * 0.7); // Reduce quality
                  canvas.toBlob(
                    (smallerBlob) => {
                      if (smallerBlob) {
                        resolve(smallerBlob);
                      } else {
                        resolve(blob);
                      }
                    },
                    'image/jpeg',
                    newQuality
                  );
                } else {
                  resolve(blob);
                }
              } else {
                reject(new Error("Failed to compress image"));
              }
            },
            'image/jpeg',
            quality
          );
        };
        
        img.onerror = () => {
          reject(new Error("Failed to load image"));
        };
      };
      
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
    });
  };

  // Convert blob to base64
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Upload image using FormData (more reliable than base64)
  const uploadImageUsingFormData = async (blob, filename) => {
    try {
      console.log("Uploading image:", filename, "Size:", blob.size);
      
      // Create FormData
      const formData = new FormData();
      const file = new File([blob], filename, { type: 'image/jpeg' });
      formData.append('image', file);
      formData.append('type', 'product');
      
      // Use the productAPI upload method
      const response = await productAPI.uploadProductImage(file);
      
      console.log("Upload response:", response);
      
      if (response?.success && response.image?.url) {
        return response.image.url;
      } else if (response?.success && response.url) {
        return response.url;
      } else if (response?.image) {
        return response.image; // Could be string URL
      } else {
        throw new Error(response?.message || "Upload failed - no URL returned");
      }
    } catch (err) {
      console.error("FormData upload error:", err);
      throw err;
    }
  };

  // Alternative: Send base64 directly in product creation
  const prepareProductDataWithBase64Images = async () => {
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
      specifications: {},
    };

    // Add category if selected
    if (product.category && product.category.trim() !== "") {
      productData.category = product.category;
    }

    // Add specifications
    specifications.forEach((spec) => {
      if (spec.key && spec.key.trim() && spec.value && spec.value.trim()) {
        productData.specifications[spec.key.trim()] = spec.value.trim();
      }
    });

    // Handle existing images (just filenames or paths)
    const existingImageData = existingImages.map(img => {
      // Extract filename from URL
      if (img.includes('/uploads/products/')) {
        return img.split('/uploads/products/')[1] || img;
      }
      return img;
    });

    // Handle new images - compress and convert to base64
    const newImageBase64 = [];
    if (newImageFiles.length > 0) {
      setUploadProgress(0);
      
      for (let i = 0; i < newImageFiles.length; i++) {
        const imgFile = newImageFiles[i];
        try {
          console.log(`Processing image ${i + 1}/${newImageFiles.length}: ${imgFile.name}`);
          
          // Compress image
          const compressedBlob = await compressImage(imgFile.file);
          console.log(`Compressed ${imgFile.name}: ${imgFile.size} -> ${compressedBlob.size} bytes`);
          
          // Convert to base64
          const base64 = await blobToBase64(compressedBlob);
          newImageBase64.push(base64);
          
          // Update progress
          setUploadProgress(Math.round(((i + 1) / newImageFiles.length) * 100));
          
        } catch (err) {
          console.error(`Failed to process image ${imgFile.name}:`, err);
          throw new Error(`Failed to process image: ${imgFile.name}`);
        }
      }
    }

    // Combine all images
    productData.images = [...existingImageData, ...newImageBase64];
    
    return productData;
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
    setUploadProgress(0);

    try {
      // Prepare product data with base64 images
      const productData = await prepareProductDataWithBase64Images();
      
      console.log("Submitting product data:", {
        ...productData,
        imageCount: productData.images?.length || 0,
        newImageCount: newImageFiles.length,
        existingImageCount: existingImages.length
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
        
        // Reset form state
        setNewImageFiles([]);
        setUploadProgress(0);
        
        setSuccess(
          isEditMode
            ? "Product updated successfully!"
            : "Product created successfully!"
        );

        // Navigate after successful save
        setTimeout(() => {
          navigate("/admin/products");
        }, 2000);
      } else {
        throw new Error(response?.message || "Failed to save product");
      }
    } catch (err) {
      console.error("Error saving product:", err);
      setError(err.message || "Failed to save product. Please try again.");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    // Clean up blob URLs before leaving
    newImageFiles.forEach(img => {
      if (img.preview && img.preview.startsWith('blob:')) {
        URL.revokeObjectURL(img.preview);
      }
    });
    navigate("/admin/products");
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading product data...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
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
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Fields marked with * are required
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Upload up to 20 images (max 5MB each)
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
            Cancel
          </button>
        </div>
      </div>

      {/* Success and Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
          <div>
            <span className="text-green-800 font-medium">{success}</span>
            {loading && (
              <p className="text-green-600 text-sm mt-1">
                Processing... This may take a moment.
              </p>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-red-800 font-medium">Error: </span>
            <span className="text-red-700">{error}</span>
            {error.includes("upload") && (
              <p className="text-red-600 text-sm mt-1">
                Please try smaller images or different formats.
              </p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Images Section */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ImageIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Product Images
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Upload high-quality product photos (Max 5MB each)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                {product.images.length}/20 images
              </span>
              {newImageFiles.length > 0 && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  {newImageFiles.length} new
                </span>
              )}
            </div>
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700">
                  Compressing and uploading images...
                </span>
                <span className="text-sm font-bold text-blue-700">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Processing {newImageFiles.length} image{newImageFiles.length !== 1 ? 's' : ''}...
              </p>
            </div>
          )}

          {/* Images Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-6">
            {product.images.map((img, index) => {
              const isNew = img && img.startsWith('blob:');
              const isExisting = existingImages.includes(img);
              const isFirst = index === 0;
              
              return (
                <div key={index} className="relative group">
                  <div className="aspect-square w-full overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50 hover:border-blue-300 transition-colors">
                    <img
                      src={img}
                      alt={`Product ${index + 1}`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getFallbackImage();
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200" />
                  </div>
                  
                  {/* Action Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg transform hover:scale-110"
                      title="Remove image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => reorderImages(index, index - 1)}
                        className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-900 transition-colors shadow-lg transform hover:scale-110"
                        title="Move up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                    )}
                    {index < product.images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => reorderImages(index, index + 1)}
                        className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-900 transition-colors shadow-lg transform hover:scale-110"
                        title="Move down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* Badges */}
                  {isFirst && (
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 text-xs font-bold bg-blue-600 text-white rounded-full shadow">
                        Main
                      </span>
                    </div>
                  )}
                  {isNew && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 text-xs font-bold bg-green-600 text-white rounded-full shadow">
                        New
                      </span>
                    </div>
                  )}
                  {isExisting && !isNew && (
                    <div className="absolute bottom-2 left-2">
                      <span className="px-2 py-1 text-xs font-bold bg-gray-600 text-white rounded-full shadow">
                        Existing
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Upload Button */}
            {product.images.length < 20 && (
              <label className="cursor-pointer">
                <div className="aspect-square w-full border-3 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group">
                  {imageUploading ? (
                    <>
                      <Loader2 className="h-10 w-10 text-blue-500 mb-3 animate-spin" />
                      <span className="text-sm text-blue-600 font-medium">
                        Loading...
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="p-3 bg-blue-100 rounded-full mb-3 group-hover:bg-blue-200 transition-colors">
                        <ImagePlus className="h-8 w-8 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        Add Images
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        PNG, JPG, WebP up to 5MB
                      </span>
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

          {/* Image Info */}
          {newImageFiles.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
              <h3 className="font-medium text-blue-800 mb-2">
                New Images to Upload ({newImageFiles.length})
              </h3>
              <div className="space-y-2">
                {newImageFiles.map((img, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 truncate">{img.name}</span>
                    <span className="text-gray-500">
                      {(img.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-blue-600 mt-3">
                These images will be compressed and uploaded when you save the product.
              </p>
            </div>
          )}
        </div>

        {/* Basic Information */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Basic Information
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Essential product details
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={product.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  formErrors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter product name"
              />
              {formErrors.name && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {formErrors.name}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={product.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
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
              <p className="text-sm text-gray-500 mt-2">
                Categorizing helps customers find your product
              </p>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={product.description}
                onChange={handleChange}
                rows={5}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  formErrors.description
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Describe your product in detail..."
              />
              {formErrors.description && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {formErrors.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Tag className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Pricing & Inventory
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Set price and stock levels
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Price */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Price (PHP) *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-gray-500 font-bold">₱</span>
                </div>
                <input
                  type="number"
                  name="price"
                  value={product.price}
                  onChange={handleNumberChange}
                  step="0.01"
                  min="0"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    formErrors.price ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="0.00"
                />
              </div>
              {formErrors.price && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {formErrors.price}
                </p>
              )}
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  name="stock"
                  value={product.stock}
                  onChange={handleNumberChange}
                  min="0"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    formErrors.stock ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="0"
                />
              </div>
              {formErrors.stock && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {formErrors.stock}
                </p>
              )}
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                SKU (Stock Keeping Unit)
              </label>
              <input
                type="text"
                name="sku"
                value={product.sku}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="SKU-001"
              />
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Ruler className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Specifications
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Add product specifications (optional)
              </p>
            </div>
          </div>

          {/* Add Specification Form */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specification Name
                </label>
                <input
                  type="text"
                  value={newSpec.key}
                  onChange={(e) =>
                    setNewSpec({ ...newSpec, key: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Color, Size, Material"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value
                </label>
                <input
                  type="text"
                  value={newSpec.value}
                  onChange={(e) =>
                    setNewSpec({ ...newSpec, value: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Red, Large, Cotton"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addSpecification}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  disabled={!newSpec.key.trim() || !newSpec.value.trim()}
                >
                  Add Specification
                </button>
              </div>
            </div>
          </div>

          {/* Specifications List */}
          {specifications.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-700">
                  Added Specifications ({specifications.length})
                </h3>
              </div>
              {specifications.map((spec, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <input
                        type="text"
                        value={spec.key}
                        onChange={(e) =>
                          updateSpecification(index, "key", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Value"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Ruler className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No specifications added</p>
              <p className="text-gray-400 text-sm mt-1">
                Add specifications like color, size, material, etc.
              </p>
            </div>
          )}
        </div>

        {/* Additional Details */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Weight className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Additional Details
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Product dimensions and weight
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Weight
              </label>
              <input
                type="text"
                name="weight"
                value={product.weight}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 1.5 kg, 500 g"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Dimensions
              </label>
              <input
                type="text"
                name="dimensions"
                value={product.dimensions}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 10×20×30 cm"
              />
            </div>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 rounded-lg">
              <Star className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Status & Actions
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Set product visibility and features
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Status Toggles */}
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${product.featured ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                    <Star className={`h-5 w-5 ${product.featured ? 'text-yellow-600 fill-yellow-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <label htmlFor="featured" className="font-medium text-gray-800 cursor-pointer">
                      Featured Product
                    </label>
                    <p className="text-sm text-gray-500">
                      Show in featured section
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={product.featured}
                  onChange={handleChange}
                  className="h-6 w-6 text-yellow-600 rounded focus:ring-yellow-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${product.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <CheckCircle className={`h-5 w-5 ${product.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <label htmlFor="isActive" className="font-medium text-gray-800 cursor-pointer">
                      Product Active
                    </label>
                    <p className="text-sm text-gray-500">
                      Show on website
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={product.isActive}
                  onChange={handleChange}
                  className="h-6 w-6 text-green-600 rounded focus:ring-green-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 className="font-medium text-blue-800 mb-2">Ready to Save?</h3>
                <p className="text-sm text-blue-600">
                  {newImageFiles.length > 0 
                    ? `Will upload ${newImageFiles.length} compressed image${newImageFiles.length !== 1 ? 's' : ''}`
                    : 'No new images to upload'
                  }
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {newImageFiles.length > 0 ? 'Uploading Images...' : 'Saving...'}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Save className="h-5 w-5" />
                      {isEditMode ? "Update Product" : "Create Product"}
                    </div>
                  )}
                </button>
              </div>

              {loading && newImageFiles.length > 0 && (
                <div className="text-center">
                  <p className="text-sm text-blue-600">
                    Compressing and uploading {newImageFiles.length} image{newImageFiles.length !== 1 ? 's' : ''}...
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Images are being compressed to reduce upload size
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;