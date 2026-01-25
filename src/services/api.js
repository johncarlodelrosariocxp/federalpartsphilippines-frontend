// src/services/api.js - COMPLETE FIXED VERSION WITH ALL FUNCTIONS
import axios from "axios";
import authService from "./auth.js";

// ========== ENVIRONMENT CONFIGURATION ==========
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://federalpartsphilippines-backend.onrender.com/api";
const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_URL || "https://federalpartsphilippines-backend.onrender.com";

// Check if running in browser environment
const isBrowser = typeof window !== "undefined";

// ========== URL VALIDATION ==========
const validateAndFixUrl = (url) => {
  if (!url || url.trim() === "") {
    return "https://federalpartsphilippines-backend.onrender.com/api";
  }
  
  if (url.includes('/api/api')) {
    url = url.replace('/api/api', '/api');
  }
  
  if (!url.endsWith('/api')) {
    url = url.endsWith('/') ? `${url}api` : `${url}/api`;
  }
  
  return url;
};

const validatedApiUrl = validateAndFixUrl(API_BASE_URL);
console.log("🌐 API Base URL:", validatedApiUrl);

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

      if (config.method === "get") {
        config.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
        config.headers["Pragma"] = "no-cache";
        config.headers["Expires"] = "0";
      }

      // Don't set Content-Type for FormData - let browser set it with boundary
      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      }
      
      if (config.method === "get" && !config.params) {
        config.params = { _t: Date.now() };
      } else if (config.method === "get" && config.params) {
        config.params._t = Date.now();
      }
    }
    
    console.log(`➡️ ${config.method?.toUpperCase()} ${config.url}`, config.data instanceof FormData ? "[FormData]" : config.params || "");
    
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
      // If response already has the success/data structure, return it as-is
      if (
        response.data.success !== undefined ||
        response.data.data ||
        response.data.error
      ) {
        return response.data;
      }
      // Wrap raw data in standard response format
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

    if (error.code === "ECONNABORTED") {
      return Promise.reject({
        success: false,
        message: "Request timeout. Please try again.",
        status: 408,
      });
    }

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

    if (error.message && error.message.includes("CORS")) {
      return Promise.reject({
        success: false,
        message: "CORS error. Please check backend CORS configuration.",
        details: "Backend needs to allow requests from your domain.",
        status: 0,
      });
    }

    if (error.response) {
      const { status, data } = error.response;

      if (status === 401 && isBrowser) {
        try {
          authService?.logout?.();
          if (!window.location.pathname.includes("/login")) {
            sessionStorage.setItem(
              "redirectAfterLogin",
              window.location.pathname
            );
            window.location.href = "/login";
          }
        } catch (authError) {
          console.warn("Auth logout error:", authError);
        }
      }

      if (status === 403) {
        return Promise.reject({
          success: false,
          message: "You don't have permission to perform this action.",
          status: 403,
        });
      }

      if (status === 404) {
        return Promise.reject({
          success: false,
          message: data?.message || "Resource not found",
          status: 404,
        });
      }

      if (status === 400) {
        // Enhanced 400 error handling
        let errorMessage = data?.message || "Bad request";
        if (data?.errors) {
          // Handle validation errors
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
      }

      if (status === 429) {
        return Promise.reject({
          success: false,
          message: "Too many requests. Please try again later.",
          status: 429,
        });
      }

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

    return Promise.reject({
      success: false,
      message: error.message || "An unexpected error occurred",
      status: -1,
    });
  }
);

// ========== FIXED IMAGE URL HELPER - COMPREHENSIVE FIX ==========
export const getImageUrl = (imagePath, type = "products") => {
  // Return null instead of empty string when no image path is provided
  if (!imagePath || 
      imagePath === "undefined" || 
      imagePath === "null" || 
      imagePath === "" || 
      imagePath === " " || 
      imagePath.trim() === "") {
    return null;
  }

  // Handle full URLs - return as-is
  if (
    typeof imagePath === "string" &&
    (imagePath.startsWith("http://") || imagePath.startsWith("https://") ||
     imagePath.startsWith("blob:") || imagePath.startsWith("data:"))
  ) {
    return imagePath;
  }

  const baseUrl = IMAGE_BASE_URL || "https://federalpartsphilippines-backend.onrender.com";
  
  // FIX: Ensure baseUrl doesn't have trailing /api for image URLs
  const cleanBaseUrl = baseUrl.replace(/\/api$/, '');
  
  // Handle absolute paths starting with /uploads
  if (typeof imagePath === "string" && imagePath.startsWith("/uploads/")) {
    return `${cleanBaseUrl}${imagePath}`;
  }
  
  // Handle relative paths that already include uploads
  if (typeof imagePath === "string" && imagePath.includes("uploads/")) {
    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${cleanBaseUrl}${path}`;
  }
  
  // Handle filename only - construct proper path
  if (typeof imagePath === "string") {
    const cleanFilename = imagePath.replace(/^.*[\\/]/, '');
    
    if (!cleanFilename || cleanFilename.trim() === "") {
      return null;
    }
    
    // Check if it's a placeholder image
    if (cleanFilename.includes('placeholder')) {
      return null; // Let component handle placeholder with fallback
    }
    
    return `${cleanBaseUrl}/uploads/${type}/${cleanFilename}`;
  }

  return null;
};

// ========== SAFE IMAGE URL HELPER FOR REACT COMPONENTS ==========
export const getSafeImageUrl = (imagePath, type = "products", fallback = null) => {
  const url = getImageUrl(imagePath, type);
  
  // If no URL, return fallback (could be a placeholder image)
  if (!url) {
    return fallback;
  }
  
  // Validate the URL format
  try {
    // Basic URL validation
    if (url.startsWith('http://') || url.startsWith('https://') || 
        url.startsWith('blob:') || url.startsWith('data:')) {
      return url;
    }
    
    // If we have a relative URL, prepend base URL
    if (url.startsWith('/')) {
      const baseUrl = IMAGE_BASE_URL || "https://federalpartsphilippines-backend.onrender.com";
      const cleanBaseUrl = baseUrl.replace(/\/api$/, '');
      return `${cleanBaseUrl}${url}`;
    }
    
    return url;
  } catch (error) {
    console.warn("Invalid image URL:", imagePath, error);
    return fallback;
  }
};

// ========== ENHANCED PRODUCT PROCESSING ==========
const processProductImages = (product) => {
  if (!product) return product;
  
  const productObj = { ...product };
  
  // Ensure images is an array
  if (!Array.isArray(productObj.images)) {
    productObj.images = [];
  }
  
  // Process each image URL
  productObj.images = productObj.images
    .filter(img => img && img.trim() !== "")
    .map(img => {
      // If image is already a full URL, return as-is
      if (img.startsWith('http://') || img.startsWith('https://') || 
          img.startsWith('blob:') || img.startsWith('data:')) {
        return img;
      }
      
      // If image starts with /uploads, it's already a server path
      if (img.startsWith('/uploads/')) {
        const baseUrl = IMAGE_BASE_URL || "https://federalpartsphilippines-backend.onrender.com";
        const cleanBaseUrl = baseUrl.replace(/\/api$/, '');
        return `${cleanBaseUrl}${img}`;
      }
      
      // If it's just a filename, construct full URL
      const baseUrl = IMAGE_BASE_URL || "https://federalpartsphilippines-backend.onrender.com";
      const cleanBaseUrl = baseUrl.replace(/\/api$/, '');
      return `${cleanBaseUrl}/uploads/products/${img}`;
    })
    .filter(img => img !== null && img !== undefined);
  
  // If no images after processing, set to empty array (not null)
  if (productObj.images.length === 0) {
    productObj.images = [];
  }
  
  return productObj;
};

const processCategoryImage = (category) => {
  if (!category) return category;
  
  const categoryObj = { ...category };
  
  if (categoryObj.image && categoryObj.image.trim() !== "") {
    const img = categoryObj.image;
    
    // If image is already a full URL, return as-is
    if (img.startsWith('http://') || img.startsWith('https://') || 
        img.startsWith('blob:') || img.startsWith('data:')) {
      return categoryObj;
    }
    
    // If image starts with /uploads, it's already a server path
    if (img.startsWith('/uploads/')) {
      const baseUrl = IMAGE_BASE_URL || "https://federalpartsphilippines-backend.onrender.com";
      const cleanBaseUrl = baseUrl.replace(/\/api$/, '');
      categoryObj.image = `${cleanBaseUrl}${img}`;
    } else {
      // If it's just a filename, construct full URL
      const baseUrl = IMAGE_BASE_URL || "https://federalpartsphilippines-backend.onrender.com";
      const cleanBaseUrl = baseUrl.replace(/\/api$/, '');
      categoryObj.image = `${cleanBaseUrl}/uploads/categories/${img}`;
    }
  }
  
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

    // Create FormData
    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", type);

    // Use the correct endpoint for uploads
    const response = await API.post("/upload", formData, {
      headers: {
        // Don't set Content-Type - let browser set it with boundary
      }
    });

    console.log("📤 Upload response:", response);
    
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

// ========== CATEGORY API - WITH FIXED IMAGE UPLOAD ==========
export const categoryAPI = {
  // Main category fetching method
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

  // Alias for getAllCategories (for backward compatibility)
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

  // FIXED: createCategory with proper FormData handling
  createCategory: async (categoryData) => {
    try {
      console.log("➕ Creating category:", categoryData);
      
      // Prepare form data
      const formData = new FormData();
      
      // Add all text fields
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
      
      // Add image file if provided
      if (categoryData.image instanceof File) {
        formData.append('image', categoryData.image);
      } else if (typeof categoryData.image === 'string' && categoryData.image.trim() !== '') {
        // If image is a string URL, we need to handle it differently
        // For now, we'll just send it as a string
        formData.append('imageUrl', categoryData.image);
      }
      
      // Log FormData contents for debugging
      console.log("📤 FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value instanceof File ? `${value.name} (File)` : value);
      }
      
      const response = await API.post("/categories", formData, {
        // Don't set Content-Type header - let browser set it
      });
      
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

  // FIXED: updateCategory with proper FormData handling
  updateCategory: async (id, categoryData) => {
    try {
      console.log(`✏️ Updating category ${id}:`, categoryData);
      
      // Prepare form data
      const formData = new FormData();
      
      // Add all text fields
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
        formData.append('parentCategory', ''); // Send empty to clear parent
      }
      
      // Handle image
      if (categoryData.image instanceof File) {
        // New image file
        formData.append('image', categoryData.image);
      } else if (categoryData.image === '' || categoryData.image === null) {
        // Empty string means remove image
        formData.append('image', '');
      } else if (typeof categoryData.image === 'string' && categoryData.image.trim() !== '') {
        // Existing image URL, we might not need to send it
        // But let's send it as imageUrl for reference
        formData.append('imageUrl', categoryData.image);
      }
      
      // Log FormData contents for debugging
      console.log("📤 FormData contents for update:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value instanceof File ? `${value.name} (File)` : value);
      }
      
      const response = await API.put(`/categories/${id}`, formData, {
        // Don't set Content-Type header - let browser set it
      });
      
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

  // Utility function to get image URL
  getImageUrl: getImageUrl,
};

// ========== PRODUCT API - WITH IMAGE FIXES ==========
export const productAPI = {
  // Main product fetching methods
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

  // Alias for getAllProducts (for backward compatibility)
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

  // FIXED: createProduct with proper FormData handling
  createProduct: async (productData) => {
    try {
      console.log("➕ Creating product:", productData);
      
      const formData = new FormData();
      
      // Add all text fields
      Object.keys(productData).forEach(key => {
        if (productData[key] !== null && productData[key] !== undefined) {
          if (key === 'images' && Array.isArray(productData.images)) {
            // Handle images array
            productData.images.forEach((image, index) => {
              if (image instanceof File) {
                formData.append('images', image);
              }
            });
          } else if (key === 'specifications' && typeof productData[key] === 'object') {
            formData.append(key, JSON.stringify(productData[key]));
          } else if (typeof productData[key] === 'string' && productData[key].trim() !== '') {
            formData.append(key, productData[key]);
          } else if (typeof productData[key] === 'number') {
            formData.append(key, productData[key].toString());
          } else if (typeof productData[key] === 'boolean') {
            formData.append(key, productData[key].toString());
          }
        }
      });
      
      const response = await API.post("/admin/products", formData, {
        // Don't set Content-Type header - let browser set it
      });
      
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

  // FIXED: updateProduct with proper FormData handling
  updateProduct: async (id, productData) => {
    try {
      console.log(`✏️ Updating product ${id}:`, productData);
      
      const formData = new FormData();
      
      // Add all fields
      Object.keys(productData).forEach(key => {
        if (productData[key] !== null && productData[key] !== undefined) {
          if (key === 'newImages' && Array.isArray(productData[key])) {
            // Add new image files
            productData[key].forEach((image, index) => {
              if (image instanceof File) {
                formData.append('images', image);
              }
            });
          } else if (key === 'images' && Array.isArray(productData[key])) {
            // Handle existing images as JSON
            formData.append('images', JSON.stringify(productData[key]));
          } else if (key === 'removeImages' && Array.isArray(productData[key])) {
            formData.append('removeImages', JSON.stringify(productData[key]));
          } else if (key === 'specifications' && typeof productData[key] === 'object') {
            formData.append(key, JSON.stringify(productData[key]));
          } else if (typeof productData[key] === 'string' && productData[key].trim() !== '') {
            formData.append(key, productData[key]);
          } else if (typeof productData[key] === 'number') {
            formData.append(key, productData[key].toString());
          } else if (typeof productData[key] === 'boolean') {
            formData.append(key, productData[key].toString());
          }
        }
      });
      
      const response = await API.put(`/admin/products/${id}`, formData, {
        // Don't set Content-Type header - let browser set it
      });
      
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
      // Get product stats
      const productsResponse = await productAPI.getAllProducts({ limit: 1 });
      const totalProducts = productsResponse.total || 0;
      
      // Get low stock products
      const lowStockResponse = await productAPI.getAllProducts({ 
        inStock: true,
        maxStock: 10 // Assuming low stock is less than 10
      });
      const lowStockProducts = lowStockResponse.products?.length || 0;
      
      // Get featured products
      const featuredResponse = await productAPI.getFeaturedProducts({ limit: 1 });
      const featuredProducts = featuredResponse.products?.length || 0;
      
      // Get category stats
      const categoryResponse = await categoryAPI.getAllCategories();
      const totalCategories = categoryResponse.categories?.length || 0;
      
      // Calculate total value (simplified - would need actual price * stock)
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
            featured: featuredProducts
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

// ========== PRICE FORMATTING ==========
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

// ========== CONNECTION TESTING UTILITY ==========
export const testApiConnection = async () => {
  console.log("🔍 Testing API connection...");
  
  const endpointsToTest = [
    validatedApiUrl.replace('/api', ''),
    validatedApiUrl,
    `${validatedApiUrl.replace('/api', '')}/health`,
    "https://federalpartsphilippines-backend.onrender.com",
    "https://federalpartsphilippines-backend.onrender.com/api",
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

// ========== MAIN API SERVICE OBJECT ==========
const apiService = {
  API,
  
  productAPI,
  categoryAPI,
  authAPI,
  cartAPI,
  dashboardAPI,
  
  getImageUrl,
  getSafeImageUrl,
  getFullImageUrl: getImageUrl,
  formatPrice,
  calculateDiscountPercentage,
  getFinalPrice,
  uploadImage,
  
  testApiConnection,
  
  API_BASE_URL: validatedApiUrl,
  IMAGE_BASE_URL: IMAGE_BASE_URL || "https://federalpartsphilippines-backend.onrender.com",
  
  // Product API aliases
  getProducts: productAPI.getAllProducts,
  getProduct: productAPI.getProductById,
  createProduct: productAPI.createProduct,
  updateProduct: productAPI.updateProduct,
  deleteProduct: productAPI.deleteProduct,
  
  // Category API aliases
  getCategories: categoryAPI.getAllCategories,
  getCategory: categoryAPI.getCategoryById,
  createCategory: categoryAPI.createCategory,
  updateCategory: categoryAPI.updateCategory,
  deleteCategory: categoryAPI.deleteCategory,
  updateCategoryProductCounts: categoryAPI.updateCategoryProductCounts,
  
  // Auth API aliases
  login: authAPI.login,
  register: authAPI.register,
  logout: authAPI.logout,
  getCurrentUser: authAPI.getCurrentUser,
  
  // Cart API aliases
  getCart: cartAPI.getCart,
  addToCart: cartAPI.addToCart,
  updateCartItem: cartAPI.updateCartItem,
  removeFromCart: cartAPI.removeFromCart,
  clearCart: cartAPI.clearCart,
  getCartCount: cartAPI.getCartCount,
  
  // Dashboard API aliases
  getDashboardStats: dashboardAPI.getOverviewStats,
  
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
  
  initialize: async () => {
    console.log("🚀 Initializing API Service...");
    console.log("📡 API URL:", validatedApiUrl);
    console.log("🖼️ Image URL:", IMAGE_BASE_URL || "Using API URL");
    
    const connection = await testApiConnection();
    console.log("🔌 Connection Status:", connection.success ? "✅ Connected" : "❌ Failed");
    
    if (connection.success) {
      console.log("🌐 Connected to:", connection.endpoint);
    } else {
      console.error("⚠️ Connection failed. Please check:");
      console.error("1. Backend server is running");
      console.error("2. CORS is properly configured");
      console.error("3. Network connectivity");
    }
    
    return connection;
  }
};

export default apiService;