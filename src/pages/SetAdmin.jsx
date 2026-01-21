// src/pages/SetAdmin.js
import React from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/auth";

const SetAdmin = () => {
  const navigate = useNavigate();

  const setAdminCredentials = () => {
    const adminUser = {
      id: "admin_123",
      name: "Administrator",
      email: "admin@example.com",
      role: "admin",
    };

    // Set admin credentials
    authService.login("mock-jwt-token-for-admin-development", adminUser);

    alert("✅ Admin credentials set! You can now access /admin");

    // Redirect to admin dashboard
    navigate("/admin");
  };

  const setUserCredentials = () => {
    const regularUser = {
      id: "user_123",
      name: "Regular User",
      email: "user@example.com",
      role: "user",
    };

    authService.login("mock-jwt-token-for-user-development", regularUser);

    alert("✅ User credentials set!");
    navigate("/");
  };

  const clearCredentials = () => {
    authService.logout();
    alert("🗑️ All credentials cleared!");
  };

  const checkCurrentAuth = () => {
    const token = authService.getToken();
    const user = authService.getUser();
    const isAdmin = authService.isAdmin();

    alert(`Current Auth Status:\n
Token: ${token ? "✅ Present" : "❌ Missing"}\n
User: ${user ? JSON.stringify(user, null, 2) : "❌ None"}\n
Is Admin: ${isAdmin ? "✅ Yes" : "❌ No"}\n
Role: ${user?.role || "❌ Not set"}
    `);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Auth Testing Tool
        </h1>

        <div className="space-y-4">
          <button
            onClick={setAdminCredentials}
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center justify-center gap-2"
          >
            <span className="text-xl">👑</span>
            Set Admin Credentials
          </button>

          <button
            onClick={setUserCredentials}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
          >
            <span className="text-xl">👤</span>
            Set Regular User Credentials
          </button>

          <button
            onClick={checkCurrentAuth}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2"
          >
            <span className="text-xl">🔍</span>
            Check Current Auth Status
          </button>

          <button
            onClick={clearCredentials}
            className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center justify-center gap-2"
          >
            <span className="text-xl">🗑️</span>
            Clear All Credentials
          </button>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This is for development testing only. After
              setting admin credentials, you should be able to access
              <a href="/admin" className="text-blue-600 hover:underline ml-1">
                /admin
              </a>
            </p>
          </div>

          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">Quick Test:</h3>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Click "Set Admin Credentials"</li>
              <li>2. Click "Check Current Auth Status" to verify</li>
              <li>
                3. Go to{" "}
                <a href="/admin" className="text-blue-600 hover:underline">
                  /admin
                </a>
              </li>
              <li>4. You should see the admin dashboard</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetAdmin;
