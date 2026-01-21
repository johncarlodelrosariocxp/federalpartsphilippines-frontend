// src/pages/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import authService from "../services/auth";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  AlertCircle,
  CheckCircle,
  Key,
  Info,
} from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    adminCode: "", // Changed from adminSecret to adminCode for clarity
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isAdminRegistration, setIsAdminRegistration] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const validateForm = () => {
    // Name validation
    if (!formData.name.trim()) {
      setError("Full name is required");
      return false;
    }

    // Email validation
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Password validation
    if (!formData.password) {
      setError("Password is required");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    // Admin code validation
    if (isAdminRegistration) {
      if (!formData.adminCode) {
        setError("Admin code is required");
        return false;
      }

      // Simple validation - at least 4 characters
      if (formData.adminCode.length < 4) {
        setError("Admin code must be at least 4 characters");
        return false;
      }
    }

    // Terms acceptance
    if (!acceptTerms) {
      setError("You must accept the terms and conditions");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone || "",
        role: isAdminRegistration ? "admin" : "customer",
        adminCode: isAdminRegistration ? formData.adminCode : undefined,
      };

      const response = await authAPI.register(userData);
      const { token, user } = response.data;

      const successMessage = isAdminRegistration
        ? `Admin account created successfully! Welcome ${user.name}`
        : `Account created successfully! Welcome ${user.name}`;

      setSuccess(successMessage);

      // Auto-login after successful registration
      setTimeout(() => {
        authService.login(token, user);

        if (user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/shop");
        }
      }, 1500);
    } catch (err) {
      let errorMessage = "Registration failed. Please try again.";

      if (err.response?.status === 400) {
        if (err.response.data.message?.includes("email")) {
          errorMessage =
            "Email already registered. Please use a different email.";
        } else if (err.response.data.message?.includes("admin")) {
          errorMessage =
            "Invalid admin code. Please check the code and try again.";
        } else {
          errorMessage = err.response.data.message || errorMessage;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminRegistration = () => {
    setIsAdminRegistration(!isAdminRegistration);
    // Clear form when toggling
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      adminCode: "",
    });
    setError("");
    setSuccess("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Logo/Header */}
          <div className="text-center mb-10">
            <Link to="/" className="inline-block">
              <h1 className="font-bebas text-5xl text-gray-900 mb-2">
                FEDERAL PARTS
              </h1>
            </Link>
            <p className="text-gray-600">
              Join our community of motorcycle enthusiasts
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8">
              {/* Header */}
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Create {isAdminRegistration ? "Admin" : ""} Account
                </h2>
                <p className="text-gray-600">
                  {isAdminRegistration
                    ? "Register as an administrator"
                    : "Sign up as a customer"}
                </p>
              </div>

              {/* Registration Type Toggle */}
              <div className="mb-6">
                <div className="flex items-center justify-center space-x-4">
                  <span className="text-sm text-gray-600">Register as:</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (isAdminRegistration) toggleAdminRegistration();
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      !isAdminRegistration
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isAdminRegistration) toggleAdminRegistration();
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isAdminRegistration
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              {/* Success Message */}
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <p className="text-green-700">{success}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {/* Admin Info Box */}
              {isAdminRegistration && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-1">
                        About Admin Registration
                      </h4>
                      <p className="text-sm text-yellow-700 mb-2">
                        You need an <strong>admin code</strong> to register as
                        an administrator. This code is provided by the system
                        owner.
                      </p>
                      <p className="text-xs text-yellow-600">
                        ✨ Admin accounts have access to the admin dashboard
                        where you can manage products, orders, and customer
                        information.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="you@example.com"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Phone Field (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number{" "}
                    {isAdminRegistration ? "(Recommended)" : "(Optional)"}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1234567890"
                      disabled={loading}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    For important notifications and support
                  </p>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    At least 6 characters
                  </p>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Re-enter password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* ADMIN CODE FIELD - Only shows for admin registration */}
                {isAdminRegistration && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Admin Code *
                      </label>
                      <span className="text-xs text-gray-500">
                        Required for admin
                      </span>
                    </div>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showAdminCode ? "text" : "password"}
                        name="adminCode"
                        value={formData.adminCode}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter admin code (e.g., ADM2024)"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminCode(!showAdminCode)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showAdminCode ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      🔐 This is a special code given by the system owner to
                      create admin accounts
                    </p>
                  </div>
                )}

                {/* Terms and Conditions */}
                <div className="flex items-start pt-2">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={loading}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="acceptTerms" className="text-gray-700">
                      I agree to the{" "}
                      <Link
                        to="/terms"
                        className="text-blue-500 hover:text-blue-600 hover:underline"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/privacy"
                        className="text-blue-500 hover:text-blue-600 hover:underline"
                      >
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      Creating Account...
                    </div>
                  ) : isAdminRegistration ? (
                    "Create Admin Account"
                  ) : (
                    "Create Customer Account"
                  )}
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-blue-500 hover:text-blue-600 hover:underline font-medium"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>

              {/* Simple Explanation for Admin Code */}
              {isAdminRegistration && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">
                    🤔 What is an Admin Code?
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• A special password to create admin accounts</li>
                    <li>• Only the system owner knows this code</li>
                    <li>
                      • Prevents anyone from creating admin accounts randomly
                    </li>
                    <li>• Contact the system owner to get the code</li>
                    <li>
                      • If you don't have it, register as a Customer instead
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
