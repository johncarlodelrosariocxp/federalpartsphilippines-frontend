// src/pages/admin/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { dashboardAPI } from "../../services/api";
import {
  Package,
  Users,
  DollarSign,
  ShoppingCart,
  BarChart3,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
} from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    activeUsers: 0,
    lowStockProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch all dashboard data in parallel
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentOrders(),
        dashboardAPI.getTopProducts(),
      ]);

      // Handle response format
      const statsData = statsRes?.data || statsRes;
      const ordersData = ordersRes?.data || ordersRes;
      const productsData = productsRes?.data || productsRes;

      setStats(
        statsData || {
          totalProducts: 0,
          totalUsers: 0,
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          activeUsers: 0,
          lowStockProducts: 0,
        }
      );

      setRecentOrders(ordersData || []);
      setTopProducts(productsData || []);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
      // Load mock data for demonstration
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    setStats({
      totalProducts: 156,
      totalUsers: 892,
      totalOrders: 1245,
      totalRevenue: 24567.89,
      pendingOrders: 23,
      activeUsers: 756,
      lowStockProducts: 12,
    });

    setRecentOrders([
      {
        _id: "1",
        orderNumber: "ORD-1001",
        customer: { name: "John Doe" },
        total: 199.99,
        status: "completed",
        createdAt: new Date().toISOString(),
      },
      {
        _id: "2",
        orderNumber: "ORD-1002",
        customer: { name: "Jane Smith" },
        total: 89.99,
        status: "pending",
        createdAt: new Date().toISOString(),
      },
      {
        _id: "3",
        orderNumber: "ORD-1003",
        customer: { name: "Bob Johnson" },
        total: 299.99,
        status: "processing",
        createdAt: new Date().toISOString(),
      },
      {
        _id: "4",
        orderNumber: "ORD-1004",
        customer: { name: "Alice Brown" },
        total: 149.99,
        status: "completed",
        createdAt: new Date().toISOString(),
      },
      {
        _id: "5",
        orderNumber: "ORD-1005",
        customer: { name: "Charlie Wilson" },
        total: 79.99,
        status: "pending",
        createdAt: new Date().toISOString(),
      },
    ]);

    setTopProducts([
      { _id: "1", name: "Motorcycle Helmet", sales: 156, revenue: 15600 },
      { _id: "2", name: "Leather Jacket", sales: 89, revenue: 17800 },
      { _id: "3", name: "Racing Gloves", sales: 123, revenue: 9840 },
      { _id: "4", name: "Exhaust Pipe", sales: 67, revenue: 13400 },
      { _id: "5", name: "LED Headlights", sales: 145, revenue: 8700 },
    ]);
  };

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: "bg-green-500",
      change: "+12.5%",
      positive: true,
      link: "/admin/orders",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: <ShoppingCart className="w-6 h-6" />,
      color: "bg-blue-500",
      change: "+8.2%",
      positive: true,
      link: "/admin/orders",
    },
    {
      title: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      icon: <Package className="w-6 h-6" />,
      color: "bg-purple-500",
      change: "+5.7%",
      positive: true,
      link: "/admin/products",
    },
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: <Users className="w-6 h-6" />,
      color: "bg-orange-500",
      change: "+3.4%",
      positive: true,
      link: "/admin/users",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: <Clock className="w-6 h-6" />,
      color: "bg-yellow-500",
      change: "-2.1%",
      positive: false,
      link: "/admin/orders?status=pending",
    },
    {
      title: "Low Stock",
      value: stats.lowStockProducts,
      icon: <AlertCircle className="w-6 h-6" />,
      color: "bg-red-500",
      change: "+4.3%",
      positive: false,
      link: "/admin/products?stock=low",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatOrderDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Dashboard Overview
          </h1>
          <p className="text-gray-600">
            Welcome back! Here's what's happening with your store.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <div className="text-white">{stat.icon}</div>
              </div>
              <div
                className={`flex items-center gap-1 text-sm ${
                  stat.positive ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.positive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-600 mt-1">{stat.title}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Orders</h2>
              <Link
                to="/admin/orders"
                className="text-blue-600 text-sm font-medium hover:text-blue-700"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3" />
                  <p>No recent orders</p>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium">{order.orderNumber}</p>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{order.customer?.name}</span>
                        <span>{formatOrderDate(order.createdAt)}</span>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="font-bold">
                        ${parseFloat(order.total).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Top Selling Products</h2>
              <Link
                to="/admin/products"
                className="text-blue-600 text-sm font-medium hover:text-blue-700"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {topProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3" />
                  <p>No products data</p>
                </div>
              ) : (
                topProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          {product.sales} units sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        ${product.revenue.toLocaleString()}
                      </p>
                      <p className="text-sm text-green-600">+15%</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/products/new"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-medium">Add Product</p>
              <p className="text-sm text-gray-500">
                Create new product listing
              </p>
            </div>
          </Link>
          <Link
            to="/admin/orders"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-medium">View Reports</p>
              <p className="text-sm text-gray-500">Sales and analytics</p>
            </div>
          </Link>
          <Link
            to="/admin/settings"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-medium">Store Settings</p>
              <p className="text-sm text-gray-500">Configure your store</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
