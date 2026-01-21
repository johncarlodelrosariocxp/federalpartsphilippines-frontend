import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  Shield,
  Truck,
  CreditCard,
  Tag,
  LogIn,
} from "lucide-react";
import { cartAPI } from "../services/api";
import authService from "../services/auth";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [cartData, setCartData] = useState({
    items: [],
    totalPrice: 0,
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchCart();
  }, []);

  const checkAuth = () => {
    const authStatus = authService.isAuthenticated();
    setIsAuthenticated(authStatus);
    return authStatus;
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      if (!checkAuth()) {
        // Load guest cart from localStorage
        const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
        setCartItems(guestCart);
        calculateGuestTotal(guestCart);
        return;
      }

      const response = await cartAPI.getCart();
      setCartData(response.data.cart);
      setCartItems(response.data.cart?.items || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
      // Load guest cart as fallback
      const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      setCartItems(guestCart);
      calculateGuestTotal(guestCart);
    } finally {
      setLoading(false);
    }
  };

  const calculateGuestTotal = (items) => {
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setCartData({
      items: items,
      totalPrice: total,
    });
  };

  const updateGuestCart = (items) => {
    localStorage.setItem("guestCart", JSON.stringify(items));
    calculateGuestTotal(items);
  };

  const updateQuantity = async (itemId, change) => {
    try {
      if (!checkAuth()) {
        // Handle guest cart update
        const updatedItems = cartItems.map((item) => {
          if (item._id === itemId) {
            const newQuantity = Math.max(1, item.quantity + change);
            return { ...item, quantity: newQuantity };
          }
          return item;
        });
        setCartItems(updatedItems);
        updateGuestCart(updatedItems);
        return;
      }

      const item = cartItems.find((item) => item._id === itemId);
      const newQuantity = Math.max(1, item.quantity + change);
      await cartAPI.updateCartItem(itemId, newQuantity);
      await fetchCart(); // Refresh cart
    } catch (error) {
      console.error("Error updating quantity:", error);
      if (error.response?.status === 401) {
        setIsAuthenticated(false);
        alert("Please login to update cart");
        navigate("/login");
      }
    }
  };

  const removeItem = async (itemId) => {
    try {
      if (!checkAuth()) {
        // Handle guest cart removal
        const updatedItems = cartItems.filter((item) => item._id !== itemId);
        setCartItems(updatedItems);
        updateGuestCart(updatedItems);
        return;
      }

      await cartAPI.removeFromCart(itemId);
      await fetchCart(); // Refresh cart
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const clearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      try {
        if (checkAuth()) {
          await cartAPI.clearCart();
        } else {
          localStorage.removeItem("guestCart");
        }
        setCartItems([]);
        setCartData({ items: [], totalPrice: 0 });
      } catch (error) {
        console.error("Error clearing cart:", error);
      }
    }
  };

  const handleLoginRedirect = () => {
    // Save guest cart before redirecting
    localStorage.setItem("pendingGuestCart", JSON.stringify(cartItems));
    localStorage.removeItem("guestCart");
    navigate("/login");
  };

  const applyPromoCode = () => {
    if (promoCode === "SAVE10") {
      alert("Promo code applied! You saved 10%.");
    } else {
      alert("Invalid promo code");
    }
    setPromoCode("");
  };

  const subtotal =
    cartData.totalPrice ||
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (loading) {
    return (
      <div className="section-padding bg-gray-50 min-h-screen">
        <div className="container-custom">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding bg-gray-50 min-h-screen">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="font-bebas text-5xl mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            Review your items and proceed to checkout
          </p>
        </div>

        {!isAuthenticated && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <LogIn className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  You're shopping as a guest.{" "}
                  <button
                    onClick={handleLoginRedirect}
                    className="font-medium text-yellow-700 underline hover:text-yellow-600"
                  >
                    Sign in
                  </button>{" "}
                  to save your cart and checkout faster.
                </p>
              </div>
            </div>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Add some motorcycle parts to get started!
            </p>
            <Link
              to="/shop"
              className="btn-primary inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">
                    Your Items ({cartItems.length})
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Clear Cart
                  </button>
                </div>

                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex gap-6 pb-6 border-b last:border-0 last:pb-0"
                    >
                      <img
                        src={item.product?.images?.[0] || item.product?.image}
                        alt={item.product?.name}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <Link to={`/product/${item.product?._id}`}>
                              <h3 className="font-bold text-lg mb-1 hover:text-blue-500">
                                {item.product?.name}
                              </h3>
                            </Link>
                            <p className="text-gray-600 mb-2">
                              {item.product?.description}
                            </p>
                            <p className="font-bold text-xl text-blue-600">
                              ${item.price.toFixed(2)}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item._id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateQuantity(item._id, -1)}
                              className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item._id, 1)}
                              className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="font-bold text-lg">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t">
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-700"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white rounded-xl p-4 text-center">
                  <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold">1-Year Warranty</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center">
                  <Truck className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold">
                    Free Shipping Over $100
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center">
                  <CreditCard className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold">Secure Payment</p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <h2 className="font-bebas text-3xl mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-green-600" : ""}>
                      {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {!isAuthenticated ? (
                  <button
                    onClick={handleLoginRedirect}
                    className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 mb-4 flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-5 h-5" />
                    Sign in to Checkout
                  </button>
                ) : (
                  <button className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 mb-4">
                    Proceed to Checkout
                  </button>
                )}

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">or</p>
                  <Link
                    to="/shop"
                    className="w-full border border-blue-500 text-blue-500 py-3 rounded-lg font-semibold hover:bg-blue-50 flex items-center justify-center gap-2"
                  >
                    Continue Shopping
                  </Link>
                </div>

                {/* Promo Code */}
                <div className="mt-6 pt-6 border-t">
                  <label className="block text-sm font-medium mb-2">
                    Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={applyPromoCode}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Tag className="w-4 h-4" />
                      Apply
                    </button>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm font-medium mb-3">We Accept</p>
                  <div className="flex gap-3">
                    <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs font-bold">VISA</span>
                    </div>
                    <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs font-bold">MC</span>
                    </div>
                    <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs font-bold">AMEX</span>
                    </div>
                    <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs font-bold">PP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
