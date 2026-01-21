// src/pages/Login.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LogIn,
  Mail,
  Lock,
  AlertCircle,
  Shield,
  UserCheck,
} from "lucide-react";
import authService from "../services/auth";
import { authAPI } from "../services/api";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/";

  // Auto-login as admin in development on component mount
  useEffect(() => {
    // Auto-login as admin in development mode
    if (process.env.NODE_ENV === "development") {
      console.log("🔧 Development mode detected");

      // Check if already logged in
      const isAuthenticated = authService.isAuthenticated();
      const isAdmin = authService.isAdmin();

      if (!isAuthenticated || !isAdmin) {
        console.log("🔄 Auto-logging in as admin for development");

        const mockAdminUser = {
          id: "admin_123",
          name: "Administrator",
          email: "admin@example.com",
          role: "admin",
          avatar:
            "https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff",
        };

        authService.login("dev-jwt-token-admin-123456", mockAdminUser);

        console.log("✅ Auto-logged in as admin");
        console.log("📤 Redirecting to:", from);

        // Small delay to ensure state is updated
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 100);
      } else {
        console.log("✅ Already logged in as admin, redirecting...");
        navigate(from, { replace: true });
      }
    }
  }, [from, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // For development/testing, use mock login
      if (process.env.NODE_ENV === "development") {
        console.log("🔧 Development mode: Using auto-login");

        // Auto-login as admin regardless of credentials in development
        const mockAdminUser = {
          id: "admin_123",
          name: "Administrator",
          email: formData.email || "admin@example.com",
          role: "admin",
          avatar:
            "https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff",
        };

        authService.login("dev-jwt-token-admin-123456", mockAdminUser);

        console.log("✅ Development login successful as admin");
        console.log("📤 Redirecting to:", from);

        navigate(from, { replace: true });
        return;
      }

      // Production code - real API call
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
      });

      if (response.data?.success) {
        const { token, user } = response.data;
        authService.login(token, user);
        navigate(from, { replace: true });
      } else {
        setError(response.data?.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  // Quick login for development - but auto-login should handle it
  const quickLogin = (role) => {
    if (role === "admin") {
      const mockAdminUser = {
        id: "admin_123",
        name: "Administrator",
        email: "admin@example.com",
        role: "admin",
        avatar:
          "https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff",
      };

      authService.login("dev-jwt-token-admin-123456", mockAdminUser);
      navigate(from, { replace: true });
    } else {
      const mockUser = {
        id: "user_123",
        name: "Regular User",
        email: "user@example.com",
        role: "user",
        avatar:
          "https://ui-avatars.com/api/?name=User&background=6b7280&color=fff",
      };

      authService.login("dev-jwt-token-user-123456", mockUser);
      navigate(from, { replace: true });
    }
  };

  const checkAuthStatus = () => {
    const isAuthenticated = authService.isAuthenticated();
    const isAdmin = authService.isAdmin();
    const user = authService.getUser();

    alert(`Auth Status:\n
Logged In: ${isAuthenticated ? "✅ Yes" : "❌ No"}\n
Is Admin: ${isAdmin ? "✅ Yes" : "❌ No"}\n
User Role: ${user?.role || "Not set"}\n
User Email: ${user?.email || "Not set"}
    `);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <LogIn className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        {/* Development Mode Notice */}
        {process.env.NODE_ENV === "development" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="h-5 w-5 text-blue-600" />
              <h3 className="text-sm font-medium text-blue-800">
                Development Mode
              </h3>
            </div>
            <p className="text-sm text-blue-700">
              You will be automatically logged in as an administrator. Try
              accessing{" "}
              <Link to="/admin" className="font-medium underline">
                /admin
              </Link>{" "}
              after login.
            </p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                "Sign in"
              )}
            </button>
          </div>

          {/* Development tools */}
          {process.env.NODE_ENV === "development" && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 text-center">
                Development Tools:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => quickLogin("admin")}
                  className="py-2 px-3 text-sm bg-purple-100 hover:bg-purple-200 rounded-md text-purple-700 flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Force Admin
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin("user")}
                  className="py-2 px-3 text-sm bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Force User
                </button>
              </div>
              <button
                type="button"
                onClick={checkAuthStatus}
                className="w-full py-2 px-3 text-sm bg-green-100 hover:bg-green-200 rounded-md text-green-700 flex items-center justify-center gap-2"
              >
                Check Auth Status
              </button>
              <div className="text-xs text-gray-500 text-center">
                In development, any login automatically grants admin access
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
