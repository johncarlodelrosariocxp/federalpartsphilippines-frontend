// src/components/admin/ProductForm.js - COMPLETE WORKING VERSION
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { productAPI, categoryAPI } from "../../services/api";
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Plus, 
  Save, 
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Trash2,
  Eye,
  Package,
  Tag,
  DollarSign,
  TrendingUp,
  Hash,
  Ruler,
  FileText,
  Settings,
  Link
} from "lucide-react";

const ProductForm = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categories, setCategories] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discountedPrice: "",
    stock: "",
    sku: "",
    weight: "",
    dimensions: "",
    category: "",
    featured: false,
    isActive: true,
    specifications: {}
  });
  
  // Image handling
  const [imageFiles, setImageFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Specifications handling
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");
  const [specifications, setSpecifications] = useState([]);
  
  // Fetch categories
  useEffect(() => {
    fetchCategories();
    if (isEdit && id) {
      fetchProduct();
    }
  }, [isEdit, id]);
  
  // Update specifications array when formData.specifications changes
  useEffect(() => {
    if (formData.specifications && typeof formData.specifications === 'object') {
      const specArray = Object.entries(formData.specifications).map(([key, value]) => ({
        key,
        value
      }));
      setSpecifications(specArray);
    }
  }, [formData.specifications]);
  
  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAllCategories();
      if (response.success) {
        setCategories(response.categories || []);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };
  
  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await productAPI.getProductById(id);
      
      if (response.success && response.product) {
        const product = response.product;
        
        // Parse specifications if it's a string
        let specs = {};
        if (product.specifications) {
          if (typeof product.specifications === 'string') {
            try {
              specs = JSON.parse(product.specifications);
            } catch (e) {
              console.warn("Failed to parse specifications as JSON:", e);
              // Try to parse as key-value pairs
              if (product.specifications.includes(':')) {
                const lines = product.specifications.split('\n');
                lines.forEach(line => {
                  const [key, ...valueParts] = line.split(':');
                  if (key && valueParts.length > 0) {
                    specs[key.trim()] = valueParts.join(':').trim();
                  }
                });
              }
            }
          } else if (typeof product.specifications === 'object') {
            specs = product.specifications;
          }
        }
        
        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: product.price?.toString() || "",
          discountedPrice: product.discountedPrice?.toString() || "",
          stock: product.stock?.toString() || "",
          sku: product.sku || "",
          weight: product.weight || "",
          dimensions: product.dimensions || "",
          category: product.category?._id || product.category || "",
          featured: product.featured || false,
          isActive: product.isActive !== undefined ? product.isActive : true,
          specifications: specs
        });
        
        // Set preview images
        if (product.images && Array.isArray(product.images)) {
          const validImages = product.images.filter(img => 
            img && img.trim() !== "" && img !== "undefined" && img !== "null"
          );
          setPreviewImages(validImages);
        }
      } else {
        setError("Product not found");
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      setError(`Failed to load product: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle image upload
  const handleImageUpload = async (files) => {
    const validFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (validFiles.length === 0) {
      setError("Please select valid image files (JPG, PNG, GIF, etc.)");
      return;
    }
    
    if (validFiles.length + previewImages.length > 10) {
      setError("You can only upload up to 10 images total");
      return;
    }
    
    setUploadingImage(true);
    
    try {
      const newImageFiles = [...imageFiles];
      const newPreviews = [...previewImages];
      
      for (const file of validFiles) {
        // Create preview
        const reader = new FileReader();
        await new Promise((resolve) => {
          reader.onload = (e) => {
            newPreviews.push(e.target.result);
            resolve();
          };
          reader.readAsDataURL(file);
        });
        
        newImageFiles.push(file);
      }
      
      setImageFiles(newImageFiles);
      setPreviewImages(newPreviews);
    } catch (err) {
      setError("Error processing images: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };
  
  // Remove image
  const removeImage = (index) => {
    const newImageFiles = [...imageFiles];
    const newPreviews = [...previewImages];
    
    // Check if it's a new file or existing URL
    if (index < newImageFiles.length) {
      newImageFiles.splice(index, 1);
    }
    newPreviews.splice(index, 1);
    
    setImageFiles(newImageFiles);
    setPreviewImages(newPreviews);
  };
  
  // Handle specification addition
  const addSpecification = () => {
    if (!specKey.trim() || !specValue.trim()) {
      setError("Please enter both key and value for specification");
      return;
    }
    
    // Check if key already exists
    if (specifications.some(spec => spec.key === specKey.trim())) {
      setError("Specification key already exists");
      return;
    }
    
    const newSpecs = [...specifications, { key: specKey.trim(), value: specValue.trim() }];
    setSpecifications(newSpecs);
    
    // Update form data
    const specsObj = {};
    newSpecs.forEach(spec => {
      specsObj[spec.key] = spec.value;
    });
    
    setFormData({
      ...formData,
      specifications: specsObj
    });
    
    // Clear input fields
    setSpecKey("");
    setSpecValue("");
  };
  
  // Remove specification
  const removeSpecification = (index) => {
    const newSpecs = specifications.filter((_, i) => i !== index);
    setSpecifications(newSpecs);
    
    // Update form data
    const specsObj = {};
    newSpecs.forEach(spec => {
      specsObj[spec.key] = spec.value;
    });
    
    setFormData({
      ...formData,
      specifications: specsObj
    });
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error("Product name is required");
      }
      
      if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
        throw new Error("Please enter a valid price greater than 0");
      }
      
      if (!formData.category) {
        throw new Error("Please select a category");
      }
      
      // Prepare data
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        discountedPrice: formData.discountedPrice ? parseFloat(formData.discountedPrice) : null,
        stock: parseInt(formData.stock) || 0,
        specifications: formData.specifications || {}
      };
      
      // Handle image uploads if there are new images
      let imageUrls = [...previewImages];
      
      if (imageFiles.length > 0) {
        // Convert new files to base64
        const base64Images = [];
        
        for (const file of imageFiles) {
          try {
            const base64 = await convertToBase64(file);
            base64Images.push(base64);
          } catch (err) {
            console.error("Error converting file to base64:", err);
            throw new Error(`Failed to process image: ${file.name}`);
          }
        }
        
        // Replace file previews with base64 strings
        imageUrls = [...previewImages.filter(img => !img.startsWith('blob:') && !img.startsWith('data:')), ...base64Images];
      }
      
      // Add images to product data
      productData.images = imageUrls.filter(img => img && img.trim() !== "");
      
      console.log("Submitting product data:", productData);
      
      let response;
      if (isEdit) {
        response = await productAPI.updateProduct(id, productData);
      } else {
        response = await productAPI.createProduct(productData);
      }
      
      console.log("API Response:", response);
      
      if (response.success) {
        setSuccess(`Product ${isEdit ? 'updated' : 'created'} successfully!`);
        
        // Clear form for new product
        if (!isEdit) {
          setFormData({
            name: "",
            description: "",
            price: "",
            discountedPrice: "",
            stock: "",
            sku: "",
            weight: "",
            dimensions: "",
            category: "",
            featured: false,
            isActive: true,
            specifications: {}
          });
          setImageFiles([]);
          setPreviewImages([]);
          setSpecifications([]);
          setSpecKey("");
          setSpecValue("");
        }
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate("/admin/products");
        }, 2000);
      } else {
        throw new Error(response.message || "Failed to save product");
      }
    } catch (err) {
      console.error("Error saving product:", err);
      setError(err.message || "An error occurred while saving the product");
    } finally {
      setSaving(false);
    }
  };
  
  // Convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };
  
  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    handleImageUpload(files);
  };
  
  // Get image URL for preview
  const getImageUrl = (image) => {
    if (!image) return null;
    
    if (image.startsWith('http://') || 
        image.startsWith('https://') || 
        image.startsWith('blob:') || 
        image.startsWith('data:')) {
      return image;
    }
    
    // For existing images from backend
    const baseUrl = "https://federalpartsphilippines-backend.onrender.com";
    
    if (image.startsWith('/uploads/')) {
      return `${baseUrl}${image}`;
    }
    
    return `${baseUrl}/uploads/products/${image}`;
  };
  
  // Handle image error
  const handleImageError = (e) => {
    e.target.src = `data:image/svg+xml,${encodeURIComponent(`
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#F3F4F6"/>
        <text x="100" y="100" font-family="Arial" font-size="16" fill="#9CA3AF" text-anchor="middle" alignment-baseline="middle">No Image</text>
      </svg>
    `)}`;
    e.target.onerror = null;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEdit ? 'Edit Product' : 'Add New Product'}
              </h1>
              <p className="text-gray-600 mt-2">
                {isEdit 
                  ? 'Update product details, images, and specifications' 
                  : 'Create a new product with images and specifications'}
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/products")}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </button>
          </div>
          
          {/* Status Messages */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Error:</span>
                <span>{error}</span>
              </div>
            </div>
          )}
          
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Success!</span>
                <span>{success}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product name"
                />
              </div>
              
              {/* SKU and Category */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  SKU (Stock Keeping Unit)
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="PROD-001"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Price Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Price (PHP) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Discounted Price (PHP)
                </label>
                <div className="relative">
                  <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    name="discountedPrice"
                    value={formData.discountedPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00 (optional)"
                  />
                </div>
              </div>
              
              {/* Stock and Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Stock Quantity
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Weight (kg)
                </label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 2.5 kg"
                  />
                </div>
              </div>
              
              {/* Dimensions */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Dimensions (L × W × H)
                </label>
                <input
                  type="text"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 10 × 5 × 3 cm"
                />
              </div>
              
              {/* Description */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product description..."
                />
              </div>
              
              {/* Checkboxes */}
              <div className="lg:col-span-2 flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700 font-medium">Featured Product</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700 font-medium">Active (Visible to customers)</span>
                </label>
              </div>
            </div>
          </div>
          
          {/* Images Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              Product Images
            </h2>
            
            <div className="space-y-6">
              {/* Image Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50 hover:bg-blue-50"
                onClick={() => document.getElementById('image-upload').click()}
              >
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                />
                
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Drag & drop images here or click to browse
                </p>
                <p className="text-gray-500 text-sm">
                  Upload product images (JPG, PNG, GIF, etc.)
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Recommended size: 800×800 pixels
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Maximum 10 images
                </p>
              </div>
              
              {/* Uploading Indicator */}
              {uploadingImage && (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600">Processing images...</span>
                </div>
              )}
              
              {/* Image Previews */}
              {previewImages.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-700">
                      Uploaded Images ({previewImages.length}/10)
                    </h3>
                    <div className="text-sm text-gray-500">
                      First image will be used as main product image
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {previewImages.map((image, index) => (
                      <div 
                        key={index} 
                        className="relative group rounded-lg overflow-hidden border-2 border-gray-200"
                      >
                        <img
                          src={getImageUrl(image)}
                          alt={`Product ${index + 1}`}
                          className="w-full h-32 object-cover"
                          onError={handleImageError}
                        />
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Move to first position
                                const newPreviews = [...previewImages];
                                const [movedImage] = newPreviews.splice(index, 1);
                                newPreviews.unshift(movedImage);
                                setPreviewImages(newPreviews);
                                
                                // Also move file if it's a new file
                                if (index < imageFiles.length) {
                                  const newFiles = [...imageFiles];
                                  const [movedFile] = newFiles.splice(index, 1);
                                  newFiles.unshift(movedFile);
                                  setImageFiles(newFiles);
                                }
                              }}
                              className="p-2 bg-white rounded-full hover:bg-blue-50"
                              title="Set as main image"
                            >
                              <Eye className="w-4 h-4 text-gray-700" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(index);
                              }}
                              className="p-2 bg-white rounded-full hover:bg-red-50"
                              title="Remove image"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Main Image Badge */}
                        {index === 0 && (
                          <div className="absolute top-2 left-2">
                            <span className="px-2 py-1 text-xs font-bold bg-blue-600 text-white rounded">
                              Main
                            </span>
                          </div>
                        )}
                        
                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Image Order Note */}
                  <div className="mt-4 text-sm text-gray-500">
                    <p>First image is the main product image. Drag and drop or use the eye icon to reorder.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Specifications Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Product Specifications
            </h2>
            
            <div className="space-y-6">
              {/* Add Specification Form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Specification Key *
                  </label>
                  <input
                    type="text"
                    value={specKey}
                    onChange={(e) => setSpecKey(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Material"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Value *
                  </label>
                  <input
                    type="text"
                    value={specValue}
                    onChange={(e) => setSpecValue(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Stainless Steel"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={addSpecification}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Specification
                  </button>
                </div>
              </div>
              
              {/* Specifications List */}
              {specifications.length > 0 ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200">
                    <div className="col-span-5 px-4 py-3 text-sm font-bold text-gray-700">
                      Key
                    </div>
                    <div className="col-span-6 px-4 py-3 text-sm font-bold text-gray-700">
                      Value
                    </div>
                    <div className="col-span-1 px-4 py-3 text-sm font-bold text-gray-700">
                      Actions
                    </div>
                  </div>
                  
                  {specifications.map((spec, index) => (
                    <div 
                      key={index} 
                      className="grid grid-cols-12 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                    >
                      <div className="col-span-5 px-4 py-3">
                        <div className="font-medium text-gray-800">{spec.key}</div>
                      </div>
                      <div className="col-span-6 px-4 py-3">
                        <div className="text-gray-600">{spec.value}</div>
                      </div>
                      <div className="col-span-1 px-4 py-3 flex items-center">
                        <button
                          type="button"
                          onClick={() => removeSpecification(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove specification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No specifications added yet.</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Add specifications like material, dimensions, warranty, etc.
                  </p>
                </div>
              )}
              
              {/* Example Specifications */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Example Specifications:
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Material:</strong> Stainless Steel</li>
                  <li>• <strong>Warranty:</strong> 2 Years</li>
                  <li>• <strong>Color:</strong> Silver</li>
                  <li>• <strong>Manufacturer:</strong> Federal Parts</li>
                  <li>• <strong>Model:</strong> FP-2024</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-sm text-gray-500">
                Fields marked with * are required
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/admin/products")}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      {isEdit ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {isEdit ? 'Update Product' : 'Create Product'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;