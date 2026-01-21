// src/pages/admin/BrandForm.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { brandAPI } from "../../services/api";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle,
  Factory,
  Upload,
  X,
  Image as ImageIcon,
  Camera,
  Trash2,
  Globe,
  Calendar,
  MapPin,
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

  // Otherwise, assume it's a filename in brands folder
  const cleanFilename = imagePath.replace(/^.*[\\/]/, "");
  return `${IMAGE_BASE_URL}/uploads/brands/${cleanFilename}`;
};

const BrandForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showImageRemoveConfirm, setShowImageRemoveConfirm] = useState(false);
  const [originalLogo, setOriginalLogo] = useState("");

  const [brand, setBrand] = useState({
    name: "",
    description: "",
    isActive: true,
    foundedYear: "",
    country: "",
    website: "",
    slogan: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  });

  useEffect(() => {
    if (isEditMode) {
      fetchBrand();
    }
  }, [id]);

  // Fetch specific brand (for edit mode)
  const fetchBrand = async () => {
    try {
      setLoading(true);
      const response = await brandAPI.getBrandById(id);

      let brandData = null;
      
      // Handle different response structures
      if (response?.success && response.data) {
        brandData = response.data;
      } else if (response?.brand) {
        brandData = response.brand;
      } else if (response && typeof response === 'object') {
        // If response is already the brand object
        brandData = response;
      }

      if (brandData) {
        setBrand({
          name: brandData.name || "",
          description: brandData.description || "",
          isActive: brandData.isActive !== undefined ? brandData.isActive : true,
          foundedYear: brandData.foundedYear || "",
          country: brandData.country || "",
          website: brandData.website || "",
          slogan: brandData.slogan || "",
          seoTitle: brandData.seoTitle || "",
          seoDescription: brandData.seoDescription || "",
          seoKeywords: brandData.seoKeywords || "",
        });

        // Set image preview if logo exists
        const logoPath = brandData.logo || brandData.image || "";
        if (logoPath) {
          setImagePreview(getImageUrl(logoPath));
          setOriginalLogo(logoPath);
        }
      } else {
        setError("Brand not found or invalid response format");
      }
    } catch (err) {
      console.error("Error fetching brand:", err);
      setError(`Failed to load brand: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBrand({
      ...brand,
      [name]: type === "checkbox" ? checked : value,
    });

    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: "",
      });
    }
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
      "image/svg+xml",
    ];

    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPEG, PNG, WebP, or SVG)");
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
    } catch (err) {
      console.error("Error processing image:", err);
      setError("Failed to process image");
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setShowImageRemoveConfirm(false);
  };

  const validateForm = () => {
    const errors = {};

    if (!brand.name.trim()) {
      errors.name = "Brand name is required";
    } else if (brand.name.trim().length > 100) {
      errors.name = "Brand name cannot exceed 100 characters";
    }

    if (brand.description.length > 500) {
      errors.description = "Description cannot exceed 500 characters";
    }

    if (brand.foundedYear && !/^\d{4}$/.test(brand.foundedYear)) {
      errors.foundedYear = "Please enter a valid year (YYYY)";
    }

    if (brand.website && brand.website.trim() !== "") {
      try {
        new URL(brand.website);
      } catch (e) {
        errors.website = "Please enter a valid website URL";
      }
    }

    if (brand.seoTitle.length > 60) {
      errors.seoTitle = "SEO title cannot exceed 60 characters";
    }

    if (brand.seoDescription.length > 160) {
      errors.seoDescription = "SEO description cannot exceed 160 characters";
    }

    if (brand.seoKeywords.length > 200) {
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
      const brandData = {
        name: brand.name.trim(),
        description: brand.description.trim(),
        isActive: brand.isActive,
        foundedYear: brand.foundedYear.trim(),
        country: brand.country.trim(),
        website: brand.website.trim(),
        slogan: brand.slogan.trim(),
        seoTitle: brand.seoTitle.trim(),
        seoDescription: brand.seoDescription.trim(),
        seoKeywords: brand.seoKeywords.trim(),
      };

      if (imageFile) {
        // Use FormData for file upload
        const formData = new FormData();

        // Append all brand data
        Object.keys(brandData).forEach((key) => {
          if (brandData[key] !== null && brandData[key] !== undefined) {
            formData.append(key, brandData[key]);
          }
        });

        // Append image
        formData.append("image", imageFile);

        if (isEditMode) {
          response = await brandAPI.updateBrand(id, formData);
        } else {
          response = await brandAPI.createBrand(formData);
        }
      } else {
        // For edit mode without new image
        if (isEditMode) {
          // If removing existing logo
          if (!imagePreview && originalLogo) {
            brandData.logo = ""; // Clear logo
          }
          response = await brandAPI.updateBrand(id, brandData);
        } else {
          response = await brandAPI.createBrand(brandData);
        }
      }

      console.log("API Response:", response);

      if (response?.success) {
        const successMessage = isEditMode
          ? "Brand updated successfully!"
          : "Brand created successfully!";

        setSuccess(successMessage);

        setTimeout(() => {
          navigate("/admin/brands", {
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
          setValidationErrors({ name: "Brand name is required" });
        } else if (
          errorMessage.toLowerCase().includes("unique") ||
          errorMessage.toLowerCase().includes("exists")
        ) {
          setValidationErrors({ name: "Brand name already exists" });
        } else {
          setError(errorMessage);
        }
      }
    } catch (err) {
      console.error("Error saving brand:", err);
      let errorMsg = "Failed to save brand. Please try again.";

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
        } else if (err.response.status === 400) {
          if (errorData?.errors) {
            const fieldErrors = {};
            errorData.errors.forEach(error => {
              fieldErrors[error.path] = error.msg;
            });
            setValidationErrors(fieldErrors);
            return;
          }
        }
      } else if (err.message) {
        errorMsg = err.message;
      }

      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading brand...</p>
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
            onClick={() => navigate("/admin/brands")}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Brands
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? "Edit Brand" : "Add New Brand"}
              </h1>
              <p className="text-gray-600">
                {isEditMode
                  ? "Update your motorcycle brand details"
                  : "Create a new motorcycle brand"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/admin/brands")}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="brandForm"
                disabled={saving || uploadingImage}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving || uploadingImage ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    {uploadingImage
                      ? "Uploading logo..."
                      : isEditMode
                      ? "Updating..."
                      : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEditMode ? "Update Brand" : "Create Brand"}
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

        <form id="brandForm" onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Upload Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <ImageIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Brand Logo
                </h2>
                <p className="text-sm text-gray-600">Upload the brand logo</p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Logo Preview Section */}
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
                          alt="Brand logo preview"
                          className="w-full h-full object-contain p-4"
                          onError={(e) => {
                            e.target.style.display = "none";
                            const fallback = document.createElement("div");
                            fallback.className =
                              "w-full h-full bg-blue-100 flex items-center justify-center";
                            fallback.innerHTML = `
                              <div class="text-center">
                                <Factory class="w-16 h-16 text-blue-600 mx-auto mb-2" />
                                <p class="text-sm text-blue-800">Logo failed to load</p>
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
                            Click to upload logo
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, WebP, SVG up to 5MB
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
                        Remove Logo
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

              {/* Logo Info Section */}
              <div className="lg:w-2/3 space-y-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-2">
                    Logo Requirements
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>
                        Recommended size: 400×400 pixels (1:1 aspect ratio)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Supported formats: JPEG, PNG, WebP, SVG</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Maximum file size: 5MB</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>
                        Logo will be displayed on brand pages and product
                        listings
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
                          Uploading Logo
                        </p>
                        <p className="text-sm text-yellow-700">
                          Please wait while we process your logo...
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
                            Logo Ready
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
                <Factory className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Brand Information
                </h2>
                <p className="text-sm text-gray-600">
                  Enter basic details about the brand
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Brand Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={brand.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    validationErrors.name
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="e.g., Honda, Yamaha, Kawasaki"
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
                      This will be displayed as the brand name
                    </p>
                  )}
                  <span className="text-xs text-gray-500">
                    {brand.name.length}/100
                  </span>
                </div>
              </div>

              {/* Slogan Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slogan
                </label>
                <input
                  type="text"
                  name="slogan"
                  value={brand.slogan}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors hover:border-gray-400"
                  placeholder="e.g., The Power of Dreams, Let the good times roll"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Brand tagline or slogan
                </p>
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={brand.description}
                  onChange={handleChange}
                  rows="4"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    validationErrors.description
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="Describe the brand history and specialties..."
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
                      Brief description about the brand
                    </p>
                  )}
                  <span className="text-xs text-gray-500">
                    {brand.description.length}/500
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Founded Year Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Founded Year
                    </div>
                  </label>
                  <input
                    type="text"
                    name="foundedYear"
                    value={brand.foundedYear}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      validationErrors.foundedYear
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="e.g., 1948"
                    maxLength={4}
                  />
                  {validationErrors.foundedYear && (
                    <p className="text-sm text-red-600 mt-2">
                      {validationErrors.foundedYear}
                    </p>
                  )}
                </div>

                {/* Country Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Country
                    </div>
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={brand.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors hover:border-gray-400"
                    placeholder="e.g., Japan, USA, Germany"
                  />
                </div>

                {/* Website Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Website
                    </div>
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={brand.website}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      validationErrors.website
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="https://www.example.com"
                  />
                  {validationErrors.website && (
                    <p className="text-sm text-red-600 mt-2">
                      {validationErrors.website}
                    </p>
                  )}
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
                      checked={brand.isActive}
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
                        {brand.isActive
                          ? "Visible to customers"
                          : "Hidden from store"}
                      </p>
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
                Optimize this brand for search engines
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
                  value={brand.seoTitle}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    validationErrors.seoTitle
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="Best [Brand Name] Motorcycles - Shop Online"
                  maxLength={60}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    Recommended: 50-60 characters
                  </p>
                  <span className="text-xs text-gray-500">
                    {brand.seoTitle.length}/60
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
                  value={brand.seoDescription}
                  onChange={handleChange}
                  rows="3"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    validationErrors.seoDescription
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="Shop the best collection of [Brand Name] motorcycles with free shipping and great deals..."
                  maxLength={160}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    Recommended: 150-160 characters
                  </p>
                  <span className="text-xs text-gray-500">
                    {brand.seoDescription.length}/160
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
                  value={brand.seoKeywords}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    validationErrors.seoKeywords
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="motorcycle brand, [brand name] bikes, motorcycle parts"
                  maxLength={200}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    Separate keywords with commas
                  </p>
                  <span className="text-xs text-gray-500">
                    {brand.seoKeywords.length}/200
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/admin/brands")}
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
                  {isEditMode ? "Update Brand" : "Create Brand"}
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
                  Remove Logo
                </h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to remove this logo?
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
                Remove Logo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandForm;