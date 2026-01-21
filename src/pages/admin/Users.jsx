// src/pages/admin/Users.js
import React, { useState, useEffect } from "react";
import { authAPI } from "../../services/api";
import {
  Search,
  User,
  Mail,
  Calendar,
  Shield,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus,
} from "lucide-react";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await authAPI.getAllUsers();
      if (response.data?.success) {
        setUsers(response.data.users || []);
        setFilteredUsers(response.data.users || []);
      } else {
        setError("Failed to fetch users");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message || "Failed to load users");
      // Load mock data for demo
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockUsers = Array.from({ length: 25 }, (_, i) => ({
      _id: `user_${i + 1}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: i === 0 ? "admin" : i % 5 === 0 ? "admin" : "user",
      isActive: i % 10 !== 0,
      createdAt: new Date(
        Date.now() - Math.random() * 10000000000
      ).toISOString(),
      lastLogin:
        i % 3 === 0
          ? new Date(Date.now() - Math.random() * 86400000).toISOString()
          : null,
    }));
    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await authAPI.deleteUser(id);
        if (response.data?.success) {
          setUsers(users.filter((user) => user._id !== id));
          setSuccess("User deleted successfully!");
          setTimeout(() => setSuccess(""), 3000);
        }
      } catch (err) {
        console.error("Error deleting user:", err);
        setError("Failed to delete user. Please try again.");
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      const response = await authAPI.updateUser(id, {
        isActive: !currentActive,
      });
      if (response.data?.success) {
        setUsers(
          users.map((user) =>
            user._id === id ? { ...user, isActive: !currentActive } : user
          )
        );
        setSuccess(
          `User ${!currentActive ? "activated" : "deactivated"} successfully!`
        );
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      console.error("Error toggling user status:", err);
      setError("Failed to update user. Please try again.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleUpdateRole = async (id, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (window.confirm(`Change user role to ${newRole}?`)) {
      try {
        const response = await authAPI.updateUserRole(id, newRole);
        if (response.data?.success) {
          setUsers(
            users.map((user) =>
              user._id === id ? { ...user, role: newRole } : user
            )
          );
          setSuccess(`User role updated to ${newRole} successfully!`);
          setTimeout(() => setSuccess(""), 3000);
        }
      } catch (err) {
        console.error("Error updating user role:", err);
        setError("Failed to update user role. Please try again.");
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Users
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role Filter
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <User className="w-12 h-12 mb-3" />
                      <p className="text-lg font-medium">No users found</p>
                      <p className="text-sm">
                        Try adjusting your search filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          {user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)}
                        </span>
                        <button
                          onClick={() => handleUpdateRole(user._id, user.role)}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          Change
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          handleToggleActive(user._id, user.isActive)
                        }
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          user.isActive
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(user.lastLogin)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
