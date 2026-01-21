// src/pages/MotorcycleDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Bike, 
  Package, 
  Settings, 
  Filter, 
  Grid3x3,
  List,
  ChevronRight,
  Star,
  Shield,
  CheckCircle,
  Fuel,
  Users,
  Gauge,
  Zap,
  Wind,
  Calendar,
  MapPin,
  ShoppingCart
} from "lucide-react";
import { categoryAPI, productAPI } from "../services/api";
import { toast } from "react-hot-toast";

const MotorcycleDetail = () => {
  const { motorcycleSlug } = useParams();
  const navigate = useNavigate();
  
  const [motorcycle, setMotorcycle] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchMotorcycleData();
  }, [motorcycleSlug]);

  const fetchMotorcycleData = async () => {
    try {
      setLoading(true);
      
      // Fetch motorcycle details
      const response = await categoryAPI.getCategoryById(motorcycleSlug);
      if (response?.success) {
        setMotorcycle(response.data);
        
        // Fetch products for this motorcycle
        const productsResponse = await categoryAPI.getCategoryProducts(response.data._id);
        if (productsResponse?.success) {
          setProducts(productsResponse.data || []);
        }
      } else {
        throw new Error("Motorcycle not found");
      }
    } catch (error) {
      console.error("Error fetching motorcycle data:", error);
      toast.error("Failed to load motorcycle information");
      navigate("/brands");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const baseUrl = API_BASE_URL.replace("/api", "");
    return `${baseUrl}${imagePath}`;
  };

  const formatSpecValue = (value) => {
    if (!value) return "N/A";
    if (typeof value === "number") {
      if (value % 1 === 0) return value.toString();
      return value.toFixed(1);
    }
    return value;
  };

  const getProductCategories = () => {
    const categories = new Set(["all"]);
    products.forEach(product => {
      if (product.category?.name) {
        categories.add(product.category.name);
      }
    });
    return Array.from(categories);
  };

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(product => product.category?.name === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!motorcycle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Motorcycle not found</h2>
          <Link to="/brands" className="text-blue-600 hover:text-blue-700">
            Back to Brands
          </Link>
        </div>
      </div>
    );
  }

  const specs = motorcycle.motorcycleSpecs || {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Motorcycle Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-amber-500 to-red-600 rounded-full translate-y-48 -translate-x-48"></div>
        </div>
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Motorcycle Image */}
            <div className="lg:w-2/5">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8">
                {motorcycle.image ? (
                  <img
                    src={getImageUrl(motorcycle.image)}
                    alt={motorcycle.name}
                    className="w-full h-auto object-contain"
                  />
                ) : (
                  <div className="w-full aspect-square flex items-center justify-center">
                    <div className="text-center">
                      <Bike className="w-32 h-32 text-gray-600 mx-auto mb-6" />
                      <span className="text-2xl font-bold text-gray-300">{motorcycle.name}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Motorcycle Info */}
            <div className="lg:w-3/5">
              <div className="flex items-center gap-2 mb-4">
                <Link 
                  to={`/brands/${motorcycle.parentCategory?.slug}`}
                  className="flex items-center gap-1 text-blue-300 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to {motorcycle.parentCategory?.name}</span>
                </Link>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{motorcycle.name}</h1>
              
              {motorcycle.description && (
                <p className="text-xl text-gray-300 mb-8 max-w-3xl">
                  {motorcycle.description}
                </p>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white mb-1">
                    {formatSpecValue(specs.engineCC)}
                  </div>
                  <div className="text-sm text-gray-300">Engine CC</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white mb-1">
                    {formatSpecValue(specs.mileage)}
                  </div>
                  <div className="text-sm text-gray-300">Mileage (kmpl)</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white mb-1">
                    {products.length}
                  </div>
                  <div className="text-sm text-gray-300">Available Parts</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-white mb-1 capitalize">
                    {specs.transmission}
                  </div>
                  <div className="text-sm text-gray-300">Transmission</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                  Shop All Parts
                </button>
                <button className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-medium hover:bg-white/30 transition-colors">
                  <Star className="w-5 h-5" />
                  Save Motorcycle
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Specifications */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Specifications</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Engine */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Engine</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium">{specs.engineType || "N/A"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Capacity</span>
                  <span className="font-medium">{formatSpecValue(specs.engineCC)} cc</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Max Power</span>
                  <span className="font-medium">{specs.maxPower || "N/A"}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Max Torque</span>
                  <span className="font-medium">{specs.maxTorque || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Gauge className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Performance</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Fuel Type</span>
                  <span className="font-medium capitalize">{specs.fuelType || "N/A"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Mileage</span>
                  <span className="font-medium">{formatSpecValue(specs.mileage)} kmpl</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Transmission</span>
                  <span className="font-medium capitalize">{specs.transmission || "N/A"}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Top Speed</span>
                  <span className="font-medium">-</span>
                </div>
              </div>
            </div>

            {/* Dimensions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Wind className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Dimensions & Capacity</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Seating Capacity</span>
                  <span className="font-medium">{formatSpecValue(specs.seatingCapacity)} persons</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Fuel Tank</span>
                  <span className="font-medium">-</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Weight</span>
                  <span className="font-medium">-</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Ground Clearance</span>
                  <span className="font-medium">-</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Available Parts & Accessories
              </h2>
              <p className="text-gray-600">
                {products.length} products compatible with {motorcycle.name}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {getProductCategories().map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category === "all" ? "All Categories" : category}
                  </button>
                ))}
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
              
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-500"
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-500"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 mb-6">
                {selectedCategory === "all" 
                  ? "No products available for this motorcycle yet."
                  : `No products found in "${selectedCategory}" category.`
                }
              </p>
              <button
                onClick={() => setSelectedCategory("all")}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
              >
                View All Categories
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Link
                  key={product._id}
                  to={`/products/${product.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 overflow-hidden">
                    {/* Product Image */}
                    <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100">
                      {product.thumbnail ? (
                        <img
                          src={getImageUrl(product.thumbnail)}
                          alt={product.name}
                          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Stock Status */}
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.stockQuantity > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {product.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-6">
                      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      
                      {product.specifications?.partNumber && (
                        <div className="text-sm text-gray-500 mb-3">
                          Part #: {product.specifications.partNumber}
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-500 fill-current" />
                          <span className="text-sm font-medium">
                            {product.ratings?.average || 0}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({product.ratings?.count || 0})
                          </span>
                        </div>
                        
                        {product.salesCount > 0 && (
                          <span className="text-sm text-gray-500">
                            {product.salesCount} sold
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          {product.discountedPrice ? (
                            <>
                              <span className="text-lg font-bold text-gray-900">
                                ${product.discountedPrice.toFixed(2)}
                              </span>
                              <span className="text-sm text-gray-500 line-through ml-2">
                                ${product.price.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-bold text-gray-900">
                              ${product.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        
                        <ChevronRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            // List View
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <Link
                  key={product._id}
                  to={`/products/${product.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-300 p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      {/* Image */}
                      <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                        {product.thumbnail ? (
                          <img
                            src={getImageUrl(product.thumbnail)}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                              {product.name}
                            </h3>
                            
                            {product.shortDescription && (
                              <p className="text-gray-600 line-clamp-2">
                                {product.shortDescription}
                              </p>
                            )}
                            
                            {product.specifications?.partNumber && (
                              <div className="text-sm text-gray-500 mt-2">
                                Part Number: {product.specifications.partNumber}
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right">
                            {product.discountedPrice ? (
                              <>
                                <div className="text-2xl font-bold text-gray-900">
                                  ${product.discountedPrice.toFixed(2)}
                                </div>
                                <div className="text-sm text-gray-500 line-through">
                                  ${product.price.toFixed(2)}
                                </div>
                              </>
                            ) : (
                              <div className="text-2xl font-bold text-gray-900">
                                ${product.price.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-amber-500 fill-current" />
                              <span className="font-medium">
                                {product.ratings?.average || 0}
                              </span>
                              <span className="text-gray-500">
                                ({product.ratings?.count || 0} reviews)
                              </span>
                            </div>
                            
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              product.stockQuantity > 0
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                              {product.stockQuantity > 0 
                                ? `${product.stockQuantity} in stock`
                                : "Out of stock"
                              }
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-blue-600">
                            <span className="font-medium">View Details</span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Compatibility Note */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Guaranteed Compatibility
              </h3>
              <p className="text-gray-700">
                All parts and accessories listed are specifically tested and verified for compatibility with the {motorcycle.name}. 
                Each product includes detailed installation instructions and compatibility information. 
                Need help finding the right part? Contact our support team for personalized assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotorcycleDetail;