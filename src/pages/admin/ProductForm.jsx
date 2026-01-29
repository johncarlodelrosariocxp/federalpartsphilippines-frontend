// src/services/api.js - ULTIMATE FIXED VERSION FOR VERCEL IMAGE ISSUES
import axios from "axios";
import authService from "./auth.js";

// ========== ENVIRONMENT CONFIGURATION ==========
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://federalpartsphilippines-backend.onrender.com/api";
const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_URL || "https://federalpartsphilippines-backend.onrender.com";

console.log("🌐 Environment Configuration:");
console.log("API_BASE_URL:", API_BASE_URL);
console.log("IMAGE_BASE_URL:", IMAGE_BASE_URL);

const isBrowser = typeof window !== "undefined";
// Detect environment
const isLocalhost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const isVercel = isBrowser && (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('federalpartsphilippines'));

console.log("📍 Environment detected:", {
  isBrowser,
  isLocalhost,
  isVercel,
  hostname: isBrowser ? window.location.hostname : 'server'
});

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

      if (config.method === "get") {
        config.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
        config.headers["Pragma"] = "no-cache";
        config.headers["Expires"] = "0";
        
        // Add cache busting for image requests
        if (config.url && (config.url.includes('/products') || config.url.includes('/categories'))) {
          if (!config.params) {
            config.params = { _t: Date.now() };
          } else {
            config.params._t = Date.now();
          }
        }
      }

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
            sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
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

// ========== ULTIMATE IMAGE URL HELPER FOR VERCEL ==========
export const getImageUrl = (imagePath, type = "products") => {
  // NULL CHECKS
  if (!imagePath || 
      imagePath === "undefined" || 
      imagePath === "null" || 
      imagePath === "" || 
      imagePath.trim() === "") {
    console.warn(`❌ Empty image path for ${type}`);
    return "/placeholder-image.jpg";
  }

  // If it's already a valid URL (http, https, data, blob), return as-is
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

  // Handle placeholder images
  if (imagePath.includes('placeholder')) {
    console.log(`⚠️ Placeholder detected: ${imagePath}`);
    return "/placeholder-image.jpg";
  }

  // Clean the filename
  let filename = imagePath;
  
  // Remove query parameters
  if (filename.includes('?')) {
    filename = filename.split('?')[0];
  }
  
  // Extract just the filename from path
  if (filename.includes("/")) {
    filename = filename.substring(filename.lastIndexOf("/") + 1);
  }
  
  // Decode URL encoding
  filename = decodeURIComponent(filename);

  // Handle empty filename after cleaning
  if (!filename || filename.trim() === "") {
    console.warn(`❌ Empty filename after cleaning for: ${imagePath}`);
    return "/placeholder-image.jpg";
  }

  // ====== GENERATE ALL POSSIBLE URLS ======
  const possibleUrls = [];
  
  // 1. Direct backend URL (MOST RELIABLE FOR VERCEL)
  possibleUrls.push(`https://federalpartsphilippines-backend.onrender.com/uploads/${type}/${filename}`);
  
  // 2. Without type directory
  possibleUrls.push(`https://federalpartsphilippines-backend.onrender.com/uploads/${filename}`);
  
  // 3. Try with environment variable base URL
  if (IMAGE_BASE_URL && IMAGE_BASE_URL !== "undefined") {
    possibleUrls.push(`${IMAGE_BASE_URL}/uploads/${type}/${filename}`);
    possibleUrls.push(`${IMAGE_BASE_URL}/uploads/${filename}`);
  }
  
  // 4. Try with API base URL converted
  const apiBaseWithoutApi = validatedApiUrl.replace('/api', '');
  possibleUrls.push(`${apiBaseWithoutApi}/uploads/${type}/${filename}`);
  possibleUrls.push(`${apiBaseWithoutApi}/uploads/${filename}`);
  
  // 5. For localhost development
  if (isLocalhost) {
    possibleUrls.push(`http://localhost:5000/uploads/${type}/${filename}`);
    possibleUrls.push(`http://localhost:5000/uploads/${filename}`);
  }
  
  // 6. Try just the filename (in case it's already a full path from backend)
  if (imagePath.startsWith('/uploads/')) {
    possibleUrls.push(`https://federalpartsphilippines-backend.onrender.com${imagePath}`);
  }
  
  // Return the first URL from the prioritized list
  const finalUrl = possibleUrls[0];
  console.log(`🖼️ Image URL generated for "${filename}":`, finalUrl);
  console.log(`📊 Total alternatives: ${possibleUrls.length}`);
  
  return finalUrl;
};

// ========== SMART IMAGE LOADER WITH FALLBACK ==========
export const loadImageWithFallback = async (imagePath, type = "products", fallbacks = []) => {
  if (!imagePath) {
    return "/placeholder-image.jpg";
  }

  // If it's already a full URL, use it
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
    return imagePath;
  }

  // Generate primary URL
  const primaryUrl = getImageUrl(imagePath, type);
  
  // Create list of URLs to try
  const urlsToTry = [primaryUrl];
  
  // Add user-provided fallbacks
  if (Array.isArray(fallbacks)) {
    urlsToTry.push(...fallbacks);
  }
  
  // Add automatic fallbacks
  const filename = extractFilename(imagePath);
  urlsToTry.push(
    `https://federalpartsphilippines-backend.onrender.com/uploads/${filename}`,
    `https://federalpartsphilippines-backend.onrender.com/uploads/${type}/${filename}`
  );
  
  // Remove duplicates
  const uniqueUrls = [...new Set(urlsToTry.filter(url => url && url !== "/placeholder-image.jpg"))];
  
  console.log(`🔄 Testing ${uniqueUrls.length} image URLs for "${filename}"`);
  
  // Try each URL in sequence
  for (let i = 0; i < uniqueUrls.length; i++) {
    const url = uniqueUrls[i];
    try {
      const isValid = await testImageUrl(url);
      if (isValid) {
        console.log(`✅ Image found at: ${url}`);
        return url;
      }
    } catch (error) {
      console.log(`❌ URL failed: ${url} - ${error.message}`);
    }
  }
  
  // All URLs failed, return placeholder
  console.warn(`⚠️ All image URLs failed for "${filename}", using placeholder`);
  return "/placeholder-image.jpg";
};

// Helper function to test if an image URL is valid
const testImageUrl = (url) => {
  return new Promise((resolve, reject) => {
    if (!url || url === "/placeholder-image.jpg") {
      resolve(false);
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    
    // Timeout after 3 seconds
    setTimeout(() => resolve(false), 3000);
  });
};

// Helper function to extract filename
const extractFilename = (path) => {
  if (!path) return '';
  if (path.includes('/')) {
    return path.substring(path.lastIndexOf('/') + 1);
  }
  return path;
};

// ========== SAFE IMAGE URL ==========
export const getSafeImageUrl = (imagePath, type = "products", fallback = "/placeholder-image.jpg") => {
  const url = getImageUrl(imagePath, type);
  return url || fallback;
};

// ========== PROCESSING HELPERS ==========
const processProductImages = async (product) => {
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
  
  // Process each image - convert to proper URLs
  const processedImages = [];
  for (const img of productObj.images) {
    if (img && img.trim() !== "") {
      const imgUrl = getImageUrl(img, "products");
      if (imgUrl && imgUrl !== "/placeholder-image.jpg") {
        processedImages.push(imgUrl);
      }
    }
  }
  
  productObj.images = processedImages;
  
  // Set main image if available
  if (productObj.images.length > 0 && !productObj.image) {
    productObj.image = productObj.images[0];
  } else if (!productObj.image && productObj.images.length === 0) {
    productObj.image = "/placeholder-image.jpg";
  }
  
  console.log(`🖼️ Processed product "${productObj.name || productObj._id}":`, {
    originalCount: product.images?.length || 0,
    processedCount: productObj.images.length,
    mainImage: productObj.image
  });
  
  return productObj;
};

const processCategoryImage = (category) => {
  if (!category) return category;
  
  const categoryObj = { ...category };
  
  // Process main image
  if (categoryObj.image && categoryObj.image.trim() !== "") {
    categoryObj.image = getImageUrl(categoryObj.image, "categories");
  } else {
    categoryObj.image = "/placeholder-image.jpg";
  }
  
  // Process imageUrl if exists
  if (categoryObj.imageUrl && categoryObj.imageUrl.trim() !== "") {
    categoryObj.imageUrl = getImageUrl(categoryObj.imageUrl, "categories");
  }
  
  console.log(`📁 Processed category "${categoryObj.name || categoryObj._id}":`, {
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
    
    // Ensure the returned image URL is fully qualified
    if (response.success && response.image && response.image.url) {
      const imageUrl = response.image.url;
      if (!imageUrl.startsWith('http')) {
        // Convert to full URL
        response.image.fullUrl = `https://federalpartsphilippines-backend.onrender.com${imageUrl}`;
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

    // Ensure the returned image URL is fully qualified
    if (response.success && response.image && response.image.url) {
      const imageUrl = response.image.url;
      if (!imageUrl.startsWith('http')) {
        // Convert to full URL
        response.image.fullUrl = `https://federalpartsphilippines-backend.onrender.com${imageUrl}`;
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
          formData.append('imageUrl', uploadResponse.image?.url || '');
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
          formData.append('imageUrl', uploadResponse.image?.url || '');
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
        // Process images for each product
        const processedProducts = [];
        for (const product of response.products) {
          const processedProduct = await processProductImages(product);
          processedProducts.push(processedProduct);
        }
        
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
        response.product = await processProductImages(response.product);
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
        response.product = await processProductImages(response.product);
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
        response.product = await processProductImages(response.product);
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
        const processedProducts = [];
        for (const product of response.products) {
          const processedProduct = await processProductImages(product);
          processedProducts.push(processedProduct);
        }
        response.products = processedProducts;
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
        const processedProducts = [];
        for (const product of response.products) {
          const processedProduct = await processProductImages(product);
          processedProducts.push(processedProduct);
        }
        response.products = processedProducts;
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
      
      // Ensure the returned URL is fully qualified for Vercel
      if (response.success && response.image && response.image.url) {
        const imageUrl = response.image.url;
        if (!imageUrl.startsWith('http')) {
          response.image.fullUrl = `https://federalpartsphilippines-backend.onrender.com${imageUrl}`;
        }
      }
      
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

// ========== OTHER API MODULES ==========
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

// ========== DEBUGGING AND TESTING ==========
export const testImageUrls = () => {
  const testCases = [
    { input: "engine.jpg", type: "products" },
    { input: "product-1234567890.jpg", type: "products" },
    { input: "/uploads/products/engine.jpg", type: "products" },
    { input: "uploads/products/engine.jpg", type: "products" },
    { input: "https://example.com/image.jpg", type: "products" },
    { input: "engine%20part.jpg", type: "products" },
    { input: "undefined", type: "products" },
    { input: "", type: "products" },
    { input: "category-1234567890.jpg", type: "categories" },
  ];

  console.log("🧪 TESTING IMAGE URLS:");
  testCases.forEach(test => {
    const url = getImageUrl(test.input, test.type);
    console.log(`🧪 "${test.input}" (${test.type}) -> ${url}`);
  });
};

export const debugImage = (imagePath, type = "products") => {
  console.log("🔍 DEBUG IMAGE:");
  console.log("Input:", imagePath);
  console.log("Type:", type);
  const result = getImageUrl(imagePath, type);
  console.log("Result:", result);
  return result;
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
  loadImageWithFallback,
  uploadImage,
  uploadBase64Image,
  formatPrice,
  calculateDiscountPercentage,
  getFinalPrice,
  testImageUrls,
  debugImage,
  API_BASE_URL: validatedApiUrl,
  IMAGE_BASE_URL: IMAGE_BASE_URL || "https://federalpartsphilippines-backend.onrender.com",
  
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
  
  // Image testing
  testImageConnection: async (imageUrl) => {
    try {
      const response = await fetch(imageUrl, { method: 'HEAD', mode: 'no-cors' });
      return {
        success: true,
        message: "Image URL appears accessible"
      };
    } catch (error) {
      // Try with image element
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ success: true, message: "Image loads successfully" });
        img.onerror = () => resolve({ success: false, message: "Image failed to load" });
        img.src = imageUrl;
      });
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
  
  // Initialize
  initialize: async () => {
    console.log("🚀 Initializing API Service...");
    console.log("📡 API URL:", validatedApiUrl);
    console.log("🌍 Environment:", isLocalhost ? "Localhost" : isVercel ? "Vercel" : "Production");
    
    // Test connection
    try {
      const response = await API.get("/");
      console.log("✅ API Connection successful:", response.data?.message);
      
      // Test image access
      console.log("🖼️ Testing image access...");
      const testImageUrl = "https://federalpartsphilippines-backend.onrender.com/uploads/products/test.jpg";
      const imgTest = await apiService.testImageConnection(testImageUrl);
      console.log("📊 Image access test:", imgTest.success ? "✅ Works" : "⚠️ May have issues");
      
      return {
        success: true,
        connected: true,
        message: "API initialized successfully",
        environment: isLocalhost ? "localhost" : isVercel ? "vercel" : "production",
        imageAccess: imgTest.success
      };
    } catch (error) {
      console.error("❌ API initialization failed:", error.message);
      return {
        success: false,
        connected: false,
        message: "API initialization failed",
        error: error.message
      };
    }
  },
  
  // Debug product images
  debugProductImages: (product) => {
    console.log("🔍 DEBUGGING PRODUCT IMAGES:");
    console.log("Product ID:", product._id);
    console.log("Product Name:", product.name);
    console.log("Raw images:", product.images);
    
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((img, index) => {
        const url = getImageUrl(img, "products");
        console.log(`Image ${index}:`, {
          raw: img,
          url: url,
          type: typeof img
        });
      });
    }
  },
  
  // Fix all image URLs in data
  fixAllImageUrls: async (data) => {
    if (!data) return data;
    
    if (Array.isArray(data)) {
      return data.map(item => apiService.fixImageUrlsInObject(item));
    }
    
    return apiService.fixImageUrlsInObject(data);
  },
  
  fixImageUrlsInObject: (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    const fixed = { ...obj };
    
    // Fix images array
    if (Array.isArray(fixed.images)) {
      fixed.images = fixed.images
        .map(img => getImageUrl(img, "products"))
        .filter(url => url && url !== "/placeholder-image.jpg");
    }
    
    // Fix single image field
    if (fixed.image) {
      fixed.image = getImageUrl(fixed.image, fixed.type === "category" ? "categories" : "products");
    }
    
    // Fix imageUrl field
    if (fixed.imageUrl) {
      fixed.imageUrl = getImageUrl(fixed.imageUrl, fixed.type === "category" ? "categories" : "products");
    }
    
    return fixed;
  }
};

export default apiService;