import React, { useState } from "react";

const CategoryCard = ({ category }) => {
  const [imgError, setImgError] = useState(false);

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

  const imageUrl = getImageUrl(category.image || category.imageUrl);

  const getFallbackImage = () => {
    const name = (category.name || "").toLowerCase();
    if (name.includes("engine"))
      return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=160&fit=crop";
    if (name.includes("brake"))
      return "https://images.unsplash.com/photo-1558981806-ec527fa0b4c9?w=400&h=160&fit=crop";
    if (name.includes("tire") || name.includes("wheel"))
      return "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=400&h=160&fit=crop";
    if (
      name.includes("electrical") ||
      name.includes("battery") ||
      name.includes("light")
    )
      return "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=160&fit=crop";
    if (name.includes("accessory") || name.includes("tool"))
      return "https://images.unsplash.com/photo-1580261450035-4d4f04b7b4c5?w=400&h=160&fit=crop";

    return "https://images.unsplash.com/photo-1566473359723-7e3e4d6c8c1b?w=400&h=160&fit=crop";
  };

  const handleError = () => {
    setImgError(true);
  };

  const finalImageUrl = imgError ? getFallbackImage() : imageUrl;

  return finalImageUrl ? (
    <img
      src={finalImageUrl}
      alt={category.name || "Category"}
      className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-500"
      onError={handleError}
      loading="lazy"
    />
  ) : (
    <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
      <span className="text-gray-400 text-sm">No Image</span>
    </div>
  );
};

export default CategoryCard;