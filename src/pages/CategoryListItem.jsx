import React, { useState } from "react";
import {
  FolderTree,
  Package,
  CheckCircle,
  Award,
  Truck,
  ArrowRight
} from "lucide-react";

// Helper function to get image URL
const getImageUrl = (imagePath) => {
  if (!imagePath || imagePath === "undefined" || imagePath === "null") {
    return "";
  }

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  if (imagePath.startsWith("blob:") || imagePath.startsWith("data:")) {
    return imagePath;
  }

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  let IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_URL;

  if (!IMAGE_BASE_URL) {
    IMAGE_BASE_URL = API_BASE_URL.replace("/api", "");
  }

  if (!IMAGE_BASE_URL) {
    IMAGE_BASE_URL = "http://localhost:5000";
  }

  if (imagePath.startsWith("/uploads/")) {
    return `${IMAGE_BASE_URL}${imagePath}`;
  }

  if (imagePath.startsWith("/")) {
    return `${IMAGE_BASE_URL}${imagePath}`;
  }

  const cleanFilename = imagePath.replace(/^.*[\\/]/, "");
  return `${IMAGE_BASE_URL}/uploads/categories/${cleanFilename}`;
};

const CategoryListItem = ({ category, onViewProducts, rootCategory }) => {
  const [imageError, setImageError] = useState(false);

  const imageUrl = getImageUrl(category.image || category.imageUrl);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:border-blue-500/30 transition-all duration-300">
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 rounded-lg blur group-hover:blur-xl transition duration-500"></div>
          <div className="relative w-24 h-24 rounded-lg bg-gray-900 border border-gray-700 overflow-hidden flex-shrink-0">
            {!imageError && imageUrl ? (
              <img
                className="w-full h-full object-cover"
                src={imageUrl}
                alt={category.name}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <FolderTree className="w-8 h-8 text-blue-400" />
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                {category.name}
              </h3>
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                {category.description || "No description available"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1 bg-gray-900 rounded-lg border border-gray-700">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-white">
                  {category.productCount || 0}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-900 text-sm text-gray-300 rounded-md border border-gray-700">
                <CheckCircle className="w-3 h-3 text-green-400" />
                Quality
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-900 text-sm text-gray-300 rounded-md border border-gray-700">
                <Truck className="w-3 h-3 text-blue-400" />
                Fast Delivery
              </span>
              {category.featured && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/20 text-sm text-amber-300 rounded-md border border-amber-500/30">
                  <Award className="w-3 h-3" />
                  Featured
                </span>
              )}
              
              {/* Show Root Category if available */}
              {rootCategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-900/30 text-sm text-purple-300 rounded-md border border-purple-700/50">
                  <FolderTree className="w-3 h-3" />
                  {rootCategory.name}
                </span>
              )}
            </div>
            <button
              onClick={() => onViewProducts(category._id)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors rounded-lg"
            >
              View Products
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryListItem;