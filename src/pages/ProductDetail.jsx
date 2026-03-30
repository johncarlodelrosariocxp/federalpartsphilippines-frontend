import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Home,
  Loader2,
  X,
  ZoomIn,
  ZoomOut,
  CheckCircle,
  ArrowLeft,
  ShieldCheck,
  Headphones,
  FileText,
  Award,
  Truck,
  RotateCcw,
  ChevronUp
} from "lucide-react";

// Static product data based on the images you provided
const staticProducts = {
  "back-plate": {
    id: "back-plate",
    name: "Back Plate",
    description: "High-quality back plate for motorcycle transmission system. Made from premium materials for durability and performance.",
    longDescription: `
      <h3>Product Overview</h3>
      <p>The Federal Parts Back Plate is engineered to exact OEM specifications, ensuring perfect fitment and optimal performance. Manufactured using high-grade materials, this back plate provides exceptional strength and durability for your motorcycle's transmission system.</p>
      
      <h3>Key Benefits</h3>
      <ul>
        <li>Precision engineered for perfect fitment</li>
        <li>Manufactured from high-strength materials</li>
        <li>Enhanced durability for long-lasting performance</li>
        <li>Tested under extreme conditions</li>
        <li>OEM quality standards</li>
      </ul>
      
      <h3>Technical Specifications</h3>
      <ul>
        <li>Material: High-grade steel alloy</li>
        <li>Surface Treatment: Anti-corrosion coating</li>
        <li>Compatibility: Universal fit for most motorcycles</li>
        <li>Heat Resistance: Up to 300°C</li>
      </ul>
      
      <h3>Installation</h3>
      <p>Professional installation recommended. Please refer to your motorcycle's service manual for proper installation procedures.</p>
    `,
    brand: "Federal Parts",
    category: { id: "transmission", name: "Transmission Parts" },
    images: ["/images/BACK PLATE.jpg"],
    features: [
      "Precision engineered for perfect fitment",
      "High-strength steel construction",
      "Anti-corrosion surface treatment",
      "Heat resistant up to 300°C",
      "OEM quality standards"
    ]
  },
  "bearing": {
    id: "bearing",
    name: "Bearing",
    description: "Premium quality bearing for smooth rotation and reduced friction. Ensures optimal performance and longevity.",
    longDescription: `
      <h3>Product Overview</h3>
      <p>Federal Parts premium bearings are manufactured to the highest standards, providing smooth operation and extended service life. Each bearing undergoes rigorous quality control to ensure consistent performance.</p>
      
      <h3>Key Benefits</h3>
      <ul>
        <li>Superior smoothness and reduced friction</li>
        <li>High load capacity</li>
        <li>Extended service life</li>
        <li>Precision manufacturing</li>
        <li>Excellent heat dissipation</li>
      </ul>
    `,
    brand: "Federal Parts",
    category: { id: "engine", name: "Engine Parts" },
    images: ["/images/BEARING.jpg"],
    features: [
      "Low friction design",
      "High load capacity",
      "Extended service life",
      "Precision ground surfaces",
      "Heat treated for durability"
    ]
  },
  "brake-pad": {
    id: "brake-pad",
    name: "Brake Pad",
    description: "High-performance brake pads for superior stopping power. Provides consistent braking performance in all conditions.",
    longDescription: `
      <h3>Product Overview</h3>
      <p>Federal Parts brake pads are engineered for maximum stopping power and consistent performance. Whether you're commuting or riding in challenging conditions, these brake pads deliver reliable braking when you need it most.</p>
      
      <h3>Key Benefits</h3>
      <ul>
        <li>Superior stopping power</li>
        <li>Consistent performance in wet and dry conditions</li>
        <li>Low dust formulation</li>
        <li>Extended pad life</li>
        <li>Quiet operation</li>
      </ul>
    `,
    brand: "Federal Parts",
    category: { id: "brake", name: "Brake System" },
    images: ["/images/BRAKE_PAD.jpg"],
    features: [
      "Ceramic formulation for reduced dust",
      "Superior stopping power",
      "Quiet operation",
      "Heat-resistant backing plate",
      "Easy installation"
    ]
  },
  "brake-shoe": {
    id: "brake-shoe",
    name: "Brake Shoe",
    description: "Reliable brake shoes for drum brake systems. Provides consistent braking performance and durability.",
    longDescription: `
      <h3>Product Overview</h3>
      <p>Federal Parts brake shoes are manufactured using high-friction materials that provide reliable stopping power for drum brake systems. Designed for long-lasting performance and consistent operation.</p>
    `,
    brand: "Federal Parts",
    category: { id: "brake", name: "Brake System" },
    images: ["/images/BRAKE_SHOE.jpg"],
    features: [
      "High-friction material",
      "Durable construction",
      "Consistent braking",
      "Easy installation",
      "Long service life"
    ]
  },
  "bushing": {
    id: "bushing",
    name: "Bushing",
    description: "High-quality bushings for suspension and chassis systems. Provides smooth operation and vibration dampening.",
    longDescription: `
      <h3>Product Overview</h3>
      <p>Federal Parts bushings are designed to provide superior vibration dampening and smooth operation for your motorcycle's suspension and chassis components.</p>
    `,
    brand: "Federal Parts",
    category: { id: "suspension", name: "Suspension" },
    images: ["/images/BUSHING.jpg"],
    features: [
      "Vibration dampening",
      "Corrosion resistant",
      "Long service life",
      "Precision fitment",
      "Easy installation"
    ]
  },
  "cap-suppresor": {
    id: "cap-suppresor",
    name: "Cap Suppresor",
    description: "High-quality cap suppressor for electrical systems. Ensures reliable electrical connections.",
    longDescription: `
      <h3>Product Overview</h3>
      <p>Federal Parts cap suppressors are manufactured to the highest standards, ensuring reliable electrical connections and protection against interference.</p>
    `,
    brand: "Federal Parts",
    category: { id: "electrical", name: "Electrical Parts" },
    images: ["/images/CAP SUPPRESOR.jpg"],
    features: [
      "Reliable connections",
      "Interference suppression",
      "Durable construction",
      "Easy installation",
      "Corrosion resistant"
    ]
  },
  "center-spring": {
    id: "center-spring",
    name: "Center Spring",
    description: "High-performance center spring for transmission systems. Provides optimal tension and durability.",
    longDescription: `
      <h3>Product Overview</h3>
      <p>Federal Parts center springs are engineered for optimal tension and durability in transmission systems. Made from high-quality spring steel for long-lasting performance.</p>
    `,
    brand: "Federal Parts",
    category: { id: "transmission", name: "Transmission Parts" },
    images: ["/images/CENTER SPRING.jpg"],
    features: [
      "High-quality spring steel",
      "Optimal tension",
      "Long service life",
      "Corrosion resistant",
      "Precision manufacturing"
    ]
  },
  "clutch-spring": {
    id: "clutch-spring",
    name: "Clutch Spring",
    description: "High-performance clutch spring for smooth engagement and reliable operation.",
    longDescription: `
      <h3>Product Overview</h3>
      <p>Federal Parts clutch springs provide smooth engagement and reliable operation for your motorcycle's clutch system. Manufactured to OEM specifications.</p>
    `,
    brand: "Federal Parts",
    category: { id: "clutch", name: "Clutch System" },
    images: ["/images/CLUCH SPRING.jpg"],
    features: [
      "Smooth engagement",
      "Reliable operation",
      "High-quality materials",
      "Long service life",
      "Precision manufacturing"
    ]
  },
  "drive-face": {
    id: "drive-face",
    name: "Drive Face",
    description: "Premium drive face for CVT systems. Ensures smooth power transfer and durability.",
    longDescription: `
      <h3>Product Overview</h3>
      <p>Federal Parts drive faces are precision-engineered for optimal power transfer in CVT systems. Made from high-strength materials for durability.</p>
    `,
    brand: "Federal Parts",
    category: { id: "transmission", name: "Transmission Parts" },
    images: ["/images/DRIVE FACE.jpg"],
    features: [
      "Precision engineering",
      "Smooth power transfer",
      "High-strength materials",
      "Long service life",
      "Easy installation"
    ]
  },
  "face-assembly-set": {
    id: "face-assembly-set",
    name: "Face Assembly Set",
    description: "Complete face assembly set for CVT systems. Includes all necessary components for replacement.",
    longDescription: `
      <h3>Product Overview</h3>
      <p>Complete face assembly set includes all components needed for CVT system maintenance. Pre-assembled for easy installation.</p>
    `,
    brand: "Federal Parts",
    category: { id: "transmission", name: "Transmission Parts" },
    images: ["/images/FACE ASSEMBLY SET.jpg"],
    features: [
      "Complete assembly set",
      "Pre-assembled for easy installation",
      "OEM quality standards",
      "Long service life",
      "All components included"
    ]
  },
  "horn": {
    id: "horn",
    name: "Horn",
    description: "Loud and clear horn for safety and communication. Weather-resistant design.",
    longDescription: `
      <h3>Product Overview</h3>
      <p>Federal Parts horns deliver loud, clear sound for safety and communication on the road. Weather-resistant design ensures reliable operation.</p>
    `,
    brand: "Federal Parts",
    category: { id: "electrical", name: "Electrical Parts" },
    images: ["/images/HORN.jpg"],
    features: [
      "Loud, clear sound",
      "Weather-resistant design",
      "Easy installation",
      "Durable construction",
      "Long service life"
    ]
  },
  "paket-v-belt": {
    id: "paket-v-belt",
    name: "Paket V-Belt",
    description: "High-quality V-belt for CVT systems. Provides smooth power transfer and long service life.",
    longDescription: `
      <h3>Product Overview</h3>
      <p>Federal Parts V-belts are manufactured using high-quality materials for smooth power transfer and extended service life in CVT systems.</p>
    `,
    brand: "Federal Parts",
    category: { id: "transmission", name: "Transmission Parts" },
    images: ["/images/PAKET V-BELT.jpg"],
    features: [
      "High-quality materials",
      "Smooth power transfer",
      "Long service life",
      "Heat resistant",
      "Precision manufacturing"
    ]
  },
  "pulley": {
    id: "pulley",
    name: "Pulley",
    description: "Precision pulley for CVT systems. Ensures smooth operation and optimal performance.",
    longDescription: `
      <h3>Product Overview</h3>
      <p>Federal Parts pulleys are precision-engineered for smooth operation and optimal performance in CVT systems.</p>
    `,
    brand: "Federal Parts",
    category: { id: "transmission", name: "Transmission Parts" },
    images: ["/images/PULLEY.jpg"],
    features: [
      "Precision engineering",
      "Smooth operation",
      "High-strength materials",
      "Long service life",
      "Easy installation"
    ]
  },
  "race-set-steering": {
    id: "race-set-steering",
    name: "Race Set Steering",
    description: "Complete steering race set for smooth and precise steering control.",
    longDescription: `
      <h3>Product Overview</h3>
      <p>Federal Parts steering race sets provide smooth and precise steering control. Complete set includes all necessary components.</p>
    `,
    brand: "Federal Parts",
    category: { id: "steering", name: "Steering System" },
    images: ["/images/RACE_SET_STEERING.jpg"],
    features: [
      "Complete steering set",
      "Smooth operation",
      "Precise steering control",
      "Long service life",
      "Easy installation"
    ]
  },
  "roller-weight-set": {
    id: "roller-weight-set",
    name: "Roller Weight Set",
    description: "Complete roller weight set for CVT tuning. Various weights available.",
    longDescription: `
      <h3>Product Overview</h3>
      <p>Federal Parts roller weight sets allow for CVT tuning to optimize acceleration and performance. Various weight options available.</p>
    `,
    brand: "Federal Parts",
    category: { id: "transmission", name: "Transmission Parts" },
    images: ["/images/ROLLER WEIGHT SET.jpg"],
    features: [
      "Complete set of rollers",
      "Various weights for tuning",
      "High-quality materials",
      "Smooth operation",
      "Easy installation"
    ]
  },
  "slider-3pcsset": {
    id: "slider-3pcsset",
    name: "Slider 3pcs Set",
    description: "Set of 3 sliders for CVT systems. Provides smooth operation and reduced friction.",
    longDescription: `
      <h3>Product Overview</h3>
      <p>Federal Parts sliders provide smooth operation and reduced friction in CVT systems. Set includes 3 pieces for complete replacement.</p>
    `,
    brand: "Federal Parts",
    category: { id: "transmission", name: "Transmission Parts" },
    images: ["/images/SLIDER 3PCSSET.jpg"],
    features: [
      "Set of 3 sliders",
      "Smooth operation",
      "Reduced friction",
      "Long service life",
      "Easy installation"
    ]
  },
  "spark-plug": {
    id: "spark-plug",
    name: "Spark Plug",
    description: "High-performance spark plug for reliable ignition and efficient combustion.",
    longDescription: `
      <h3>Product Overview</h3>
      <p>Federal Parts spark plugs deliver reliable ignition and efficient combustion for optimal engine performance and fuel economy.</p>
    `,
    brand: "Federal Parts",
    category: { id: "engine", name: "Engine Parts" },
    images: ["/images/SPARK PLUG.jpg"],
    features: [
      "Reliable ignition",
      "Efficient combustion",
      "Long service life",
      "Easy installation",
      "Improved fuel economy"
    ]
  },
  "washer-2pc": {
    id: "washer-2pc",
    name: "Washer 2pc",
    description: "Set of 2 high-quality washers for various applications. Precision manufactured.",
    longDescription: `
      <h3>Product Overview</h3>
      <p>Federal Parts washers are precision-manufactured for reliable performance in various applications. Set includes 2 pieces.</p>
    `,
    brand: "Federal Parts",
    category: { id: "hardware", name: "Hardware" },
    images: ["/images/WASHER 2PC.jpg"],
    features: [
      "Set of 2 washers",
      "Precision manufacturing",
      "Durable construction",
      "Corrosion resistant",
      "Universal fit"
    ]
  },
  "weight-set-primary-clutch": {
    id: "weight-set-primary-clutch",
    name: "Weight Set Primary Clutch",
    description: "Complete weight set for primary clutch system. Allows for tuning and optimization.",
    longDescription: `
      <h3>Product Overview</h3>
      <p>Federal Parts primary clutch weight sets allow for tuning and optimization of clutch engagement and performance.</p>
    `,
    brand: "Federal Parts",
    category: { id: "clutch", name: "Clutch System" },
    images: ["/images/WEIGHT SET PRIMARY CLUTCH.jpg"],
    features: [
      "Complete weight set",
      "Allows clutch tuning",
      "High-quality materials",
      "Smooth engagement",
      "Long service life"
    ]
  }
};

// Helper function to get product by ID
const getProductById = (productId) => {
  return staticProducts[productId] || null;
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageZoom, setImageZoom] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    if (id) {
      const foundProduct = getProductById(id);
      if (foundProduct) {
        setProduct(foundProduct);
        setLoading(false);
      } else {
        setError("Product not found");
        setLoading(false);
      }
    }
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 pt-24 px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 pt-24 px-4">
        <div className="text-center max-w-md w-full">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Product Not Found</h2>
          <p className="text-gray-400 mb-6">{error || "The product you're looking for doesn't exist."}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
            <Link
              to="/"
              className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-700 hover:to-red-600 flex items-center justify-center gap-2"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-24">
      {/* Image Zoom Modal */}
      {imageZoom && product.images.length > 0 && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setImageZoom(false)}
              className="p-2 bg-gray-800/90 backdrop-blur-sm rounded-full hover:bg-gray-700/90 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
          <div className="relative w-full h-full max-w-7xl max-h-[90vh] p-4">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-400">
            <Link to="/" className="hover:text-red-400 flex items-center gap-1">
              <Home className="w-4 h-4" />
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/categories" className="hover:text-red-400">Categories</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 md:p-8">
            {/* Images Section */}
            <div>
              <div className="relative">
                <div
                  className="relative aspect-square bg-gray-900 rounded-xl overflow-hidden cursor-zoom-in"
                  onClick={() => setImageZoom(true)}
                >
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageZoom(true);
                      }}
                      className="p-2 bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-gray-700 transition-colors"
                    >
                      <ZoomIn className="w-5 h-5 text-gray-300" />
                    </button>
                  </div>
                </div>

                {/* Thumbnails */}
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-3 mt-4">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === index
                            ? "border-red-500"
                            : "border-gray-700 hover:border-gray-600"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div>
              {/* Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              {/* Product Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {product.name}
              </h1>
              
              {/* Brand & Category */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-red-400 font-medium">{product.brand}</span>
                <span className="text-gray-500">|</span>
                <span className="text-gray-400">{product.category.name}</span>
              </div>

              {/* Description Preview */}
              <p className="text-gray-300 mb-6 leading-relaxed">
                {product.description}
              </p>

              {/* Inquire Button */}
              <button
                onClick={() => alert(`Inquiry sent for ${product.name}`)}
                className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg transition-all duration-300 font-medium"
              >
                Inquire Now
              </button>

              {/* Shipping Info */}
              <div className="grid grid-cols-2 gap-3 pt-4 mt-4 border-t border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Truck className="w-4 h-4" />
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <RotateCcw className="w-4 h-4" />
                  <span>7-Day Returns</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>2-Year Warranty</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Headphones className="w-4 h-4" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="border-t border-gray-700">
            <div className="border-b border-gray-700">
              <nav className="flex gap-8 px-6">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === "description"
                      ? "border-red-500 text-red-400"
                      : "border-transparent text-gray-500 hover:text-gray-400 hover:border-gray-600"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Description
                </button>
                <button
                  onClick={() => setActiveTab("features")}
                  className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === "features"
                      ? "border-red-500 text-red-400"
                      : "border-transparent text-gray-500 hover:text-gray-400 hover:border-gray-600"
                  }`}
                >
                  <Award className="w-4 h-4" />
                  Features
                </button>
                <button
                  onClick={() => setActiveTab("shipping")}
                  className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === "shipping"
                      ? "border-red-500 text-red-400"
                      : "border-transparent text-gray-500 hover:text-gray-400 hover:border-gray-600"
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  Shipping
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === "description" && (
                <div className="prose prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: product.longDescription || product.description }} />
                </div>
              )}

              {activeTab === "features" && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Key Features</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === "shipping" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white mb-4">Shipping Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-2">Delivery Options</h4>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li>• Standard Delivery: 3-5 business days</li>
                        <li>• Express Delivery: 1-2 business days</li>
                        <li>• Same Day Delivery: Available in Metro Manila</li>
                      </ul>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-2">Return Policy</h4>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li>• 7-day return window</li>
                        <li>• Free returns on defective items</li>
                        <li>• Original packaging required</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Back to Top Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <ChevronUp className="w-4 h-4" />
            Back to Top
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
