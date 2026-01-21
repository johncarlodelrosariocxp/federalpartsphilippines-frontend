// src/components/AdminRoute.js
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import authService from "../services/auth";

const AdminRoute = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const validateAdminAccess = () => {
      try {
        const token = authService.getToken();
        const user = authService.getUser();
        const isAdmin = authService.isAdmin();

        console.log("🔐 AdminRoute Validation:", {
          hasToken: !!token,
          user: user,
          userRole: user?.role,
          isAdmin: isAdmin,
        });

        // If no token, redirect to login
        if (!token) {
          console.log("❌ No token found, redirecting to login");
          setIsAuthorized(false);
          return;
        }

        // If token exists but no user data, try to parse from localStorage
        if (!user && token) {
          console.log(
            "⚠️ User data not found in auth service, checking localStorage"
          );
          const userStr = localStorage.getItem("federal_parts_user");
          if (userStr) {
            try {
              const parsedUser = JSON.parse(userStr);
              console.log("✅ Found user in localStorage:", parsedUser);
              // Update auth service
              authService.updateUser(parsedUser);
            } catch (e) {
              console.error("Error parsing user from localStorage:", e);
            }
          }
        }

        // Check if user is admin
        const finalUser = user || authService.getUser();
        const userIsAdmin = finalUser?.role === "admin";

        if (userIsAdmin) {
          console.log("✅ User is admin, granting access");
          setIsAuthorized(true);
        } else {
          console.log("❌ User is not admin, redirecting to login");
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("❌ Error validating admin access:", error);
        setIsAuthorized(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateAdminAccess();
  }, [location.pathname]);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking admin permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    console.log("🚫 AdminRoute: Not authorized, redirecting to login");
    console.log("📌 Current path:", location.pathname);

    // Store the intended destination
    sessionStorage.setItem("redirectAfterLogin", location.pathname);

    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default AdminRoute;
