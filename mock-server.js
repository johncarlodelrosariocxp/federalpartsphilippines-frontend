// mock-server.js
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Generate mock data functions
const generateMockProducts = (count = 50) => {
  const products = [];
  for (let i = 1; i <= count; i++) {
    products.push({
      id: `PROD${1000 + i}`,
      name: `Product ${i}`,
      description: `Description for product ${i}`,
      price: (Math.random() * 500 + 10).toFixed(2),
      discountedPrice:
        Math.random() > 0.7 ? (Math.random() * 400 + 5).toFixed(2) : null,
      category: `Category ${(i % 5) + 1}`,
      stock: Math.floor(Math.random() * 200),
      isActive: Math.random() > 0.1,
      isFeatured: Math.random() > 0.7,
      images: [`https://picsum.photos/400/300?random=${i}`],
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    });
  }
  return products;
};

const generateMockCategories = (count = 10) => {
  const categories = [];
  for (let i = 1; i <= count; i++) {
    categories.push({
      id: `CAT${100 + i}`,
      name: `Category ${i}`,
      description: `Description for category ${i}`,
      productCount: Math.floor(Math.random() * 100) + 10,
      isActive: true,
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    });
  }
  return categories;
};

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Dashboard endpoints
app.get("/api/admin/dashboard/stats", (req, res) => {
  res.json({
    success: true,
    data: {
      totalSales: 125430,
      totalOrders: 345,
      totalCustomers: 1289,
      totalProducts: 567,
      revenue: {
        today: 3245.67,
        thisWeek: 23456.89,
        thisMonth: 98765.43,
      },
    },
  });
});

app.get("/api/admin/dashboard/recent-orders", (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const orders = Array.from({ length: limit }, (_, i) => ({
    id: `ORD${1000 + i}`,
    customer: `Customer ${i + 1}`,
    date: new Date(Date.now() - i * 86400000).toISOString(),
    amount: (Math.random() * 500 + 50).toFixed(2),
    status: ["Pending", "Processing", "Shipped", "Delivered"][i % 4],
  }));
  res.json({ success: true, data: orders });
});

app.get("/api/admin/dashboard/top-products", (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const products = Array.from({ length: limit }, (_, i) => ({
    id: `PROD${100 + i}`,
    name: `Product ${i + 1}`,
    sales: Math.floor(Math.random() * 500) + 100,
    revenue: (Math.random() * 10000 + 1000).toFixed(2),
    stock: Math.floor(Math.random() * 200) + 10,
  }));
  res.json({ success: true, data: products });
});

// Products endpoints
app.get("/api/admin/products/stats", (req, res) => {
  res.json({
    success: true,
    data: {
      totalProducts: 567,
      activeProducts: 512,
      outOfStock: 12,
      lowStock: 45,
      totalCategories: 15,
      averagePrice: 89.99,
    },
  });
});

app.get("/api/admin/products", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const search = req.query.search || "";

  const mockProducts = generateMockProducts(50);
  const filteredProducts = search
    ? mockProducts.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    : mockProducts;

  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedProducts = filteredProducts.slice(start, end);

  res.json({
    success: true,
    data: paginatedProducts,
    pagination: {
      page,
      limit,
      total: filteredProducts.length,
      totalPages: Math.ceil(filteredProducts.length / limit),
    },
  });
});

app.get("/api/admin/products/:id", (req, res) => {
  const product = {
    id: req.params.id,
    name: `Product ${req.params.id}`,
    description: `Detailed description for product ${req.params.id}`,
    price: 199.99,
    discountedPrice: 149.99,
    category: "Electronics",
    stock: 150,
    isActive: true,
    isFeatured: true,
    images: [
      "https://picsum.photos/400/300?random=1",
      "https://picsum.photos/400/300?random=2",
      "https://picsum.photos/400/300?random=3",
    ],
    specifications: {
      brand: "Example Brand",
      weight: "1.5kg",
      dimensions: "10 x 15 x 5 cm",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  res.json({ success: true, data: product });
});

app.post("/api/admin/products", (req, res) => {
  const newProduct = {
    id: `PROD${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  res.status(201).json({
    success: true,
    data: newProduct,
    message: "Product created successfully",
  });
});

app.put("/api/admin/products/:id", (req, res) => {
  res.json({
    success: true,
    data: { id: req.params.id, ...req.body },
    message: "Product updated successfully",
  });
});

app.delete("/api/admin/products/:id", (req, res) => {
  res.json({ success: true, message: "Product deleted successfully" });
});

// Categories endpoints
app.get("/api/admin/categories", (req, res) => {
  const categories = generateMockCategories();
  res.json({ success: true, data: categories });
});

// Auth endpoints
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (email && password) {
    res.json({
      success: true,
      data: {
        token: "mock-jwt-token-" + Date.now(),
        user: {
          id: "USER001",
          name: "Admin User",
          email: email,
          role: "admin",
          avatar: "https://ui-avatars.com/api/?name=Admin+User",
        },
      },
    });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

app.get("/api/auth/profile", (req, res) => {
  res.json({
    success: true,
    data: {
      id: "USER001",
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      avatar: "https://ui-avatars.com/api/?name=Admin+User",
    },
  });
});

// Catch-all for other endpoints
app.use("/api", (req, res) => {
  console.log(`[Mock Server] ${req.method} ${req.url}`);
  res.json({
    success: true,
    message: "Mock API response",
    endpoint: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock API server running on http://localhost:${PORT}`);
  console.log(
    `📊 Dashboard: http://localhost:${PORT}/api/admin/dashboard/stats`
  );
  console.log(`🛒 Products: http://localhost:${PORT}/api/admin/products`);
  console.log(`🔐 Login: http://localhost:${PORT}/api/auth/login`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
});
