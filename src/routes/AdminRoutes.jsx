import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminRoute from "../components/AdminRoute";
import AdminLayout from "../components/admin/AdminLayout";
import AdminDashboard from "../pages/admin/Dashboard";
import AdminProducts from "../pages/admin/Products";
import ProductForm from "../pages/admin/ProductForm";
import AdminCategories from "../pages/admin/Categories";
import CategoryForm from "../pages/admin/CategoryForm";
import AdminOrders from "../pages/admin/Orders"; // This will now work
import AdminUsers from "../pages/admin/Users";
import AdminSettings from "../components/Settings";
// Import brand components
import Brands from "../pages/admin/Brands";
import BrandForm from "../pages/admin/BrandForm";

const AdminRoutes = () => {
  return (
    <AdminRoute>
      <AdminLayout>
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="categories/new" element={<CategoryForm />} />
          <Route path="categories/edit/:id" element={<CategoryForm />} />
          {/* Brand Routes */}
          <Route path="brands" element={<Brands />} />
          <Route path="brands/new" element={<BrandForm />} />
          <Route path="brands/edit/:id" element={<BrandForm />} />
          {/* End Brand Routes */}
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="*" element={<AdminDashboard />} />
        </Routes>
      </AdminLayout>
    </AdminRoute>
  );
};

export default AdminRoutes;