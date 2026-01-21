// src/App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Categories from "./pages/Categories";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SetAdmin from "./pages/SetAdmin";
import HelpFindingParts from "./pages/HelpFindingParts";
import AdminRoutes from "./routes/AdminRoutes";
import authService from "./services/auth";

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = () => {
      setIsAdmin(authService.isAdmin());
    };

    checkAdminStatus();
    window.addEventListener("authChange", checkAdminStatus);

    return () => {
      window.removeEventListener("authChange", checkAdminStatus);
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header isAdmin={isAdmin} />
        <main className="flex-grow">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/set-admin" element={<SetAdmin />} />
            <Route path="/help-finding-parts" element={<HelpFindingParts />} />

            {/* Admin routes - using AdminRoutes component ONLY */}
            <Route path="/admin/*" element={<AdminRoutes />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
