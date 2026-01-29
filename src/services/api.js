// src/services/api.js - ULTIMATE FIXED VERSION FOR ALL DEPLOYMENTS
import axios from "axios";
import authService from "./auth.js";

// ========== ENVIRONMENT CONFIGURATION ==========
// FIXED: Fallback to proper Render URL if env vars not set
const getEnvVariable = (key, defaultValue) => {
  // Check for Vercel environment variables
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  // Check for import.meta.env (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  // Check for global window variable
  if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__[key]) {
    return window.__ENV__[key];
  }
  return defaultValue;
};

const DEFAULT_API_URL = "https://federalpartsphilippines-backend.onrender.com/api";
const DEFAULT_IMAGE_URL = "https://federalpartsphilippines-backend.onrender.com";

const API_BASE_URL = getEnvVariable('VITE_API_URL', DEFAULT_API_URL);
const IMAGE_BASE_URL = getEnvVariable('VITE_IMAGE_URL', DEFAULT_IMAGE_URL);

console.log("🌐 Environment Configuration:");
console.log("API_BASE_URL:", API_BASE_URL);
console.log("IMAGE_BASE_URL:", IMAGE_BASE_URL);
console.log("Environment:", typeof window !== 'undefined' ? window.location.hostname : 'Server');

const isBrowser = typeof window !== "undefined";

// ========== URL VALIDATION ==========
const validateAndFixUrl = (url) => {
  if (!url || url.trim() === "") {
    return DEFAULT_API_URL;
  }
  
  // Remove duplicate /api
  if (url.includes('/api/api')) {
    url = url.replace('/api/api', '/api');
  }
  
  // Ensure it ends with /api
  if (!url.endsWith('/api')) {
    url = url.endsWith('/') ? `${url}api` : `${url}/api`;
  }
  
  return url;
};

const validatedApiUrl = validateAndFixUrl(API_BASE_URL);
console.log("🌐 Final API URL:", validatedApiUrl);

// ========== AXIOS INSTANCE ==========
const API = axios.create({
  baseURL: validatedApiUrl,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  timeout: 30000,
  withCredentials: false,
});

// ========== REQUEST INTERCEPTOR ==========
API.interceptors.request.use(
  (config) => {
    if (isBrowser) {
      try {
        const token = authService?.getToken?.();
        if (token && token.trim() !== "") {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.warn("❌ Error getting auth token:", error);
      }

      // Add cache busting for GET requests
      if (config.method === "get") {
        config.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
        config.headers["Pragma"] = "no-cache";
        config.headers["Expires"] = "0";
        
        if (!config.params) {
          config.params = { _t: Date.now() };
        } else {
          config.params._t = Date.now();
        }
      }

      // Don't set Content-Type for FormData
      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      }
    }
    
    console.log(`➡️ ${config.method?.toUpperCase()} ${config.url}`, 
      config.data instanceof FormData ? "[FormData]" : 
      config.method === "get" ? config.params : 
      config.data ? "[Data]" : "");
    
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// ========== RESPONSE INTERCEPTOR ==========
API.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    
    if (response && response.data) {
      // Standardize response format
      if (response.data.success !== undefined || response.data.data || response.data.error) {
        return response.data;
      }
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    }
    return response;
  },
  (error) => {
    console.error("❌ API Error:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data
    });

    // Handle timeout
    if (error.code === "ECONNABORTED") {
      return Promise.reject({
        success: false,
        message: "Request timeout. Please try again.",
        status: 408,
      });
    }

    // Handle network errors
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      console.error("🌐 Network error detected!");
      console.error("Backend URL:", validatedApiUrl);
      
      return Promise.reject({
        success: false,
        message: "Cannot connect to server. Please check your internet connection and try again.",
        details: `Failed to connect to: ${validatedApiUrl.replace('/api', '')}`,
        status: 0,
      });
    }

    // Handle CORS errors
    if (error.message && error.message.includes("CORS")) {
      return Promise.reject({
        success: false,
        message: "CORS error. Please check backend CORS configuration.",
        details: "Backend needs to allow requests from your domain.",
        status: 0,
      });
    }

    // Handle HTTP errors
    if (error.response) {
      const { status, data } = error.response;

      // Handle 401 - Unauthorized
      if (status === 401 && isBrowser) {
        try {
          authService?.logout?.();
          if (!window.location.pathname.includes("/login")) {
            sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
            window.location.href = "/login";
          }
        } catch (authError) {
          console.warn("Auth logout error:", authError);
        }
      }

      // Handle other status codes
      switch (status) {
        case 403:
          return Promise.reject({
            success: false,
            message: "You don't have permission to perform this action.",
            status: 403,
          });
          
        case 404:
          return Promise.reject({
            success: false,
            message: data?.message || "Resource not found",
            status: 404,
          });
          
        case 400:
          let errorMessage = data?.message || "Bad request";
          if (data?.errors) {
            if (Array.isArray(data.errors)) {
              errorMessage = data.errors.map(err => err.msg || err.message).join(", ");
            } else if (typeof data.errors === 'object') {
              errorMessage = Object.values(data.errors).map(err => err.message || err).join(", ");
            }
          } else if (data?.error) {
            errorMessage = data.error;
          }
          
          return Promise.reject({
            success: false,
            message: errorMessage,
            data: data,
            status: 400,
          });
          
        case 429:
          return Promise.reject({
            success: false,
            message: "Too many requests. Please try again later.",
            status: 429,
          });
          
        default:
          if (status >= 500) {
            return Promise.reject({
              success: false,
              message: "Server error. Please try again later.",
              status: status,
            });
          }
          
          return Promise.reject({
            success: false,
            message: data?.message || `Error ${status}`,
            data: data,
            status: status,
          });
      }
    }

    // Handle unknown errors
    return Promise.reject({
      success: false,
      message: error.message || "An unexpected error occurred",
      status: -1,
    });
  }
);

// ========== ULTIMATE IMAGE URL HELPER ==========
export const getImageUrl = (imagePath, type = "products") => {
  // NULL CHECKS
  if (!imagePath || 
      imagePath === "undefined" || 
      imagePath === "null" || 
      imagePath === "" || 
      imagePath.trim() === "") {
    console.warn(`❌ Empty image path for ${type}`);
    return null;
  }

  console.log(`🖼️ Processing image:`, { imagePath, type });

  // ALREADY FULL URL - RETURN AS-IS
  if (
    typeof imagePath === "string" &&
    (imagePath.startsWith("http://") || 
     imagePath.startsWith("https://") ||
     imagePath.startsWith("blob:") || 
     imagePath.startsWith("data:"))
  ) {
    console.log(`✅ Already full URL: ${imagePath}`);
    return imagePath;
  }

  // FIXED: Get the correct base URL
  // Try multiple sources for base URL
  let baseUrl = "";
  
  // 1. Use IMAGE_BASE_URL if available
  if (IMAGE_BASE_URL && IMAGE_BASE_URL.trim() !== "") {
    baseUrl = IMAGE_BASE_URL;
  } 
  // 2. Fall back to API URL without /api
  else {
    baseUrl = validatedApiUrl.replace("/api", "");
  }
  
  // Clean up base URL
  baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  
  console.log(`📍 Base URL: ${baseUrl}`);

  // CLEAN THE FILENAME
  let filename = imagePath;
  
  // Remove query parameters
  if (filename.includes('?')) {
    filename = filename.split('?')[0];
    console.log(`🔪 Removed query params, filename: ${filename}`);
  }
  
  // Extract just the filename from path
  if (filename.includes("/")) {
    // Check if it's already a full path like /uploads/products/filename.jpg
    if (filename.includes('/uploads/')) {
      // Extract just the filename from the uploads path
      const parts = filename.split('/');
      const uploadsIndex = parts.findIndex(part => part === 'uploads');
      if (uploadsIndex !== -1 && parts.length > uploadsIndex + 2) {
        filename = parts[parts.length - 1]; // Get last part
      }
    } else {
      filename = filename.substring(filename.lastIndexOf("/") + 1);
    }
    console.log(`🔪 Extracted filename from path: ${filename}`);
  }
  
  // Decode URL encoding
  try {
    filename = decodeURIComponent(filename);
    console.log(`🔍 Decoded filename: ${filename}`);
  } catch (e) {
    console.warn(`⚠️ Could not decode filename: ${filename}`);
  }

  // Handle empty filename after cleaning
  if (!filename || filename.trim() === "") {
    console.warn(`❌ Empty filename after cleaning for: ${imagePath}`);
    return null;
  }

  // Handle special cases
  if (filename.includes('placeholder')) {
    console.log(`⚠️ Placeholder detected: ${filename}`);
    return null;
  }

  // FIXED: Construct final URL with consistent path
  const finalUrl = `${baseUrl}/uploads/${type}/${filename}`;
  console.log(`🎯 Final image URL: ${finalUrl}`);
  
  return finalUrl;
};

export const getSafeImageUrl = (imagePath, type = "products", fallback = null) => {
  const url = getImageUrl(imagePath, type);
  
  if (!url) {
    console.warn(`⚠️ No URL, using fallback for: ${imagePath}`);
    return fallback || `/placeholder-${type}.jpg`;
  }
  
  return url;
};

// ========== PROCESSING HELPERS ==========
const processProductImages = (product) => {
  if (!product) return product;
  
  const productObj = { ...product };
  
  // Ensure images array exists
  if (!Array.isArray(productObj.images)) {
    if (productObj.image) {
      productObj.images = [productObj.image];
    } else if (productObj.imageUrl) {
      productObj.images = [productObj.imageUrl];
    } else {
      productObj.images = [];
    }
  }
  
  // Process each image
  productObj.images = productObj.images
    .filter(img => img && img.trim() !== "")
    .map(img => {
      // FIXED: Check if image is already a full URL or needs processing
      if (img && (img.startsWith('http') || img.startsWith('https') || img.startsWith('/uploads/'))) {
        // If it's already a full path starting with /uploads/, construct URL
        if (img.startsWith('/uploads/')) {
          const baseUrl = IMAGE_BASE_URL || validatedApiUrl.replace("/api", "");
          return `${baseUrl.replace(/\/$/, '')}${img}`;
        }
        return img;
      }
      return getImageUrl(img, "products");
    })
    .filter(img => img !== null && img !== undefined);
  
  // Set main image if available
  if (productObj.images.length > 0 && !productObj.image) {
    productObj.image = productObj.images[0];
  }
  
  console.log(`🖼️ Processed product ${productObj.name || productObj._id}:`, {
    originalCount: product.images?.length || 0,
    processedCount: productObj.images.length,
    images: productObj.images
  });
  
  return productObj;
};

const processCategoryImage = (category) => {
  if (!category) return category;
  
  const categoryObj = { ...category };
  
  // Process main image - FIXED: Check for full URLs
  if (categoryObj.image && categoryObj.image.trim() !== "") {
    if (categoryObj.image.startsWith('http') || categoryObj.image.startsWith('https')) {
      // Already a full URL
      categoryObj.image = categoryObj.image;
    } else if (categoryObj.image.startsWith('/uploads/')) {
      // Path starting with /uploads/
      const baseUrl = IMAGE_BASE_URL || validatedApiUrl.replace("/api", "");
      categoryObj.image = `${baseUrl.replace(/\/$/, '')}${categoryObj.image}`;
    } else {
      // Filename only
      categoryObj.image = getImageUrl(categoryObj.image, "categories");
    }
  }
  
  // Process imageUrl if exists
  if (categoryObj.imageUrl && categoryObj.imageUrl.trim() !== "") {
    if (categoryObj.imageUrl.startsWith('http') || categoryObj.imageUrl.startsWith('https')) {
      categoryObj.imageUrl = categoryObj.imageUrl;
    } else if (categoryObj.imageUrl.startsWith('/uploads/')) {
      const baseUrl = IMAGE_BASE_URL || validatedApiUrl.replace("/api", "");
      categoryObj.imageUrl = `${baseUrl.replace(/\/$/, '')}${categoryObj.imageUrl}`;
    } else {
      categoryObj.imageUrl = getImageUrl(categoryObj.imageUrl, "categories");
    }
  }
  
  console.log(`📁 Processed category ${categoryObj.name || categoryObj._id}:`, {
    originalImage: category.image,
    processedImage: categoryObj.image
  });
  
  return categoryObj;
};

// ========== UPLOAD UTILITIES ==========
export const uploadImage = async (file, type = "category") => {
  try {
    console.log(`📤 Uploading ${type} image:`, file.name);
    
    if (!file) {
      return {
        success: false,
        message: "No file provided"
      };
    }

    const formData = new FormData();
    formData.append("image", file);
    
    const endpoint = type === "category" ? "/upload/category" : "/upload";
    
    const response = await API.post(endpoint, formData);

    console.log("📤 Upload response:", response);
    
    // FIXED: Ensure the response has proper URL
    if (response.success && response.image) {
      // If server returns relative path, convert to absolute URL
      if (response.image.url && !response.image.url.startsWith('http')) {
        const baseUrl = IMAGE_BASE_URL || validatedApiUrl.replace("/api", "");
        response.image.fullUrl = `${baseUrl}${response.image.url.startsWith('/') ? '' : '/'}${response.image.url}`;
      }
    }
    
    return response;
  } catch (error) {
    console.error("❌ Error uploading image:", error);
    return {
      success: false,
      message: error.message || "Failed to upload image",
      error: error
    };
  }
};

export const uploadBase64Image = async (base64Data, type = "product") => {
  try {
    console.log(`📤 Uploading base64 ${type} image`);
    
    if (!base64Data || !base64Data.startsWith("data:image/")) {
      return {
        success: false,
        message: "Invalid base64 image data"
      };
    }

    const response = await API.post("/upload/base64", {
      image: base64Data,
      type: type
    });

    // FIXED: Ensure proper URL in response
    if (response.success && response.image) {
      if (response.image.url && !response.image.url.startsWith('http')) {
        const baseUrl = IMAGE_BASE_URL || validatedApiUrl.replace("/api", "");
        response.image.fullUrl = `${baseUrl}${response.image.url.startsWith('/') ? '' : '/'}${response.image.url}`;
      }
    }

    return response;
  } catch (error) {
    console.error("❌ Error uploading base64 image:", error);
    return {
      success: false,
      message: error.message || "Failed to upload base64 image",
      error: error
    };
  }
};

// ========== CATEGORY API ==========
export const categoryAPI = {
  getAllCategories: async (params = {}) => {
    try {
      console.log("📁 Fetching categories with params:", params);
      const response = await API.get("/categories", { params });
      
      if (response.success && response.categories) {
        const processedCategories = response.categories.map(category => 
          processCategoryImage(category)
        );
        
        return {
          ...response,
          categories: processedCategories
        };
      }
      
      return response;
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch categories",
        categories: []
      };
    }
  },

  getAll: async (params = {}) => {
    return categoryAPI.getAllCategories(params);
  },

  getCategoryById: async (id) => {
    try {
      console.log(`📁 Fetching category ${id}`);
      const response = await API.get(`/categories/${id}`);
      
      if (response.success && response.category) {
        response.category = processCategoryImage(response.category);
      }
      
      return response;
    } catch (error) {
      console.error(`❌ Error fetching category ${id}:`, error);
      return {
        success: false,
        message: error.message || "Failed to fetch category",
        category: null
      };
    }
  },

  createCategory: async (categoryData) => {
    try {
      console.log("➕ Creating category:", categoryData);
      
      const formData = new FormData();
      
      formData.append('name', categoryData.name || '');
      formData.append('description', categoryData.description || '');
      formData.append('seoTitle', categoryData.seoTitle || '');
      formData.append('seoDescription', categoryData.seoDescription || '');
      formData.append('seoKeywords', categoryData.seoKeywords || '');
      formData.append('order', categoryData.order?.toString() || '0');
      formData.append('isActive', categoryData.isActive?.toString() || 'true');
      
      if (categoryData.parentCategory) {
        formData.append('parentCategory', categoryData.parentCategory);
      }
      
      if (categoryData.image instanceof File) {
        formData.append('image', categoryData.image);
      } else if (categoryData.image && categoryData.image.startsWith('data:image/')) {
        const uploadResponse = await uploadBase64Image(categoryData.image, 'category');
        if (uploadResponse.success) {
          formData.append('imageUrl', uploadResponse.image?.fullUrl || uploadResponse.image?.url || '');
        }
      }
      
      const response = await API.post("/categories", formData);
      
      console.log("✅ Create category response:", response);
      
      if (response.success && response.category) {
        response.category = processCategoryImage(response.category);
      }
      
      return response;
    } catch (error) {
      console.error("❌ Error creating category:", error);
      return {
        success: false,
        message: error.message || "Failed to create category",
        category: null,
        error: error
      };
    }
  },

  updateCategory: async (id, categoryData) => {
    try {
      console.log(`✏️ Updating category ${id}:`, categoryData);
      
      const formData = new FormData();
      
      formData.append('name', categoryData.name || '');
      formData.append('description', categoryData.description || '');
      formData.append('seoTitle', categoryData.seoTitle || '');
      formData.append('seoDescription', categoryData.seoDescription || '');
      formData.append('seoKeywords', categoryData.seoKeywords || '');
      formData.append('order', categoryData.order?.toString() || '0');
      formData.append('isActive', categoryData.isActive?.toString() || 'true');
      
      if (categoryData.parentCategory) {
        formData.append('parentCategory', categoryData.parentCategory);
      } else {
        formData.append('parentCategory', '');
      }
      
      if (categoryData.image instanceof File) {
        formData.append('image', categoryData.image);
      } else if (categoryData.image === '' || categoryData.image === null) {
        formData.append('removeImage', 'true');
      } else if (categoryData.image && categoryData.image.startsWith('data:image/')) {
        const uploadResponse = await uploadBase64Image(categoryData.image, 'category');
        if (uploadResponse.success) {
          formData.append('imageUrl', uploadResponse.image?.fullUrl || uploadResponse.image?.url || '');
        }
      }
      
      const response = await API.put(`/categories/${id}`, formData);
      
      console.log("✅ Update category response:", response);
      
      if (response.success && response.category) {
        response.category = processCategoryImage(response.category);
      }
      
      return response;
    } catch (error) {
      console.error(`❌ Error updating category ${id}:`, error);
      console.error("Error details:", error.response?.data);
      return {
        success: false,
        message: error.message || "Failed to update category",
        category: null,
        error: error
      };
    }
  },

  deleteCategory: async (id) => {
    try {
      console.log(`🗑️ Deleting category ${id}`);
      const response = await API.delete(`/categories/${id}`);
      return response;
    } catch (error) {
      console.error(`❌ Error deleting category ${id}:`, error);
      return {
        success: false,
        message: error.message || "Failed to delete category"
      };
    }
  },

  updateCategoryProductCounts: async () => {
    try {
      console.log("🔄 Updating category product counts...");
      const response = await API.post("/admin/categories/update-counts");
      return response;
    } catch (error) {
      console.error("❌ Error updating category product counts:", error);
      return {
        success: false,
        message: error.message || "Failed to update category product counts"
      };
    }
  },
};

// ========== PRODUCT API ==========
export const productAPI = {
  getAllProducts: async (params = {}) => {
    try {
      console.log("📦 Fetching products with params:", params);
      const response = await API.get("/products", { params });
      
      if (response.success && response.products) {
        const processedProducts = response.products.map(product => 
          processProductImages(product)
        );
        
        return {
          ...response,
          products: processedProducts
        };
      }
      
      return response;
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch products",
        products: [],
        total: 0,
        totalPages: 0
      };
    }
  },

  getAll: async (params = {}) => {
    return productAPI.getAllProducts(params);
  },

  getProductById: async (id) => {
    try {
      console.log(`📦 Fetching product ${id}`);
      const response = await API.get(`/products/${id}`);
      
      if (response.success && response.product) {
        response.product = processProductImages(response.product);
      }
      
      return response;
    } catch (error) {
      console.error(`❌ Error fetching product ${id}:`, error);
      return {
        success: false,
        message: error.message || "Failed to fetch product",
        product: null
      };
    }
  },

  createProduct: async (productData) => {
    try {
      console.log("➕ Creating product:", productData);
      
      // Prepare the data to send
      const dataToSend = {
        name: productData.name || '',
        description: productData.description || '',
        price: productData.price || 0,
        stock: productData.stock || 0,
        sku: productData.sku || '',
        weight: productData.weight || '',
        dimensions: productData.dimensions || '',
        featured: productData.featured || false,
        isActive: productData.isActive !== undefined ? productData.isActive : true,
        specifications: productData.specifications || {},
      };

      // Add category if provided
      if (productData.category && productData.category.trim() !== '') {
        dataToSend.category = productData.category;
      }

      // Handle images - send base64 images directly
      if (productData.images && Array.isArray(productData.images)) {
        dataToSend.images = productData.images;
      }

      console.log("📤 Sending product data:", dataToSend);
      
      const response = await API.post("/admin/products", dataToSend);
      
      if (response.success && response.product) {
        response.product = processProductImages(response.product);
      }
      
      return response;
    } catch (error) {
      console.error("❌ Error creating product:", error);
      return {
        success: false,
        message: error.message || "Failed to create product",
        product: null,
        error: error
      };
    }
  },

  updateProduct: async (id, productData) => {
    try {
      console.log(`✏️ Updating product ${id}:`, productData);
      
      // Prepare the data to send
      const dataToSend = {
        name: productData.name || '',
        description: productData.description || '',
        price: productData.price || 0,
        stock: productData.stock || 0,
        sku: productData.sku || '',
        weight: productData.weight || '',
        dimensions: productData.dimensions || '',
        featured: productData.featured || false,
        isActive: productData.isActive !== undefined ? productData.isActive : true,
        specifications: productData.specifications || {},
      };

      // Add category if provided
      if (productData.category && productData.category.trim() !== '') {
        dataToSend.category = productData.category;
      }

      // Handle images - send base64 images directly
      if (productData.images && Array.isArray(productData.images)) {
        dataToSend.images = productData.images;
      }

      console.log("📤 Sending update data:", dataToSend);
      
      const response = await API.put(`/admin/products/${id}`, dataToSend);
      
      if (response.success && response.product) {
        response.product = processProductImages(response.product);
      }
      
      return response;
    } catch (error) {
      console.error(`❌ Error updating product ${id}:`, error);
      return {
        success: false,
        message: error.message || "Failed to update product",
        product: null,
        error: error
      };
    }
  },

  deleteProduct: async (id) => {
    try {
      console.log(`🗑️ Deleting product ${id}`);
      const response = await API.delete(`/admin/products/${id}`);
      return response;
    } catch (error) {
      console.error(`❌ Error deleting product ${id}:`, error);
      return {
        success: false,
        message: error.message || "Failed to delete product"
      };
    }
  },

  searchProducts: async (query, params = {}) => {
    try {
      const response = await API.get("/products", {
        params: { search: query, ...params }
      });
      
      if (response.success && response.products) {
        response.products = response.products.map(product => 
          processProductImages(product)
        );
      }
      
      return response;
    } catch (error) {
      console.error("❌ Error searching products:", error);
      return {
        success: false,
        message: error.message || "Failed to search products",
        products: [],
        total: 0
      };
    }
  },

  getProductsByCategory: async (categoryId, params = {}) => {
    try {
      const response = await API.get("/products", {
        params: { category: categoryId, ...params }
      });
      
      if (response.success && response.products) {
        response.products = response.products.map(product => 
          processProductImages(product)
        );
      }
      
      return response;
    } catch (error) {
      console.error(`❌ Error fetching products by category ${categoryId}:`, error);
      return {
        success: false,
        message: error.message || "Failed to fetch products by category",
        products: [],
        total: 0
      };
    }
  },

  uploadProductImage: async (imageFile, productId = null) => {
    try {
      console.log(`📸 Uploading product image${productId ? ` for product ${productId}` : ''}`);
      
      if (!imageFile) {
        return {
          success: false,
          message: "No image file provided"
        };
      }
      
      const formData = new FormData();
      formData.append('image', imageFile);
      if (productId) {
        formData.append('productId', productId);
      }
      
      const response = await API.post("/upload", formData);
      
      return response;
    } catch (error) {
      console.error("❌ Error uploading product image:", error);
      return {
        success: false,
        message: error.message || "Failed to upload product image",
        image: null
      };
    }
  },
};

// ========== AUTH API ==========
export const authAPI = {
  login: (credentials) => API.post("/auth/login", credentials),
  register: (userData) => API.post("/auth/register", userData),
  logout: () => API.post("/auth/logout"),
  refreshToken: () => API.post("/auth/refresh-token"),
  getCurrentUser: () => API.get("/auth/me"),
  updateProfile: (userData) => API.put("/auth/profile", userData),
  changePassword: (passwordData) => API.put("/auth/change-password", passwordData),
  forgotPassword: (email) => API.post("/auth/forgot-password", { email }),
  resetPassword: (token, passwordData) => 
    API.post(`/auth/reset-password/${token}`, passwordData),
  verifyEmail: (token) => API.post(`/auth/verify-email/${token}`),
  resendVerificationEmail: (email) => 
    API.post("/auth/resend-verification", { email }),
};

// ========== CART API ==========
export const cartAPI = {
  getCart: () => {
    if (isBrowser) {
      try {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : { items: [], total: 0, count: 0 };
      } catch (error) {
        console.error("Error parsing cart from localStorage:", error);
        return { items: [], total: 0, count: 0 };
      }
    }
    return { items: [], total: 0, count: 0 };
  },
  
  addToCart: (product, quantity = 1) => {
    if (!isBrowser) return { success: false, message: "Not in browser" };
    
    try {
      const cart = cartAPI.getCart();
      const existingIndex = cart.items.findIndex(item => item.product._id === product._id);
      
      if (existingIndex >= 0) {
        cart.items[existingIndex].quantity += quantity;
      } else {
        cart.items.push({
          product: {
            _id: product._id,
            name: product.name,
            price: product.price,
            discountedPrice: product.discountedPrice,
            images: product.images || [],
            stock: product.stock || 0
          },
          quantity: quantity
        });
      }
      
      cart.total = cart.items.reduce((sum, item) => {
        const price = item.product.discountedPrice || item.product.price;
        return sum + (price * item.quantity);
      }, 0);
      
      cart.count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      
      localStorage.setItem('cart', JSON.stringify(cart));
      
      return {
        success: true,
        cart,
        message: "Product added to cart"
      };
    } catch (error) {
      console.error("❌ Error adding to cart:", error);
      return {
        success: false,
        message: error.message || "Failed to add to cart"
      };
    }
  },
  
  updateCartItem: (productId, quantity) => {
    if (!isBrowser) return { success: false, message: "Not in browser" };
    
    try {
      const cart = cartAPI.getCart();
      const itemIndex = cart.items.findIndex(item => item.product._id === productId);
      
      if (itemIndex >= 0) {
        if (quantity <= 0) {
          cart.items.splice(itemIndex, 1);
        } else {
          cart.items[itemIndex].quantity = quantity;
        }
        
        cart.total = cart.items.reduce((sum, item) => {
          const price = item.product.discountedPrice || item.product.price;
          return sum + (price * item.quantity);
        }, 0);
        
        cart.count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        
        localStorage.setItem('cart', JSON.stringify(cart));
        
        return {
          success: true,
          cart,
          message: "Cart updated"
        };
      }
      
      return {
        success: false,
        message: "Product not found in cart"
      };
    } catch (error) {
      console.error("❌ Error updating cart:", error);
      return {
        success: false,
        message: error.message || "Failed to update cart"
      };
    }
  },
  
  removeFromCart: (productId) => {
    return cartAPI.updateCartItem(productId, 0);
  },
  
  clearCart: () => {
    if (!isBrowser) return { success: false, message: "Not in browser" };
    
    try {
      localStorage.setItem('cart', JSON.stringify({ items: [], total: 0, count: 0 }));
      return {
        success: true,
        message: "Cart cleared"
      };
    } catch (error) {
      console.error("❌ Error clearing cart:", error);
      return {
        success: false,
        message: error.message || "Failed to clear cart"
      };
    }
  },
  
  getCartCount: () => {
    const cart = cartAPI.getCart();
    return cart.count || 0;
  }
};

// ========== DASHBOARD API ==========
export const dashboardAPI = {
  getOverviewStats: async () => {
    try {
      const productsResponse = await productAPI.getAllProducts({ limit: 1 });
      const totalProducts = productsResponse.total || 0;
      
      const lowStockResponse = await productAPI.getAllProducts({ 
        inStock: true,
        maxStock: 10
      });
      const lowStockProducts = lowStockResponse.products?.length || 0;
      
      const categoryResponse = await categoryAPI.getAllCategories();
      const totalCategories = categoryResponse.categories?.length || 0;
      
      const allProducts = await productAPI.getAllProducts({ limit: 1000 });
      let totalValue = 0;
      if (allProducts.products) {
        totalValue = allProducts.products.reduce((sum, product) => {
          const price = product.discountedPrice || product.price || 0;
          const stock = product.stock || 0;
          return sum + (price * stock);
        }, 0);
      }
      
      return {
        success: true,
        stats: {
          products: {
            total: totalProducts,
            inStock: totalProducts - (lowStockProducts || 0),
            lowStock: lowStockProducts,
          },
          orders: {
            totalOrders: 0,
            pendingOrders: 0,
            completedOrders: 0,
            cancelledOrders: 0,
            totalRevenue: 0
          },
          categories: {
            total: totalCategories,
            active: categoryResponse.categories?.filter(c => c.isActive).length || 0
          },
          totalValue: totalValue,
          lowStockAlerts: lowStockProducts
        }
      };
    } catch (error) {
      console.error("❌ Error fetching dashboard stats:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch dashboard stats",
        stats: {}
      };
    }
  }
};

// ========== UTILITY FUNCTIONS ==========
export const formatPrice = (price, currency = "PHP") => {
  try {
    if (price === null || price === undefined) {
      return `₱0.00`;
    }
    
    const priceNum = Number(price);
    
    if (isNaN(priceNum)) {
      return `₱0.00`;
    }
    
    if (currency === "PHP") {
      return `₱${priceNum.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(priceNum);
    } catch (intlError) {
      return `${currency} ${priceNum.toFixed(2)}`;
    }
  } catch (error) {
    console.error("Error formatting price:", error);
    return `₱0.00`;
  }
};

export const calculateDiscountPercentage = (price, discountedPrice) => {
  if (!price || !discountedPrice || discountedPrice >= price) return 0;
  return Math.round(((price - discountedPrice) / price) * 100);
};

export const getFinalPrice = (price, discountedPrice) => {
  if (!price) return 0;
  return discountedPrice && discountedPrice < price ? discountedPrice : price;
};

// ========== CONNECTION TESTING ==========
export const testApiConnection = async () => {
  console.log("🔍 Testing API connection...");
  
  const endpointsToTest = [
    validatedApiUrl.replace('/api', ''),
    validatedApiUrl,
    `${validatedApiUrl.replace('/api', '')}/health`,
  ];

  const results = [];

  for (const endpoint of endpointsToTest) {
    try {
      console.log(`🔄 Testing: ${endpoint}`);
      const response = await axios.get(endpoint, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log(`✅ Connected to: ${endpoint}`);
      results.push({
        endpoint,
        success: true,
        status: response.status,
        data: response.data
      });
      
      return {
        success: true,
        connected: true,
        message: `Connected to ${endpoint}`,
        endpoint,
        data: response.data,
        allResults: results
      };
    } catch (error) {
      console.log(`❌ Failed: ${endpoint} - ${error.message}`);
      results.push({
        endpoint,
        success: false,
        error: error.message
      });
    }
  }

  return {
    success: false,
    connected: false,
    message: "Cannot connect to any API endpoint",
    allResults: results,
    suggestions: [
      "1. Check if backend server is running on Render",
      "2. Verify CORS is configured on backend",
      "3. Check network connectivity",
      `4. Backend URL should be: https://federalpartsphilippines-backend.onrender.com`
    ]
  };
};

// ========== DEBUGGING UTILITIES ==========
export const debugImage = (imagePath, type = "products") => {
  console.log("🔍 DEBUG IMAGE:");
  console.log("Input:", imagePath);
  console.log("Type:", type);
  console.log("Result:", getImageUrl(imagePath, type));
  return getImageUrl(imagePath, type);
};

export const testImageUrls = () => {
  const testCases = [
    { input: "engine.jpg", type: "products" },
    { input: "engine.jpg?timestamp=123456", type: "products" },
    { input: "/uploads/products/engine.jpg", type: "products" },
    { input: "uploads/products/engine.jpg", type: "products" },
    { input: "https://example.com/image.jpg", type: "products" },
    { input: "engine%20part.jpg", type: "products" },
    { input: "undefined", type: "products" },
    { input: "", type: "products" },
    { input: "brake-pads.jpg", type: "categories" },
  ];

  console.log("🧪 TESTING IMAGE URLS:");
  testCases.forEach(test => {
    console.log(`🧪 "${test.input}" (${test.type}) -> ${getImageUrl(test.input, test.type)}`);
  });
};

// ========== MAIN API SERVICE OBJECT ==========
const apiService = {
  // Core
  API,
  
  // API modules
  productAPI,
  categoryAPI,
  authAPI,
  cartAPI,
  dashboardAPI,
  
  // Image utilities
  getImageUrl,
  getSafeImageUrl,
  getFullImageUrl: getImageUrl,
  uploadImage,
  uploadBase64Image,
  
  // Price utilities
  formatPrice,
  calculateDiscountPercentage,
  getFinalPrice,
  
  // Testing & debugging
  testApiConnection,
  debugImage,
  testImageUrls,
  
  // Configuration
  API_BASE_URL: validatedApiUrl,
  IMAGE_BASE_URL: IMAGE_BASE_URL || DEFAULT_IMAGE_URL,
  
  // Convenience methods
  getProducts: productAPI.getAllProducts,
  getProduct: productAPI.getProductById,
  createProduct: productAPI.createProduct,
  updateProduct: productAPI.updateProduct,
  deleteProduct: productAPI.deleteProduct,
  searchProducts: productAPI.searchProducts,
  
  getCategories: categoryAPI.getAllCategories,
  getCategory: categoryAPI.getCategoryById,
  createCategory: categoryAPI.createCategory,
  updateCategory: categoryAPI.updateCategory,
  deleteCategory: categoryAPI.deleteCategory,
  updateCategoryProductCounts: categoryAPI.updateCategoryProductCounts,
  
  login: authAPI.login,
  register: authAPI.register,
  logout: authAPI.logout,
  getCurrentUser: authAPI.getCurrentUser,
  
  getCart: cartAPI.getCart,
  addToCart: cartAPI.addToCart,
  updateCartItem: cartAPI.updateCartItem,
  removeFromCart: cartAPI.removeFromCart,
  clearCart: cartAPI.clearCart,
  getCartCount: cartAPI.getCartCount,
  
  getDashboardStats: dashboardAPI.getOverviewStats,
  
  // Connection check
  checkConnection: async () => {
    try {
      const response = await API.get("/");
      return {
        success: true,
        connected: true,
        message: "API is running",
        data: response
      };
    } catch (error) {
      console.error("❌ API connection check failed:", error);
      return {
        success: false,
        connected: false,
        message: "Cannot connect to API",
        error: error.message
      };
    }
  },
  
  // Health check
  healthCheck: async () => {
    try {
      const response = await API.get("/health");
      return response;
    } catch (error) {
      return {
        success: false,
        message: "API health check failed",
        error: error.message
      };
    }
  },
  
  // File upload
  uploadFile: async (file, endpoint = "/upload", fieldName = "image") => {
    try {
      if (!file) {
        return {
          success: false,
          message: "No file provided"
        };
      }
      
      const formData = new FormData();
      formData.append(fieldName, file);
      
      const response = await API.post(endpoint, formData);
      
      return response;
    } catch (error) {
      console.error("❌ Error uploading file:", error);
      return {
        success: false,
        message: error.message || "Failed to upload file",
        error: error
      };
    }
  },
  
  // Initialization
  initialize: async () => {
    console.log("🚀 Initializing API Service...");
    console.log("📡 API URL:", validatedApiUrl);
    console.log("🖼️ Image URL:", IMAGE_BASE_URL || DEFAULT_IMAGE_URL);
    console.log("🌍 Environment:", isBrowser ? 'Browser' : 'Server');
    
    const connection = await testApiConnection();
    console.log("🔌 Connection Status:", connection.success ? "✅ Connected" : "❌ Failed");
    
    if (connection.success) {
      console.log("🌐 Connected to:", connection.endpoint);
    } else {
      console.error("⚠️ Connection failed. Please check:");
      console.error("1. Backend server is running");
      console.error("2. CORS is properly configured");
      console.error("3. Network connectivity");
      console.error(`4. Backend URL: ${DEFAULT_API_URL}`);
    }
    
    return connection;
  },
  
  // Image utilities
  checkImageExists: async (imageUrl) => {
    try {
      const response = await axios.head(imageUrl, { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      console.log(`Image not found: ${imageUrl}`, error.message);
      return false;
    }
  },
  
  getAllImageUrls: async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productAPI.getAllProducts({ limit: 100 }),
        categoryAPI.getAllCategories()
      ]);
      
      const allUrls = [];
      
      if (productsRes.success && productsRes.products) {
        productsRes.products.forEach(product => {
          if (product.images && Array.isArray(product.images)) {
            product.images.forEach(img => {
              allUrls.push({
                type: 'product',
                productId: product._id,
                productName: product.name,
                url: getImageUrl(img, 'products'),
                original: img
              });
            });
          }
        });
      }
      
      if (categoriesRes.success && categoriesRes.categories) {
        categoriesRes.categories.forEach(category => {
          if (category.image) {
            allUrls.push({
              type: 'category',
              categoryId: category._id,
              categoryName: category.name,
              url: getImageUrl(category.image, 'categories'),
              original: category.image
            });
          }
        });
      }
      
      return {
        success: true,
        total: allUrls.length,
        urls: allUrls
      };
    } catch (error) {
      console.error("Error getting all image URLs:", error);
      return {
        success: false,
        message: error.message,
        urls: []
      };
    }
  },
  
  // Image debug
  debugProductImages: (product) => {
    console.log("🔍 DEBUGGING PRODUCT IMAGES:");
    console.log("Product ID:", product._id);
    console.log("Product Name:", product.name);
    console.log("Raw images:", product.images);
    
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((img, index) => {
        console.log(`Image ${index}:`, {
          raw: img,
          processed: getImageUrl(img, "products"),
          type: typeof img
        });
      });
    }
  },
  
  // NEW: Environment detection helper
  getEnvironmentInfo: () => {
    return {
      isBrowser: isBrowser,
      isLocalhost: isBrowser && window.location.hostname.includes('localhost'),
      isVercel: isBrowser && window.location.hostname.includes('vercel'),
      apiUrl: validatedApiUrl,
      imageUrl: IMAGE_BASE_URL || DEFAULT_IMAGE_URL,
      hostname: isBrowser ? window.location.hostname : 'Server'
    };
  }
};

export default apiService;