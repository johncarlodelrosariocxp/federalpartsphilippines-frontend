// src/services/api.js - COMPLETE API SERVICE WITH FULL PRODUCT SUPPORT
import axios from "axios";
import authService from "./auth.js";

// Use environment variable with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Check if running in browser environment
const isBrowser = typeof window !== "undefined";

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
  withCredentials: true,
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    if (isBrowser) {
      const token = authService?.getToken?.();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Remove cache control for all requests to prevent issues
      if (config.method === "get") {
        config.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
        config.headers["Pragma"] = "no-cache";
        config.headers["Expires"] = "0";
      }

      // For multipart/form-data, let the browser set the content-type
      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
API.interceptors.response.use(
  (response) => {
    // Handle different response structures
    if (response && response.data) {
      // If response.data has success property, return it directly
      if (
        response.data.success !== undefined ||
        response.data.data ||
        response.data.error
      ) {
        return response.data;
      }
      // If response.data is an array or object, wrap it
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    }
    return response;
  },
  (error) => {
    // Handle timeout
    if (error.code === "ECONNABORTED") {
      return Promise.reject({
        success: false,
        message: "Request timeout. Please try again.",
        status: 408,
      });
    }

    // Handle network errors
    if (error.code === "ERR_NETWORK") {
      return Promise.reject({
        success: false,
        message: "Network error. Please check your internet connection.",
        status: 0,
      });
    }

    // Handle response errors
    if (error.response) {
      const { status, data } = error.response;

      // Handle 401 Unauthorized
      if (status === 401 && isBrowser) {
        authService?.logout?.();
        if (!window.location.pathname.includes("/login")) {
          sessionStorage.setItem(
            "redirectAfterLogin",
            window.location.pathname
          );
          window.location.href = "/login";
        }
      }

      // Handle 403 Forbidden
      if (status === 403) {
        return Promise.reject({
          success: false,
          message: "You don't have permission to perform this action.",
          status: 403,
        });
      }

      // Handle 404 Not Found
      if (status === 404) {
        console.warn(`API Endpoint not found: ${error.config.url}`);
        return Promise.reject({
          success: false,
          message: data?.message || "Resource not found",
          status: 404,
        });
      }

      // Handle 429 Too Many Requests
      if (status === 429) {
        return Promise.reject({
          success: false,
          message: "Too many requests. Please try again later.",
          status: 429,
        });
      }

      // Handle 500+ Server Errors
      if (status >= 500) {
        return Promise.reject({
          success: false,
          message: "Server error. Please try again later.",
          status: status,
        });
      }

      // Handle other errors
      return Promise.reject({
        success: false,
        message: data?.message || `Error ${status}`,
        data: data,
        status: status,
      });
    }

    // Handle unknown errors
    return Promise.reject({
      success: false,
      message: error.message || "An unexpected error occurred",
      status: -1,
    });
  }
);

// ========== HELPER FUNCTIONS ==========

// Image URL helper
export const getImageUrl = (imagePath, type = "products") => {
  if (!imagePath || imagePath === "undefined" || imagePath === "null") {
    return "";
  }

  // If it's already a full URL
  if (
    typeof imagePath === "string" &&
    (imagePath.startsWith("http://") || imagePath.startsWith("https://"))
  ) {
    return imagePath;
  }

  // If it's a blob URL or data URL
  if (
    typeof imagePath === "string" &&
    (imagePath.startsWith("blob:") || imagePath.startsWith("data:"))
  ) {
    return imagePath;
  }

  // Get base URL
  let IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_URL;

  if (!IMAGE_BASE_URL) {
    IMAGE_BASE_URL = API_BASE_URL.replace("/api", "");
  }

  if (!IMAGE_BASE_URL) {
    IMAGE_BASE_URL = "http://localhost:5000";
  }

  // Handle absolute paths
  if (typeof imagePath === "string" && imagePath.startsWith("/")) {
    return `${IMAGE_BASE_URL}${imagePath}`;
  }

  // Handle relative paths/filenames
  if (typeof imagePath === "string") {
    const cleanFilename = imagePath.replace(/^.*[\\/]/, "");
    return `${IMAGE_BASE_URL}/uploads/${type}/${cleanFilename}`;
  }

  return "";
};

// Alias for getFullImageUrl for backward compatibility
export const getFullImageUrl = getImageUrl;

// Price formatting helper
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

// Calculate discount percentage
export const calculateDiscountPercentage = (price, discountedPrice) => {
  if (!price || !discountedPrice || discountedPrice >= price) return 0;
  return Math.round(((price - discountedPrice) / price) * 100);
};

// Get final price
export const getFinalPrice = (price, discountedPrice) => {
  if (!price) return 0;
  return discountedPrice && discountedPrice < price ? discountedPrice : price;
};

// ========== GENERIC API HELPER WITH FALLBACK ==========
const tryEndpoints = async (endpoints, params = {}) => {
  for (const endpoint of endpoints) {
    try {
      console.log(`Trying endpoint: ${endpoint}`);
      const response = await API.get(endpoint, { params });
      console.log(`Success from endpoint: ${endpoint}`, response);
      return response;
    } catch (error) {
      console.warn(`Failed endpoint: ${endpoint}`, error.message);
      // Continue to next endpoint
    }
  }
  
  // All endpoints failed
  throw new Error("All API endpoints failed");
};

// ========== PRODUCT API - COMPLETE WITH ALL ENDPOINTS ==========
export const productAPI = {
  // ========== PUBLIC ENDPOINTS ==========
  
  // Get all products with filters
  getAllProducts: async (params = {}) => {
    try {
      console.log("📦 Fetching products with params:", params);
      const response = await API.get("/api/products", { params });
      
      if (response.success && response.products) {
        // Process images for each product
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

  // Get single product by ID
  getProductById: async (id) => {
    try {
      console.log(`📦 Fetching product ${id}`);
      const response = await API.get(`/api/products/${id}`);
      
      if (response.success && response.product) {
        // Process images
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

  // Search products
  searchProducts: async (query, params = {}) => {
    try {
      const response = await API.get("/api/products", {
        params: { search: query, ...params }
      });
      
      if (response.success && response.products) {
        // Process images
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

  // Get products by category
  getProductsByCategory: async (categoryId, params = {}) => {
    try {
      const response = await API.get("/api/products", {
        params: { category: categoryId, ...params }
      });
      
      if (response.success && response.products) {
        // Process images
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

  // Get featured products
  getFeaturedProducts: async (params = {}) => {
    try {
      const response = await API.get("/api/products", {
        params: { featured: true, ...params }
      });
      
      if (response.success && response.products) {
        // Process images
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

  // Get products in stock
  getProductsInStock: async (params = {}) => {
    try {
      const response = await API.get("/api/products", {
        params: { inStock: true, ...params }
      });
      
      if (response.success && response.products) {
        // Process images
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

  // Get products by price range
  getProductsByPriceRange: async (minPrice, maxPrice, params = {}) => {
    try {
      const response = await API.get("/api/products", {
        params: { minPrice, maxPrice, ...params }
      });
      
      if (response.success && response.products) {
        // Process images
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

  // ========== ADMIN ENDPOINTS ==========
  
  // Get all products for admin (including inactive)
  getAllProductsForAdmin: async (params = {}) => {
    try {
      console.log("👑 Fetching admin products with params:", params);
      const response = await API.get("/api/admin/products", { params });
      
      if (response.success && response.products) {
        // Process images
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

  // Create product
  createProduct: async (productData) => {
    try {
      console.log("➕ Creating product:", productData);
      
      // Handle images
      const formData = new FormData();
      
      // Add all product data to formData
      Object.keys(productData).forEach(key => {
        if (productData[key] !== null && productData[key] !== undefined) {
          if (key === 'images' && Array.isArray(productData.images)) {
            // Handle multiple images
            productData.images.forEach((image, index) => {
              if (image instanceof File) {
                formData.append('images', image);
              } else if (typeof image === 'string') {
                // Could be base64 or URL
                formData.append('images', image);
              }
            });
          } else if (key === 'specifications' && typeof productData[key] === 'object') {
            formData.append(key, JSON.stringify(productData[key]));
          } else if (key === 'category' && productData[key] === '') {
            // Handle empty category
            formData.append(key, '');
          } else {
            formData.append(key, productData[key]);
          }
        }
      });
      
      const response = await API.post("/api/admin/products", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.success && response.product) {
        // Process images for response
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

  // Update product
  updateProduct: async (id, productData) => {
    try {
      console.log(`✏️ Updating product ${id}:`, productData);
      
      const formData = new FormData();
      
      // Add all product data to formData
      Object.keys(productData).forEach(key => {
        if (productData[key] !== null && productData[key] !== undefined) {
          if (key === 'images' && Array.isArray(productData.images)) {
            // Handle images array - could be Files, URLs, or base64
            const imagesJSON = JSON.stringify(productData.images);
            formData.append('images', imagesJSON);
          } else if (key === 'removeImages' && Array.isArray(productData[key])) {
            // Handle images to remove
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
      
      // Add any new image files
      if (productData.newImages && Array.isArray(productData.newImages)) {
        productData.newImages.forEach(image => {
          if (image instanceof File) {
            formData.append('imageFiles', image);
          }
        });
      }
      
      const response = await API.put(`/api/admin/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.success && response.product) {
        // Process images for response
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

  // Delete product (soft delete)
  deleteProduct: async (id) => {
    try {
      console.log(`🗑️ Deleting product ${id}`);
      const response = await API.delete(`/api/admin/products/${id}`);
      return response;
    } catch (error) {
      console.error(`❌ Error deleting product ${id}:`, error);
      return {
        success: false,
        message: error.message || "Failed to delete product"
      };
    }
  },

  // Hard delete product (permanent)
  hardDeleteProduct: async (id) => {
    try {
      console.log(`💀 Hard deleting product ${id}`);
      const response = await API.delete(`/api/admin/products/${id}/hard`);
      return response;
    } catch (error) {
      console.error(`❌ Error hard deleting product ${id}:`, error);
      return {
        success: false,
        message: error.message || "Failed to hard delete product"
      };
    }
  },

  // Toggle product active status
  toggleProductStatus: async (id) => {
    try {
      console.log(`🔄 Toggling status for product ${id}`);
      // First get current product
      const productResponse = await API.get(`/api/admin/products/${id}`);
      
      if (productResponse.success && productResponse.product) {
        const newStatus = !productResponse.product.isActive;
        
        const updateResponse = await API.put(`/api/admin/products/${id}`, {
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

  // Update product stock
  updateProductStock: async (id, stock) => {
    try {
      console.log(`📊 Updating stock for product ${id} to ${stock}`);
      const response = await API.put(`/api/admin/products/${id}`, {
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

  // Upload product image
  uploadProductImage: async (imageFile, productId = null) => {
    try {
      console.log(`📸 Uploading product image${productId ? ` for product ${productId}` : ''}`);
      
      const formData = new FormData();
      formData.append('image', imageFile);
      if (productId) {
        formData.append('productId', productId);
      }
      
      const response = await API.post("/api/upload", formData, {
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

  // Upload base64 image
  uploadBase64Image: async (base64Data, type = "product") => {
    try {
      console.log(`📸 Uploading base64 ${type} image`);
      
      const response = await API.post("/api/upload/base64", {
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

  // Delete product image
  deleteProductImage: async (productId, imageUrlOrIndex) => {
    try {
      console.log(`🗑️ Deleting image from product ${productId}:`, imageUrlOrIndex);
      
      // Get current product
      const productResponse = await API.get(`/api/admin/products/${productId}`);
      
      if (!productResponse.success) {
        return productResponse;
      }
      
      const product = productResponse.product;
      let updatedImages = [...(product.images || [])];
      
      // Determine which image to remove
      if (typeof imageUrlOrIndex === 'number') {
        // Remove by index
        if (imageUrlOrIndex >= 0 && imageUrlOrIndex < updatedImages.length) {
          const removedImage = updatedImages[imageUrlOrIndex];
          updatedImages.splice(imageUrlOrIndex, 1);
          
          // Extract filename for server deletion
          const filename = removedImage.split('/').pop();
          
          // Update product with new images array
          const updateResponse = await API.put(`/api/admin/products/${productId}`, {
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
        // Remove by URL/filename
        const filename = imageUrlOrIndex.split('/').pop();
        updatedImages = updatedImages.filter(img => {
          const imgFilename = img.split('/').pop();
          return imgFilename !== filename;
        });
        
        // Update product
        const updateResponse = await API.put(`/api/admin/products/${productId}`, {
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
  },

  // Bulk operations
  bulkDeleteProducts: async (productIds) => {
    try {
      console.log("🗑️ Bulk deleting products:", productIds);
      
      // Delete products one by one (or implement bulk endpoint on backend)
      const results = await Promise.all(
        productIds.map(id => productAPI.deleteProduct(id))
      );
      
      const allSuccess = results.every(result => result.success);
      const failedIds = results
        .map((result, index) => result.success ? null : productIds[index])
        .filter(id => id !== null);
      
      return {
        success: allSuccess,
        message: allSuccess 
          ? "All products deleted successfully" 
          : `Failed to delete some products: ${failedIds.join(', ')}`,
        deletedCount: results.filter(r => r.success).length,
        failedCount: failedIds.length,
        failedIds
      };
    } catch (error) {
      console.error("❌ Error bulk deleting products:", error);
      return {
        success: false,
        message: error.message || "Failed to bulk delete products",
        deletedCount: 0,
        failedCount: productIds.length,
        failedIds: productIds
      };
    }
  },

  bulkUpdateProducts: async (productIds, updateData) => {
    try {
      console.log("✏️ Bulk updating products:", productIds, updateData);
      
      // Update products one by one
      const results = await Promise.all(
        productIds.map(id => productAPI.updateProduct(id, updateData))
      );
      
      const allSuccess = results.every(result => result.success);
      const failedIds = results
        .map((result, index) => result.success ? null : productIds[index])
        .filter(id => id !== null);
      
      return {
        success: allSuccess,
        message: allSuccess 
          ? "All products updated successfully" 
          : `Failed to update some products: ${failedIds.join(', ')}`,
        updatedCount: results.filter(r => r.success).length,
        failedCount: failedIds.length,
        failedIds
      };
    } catch (error) {
      console.error("❌ Error bulk updating products:", error);
      return {
        success: false,
        message: error.message || "Failed to bulk update products",
        updatedCount: 0,
        failedCount: productIds.length,
        failedIds: productIds
      };
    }
  },

  // Get product statistics
  getProductStats: async () => {
    try {
      console.log("📊 Fetching product statistics");
      
      // Get all products
      const response = await API.get("/api/admin/products", {
        params: { limit: 1000 }
      });
      
      if (!response.success || !response.products) {
        return {
          success: false,
          message: "Failed to fetch products for statistics",
          stats: {}
        };
      }
      
      const products = response.products;
      
      // Calculate statistics
      const stats = {
        totalProducts: products.length,
        activeProducts: products.filter(p => p.isActive).length,
        outOfStockProducts: products.filter(p => p.stock <= 0).length,
        lowStockProducts: products.filter(p => p.stock > 0 && p.stock <= 10).length,
        featuredProducts: products.filter(p => p.featured).length,
        totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
        
        // Category distribution
        categories: {},
        
        // Price range
        minPrice: Math.min(...products.map(p => p.price)),
        maxPrice: Math.max(...products.map(p => p.price)),
        avgPrice: products.reduce((sum, p) => sum + p.price, 0) / products.length,
        
        // Stock analysis
        totalStock: products.reduce((sum, p) => sum + p.stock, 0),
        avgStock: products.reduce((sum, p) => sum + p.stock, 0) / products.length,
        
        // Discount analysis
        discountedProducts: products.filter(p => p.discountedPrice && p.discountedPrice < p.price).length,
        avgDiscount: products
          .filter(p => p.discountedPrice && p.discountedPrice < p.price)
          .reduce((sum, p) => sum + ((p.price - p.discountedPrice) / p.price * 100), 0) /
          products.filter(p => p.discountedPrice && p.discountedPrice < p.price).length || 0
      };
      
      // Calculate category distribution
      products.forEach(product => {
        const category = product.category || 'Uncategorized';
        stats.categories[category] = (stats.categories[category] || 0) + 1;
      });
      
      return {
        success: true,
        stats,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error("❌ Error fetching product stats:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch product statistics",
        stats: {}
      };
    }
  },

  // Get low stock products
  getLowStockProducts: async (threshold = 10) => {
    try {
      console.log(`📉 Fetching low stock products (threshold: ${threshold})`);
      
      const response = await API.get("/api/admin/products", {
        params: { limit: 1000 }
      });
      
      if (!response.success || !response.products) {
        return {
          success: false,
          message: "Failed to fetch products",
          products: []
        };
      }
      
      const lowStockProducts = response.products.filter(
        p => p.stock > 0 && p.stock <= threshold
      );
      
      // Process images
      const processedProducts = lowStockProducts.map(product => ({
        ...product,
        images: product.images?.map(img => getImageUrl(img, "products")) || []
      }));
      
      return {
        success: true,
        products: processedProducts,
        count: processedProducts.length,
        threshold
      };
    } catch (error) {
      console.error("❌ Error fetching low stock products:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch low stock products",
        products: []
      };
    }
  },

  // Export products
  exportProducts: async (format = 'csv') => {
    try {
      console.log(`📤 Exporting products as ${format}`);
      
      // Get all products
      const response = await API.get("/api/admin/products", {
        params: { limit: 5000 }
      });
      
      if (!response.success || !response.products) {
        throw new Error("Failed to fetch products for export");
      }
      
      const products = response.products;
      
      // Convert to CSV format
      if (format === 'csv') {
        const headers = ['ID', 'Name', 'SKU', 'Category', 'Price', 'Discounted Price', 'Stock', 'Brand', 'Status', 'Featured', 'Created At'];
        const rows = products.map(p => [
          p._id,
          `"${p.name?.replace(/"/g, '""')}"`,
          p.sku,
          p.category,
          p.price,
          p.discountedPrice || '',
          p.stock,
          p.brand,
          p.isActive ? 'Active' : 'Inactive',
          p.featured ? 'Yes' : 'No',
          new Date(p.createdAt).toLocaleDateString()
        ]);
        
        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.join(','))
        ].join('\n');
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `products_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return {
          success: true,
          message: `Exported ${products.length} products successfully`
        };
      }
      
      // JSON export
      if (format === 'json') {
        const jsonContent = JSON.stringify(products, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `products_export_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return {
          success: true,
          message: `Exported ${products.length} products successfully`
        };
      }
      
      return {
        success: false,
        message: `Unsupported export format: ${format}`
      };
    } catch (error) {
      console.error("❌ Error exporting products:", error);
      return {
        success: false,
        message: error.message || "Failed to export products"
      };
    }
  },

  // Import products
  importProducts: async (file) => {
    try {
      console.log("📥 Importing products from file:", file.name);
      
      if (!file) {
        return {
          success: false,
          message: "No file provided"
        };
      }
      
      const formData = new FormData();
      formData.append('file', file);
      
      // This would require a backend endpoint
      // For now, we'll read the file and parse it
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async (event) => {
          try {
            const content = event.target.result;
            let products = [];
            
            if (file.name.endsWith('.csv')) {
              // Parse CSV
              const lines = content.split('\n');
              const headers = lines[0].split(',').map(h => h.trim());
              
              for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                
                const values = lines[i].split(',');
                const product = {};
                
                headers.forEach((header, index) => {
                  if (values[index]) {
                    let value = values[index].trim();
                    
                    // Remove quotes if present
                    if (value.startsWith('"') && value.endsWith('"')) {
                      value = value.slice(1, -1);
                    }
                    
                    // Parse based on header
                    switch (header) {
                      case 'Price':
                      case 'Discounted Price':
                        product[header.toLowerCase().replace(' ', '')] = parseFloat(value) || 0;
                        break;
                      case 'Stock':
                        product[header] = parseInt(value) || 0;
                        break;
                      case 'Featured':
                      case 'Status':
                        product[header] = value === 'Yes' || value === 'Active';
                        break;
                      default:
                        product[header] = value;
                    }
                  }
                });
                
                if (product.Name) {
                  products.push({
                    name: product.Name,
                    sku: product.SKU || `SKU-${Date.now()}-${i}`,
                    category: product.Category,
                    price: product.Price || 0,
                    discountedPrice: product.DiscountedPrice || null,
                    stock: product.Stock || 0,
                    brand: product.Brand || '',
                    isActive: product.Status !== false,
                    featured: product.Featured || false,
                    description: product.Description || `${product.Name} - Imported product`
                  });
                }
              }
            } else if (file.name.endsWith('.json')) {
              // Parse JSON
              try {
                products = JSON.parse(content);
              } catch (e) {
                throw new Error("Invalid JSON file");
              }
            } else {
              throw new Error("Unsupported file format. Please use CSV or JSON.");
            }
            
            // Import products one by one
            const results = [];
            let successCount = 0;
            let errorCount = 0;
            
            for (const productData of products) {
              try {
                const result = await productAPI.createProduct(productData);
                results.push({
                  product: productData.name,
                  success: result.success,
                  message: result.message
                });
                
                if (result.success) {
                  successCount++;
                } else {
                  errorCount++;
                }
                
                // Small delay to avoid overwhelming the server
                await new Promise(resolve => setTimeout(resolve, 100));
              } catch (error) {
                results.push({
                  product: productData.name,
                  success: false,
                  message: error.message
                });
                errorCount++;
              }
            }
            
            resolve({
              success: true,
              message: `Imported ${successCount} products successfully, ${errorCount} failed`,
              imported: successCount,
              failed: errorCount,
              results
            });
          } catch (error) {
            reject({
              success: false,
              message: error.message || "Failed to parse import file"
            });
          }
        };
        
        reader.onerror = () => {
          reject({
            success: false,
            message: "Failed to read file"
          });
        };
        
        if (file.name.endsWith('.csv')) {
          reader.readAsText(file);
        } else if (file.name.endsWith('.json')) {
          reader.readAsText(file);
        } else {
          reject({
            success: false,
            message: "Unsupported file format"
          });
        }
      });
    } catch (error) {
      console.error("❌ Error importing products:", error);
      return {
        success: false,
        message: error.message || "Failed to import products"
      };
    }
  },

  // Duplicate product
  duplicateProduct: async (id) => {
    try {
      console.log(`📋 Duplicating product ${id}`);
      
      // Get original product
      const originalResponse = await productAPI.getProductById(id);
      
      if (!originalResponse.success || !originalResponse.product) {
        return originalResponse;
      }
      
      const originalProduct = originalResponse.product;
      
      // Create new product with "Copy of " prefix
      const newProductData = {
        ...originalProduct,
        name: `Copy of ${originalProduct.name}`,
        sku: `${originalProduct.sku}-COPY-${Date.now()}`,
        images: originalProduct.images, // Will be copied if backend handles it
        createdBy: 'duplicate',
        createdAt: undefined,
        updatedAt: undefined,
        _id: undefined,
        __v: undefined
      };
      
      // Remove MongoDB-specific fields
      delete newProductData._id;
      delete newProductData.__v;
      delete newProductData.createdAt;
      delete newProductData.updatedAt;
      
      const createResponse = await productAPI.createProduct(newProductData);
      
      return createResponse;
    } catch (error) {
      console.error(`❌ Error duplicating product ${id}:`, error);
      return {
        success: false,
        message: error.message || "Failed to duplicate product"
      };
    }
  },

  // Get similar products
  getSimilarProducts: async (productId, limit = 4) => {
    try {
      console.log(`🔍 Finding similar products to ${productId}`);
      
      // Get the target product
      const productResponse = await productAPI.getProductById(productId);
      
      if (!productResponse.success || !productResponse.product) {
        return productResponse;
      }
      
      const targetProduct = productResponse.product;
      
      // Search for similar products
      const similarParams = {
        category: targetProduct.category,
        limit: limit + 1, // +1 to exclude the target product
        excludeId: productId
      };
      
      const similarResponse = await API.get("/api/products", {
        params: similarParams
      });
      
      if (!similarResponse.success || !similarResponse.products) {
        return similarResponse;
      }
      
      // Filter out the target product and process images
      const similarProducts = similarResponse.products
        .filter(p => p._id !== productId)
        .slice(0, limit)
        .map(product => ({
          ...product,
          images: product.images?.map(img => getImageUrl(img, "products")) || []
        }));
      
      return {
        success: true,
        products: similarProducts,
        count: similarProducts.length,
        basedOn: targetProduct.name
      };
    } catch (error) {
      console.error(`❌ Error finding similar products for ${productId}:`, error);
      return {
        success: false,
        message: error.message || "Failed to find similar products",
        products: []
      };
    }
  }
};

// ========== CATEGORY API ==========
export const categoryAPI = {
  // Get all categories
  getAllCategories: async (params = {}) => {
    try {
      console.log("📁 Fetching categories with params:", params);
      const response = await API.get("/api/categories", { params });
      
      if (response.success && response.categories) {
        // Process category images
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

  // Get single category by ID
  getCategoryById: async (id) => {
    try {
      console.log(`📁 Fetching category ${id}`);
      const response = await API.get(`/api/categories/${id}`);
      
      if (response.success && response.category) {
        // Process image
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

  // Create category
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
      
      const response = await API.post("/api/categories", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.success && response.category) {
        // Process image for response
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

  // Update category
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
      
      const response = await API.put(`/api/categories/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.success && response.category) {
        // Process image for response
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

  // Delete category
  deleteCategory: async (id) => {
    try {
      console.log(`🗑️ Deleting category ${id}`);
      const response = await API.delete(`/api/categories/${id}`);
      return response;
    } catch (error) {
      console.error(`❌ Error deleting category ${id}:`, error);
      return {
        success: false,
        message: error.message || "Failed to delete category"
      };
    }
  },

  // Get products by category
  getCategoryProducts: async (categoryId, params = {}) => {
    try {
      console.log(`📦 Fetching products for category ${categoryId}`);
      
      const productResponse = await productAPI.getProductsByCategory(categoryId, params);
      
      // Also get category info
      const categoryResponse = await categoryAPI.getCategoryById(categoryId);
      
      return {
        success: productResponse.success,
        products: productResponse.products || [],
        category: categoryResponse.category,
        count: productResponse.products?.length || 0,
        total: productResponse.total || 0
      };
    } catch (error) {
      console.error(`❌ Error fetching category products ${categoryId}:`, error);
      return {
        success: false,
        message: error.message || "Failed to fetch category products",
        products: [],
        category: null
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

// ========== ORDER API ==========
export const orderAPI = {
  // Public endpoints
  placeOrder: (orderData) => API.post("/orders", orderData),
  getMyOrders: (params = {}) => API.get("/orders/my-orders", { params }),
  getOrderById: (id) => API.get(`/orders/${id}`),
  cancelOrder: (id) => API.post(`/orders/${id}/cancel`),
  trackOrder: (id) => API.get(`/orders/${id}/track`),
  
  // Admin endpoints
  getAllOrders: (params = {}) => API.get("/admin/orders", { params }),
  updateOrderStatus: (id, statusData) => 
    API.put(`/admin/orders/${id}/status`, statusData),
  updateOrder: (id, orderData) => API.put(`/admin/orders/${id}`, orderData),
  deleteOrder: (id) => API.delete(`/admin/orders/${id}`),
  
  // Stats and analytics
  getOrderStats: () => API.get("/admin/orders/stats"),
  getRecentOrders: (limit = 10) => 
    API.get("/admin/orders/recent", { params: { limit } }),
  
  // Bulk operations
  bulkUpdateOrders: async (orderIds, updateData) => {
    const results = await Promise.all(
      orderIds.map(id => orderAPI.updateOrder(id, updateData))
    );
    
    return {
      success: results.every(r => r.success),
      results
    };
  },
  
  // Export/Import
  exportOrders: (params = {}) => {
    // Implementation for exporting orders
    return Promise.resolve({ success: true, message: "Export functionality" });
  },
  
  importOrders: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return API.post("/admin/orders/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// ========== CART API ==========
export const cartAPI = {
  // Get cart from localStorage or API
  getCart: () => {
    if (isBrowser) {
      const cart = localStorage.getItem('cart');
      return cart ? JSON.parse(cart) : { items: [], total: 0 };
    }
    return { items: [], total: 0 };
  },
  
  // Add to cart
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
      
      // Recalculate total
      cart.total = cart.items.reduce((sum, item) => {
        const price = item.product.discountedPrice || item.product.price;
        return sum + (price * item.quantity);
      }, 0);
      
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
  
  // Update cart item quantity
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
        
        // Recalculate total
        cart.total = cart.items.reduce((sum, item) => {
          const price = item.product.discountedPrice || item.product.price;
          return sum + (price * item.quantity);
        }, 0);
        
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
  
  // Remove from cart
  removeFromCart: (productId) => {
    return cartAPI.updateCartItem(productId, 0);
  },
  
  // Clear cart
  clearCart: () => {
    if (!isBrowser) return { success: false, message: "Not in browser" };
    
    try {
      localStorage.setItem('cart', JSON.stringify({ items: [], total: 0 }));
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
  
  // Get cart count
  getCartCount: () => {
    const cart = cartAPI.getCart();
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }
};

// ========== DASHBOARD API ==========
export const dashboardAPI = {
  getOverviewStats: async () => {
    try {
      // Get product stats
      const productStats = await productAPI.getProductStats();
      
      // Get order stats (simulated)
      const orderStats = {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0
      };
      
      // Get category stats
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

// ========== CUSTOMER API ==========
export const customerAPI = {
  // For now, we'll use localStorage for guest customers
  getProfile: () => {
    if (isBrowser) {
      const profile = localStorage.getItem('customerProfile');
      return profile ? JSON.parse(profile) : null;
    }
    return null;
  },
  
  updateProfile: (profileData) => {
    if (!isBrowser) return { success: false, message: "Not in browser" };
    
    try {
      localStorage.setItem('customerProfile', JSON.stringify(profileData));
      return {
        success: true,
        profile: profileData,
        message: "Profile updated"
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to update profile"
      };
    }
  }
};

// ========== MAIN API SERVICE OBJECT ==========
const apiService = {
  // Axios instance
  API,
  
  // All API modules
  productAPI,
  categoryAPI,
  authAPI,
  orderAPI,
  cartAPI,
  dashboardAPI,
  customerAPI,
  
  // Helper functions
  getImageUrl,
  getFullImageUrl,
  formatPrice,
  calculateDiscountPercentage,
  getFinalPrice,
  
  // Base URL
  API_BASE_URL,
  
  // Direct methods for convenience
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
  
  // Utility function to check API connection
  checkConnection: async () => {
    try {
      const response = await API.get("/api");
      return {
        success: true,
        connected: true,
        message: "API is running",
        data: response
      };
    } catch (error) {
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
  
  // Upload helper
  uploadFile: async (file, endpoint = "/api/upload", fieldName = "image") => {
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
  }
};

export default apiService;