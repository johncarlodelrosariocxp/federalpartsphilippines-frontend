// src/services/auth.js
class AuthService {
  constructor() {
    this.tokenKey = import.meta.env.VITE_TOKEN_KEY || "federal_parts_token";
    this.userKey = import.meta.env.VITE_USER_KEY || "federal_parts_user";
    this.roleKey = import.meta.env.VITE_ROLE_KEY || "federal_parts_role";
  }

  login(token, userData) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(userData));
    localStorage.setItem(this.roleKey, userData.role || "user");

    // Trigger auth change event
    window.dispatchEvent(new Event("authChange"));
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.roleKey);

    // Clear any guest cart data
    localStorage.removeItem("guestCart");

    // Trigger auth change event
    window.dispatchEvent(new Event("authChange"));
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  getUser() {
    const user = localStorage.getItem(this.userKey);
    try {
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }

  getRole() {
    return localStorage.getItem(this.roleKey);
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  isAdmin() {
    return this.getRole() === "admin";
  }

  // Get auth headers for manual requests
  getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Update user data
  updateUser(userData) {
    const currentUser = this.getUser();
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem(this.userKey, JSON.stringify(updatedUser));

    if (userData.role) {
      localStorage.setItem(this.roleKey, userData.role);
    }

    window.dispatchEvent(new Event("authChange"));
  }
}

export default new AuthService();
