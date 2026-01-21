// src/services/api.js - UPDATED WITH PROPER ERROR HANDLING
import axios from "axios";
import authService from "./auth.js";

// Use environment variable with fallback
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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

// ========== BRAND/CATEGORY API WITH FALLBACK MECHANISM ==========
export const brandAPI = {
  // Get all brands/categories - tries multiple endpoints
  getAllBrands: (params = {}) => {
    const endpoints = [
      "/brands",
      "/categories",
      "/api/brands",
      "/api/categories",
      "/admin/brands",
      "/admin/categories"
    ];
    
    return tryEndpoints(endpoints, params);
  },

  // Get brand/category by ID
  getBrandById: (id) => {
    const endpoints = [
      `/brands/${id}`,
      `/categories/${id}`,
      `/api/brands/${id}`,
      `/api/categories/${id}`
    ];
    
    return tryEndpoints(endpoints);
  },

  // Create brand/category
  createBrand: (brandData) => {
    console.log("Creating brand/category:", brandData);
    
    // Try multiple endpoints
    const tryCreate = async () => {
      const endpoints = ["/brands", "/categories", "/admin/brands", "/admin/categories"];
      
      for (const endpoint of endpoints) {
        try {
          if (brandData.image && brandData.image instanceof File) {
            const formData = new FormData();
            Object.keys(brandData).forEach((key) => {
              if (brandData[key] !== null && brandData[key] !== undefined) {
                formData.append(key, brandData[key]);
              }
            });
            return await API.post(endpoint, formData);
          }
          return await API.post(endpoint, brandData);
        } catch (error) {
          console.warn(`Failed to create at ${endpoint}:`, error.message);
          // Continue to next endpoint
        }
      }
      throw new Error("All create endpoints failed");
    };
    
    return tryCreate();
  },

  // Update brand/category
  updateBrand: (id, brandData) => {
    console.log(`Updating brand/category ${id}:`, brandData);
    
    const tryUpdate = async () => {
      const endpoints = [
        `/brands/${id}`,
        `/categories/${id}`,
        `/admin/brands/${id}`,
        `/admin/categories/${id}`
      ];
      
      for (const endpoint of endpoints) {
        try {
          if (brandData.image && brandData.image instanceof File) {
            const formData = new FormData();
            Object.keys(brandData).forEach((key) => {
              if (brandData[key] !== null && brandData[key] !== undefined) {
                formData.append(key, brandData[key]);
              }
            });
            return await API.put(endpoint, formData);
          }
          return await API.put(endpoint, brandData);
        } catch (error) {
          console.warn(`Failed to update at ${endpoint}:`, error.message);
        }
      }
      throw new Error("All update endpoints failed");
    };
    
    return tryUpdate();
  },

  // Delete brand/category
  deleteBrand: (id) => {
    console.log(`Deleting brand/category ${id}`);
    
    const tryDelete = async () => {
      const endpoints = [
        `/brands/${id}`,
        `/categories/${id}`,
        `/admin/brands/${id}`,
        `/admin/categories/${id}`
      ];
      
      for (const endpoint of endpoints) {
        try {
          return await API.delete(endpoint);
        } catch (error) {
          console.warn(`Failed to delete at ${endpoint}:`, error.message);
        }
      }
      throw new Error("All delete endpoints failed");
    };
    
    return tryDelete();
  },

  // Toggle brand/category status
  toggleBrandStatus: (id) => {
    console.log(`Toggling brand/category ${id} status`);
    
    const tryToggle = async () => {
      const endpoints = [
        `/brands/${id}/toggle-status`,
        `/categories/${id}/toggle-status`,
        `/brands/${id}/status`,
        `/categories/${id}/status`
      ];
      
      for (const endpoint of endpoints) {
        try {
          return await API.patch(endpoint);
        } catch (error) {
          console.warn(`Failed to toggle at ${endpoint}:`, error.message);
        }
      }
      throw new Error("All toggle endpoints failed");
    };
    
    return tryToggle();
  },

  // Get motorcycles by brand/category
  getBrandMotorcycles: (brandId, params = {}) => {
    const endpoints = [
      `/brands/${brandId}/motorcycles`,
      `/categories/${brandId}/motorcycles`,
      `/brands/${brandId}/products`,
      `/categories/${brandId}/products`
    ];
    
    return tryEndpoints(endpoints, params);
  },

  // Get brands with stats
  getBrandsWithStats: () => {
    const endpoints = [
      "/brands/stats",
      "/categories/stats",
      "/admin/brands/stats",
      "/admin/categories/stats"
    ];
    
    return tryEndpoints(endpoints);
  },

  // Bulk operations
  bulkDeleteBrands: (brandIds) => {
    console.log("Bulk deleting brands/categories:", brandIds);
    
    const tryBulkDelete = async () => {
      const endpoints = ["/brands/bulk", "/categories/bulk", "/admin/brands/bulk", "/admin/categories/bulk"];
      
      for (const endpoint of endpoints) {
        try {
          return await API.delete(endpoint, { data: { brandIds } });
        } catch (error) {
          console.warn(`Failed bulk delete at ${endpoint}:`, error.message);
        }
      }
      throw new Error("All bulk delete endpoints failed");
    };
    
    return tryBulkDelete();
  },

  bulkUpdateBrands: (brandData) => {
    console.log("Bulk updating brands/categories:", brandData);
    
    const tryBulkUpdate = async () => {
      const endpoints = ["/brands/bulk", "/categories/bulk", "/admin/brands/bulk", "/admin/categories/bulk"];
      
      for (const endpoint of endpoints) {
        try {
          return await API.put(endpoint, brandData);
        } catch (error) {
          console.warn(`Failed bulk update at ${endpoint}:`, error.message);
        }
      }
      throw new Error("All bulk update endpoints failed");
    };
    
    return tryBulkUpdate();
  },
};

// ========== CATEGORY API (ALIASES FOR BRAND API) ==========
export const categoryAPI = {
  // Alias methods that point to brandAPI
  getAllCategories: (params = {}) => brandAPI.getAllBrands(params),
  getAll: (params = {}) => brandAPI.getAllBrands(params),
  getCategoryById: (id) => brandAPI.getBrandById(id),
  createCategory: (categoryData) => brandAPI.createBrand(categoryData),
  updateCategory: (id, categoryData) => brandAPI.updateBrand(id, categoryData),
  deleteCategory: (id) => brandAPI.deleteBrand(id),
  toggleCategoryStatus: (id) => brandAPI.toggleBrandStatus(id),
  getCategoryProducts: (id, params = {}) => brandAPI.getBrandMotorcycles(id, params),
  
  // Additional category-specific methods
  getCategoriesWithStats: () => brandAPI.getBrandsWithStats(),
  bulkDeleteCategories: (categoryIds) => brandAPI.bulkDeleteBrands(categoryIds),
  bulkUpdateCategories: (categoryData) => brandAPI.bulkUpdateBrands(categoryData),
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

// ========== MOTORCYCLE API ==========
export const motorcycleAPI = {
  // Get all motorcycles
  getAllMotorcycles: (params = {}) => API.get("/motorcycles", { params }),

  // Get motorcycle by ID
  getMotorcycleById: (id) => API.get(`/motorcycles/${id}`),

  // Create motorcycle
  createMotorcycle: (motorcycleData) => {
    if (
      motorcycleData.images &&
      (motorcycleData.images instanceof File ||
        Array.isArray(motorcycleData.images))
    ) {
      const formData = new FormData();
      Object.keys(motorcycleData).forEach((key) => {
        if (motorcycleData[key] !== null && motorcycleData[key] !== undefined) {
          if (key === "images" && Array.isArray(motorcycleData.images)) {
            motorcycleData.images.forEach((image, index) => {
              formData.append("images", image);
            });
          } else if (key === "specifications") {
            formData.append(key, JSON.stringify(motorcycleData[key]));
          } else {
            formData.append(key, motorcycleData[key]);
          }
        }
      });
      return API.post("/motorcycles", formData);
    }
    return API.post("/motorcycles", motorcycleData);
  },

  // Update motorcycle
  updateMotorcycle: (id, motorcycleData) => {
    if (
      motorcycleData.images &&
      (motorcycleData.images instanceof File ||
        Array.isArray(motorcycleData.images))
    ) {
      const formData = new FormData();
      Object.keys(motorcycleData).forEach((key) => {
        if (motorcycleData[key] !== null && motorcycleData[key] !== undefined) {
          if (key === "images" && Array.isArray(motorcycleData.images)) {
            motorcycleData.images.forEach((image, index) => {
              formData.append("images", image);
            });
          } else if (key === "specifications") {
            formData.append(key, JSON.stringify(motorcycleData[key]));
          } else {
            formData.append(key, motorcycleData[key]);
          }
        }
      });
      return API.put(`/motorcycles/${id}`, formData);
    }
    return API.put(`/motorcycles/${id}`, motorcycleData);
  },

  // Delete motorcycle
  deleteMotorcycle: (id) => API.delete(`/motorcycles/${id}`),

  // Get motorcycles by brand
  getMotorcyclesByBrand: (brandId, params = {}) =>
    API.get(`/motorcycles/brand/${brandId}`, { params }),

  // Get motorcycle products
  getMotorcycleProducts: (motorcycleId, params = {}) =>
    API.get(`/motorcycles/${motorcycleId}/products`, { params }),

  // Search motorcycles
  searchMotorcycles: (query, params = {}) =>
    API.get("/motorcycles/search", { params: { q: query, ...params } }),

  // Get featured motorcycles
  getFeaturedMotorcycles: () => API.get("/motorcycles/featured"),

  // Bulk operations
  bulkDeleteMotorcycles: (motorcycleIds) =>
    API.delete("/motorcycles/bulk", { data: { motorcycleIds } }),

  bulkUpdateMotorcycles: (motorcycleData) =>
    API.put("/motorcycles/bulk", motorcycleData),

  // Toggle status
  toggleMotorcycleStatus: (id) => API.patch(`/motorcycles/${id}/toggle-status`),
};

// ========== PRODUCT API ==========
export const productAPI = {
  // Public endpoints
  getAllProducts: (params = {}) => API.get("/products", { params }),
  getProductById: (id) => API.get(`/products/${id}`),
  getFeaturedProducts: () => API.get("/products/featured"),
  getBestSellingProducts: () => API.get("/products/best-selling"),

  // Get products by motorcycle
  getProductsByMotorcycle: (motorcycleId, params = {}) =>
    API.get(`/products/motorcycle/${motorcycleId}`, { params }),

  // Get products by brand
  getProductsByBrand: (brandId, params = {}) =>
    API.get(`/products/brand/${brandId}`, { params }),

  searchProducts: (query, params = {}) =>
    API.get("/products/search", { params: { q: query, ...params } }),

  // Admin endpoints
  getAllProductsForAdmin: (params = {}) =>
    API.get("/admin/products", { params }),
  createProduct: (productData) => {
    if (
      productData.images &&
      (productData.images instanceof File || Array.isArray(productData.images))
    ) {
      const formData = new FormData();
      Object.keys(productData).forEach((key) => {
        if (productData[key] !== null && productData[key] !== undefined) {
          if (key === "images" && Array.isArray(productData.images)) {
            productData.images.forEach((image, index) => {
              formData.append("images", image);
            });
          } else if (key === "specifications") {
            formData.append(key, JSON.stringify(productData[key]));
          } else {
            formData.append(key, productData[key]);
          }
        }
      });
      return API.post("/admin/products", formData);
    }
    return API.post("/admin/products", productData);
  },

  updateProduct: (id, productData) => {
    if (
      productData.images &&
      (productData.images instanceof File || Array.isArray(productData.images))
    ) {
      const formData = new FormData();
      Object.keys(productData).forEach((key) => {
        if (productData[key] !== null && productData[key] !== undefined) {
          if (key === "images" && Array.isArray(productData.images)) {
            productData.images.forEach((image, index) => {
              formData.append("images", image);
            });
          } else if (key === "specifications") {
            formData.append(key, JSON.stringify(productData[key]));
          } else {
            formData.append(key, productData[key]);
          }
        }
      });
      return API.put(`/admin/products/${id}`, formData);
    }
    return API.put(`/admin/products/${id}`, productData);
  },

  deleteProduct: (id) => API.delete(`/admin/products/${id}`),
  bulkDeleteProducts: (productIds) =>
    API.delete("/admin/products/bulk", { data: { productIds } }),
  bulkUpdateProducts: (data) => API.put("/admin/products/bulk", data),
  toggleProductStatus: (id) => API.patch(`/admin/products/${id}/toggle-status`),
  updateStock: (id, stockData) =>
    API.put(`/admin/products/${id}/stock`, stockData),

  // Product stats
  getProductStats: () => API.get("/admin/products/stats"),
  getLowStockProducts: (threshold = 10) =>
    API.get("/admin/products/low-stock", { params: { threshold } }),

  // Images
  uploadProductImage: (imageFile, productId = null) => {
    const formData = new FormData();
    formData.append("image", imageFile);
    if (productId) formData.append("productId", productId);

    return API.post("/admin/products/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deleteProductImage: (productId, imageIndex) =>
    API.delete(`/admin/products/${productId}/images/${imageIndex}`),

  exportProducts: (params = {}) =>
    API.get("/admin/products/export", { params, responseType: "blob" }),
  importProducts: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return API.post("/admin/products/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// ========== ORDER API ==========
export const orderAPI = {
  placeOrder: (orderData) => API.post("/orders", orderData),
  getMyOrders: (params = {}) => API.get("/orders/my-orders", { params }),
  getOrderById: (id) => API.get(`/orders/${id}`),
  cancelOrder: (id) => API.post(`/orders/${id}/cancel`),
  trackOrder: (id) => API.get(`/orders/${id}/track`),
  
  getAllOrders: (params = {}) => API.get("/admin/orders", { params }),
  updateOrderStatus: (id, statusData) => 
    API.put(`/admin/orders/${id}/status`, statusData),
  updateOrder: (id, orderData) => API.put(`/admin/orders/${id}`, orderData),
  deleteOrder: (id) => API.delete(`/admin/orders/${id}`),
  getOrderStats: () => API.get("/admin/orders/stats"),
  getRecentOrders: (limit = 10) => 
    API.get("/admin/orders/recent", { params: { limit } }),
  
  bulkUpdateOrders: (orderIds, updateData) => 
    API.put("/admin/orders/bulk", { orderIds, ...updateData }),
  bulkDeleteOrders: (orderIds) => 
    API.delete("/admin/orders/bulk", { data: { orderIds } }),
  
  exportOrders: (params = {}) => 
    API.get("/admin/orders/export", { params, responseType: "blob" }),
  importOrders: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return API.post("/admin/orders/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// ========== DASHBOARD API ==========
export const dashboardAPI = {
  getOverviewStats: () => API.get("/dashboard/overview"),
  getRevenueStats: (period = "monthly") => 
    API.get("/dashboard/revenue", { params: { period } }),
  getSalesStats: (period = "monthly") => 
    API.get("/dashboard/sales", { params: { period } }),
  getCustomerStats: () => API.get("/dashboard/customers"),
  getProductStats: () => API.get("/dashboard/products"),
  getOrderStats: (period = "monthly") => 
    API.get("/dashboard/orders", { params: { period } }),
  getTopProducts: (limit = 10) => 
    API.get("/dashboard/top-products", { params: { limit } }),
  getTopCategories: (limit = 10) => 
    API.get("/dashboard/top-categories", { params: { limit } }),
  getRecentActivities: (limit = 20) => 
    API.get("/dashboard/activities", { params: { limit } }),
};

// ========== CART API ==========
export const cartAPI = {
  getCart: () => API.get("/cart"),
  addToCart: (cartItem) => API.post("/cart", cartItem),
  updateCartItem: (itemId, quantity) => 
    API.put(`/cart/${itemId}`, { quantity }),
  removeFromCart: (itemId) => API.delete(`/cart/${itemId}`),
  clearCart: () => API.delete("/cart/clear"),
  getCartCount: () => API.get("/cart/count"),
  applyCoupon: (couponCode) => 
    API.post("/cart/apply-coupon", { couponCode }),
  removeCoupon: () => API.delete("/cart/remove-coupon"),
  
  getGuestCart: (cartId) => API.get(`/cart/guest/${cartId}`),
  createGuestCart: () => API.post("/cart/guest"),
  syncGuestCart: (cartId, cartData) => 
    API.post(`/cart/guest/${cartId}/sync`, cartData),
};

// ========== CUSTOMER API ==========
export const customerAPI = {
  getProfile: () => API.get("/customers/profile"),
  updateProfile: (profileData) => API.put("/customers/profile", profileData),
  
  getAddresses: () => API.get("/customers/addresses"),
  addAddress: (addressData) => API.post("/customers/addresses", addressData),
  updateAddress: (addressId, addressData) => 
    API.put(`/customers/addresses/${addressId}`, addressData),
  deleteAddress: (addressId) => API.delete(`/customers/addresses/${addressId}`),
  setDefaultAddress: (addressId) => 
    API.put(`/customers/addresses/${addressId}/default`),
  
  getWishlist: () => API.get("/customers/wishlist"),
  addToWishlist: (productId) => 
    API.post("/customers/wishlist", { productId }),
  removeFromWishlist: (productId) => 
    API.delete(`/customers/wishlist/${productId}`),
  clearWishlist: () => API.delete("/customers/wishlist/clear"),
  
  getAllCustomers: (params = {}) => API.get("/admin/customers", { params }),
  getCustomerById: (id) => API.get(`/admin/customers/${id}`),
  updateCustomer: (id, customerData) => 
    API.put(`/admin/customers/${id}`, customerData),
  deleteCustomer: (id) => API.delete(`/admin/customers/${id}`),
  getCustomerStats: () => API.get("/admin/customers/stats"),
  getCustomerOrders: (customerId, params = {}) => 
    API.get(`/admin/customers/${customerId}/orders`, { params }),
  
  bulkUpdateCustomers: (customerIds, updateData) => 
    API.put("/admin/customers/bulk", { customerIds, ...updateData }),
  bulkDeleteCustomers: (customerIds) => 
    API.delete("/admin/customers/bulk", { data: { customerIds } }),
  
  exportCustomers: (params = {}) => 
    API.get("/admin/customers/export", { params, responseType: "blob" }),
  importCustomers: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return API.post("/admin/customers/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// ========== OTHER APIS (SIMPLIFIED) ==========
export const tableAPI = {
  getAllTables: (params = {}) => API.get("/tables", { params }),
  getTableById: (id) => API.get(`/tables/${id}`),
  createTable: (tableData) => API.post("/tables", tableData),
  updateTable: (id, tableData) => API.put(`/tables/${id}`, tableData),
  deleteTable: (id) => API.delete(`/tables/${id}`),
};

export const reportAPI = {
  getSalesReport: (startDate, endDate, params = {}) => 
    API.get("/reports/sales", { params: { startDate, endDate, ...params } }),
  getInventoryReport: () => API.get("/reports/inventory"),
};

export const posAPI = {
  createPOSOrder: (orderData) => API.post("/pos/orders", orderData),
  getPOSOrders: (params = {}) => API.get("/pos/orders", { params }),
};

export const settingsAPI = {
  getSettings: () => API.get("/settings"),
  updateSettings: (settingsData) => API.put("/settings", settingsData),
};

export const inventoryAPI = {
  getInventory: (params = {}) => API.get("/inventory", { params }),
  updateInventory: (id, inventoryData) => 
    API.put(`/inventory/${id}`, inventoryData),
};

// ========== MAIN API SERVICE OBJECT ==========
const apiService = {
  API,
  
  // All API modules
  authAPI,
  brandAPI,
  motorcycleAPI,
  productAPI,
  categoryAPI,
  orderAPI,
  dashboardAPI,
  cartAPI,
  customerAPI,
  tableAPI,
  reportAPI,
  posAPI,
  settingsAPI,
  inventoryAPI,

  // Helper functions
  getImageUrl,
  getFullImageUrl,
  formatPrice,
  calculateDiscountPercentage,
  getFinalPrice,

  API_BASE_URL,
};

export default apiService;