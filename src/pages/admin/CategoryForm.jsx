// src/pages/admin/CategoryForm.js - COMPLETE FIXED VERSION
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { categoryAPI } from "../../services/api";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle,
  FolderTree,
  ChevronDown,
  ChevronUp,
  Upload,
  X,
  Image as ImageIcon,
  Camera,
  Trash2,
} from "lucide-react";

// Helper function to get image URL
const getImageUrl = (imagePath) => {
  if (!imagePath || imagePath === "undefined" || imagePath === "null") {
    return "";
  }

  // If it's already a full URL
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // If it's a blob or data URL
  if (imagePath.startsWith("blob:") || imagePath.startsWith("data:")) {
    return imagePath;
  }

  // Get the server URL
  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  let IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_URL;

  if (!IMAGE_BASE_URL) {
    IMAGE_BASE_URL = API_BASE_URL.replace("/api", "");
  }

  if (!IMAGE_BASE_URL) {
    IMAGE_BASE_URL = "http://localhost:5000";
  }

  // If it's an absolute path starting with /uploads/
  if (imagePath.startsWith("/uploads/")) {
    return `${IMAGE_BASE_URL}${imagePath}`;
  }

  // If it starts with /
  if (imagePath.startsWith("/")) {
    return `${IMAGE_BASE_URL}${imagePath}`;
  }

  // Otherwise, assume it's a filename in categories folder
  const cleanFilename = imagePath.replace(/^.*[\\/]/, "");
  return `${IMAGE_BASE_URL}/uploads/categories/${cleanFilename}`;
};

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [allCategories, setAllCategories] = useState([]);
  const [showParentDropdown, setShowParentDropdown] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showImageRemoveConfirm, setShowImageRemoveConfirm] = useState(false);

  const [category, setCategory] = useState({
    name: "",
    description: "",
    isActive: true,
    parentCategory: null,
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    order: 0,
    image: "",
    imageUrl: "",
  });

  useEffect(() => {
    if (isEditMode) {
      fetchCategory();
    }
    fetchAllCategories();
  }, [id]);

  // Fetch specific category (for edit mode)
  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getCategory(id);

      let categoryData = null;
      if (response?.success && response.data) {
        categoryData = response.data;
      } else if (response?.category) {
        categoryData = response.category;
      } else if (response?.data && typeof response.data === "object") {
        categoryData = response.data;
      }

      if (categoryData) {
        setCategory({
          name: categoryData.name || "",
          description: categoryData.description || "",
          isActive:
            categoryData.isActive !== undefined ? categoryData.isActive : true,
          parentCategory: categoryData.parentCategory || null,
          seoTitle: categoryData.seoTitle || "",
          seoDescription: categoryData.seoDescription || "",
          seoKeywords: categoryData.seoKeywords || "",
          order: categoryData.order || 0,
          image: categoryData.image || "",
          imageUrl: categoryData.imageUrl || categoryData.image || "",
        });

        // Set image preview if image exists
        const imageUrl = categoryData.imageUrl || categoryData.image;
        if (imageUrl) {
          setImagePreview(getImageUrl(imageUrl));
        }
      } else {
        setError("Category not found or invalid response format");
      }
    } catch (err) {
      console.error("Error fetching category:", err);
      setError(`Failed to load category: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all categories
  const fetchAllCategories = async () => {
    try {
      const response = await categoryAPI.getAllCategories();

      let categories = [];
      if (response?.success && response.data) {
        categories = response.data;
      } else if (response?.success && response.categories) {
        categories = response.categories;
      } else if (Array.isArray(response)) {
        categories = response;
      } else if (response?.data && Array.isArray(response.data)) {
        categories = response.data;
      } else if (Array.isArray(response.categories)) {
        categories = response.categories;
      }

      setAllCategories(categories || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setAllCategories([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCategory({
      ...category,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseInt(value) || 0
          : value,
    });

    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: "",
      });
    }
    setError("");
  };

  const handleSelectParent = (parentId) => {
    setCategory({
      ...category,
      parentCategory: parentId === category.parentCategory ? null : parentId,
    });
    setShowParentDropdown(false);
    setError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];

    if (!validTypes.includes(file.type)) {
      setError(
        "Please upload a valid image file (JPEG, PNG, WebP, GIF, or SVG)"
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);
    setError("");

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);

      setImageFile(file);
      setCategory((prev) => ({
        ...prev,
        image: file.name,
      }));
    } catch (err) {
      console.error("Error processing image:", err);
      setError("Failed to process image");
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setImageFile(null);
    setCategory((prev) => ({
      ...prev,
      image: "",
      imageUrl: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setShowImageRemoveConfirm(false);
  };

  const validateForm = () => {
    const errors = {};

    if (!category.name.trim()) {
      errors.name = "Category name is required";
    } else if (category.name.trim().length > 100) {
      errors.name = "Category name cannot exceed 100 characters";
    }

    if (category.description.length > 500) {
      errors.description = "Description cannot exceed 500 characters";
    }

    if (category.seoTitle.length > 60) {
      errors.seoTitle = "SEO title cannot exceed 60 characters";
    }

    if (category.seoDescription.length > 160) {
      errors.seoDescription = "SEO description cannot exceed 160 characters";
    }

    if (category.seoKeywords.length > 200) {
      errors.seoKeywords = "SEO keywords cannot exceed 200 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setValidationErrors({});

    if (!validateForm()) {
      const firstError = Object.keys(validationErrors)[0];
      if (firstError) {
        const element = document.querySelector(`[name="${firstError}"]`);
        if (element) {
          element.focus();
        }
      }
      return;
    }

    setSaving(true);
    setSuccess("");

    try {
      let response;
      const categoryData = {
        name: category.name.trim(),
        description: category.description.trim(),
        isActive: category.isActive,
        order: category.order || 0,
        seoTitle: category.seoTitle.trim(),
        seoDescription: category.seoDescription.trim(),
        seoKeywords: category.seoKeywords.trim(),
      };

      if (category.parentCategory) {
        categoryData.parentCategory = category.parentCategory;
      }

      if (imageFile) {
        // Use FormData for file upload
        const formData = new FormData();

        // Append all category data
        Object.keys(categoryData).forEach((key) => {
          if (categoryData[key] !== null && categoryData[key] !== undefined) {
            formData.append(key, categoryData[key]);
          }
        });

        // Append image with correct field name
        formData.append("image", imageFile);

        if (isEditMode) {
          response = await categoryAPI.updateCategory(id, formData);
        } else {
          response = await categoryAPI.createCategory(formData);
        }
      } else {
        // Use regular JSON for non-image updates
        if (isEditMode && category.imageUrl && !imagePreview) {
          categoryData.image = category.imageUrl;
        }

        if (isEditMode) {
          response = await categoryAPI.updateCategory(id, categoryData);
        } else {
          response = await categoryAPI.createCategory(categoryData);
        }
      }

      console.log("API Response:", response);

      if (response?.success) {
        const successMessage = isEditMode
          ? "Category updated successfully!"
          : "Category created successfully!";

        setSuccess(successMessage);

        setTimeout(() => {
          navigate("/admin/categories", {
            state: {
              success: successMessage,
              timestamp: Date.now(),
            },
          });
        }, 1500);
      } else {
        const errorMessage =
          response?.message || response?.error || "Unknown error occurred";

        if (
          errorMessage.toLowerCase().includes("required") &&
          errorMessage.toLowerCase().includes("name")
        ) {
          setValidationErrors({ name: "Category name is required" });
        } else if (
          errorMessage.toLowerCase().includes("unique") ||
          errorMessage.toLowerCase().includes("exists")
        ) {
          setValidationErrors({ name: "Category name already exists" });
        } else {
          setError(errorMessage);
        }
      }
    } catch (err) {
      console.error("Error saving category:", err);
      let errorMsg = "Failed to save category. Please try again.";

      if (err.response) {
        const errorData = err.response.data;
        if (errorData?.message) {
          errorMsg = errorData.message;
        } else if (errorData?.error) {
          errorMsg = errorData.error;
        }

        if (err.response.status === 413) {
          errorMsg = "Image file is too large. Maximum size is 5MB.";
        } else if (err.response.status === 415) {
          errorMsg = "Unsupported file type. Please upload an image file.";
        }
      }

      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const flattenCategoriesForSelect = (categories, level = 0) => {
    if (!Array.isArray(categories)) return [];

    let flatList = [];

    categories.forEach((cat) => {
      if (cat._id !== id) {
        flatList.push({
          ...cat,
          level,
          disabled: false,
        });

        if (cat.children && cat.children.length > 0) {
          flatList = flatList.concat(
            flattenCategoriesForSelect(cat.children, level + 1)
          );
        }
      }
    });

    return flatList;
  };

  const getParentCategoryName = () => {
    if (!category.parentCategory) return "None (Root Category)";

    const findCategory = (categories, id) => {
      if (!Array.isArray(categories)) return null;

      for (const cat of categories) {
        if (cat._id === id) return cat.name;
        if (cat.children) {
          const found = findCategory(cat.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    return findCategory(allCategories, category.parentCategory) || "Unknown";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading category...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin/categories")}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Categories
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? "Edit Category" : "Add New Category"}
              </h1>
              <p className="text-gray-600">
                {isEditMode
                  ? "Update your product category details"
                  : "Create a new product category"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/admin/categories")}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="categoryForm"
                disabled={saving || uploadingImage}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving || uploadingImage ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    {uploadingImage
                      ? "Uploading image..."
                      : isEditMode
                      ? "Updating..."
                      : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEditMode ? "Update Category" : "Create Category"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Error</span>
              <button
                onClick={() => setError("")}
                className="ml-auto text-sm text-red-600 hover:text-red-800"
              >
                Dismiss
              </button>
            </div>
            <div className="mt-2 text-sm text-red-600">{error}</div>
            {Object.keys(validationErrors).length > 0 && (
              <ul className="mt-2 text-sm text-red-600 space-y-1">
                {Object.entries(validationErrors).map(
                  ([field, errorMsg]) =>
                    errorMsg && (
                      <li key={field} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
                        <span>{errorMsg}</span>
                      </li>
                    )
                )}
              </ul>
            )}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          </div>
        )}

        <form id="categoryForm" onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <ImageIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Category Image
                </h2>
                <p className="text-sm text-gray-600">
                  Upload a representative image for this category
                </p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Image Preview Section */}
              <div className="lg:w-1/3">
                <div className="space-y-4">
                  <div
                    className={`aspect-square rounded-xl border-2 ${
                      imagePreview
                        ? "border-gray-200"
                        : "border-dashed border-gray-300 hover:border-blue-400"
                    } overflow-hidden bg-gray-50 transition-all duration-300 cursor-pointer group`}
                    onClick={() =>
                      !uploadingImage && fileInputRef.current?.click()
                    }
                  >
                    {imagePreview ? (
                      <div className="relative w-full h-full">
                        <img
                          src={imagePreview}
                          alt="Category preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            const fallback = document.createElement("div");
                            fallback.className =
                              "w-full h-full bg-blue-100 flex items-center justify-center";
                            fallback.innerHTML = `
                              <div class="text-center">
                                <FolderTree class="w-16 h-16 text-blue-600 mx-auto mb-2" />
                                <p class="text-sm text-blue-800">Image failed to load</p>
                              </div>
                            `;
                            e.target.parentNode.appendChild(fallback);
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Camera className="w-10 h-10 text-white" />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowImageRemoveConfirm(true);
                          }}
                          className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                          <Upload className="w-8 h-8 text-blue-400" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">
                            Click to upload image
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, WebP up to 5MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {imagePreview && (
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setShowImageRemoveConfirm(true)}
                        className="text-sm text-red-600 hover:text-red-700 inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove Image
                      </button>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              {/* Image Info Section */}
              <div className="lg:w-2/3 space-y-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-2">
                    Image Requirements
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>
                        Recommended size: 600×600 pixels (1:1 aspect ratio)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Supported formats: JPEG, PNG, WebP, GIF, SVG</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Maximum file size: 5MB</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>
                        Image will be displayed on category cards and pages
                      </span>
                    </li>
                  </ul>
                </div>

                {uploadingImage && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-yellow-600"></div>
                      <div>
                        <p className="font-medium text-yellow-800">
                          Uploading Image
                        </p>
                        <p className="text-sm text-yellow-700">
                          Please wait while we process your image...
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {imageFile && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-green-800">
                            Image Ready
                          </p>
                          <p className="text-sm text-green-700">
                            {imageFile.name}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                        {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Basic Information Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FolderTree className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Category Information
                </h2>
                <p className="text-sm text-gray-600">
                  Enter basic details about the category
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Category Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={category.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    validationErrors.name
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="e.g., Electronics, Clothing, Home Decor"
                  required
                  maxLength={100}
                />
                <div className="flex justify-between items-center mt-2">
                  {validationErrors.name ? (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.name}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      This will be displayed as the category title
                    </p>
                  )}
                  <span className="text-xs text-gray-500">
                    {category.name.length}/100
                  </span>
                </div>
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={category.description}
                  onChange={handleChange}
                  rows="4"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    validationErrors.description
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="Describe what products this category contains..."
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-2">
                  {validationErrors.description ? (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.description}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Optional. Brief description for users
                    </p>
                  )}
                  <span className="text-xs text-gray-500">
                    {category.description.length}/500
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Parent Category Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Category
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowParentDropdown(!showParentDropdown)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left bg-white flex items-center justify-between hover:border-gray-400 transition-colors"
                    >
                      <span className="truncate text-gray-700">
                        {getParentCategoryName()}
                      </span>
                      {showParentDropdown ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>

                    {showParentDropdown && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowParentDropdown(false)}
                        />
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                          <div className="p-2 space-y-1">
                            <button
                              type="button"
                              onClick={() => handleSelectParent(null)}
                              className={`w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                                !category.parentCategory
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "text-gray-700"
                              }`}
                            >
                              <div className="font-medium">
                                None (Root Category)
                              </div>
                              <div className="text-xs text-gray-500">
                                Create as top-level category
                              </div>
                            </button>
                            {flattenCategoriesForSelect(allCategories).map(
                              (cat) => (
                                <button
                                  key={cat._id}
                                  type="button"
                                  onClick={() => handleSelectParent(cat._id)}
                                  disabled={cat.disabled}
                                  className={`w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                                    category.parentCategory === cat._id
                                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                                      : "text-gray-700"
                                  } ${
                                    cat.disabled
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                  style={{
                                    paddingLeft: `${cat.level * 24 + 16}px`,
                                  }}
                                >
                                  <div className="font-medium">{cat.name}</div>
                                  {cat.description && (
                                    <div className="text-xs text-gray-500 truncate">
                                      {cat.description}
                                    </div>
                                  )}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Select a parent category to create a sub-category
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Order Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      name="order"
                      value={category.order}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors hover:border-gray-400"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Lower numbers appear first
                    </p>
                  </div>

                  {/* Status Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={category.isActive}
                        onChange={handleChange}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div>
                        <label
                          htmlFor="isActive"
                          className="block text-sm font-medium text-gray-900"
                        >
                          Active
                        </label>
                        <p className="text-xs text-gray-500">
                          {category.isActive
                            ? "Visible to customers"
                            : "Hidden from store"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SEO Information Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                SEO Settings
              </h2>
              <p className="text-sm text-gray-600">
                Optimize this category for search engines
              </p>
            </div>

            <div className="space-y-6">
              {/* SEO Title Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Title
                </label>
                <input
                  type="text"
                  name="seoTitle"
                  value={category.seoTitle}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    validationErrors.seoTitle
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="Best [Category Name] - Shop Online"
                  maxLength={60}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    Recommended: 50-60 characters
                  </p>
                  <span className="text-xs text-gray-500">
                    {category.seoTitle.length}/60
                  </span>
                </div>
              </div>

              {/* SEO Description Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Description
                </label>
                <textarea
                  name="seoDescription"
                  value={category.seoDescription}
                  onChange={handleChange}
                  rows="3"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    validationErrors.seoDescription
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="Shop the best collection of [Category Name] with free shipping and great deals..."
                  maxLength={160}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    Recommended: 150-160 characters
                  </p>
                  <span className="text-xs text-gray-500">
                    {category.seoDescription.length}/160
                  </span>
                </div>
              </div>

              {/* SEO Keywords Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Keywords
                </label>
                <input
                  type="text"
                  name="seoKeywords"
                  value={category.seoKeywords}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    validationErrors.seoKeywords
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="keyword1, keyword2, keyword3"
                  maxLength={200}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    Separate keywords with commas
                  </p>
                  <span className="text-xs text-gray-500">
                    {category.seoKeywords.length}/200
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/admin/categories")}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[140px]"
            >
              {saving || uploadingImage ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  {uploadingImage
                    ? "Uploading..."
                    : isEditMode
                    ? "Updating..."
                    : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEditMode ? "Update Category" : "Create Category"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Remove Image Confirmation Modal */}
      {showImageRemoveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Remove Image
                </h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to remove this image?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowImageRemoveConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
              >
                Remove Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryForm;
