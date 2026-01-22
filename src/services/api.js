// src/services/api.js - COMPLETE FIXED VERSION WITH CATEGORY UPDATE
import axios from "axios";
import authService from "./auth.js";

// ========== ENVIRONMENT CONFIGURATION ==========
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://federalpartsphilippines-backend.onrender.com/api";
const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_URL || "https://federalpartsphilippines-backend.onrender.com";

// Check if running in browser environment
const isBrowser = typeof window !== "undefined";

// ========== URL VALIDATION ==========
const validateAndFixUrl = (url) => {
  if (!url) return "https://federalpartsphilippines-backend.onrender.com/api";
  
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

      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      }
      
      if (config.method === "get" && !config.params) {
        config.params = { _t: Date.now() };
      } else if (config.method === "get" && config.params) {
        config.params._t = Date.now();
      }
    }
    
    console.log(`➡️ ${config.method?.toUpperCase()} ${config.url}`, config.params || "");
    
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
      if (
        response.data.success !== undefined ||
        response.data.data ||
        response.data.error
      ) {
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
      method: error.config?.method
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

// ========== IMAGE URL HELPER ==========
export const getImageUrl = (imagePath, type = "products") => {
  if (!imagePath || imagePath === "undefined" || imagePath === "null") {
    return "";
  }

  if (
    typeof imagePath === "string" &&
    (imagePath.startsWith("http://") || imagePath.startsWith("https://"))
  ) {
    return imagePath;
  }

  if (
    typeof imagePath === "string" &&
    (imagePath.startsWith("blob:") || imagePath.startsWith("data:"))
  ) {
    return imagePath;
  }

  const baseUrl = IMAGE_BASE_URL || "https://federalpartsphilippines-backend.onrender.com";

  if (typeof imagePath === "string" && imagePath.startsWith("/")) {
    return `${baseUrl}${imagePath}`;
  }

  if (typeof imagePath === "string") {
    const cleanFilename = imagePath.replace(/^.*[\\/]/, '');
    
    if (imagePath.includes('uploads/')) {
      const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
      return `${baseUrl}${path}`;
    }
    
    return `${baseUrl}/uploads/${type}/${cleanFilename}`;
  }

  return "";
};

export const getFullImageUrl = getImageUrl;

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

// ========== PRODUCT API ==========
export const productAPI = {
  getAllProducts: async (params = {}) => {
    try {
      console.log("📦 Fetching products with params:", params);
      const response = await API.get("/products", { params });
      
      if (response.success && response.products) {
        const processedProducts = response.products.map(product => ({
          ...product,
          images: product.images?.map(img => getImageUrl(img, "products")) || []
        }));
        
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

  getProductById: async (id) => {
    try {
      console.log(`📦 Fetching product ${id}`);
      const response = await API.get(`/products/${id}`);
      
      if (response.success && response.product) {
        response.product = {
          ...response.product,
          images: response.product.images?.map(img => getImageUrl(img, "products")) || []
        };
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

  searchProducts: async (query, params = {}) => {
    try {
      const response = await API.get("/products", {
        params: { search: query, ...params }
      });
      
      if (response.success && response.products) {
        response.products = response.products.map(product => ({
          ...product,
          images: product.images?.map(img => getImageUrl(img, "products")) || []
        }));
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
        response.products = response.products.map(product => ({
          ...product,
          images: product.images?.map(img => getImageUrl(img, "products")) || []
        }));
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

  getFeaturedProducts: async (params = {}) => {
    try {
      const response = await API.get("/products", {
        params: { featured: true, ...params }
      });
      
      if (response.success && response.products) {
        response.products = response.products.map(product => ({
          ...product,
          images: product.images?.map(img => getImageUrl(img, "products")) || []
        }));
      }
      
      return response;
    } catch (error) {
      console.error("❌ Error fetching featured products:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch featured products",
        products: []
      };
    }
  },

  getProductsInStock: async (params = {}) => {
    try {
      const response = await API.get("/products", {
        params: { inStock: true, ...params }
      });
      
      if (response.success && response.products) {
        response.products = response.products.map(product => ({
          ...product,
          images: product.images?.map(img => getImageUrl(img, "products")) || []
        }));
      }
      
      return response;
    } catch (error) {
      console.error("❌ Error fetching products in stock:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch products in stock",
        products: []
      };
    }
  },

  getProductsByPriceRange: async (minPrice, maxPrice, params = {}) => {
    try {
      const response = await API.get("/products", {
        params: { minPrice, maxPrice, ...params }
      });
      
      if (response.success && response.products) {
        response.products = response.products.map(product => ({
          ...product,
          images: product.images?.map(img => getImageUrl(img, "products")) || []
        }));
      }
      
      return response;
    } catch (error) {
      console.error("❌ Error fetching products by price range:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch products by price range",
        products: []
      };
    }
  },

  getAllProductsForAdmin: async (params = {}) => {
    try {
      console.log("👑 Fetching admin products with params:", params);
      const response = await API.get("/admin/products", { params });
      
      if (response.success && response.products) {
        const processedProducts = response.products.map(product => ({
          ...product,
          images: product.images?.map(img => getImageUrl(img, "products")) || []
        }));
        
        return {
          ...response,
          products: processedProducts
        };
      }
      
      return response;
    } catch (error) {
      console.error("❌ Error fetching admin products:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch admin products",
        products: [],
        total: 0,
        totalPages: 0
      };
    }
  },

  createProduct: async (productData) => {
    try {
      console.log("➕ Creating product:", productData);
      
      const formData = new FormData();
      
      Object.keys(productData).forEach(key => {
        if (productData[key] !== null && productData[key] !== undefined) {
          if (key === 'images' && Array.isArray(productData.images)) {
            productData.images.forEach((image, index) => {
              if (image instanceof File) {
                formData.append('images', image);
              } else if (typeof image === 'string') {
                formData.append('images', image);
              }
            });
          } else if (key === 'specifications' && typeof productData[key] === 'object') {
            formData.append(key, JSON.stringify(productData[key]));
          } else if (key === 'category' && productData[key] === '') {
            formData.append(key, '');
          } else {
            formData.append(key, productData[key]);
          }
        }
      });
      
      const response = await API.post("/admin/products", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.success && response.product) {
        response.product = {
          ...response.product,
          images: response.product.images?.map(img => getImageUrl(img, "products")) || []
        };
      }
      
      return response;
    } catch (error) {
      console.error("❌ Error creating product:", error);
      return {
        success: false,
        message: error.message || "Failed to create product",
        product: null
      };
    }
  },

  updateProduct: async (id, productData) => {
    try {
      console.log(`✏️ Updating product ${id}:`, productData);
      
      const formData = new FormData();
      
      Object.keys(productData).forEach(key => {
        if (productData[key] !== null && productData[key] !== undefined) {
          if (key === 'images' && Array.isArray(productData.images)) {
            const imagesJSON = JSON.stringify(productData.images);
            formData.append('images', imagesJSON);
          } else if (key === 'removeImages' && Array.isArray(productData[key])) {
            formData.append('removeImages', JSON.stringify(productData[key]));
          } else if (key === 'specifications' && typeof productData[key] === 'object') {
            formData.append(key, JSON.stringify(productData[key]));
          } else if (key === 'category' && productData[key] === '') {
            formData.append(key, '');
          } else {
            formData.append(key, productData[key]);
          }
        }
      });
      
      if (productData.newImages && Array.isArray(productData.newImages)) {
        productData.newImages.forEach(image => {
          if (image instanceof File) {
            formData.append('imageFiles', image);
          }
        });
      }
      
      const response = await API.put(`/admin/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.success && response.product) {
        response.product = {
          ...response.product,
          images: response.product.images?.map(img => getImageUrl(img, "products")) || []
        };
      }
      
      return response;
    } catch (error) {
      console.error(`❌ Error updating product ${id}:`, error);
      return {
        success: false,
        message: error.message || "Failed to update product",
        product: null
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

  hardDeleteProduct: async (id) => {
    try {
      console.log(`💀 Hard deleting product ${id}`);
      const response = await API.delete(`/admin/products/${id}/hard`);
      return response;
    } catch (error) {
      console.error(`❌ Error hard deleting product ${id}:`, error);
      return {
        success: false,
        message: error.message || "Failed to hard delete product"
      };
    }
  },

  toggleProductStatus: async (id) => {
    try {
      console.log(`🔄 Toggling status for product ${id}`);
      const productResponse = await API.get(`/admin/products/${id}`);
      
      if (productResponse.success && productResponse.product) {
        const newStatus = !productResponse.product.isActive;
        
        const updateResponse = await API.put(`/admin/products/${id}`, {
          isActive: newStatus
        });
        
        return updateResponse;
      }
      
      return productResponse;
    } catch (error) {
      console.error(`❌ Error toggling product status ${id}:`, error);
      return {
        success: false,
        message: error.message || "Failed to toggle product status"
      };
    }
  },

  updateProductStock: async (id, stock) => {
    try {
      console.log(`📊 Updating stock for product ${id} to ${stock}`);
      const response = await API.put(`/admin/products/${id}`, {
        stock: parseInt(stock)
      });
      return response;
    } catch (error) {
      console.error(`❌ Error updating stock for product ${id}:`, error);
      return {
        success: false,
        message: error.message || "Failed to update product stock"
      };
    }
  },

  uploadProductImage: async (imageFile, productId = null) => {
    try {
      console.log(`📸 Uploading product image${productId ? ` for product ${productId}` : ''}`);
      
      const formData = new FormData();
      formData.append('image', imageFile);
      if (productId) {
        formData.append('productId', productId);
      }
      
      const response = await API.post("/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
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

  uploadBase64Image: async (base64Data, type = "product") => {
    try {
      console.log(`📸 Uploading base64 ${type} image`);
      
      const response = await API.post("/upload/base64", {
        image: base64Data,
        type: type
      });
      
      return response;
    } catch (error) {
      console.error(`❌ Error uploading base64 ${type} image:`, error);
      return {
        success: false,
        message: error.message || "Failed to upload base64 image",
        image: null
      };
    }
  },

  deleteProductImage: async (productId, imageUrlOrIndex) => {
    try {
      console.log(`🗑️ Deleting image from product ${productId}:`, imageUrlOrIndex);
      
      const productResponse = await API.get(`/admin/products/${productId}`);
      
      if (!productResponse.success) {
        return productResponse;
      }
      
      const product = productResponse.product;
      let updatedImages = [...(product.images || [])];
      
      if (typeof imageUrlOrIndex === 'number') {
        if (imageUrlOrIndex >= 0 && imageUrlOrIndex < updatedImages.length) {
          const removedImage = updatedImages[imageUrlOrIndex];
          updatedImages.splice(imageUrlOrIndex, 1);
          
          const filename = removedImage.split('/').pop();
          
          const updateResponse = await API.put(`/admin/products/${productId}`, {
            images: updatedImages,
            removeImages: [filename]
          });
          
          return updateResponse;
        } else {
          return {
            success: false,
            message: "Invalid image index"
          };
        }
      } else {
        const filename = imageUrlOrIndex.split('/').pop();
        updatedImages = updatedImages.filter(img => {
          const imgFilename = img.split('/').pop();
          return imgFilename !== filename;
        });
        
        const updateResponse = await API.put(`/admin/products/${productId}`, {
          images: updatedImages,
          removeImages: [filename]
        });
        
        return updateResponse;
      }
    } catch (error) {
      console.error(`❌ Error deleting product image ${productId}:`, error);
      return {
        success: false,
        message: error.message || "Failed to delete product image"
      };
    }
  }
};

// ========== CATEGORY API ==========
export const categoryAPI = {
  getAllCategories: async (params = {}) => {
    try {
      console.log("📁 Fetching categories with params:", params);
      const response = await API.get("/categories", { params });
      
      if (response.success && response.categories) {
        const processedCategories = response.categories.map(category => ({
          ...category,
          image: getImageUrl(category.image, "categories")
        }));
        
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

  getCategoryById: async (id) => {
    try {
      console.log(`📁 Fetching category ${id}`);
      const response = await API.get(`/categories/${id}`);
      
      if (response.success && response.category) {
        response.category = {
          ...response.category,
          image: getImageUrl(response.category.image, "categories")
        };
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
      Object.keys(categoryData).forEach(key => {
        if (categoryData[key] !== null && categoryData[key] !== undefined) {
          if (key === 'image' && categoryData[key] instanceof File) {
            formData.append('image', categoryData[key]);
          } else {
            formData.append(key, categoryData[key]);
          }
        }
      });
      
      const response = await API.post("/categories", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.success && response.category) {
        response.category = {
          ...response.category,
          image: getImageUrl(response.category.image, "categories")
        };
      }
      
      return response;
    } catch (error) {
      console.error("❌ Error creating category:", error);
      return {
        success: false,
        message: error.message || "Failed to create category",
        category: null
      };
    }
  },

  updateCategory: async (id, categoryData) => {
    try {
      console.log(`✏️ Updating category ${id}:`, categoryData);
      
      const formData = new FormData();
      Object.keys(categoryData).forEach(key => {
        if (categoryData[key] !== null && categoryData[key] !== undefined) {
          if (key === 'image' && categoryData[key] instanceof File) {
            formData.append('image', categoryData[key]);
          } else {
            formData.append(key, categoryData[key]);
          }
        }
      });
      
      const response = await API.put(`/categories/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.success && response.category) {
        response.category = {
          ...response.category,
          image: getImageUrl(response.category.image, "categories")
        };
      }
      
      return response;
    } catch (error) {
      console.error(`❌ Error updating category ${id}:`, error);
      return {
        success: false,
        message: error.message || "Failed to update category",
        category: null
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

  // ADDED THIS FUNCTION: Update category product counts
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
  }
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
      const productStats = await productAPI.getProductStats();
      
      const orderStats = {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0
      };
      
      const categoryResponse = await categoryAPI.getAllCategories();
      const categoryStats = {
        totalCategories: categoryResponse.categories?.length || 0,
        activeCategories: categoryResponse.categories?.filter(c => c.isActive).length || 0
      };
      
      return {
        success: true,
        stats: {
          products: productStats.stats || {},
          orders: orderStats,
          categories: categoryStats,
          totalValue: productStats.stats?.totalValue || 0,
          lowStockAlerts: productStats.stats?.lowStockProducts || 0
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

// ========== MAIN API SERVICE OBJECT ==========
const apiService = {
  API,
  
  productAPI,
  categoryAPI,
  authAPI,
  cartAPI,
  dashboardAPI,
  
  getImageUrl,
  getFullImageUrl,
  formatPrice,
  calculateDiscountPercentage,
  getFinalPrice,
  
  testApiConnection,
  
  API_BASE_URL: validatedApiUrl,
  IMAGE_BASE_URL: IMAGE_BASE_URL || "https://federalpartsphilippines-backend.onrender.com",
  
  getProducts: productAPI.getAllProducts,
  getProduct: productAPI.getProductById,
  createProduct: productAPI.createProduct,
  updateProduct: productAPI.updateProduct,
  deleteProduct: productAPI.deleteProduct,
  
  getCategories: categoryAPI.getAllCategories,
  getCategory: categoryAPI.getCategoryById,
  createCategory: categoryAPI.createCategory,
  updateCategory: categoryAPI.updateCategory,
  deleteCategory: categoryAPI.deleteCategory,
  updateCategoryProductCounts: categoryAPI.updateCategoryProductCounts, // ADDED THIS
  
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
      const formData = new FormData();
      formData.append(fieldName, file);
      
      const response = await API.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response;
    } catch (error) {
      console.error("❌ Error uploading file:", error);
      return {
        success: false,
        message: error.message || "Failed to upload file"
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