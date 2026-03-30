import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Home, ChevronRight, ShoppingBag, Bike, ChevronLeft } from "lucide-react";

// Static categories/brands data
const brands = [
  {
    id: "honda",
    name: "Honda",
    image: "/BRAND/HONDA.png",
    description: "Premium Honda motorcycle parts and accessories",
    models: [
      { id: "honda-genio", name: "Genio", image: "/motorcycle/honda/Genio_Redpng.png" },
      { id: "honda-adv-150", name: "ADV 150", image: "/motorcycle/honda/honda-adv-150.png" },
      { id: "honda-airblade-160", name: "AirBlade 160", image: "/motorcycle/honda/Honda-AirBlade160-1.png" },
      { id: "honda-beat", name: "Beat", image: "/motorcycle/honda/honda-beat.png" },
      { id: "honda-click-125", name: "Click 125", image: "/motorcycle/honda/honda-Click-125-4.png" },
      { id: "honda-pcx-160", name: "PCX 160", image: "/motorcycle/honda/Honda-pcx160-abs-1.png" },
      { id: "honda-scoopy", name: "Scoopy", image: "/motorcycle/honda/honda-scoopy.png" },
      { id: "honda-wave", name: "Wave", image: "/motorcycle/honda/Honda-Wave.png" },
      { id: "honda-click-160", name: "Click 160", image: "/motorcycle/honda/NEW-CLICK-160-RED.png" }
    ]
  },
  {
    id: "yamaha",
    name: "Yamaha",
    image: "/BRAND/YAMAHA.webp",
    description: "Genuine Yamaha motorcycle parts",
    models: [
      { id: "yamaha-fazzio", name: "Fazzio", image: "/motorcycle/yamaha/Fazzio.png" },
      { id: "yamaha-gear-ultimate", name: "Gear Ultimate", image: "/motorcycle/yamaha/gear-ultimate-125-hybrid-1.png" },
      { id: "yamaha-matte-green", name: "Matte Green", image: "/motorcycle/yamaha/matte-green.png" },
      { id: "yamaha-mio-sporty", name: "Mio Sporty", image: "/motorcycle/yamaha/MIO-SPORTY_Matte-Black.png" },
      { id: "yamaha-racing-blue", name: "Racing Blue", image: "/motorcycle/yamaha/Racing-Blue.png" },
      { id: "yamaha-vega", name: "Vega", image: "/motorcycle/yamaha/vega.png" },
      { id: "yamaha-xmax", name: "XMax", image: "/motorcycle/yamaha/xmax.png" }
    ]
  },
  {
    id: "suzuki",
    name: "Suzuki",
    image: "/BRAND/SUZUKI.png",
    description: "Quality Suzuki motorcycle parts",
    models: [
      { id: "suzuki-skydrive", name: "Skydrive", image: "/motorcycle/suzuki/suzuki-skydrive.png" }
    ]
  }
];

// Static products data
const staticProducts = {
  "back-plate": {
    id: "back-plate",
    name: "Back Plate",
    description: "High-quality back plate for motorcycle transmission system.",
    brand: "Federal Parts",
    category: { id: "transmission", name: "Transmission Parts" },
    images: ["/images/BACK PLATE.jpg"]
  },
  "bearing": {
    id: "bearing",
    name: "Bearing",
    description: "Premium quality bearing for smooth rotation and reduced friction.",
    brand: "Federal Parts",
    category: { id: "engine", name: "Engine Parts" },
    images: ["/images/BEARING.jpg"]
  },
  "brake-pad": {
    id: "brake-pad",
    name: "Brake Pad",
    description: "High-performance brake pads for superior stopping power.",
    brand: "Federal Parts",
    category: { id: "brake", name: "Brake System" },
    images: ["/images/BRAKE_PAD.jpg"]
  },
  "brake-shoe": {
    id: "brake-shoe",
    name: "Brake Shoe",
    description: "Reliable brake shoes for drum brake systems.",
    brand: "Federal Parts",
    category: { id: "brake", name: "Brake System" },
    images: ["/images/BRAKE_SHOE.jpg"]
  },
  "bushing": {
    id: "bushing",
    name: "Bushing",
    description: "High-quality bushings for suspension and chassis systems.",
    brand: "Federal Parts",
    category: { id: "suspension", name: "Suspension" },
    images: ["/images/BUSHING.jpg"]
  },
  "cap-suppresor": {
    id: "cap-suppresor",
    name: "Cap Suppresor",
    description: "High-quality cap suppressor for electrical systems.",
    brand: "Federal Parts",
    category: { id: "electrical", name: "Electrical Parts" },
    images: ["/images/CAP SUPPRESOR.jpg"]
  },
  "center-spring": {
    id: "center-spring",
    name: "Center Spring",
    description: "High-performance center spring for transmission systems.",
    brand: "Federal Parts",
    category: { id: "transmission", name: "Transmission Parts" },
    images: ["/images/CENTER SPRING.jpg"]
  },
  "clutch-spring": {
    id: "clutch-spring",
    name: "Clutch Spring",
    description: "High-performance clutch spring for smooth engagement.",
    brand: "Federal Parts",
    category: { id: "clutch", name: "Clutch System" },
    images: ["/images/CLUCH SPRING.jpg"]
  },
  "drive-face": {
    id: "drive-face",
    name: "Drive Face",
    description: "Premium drive face for CVT systems.",
    brand: "Federal Parts",
    category: { id: "transmission", name: "Transmission Parts" },
    images: ["/images/DRIVE FACE.jpg"]
  },
  "face-assembly-set": {
    id: "face-assembly-set",
    name: "Face Assembly Set",
    description: "Complete face assembly set for CVT systems.",
    brand: "Federal Parts",
    category: { id: "transmission", name: "Transmission Parts" },
    images: ["/images/FACE ASSEMBLY SET.jpg"]
  },
  "horn": {
    id: "horn",
    name: "Horn",
    description: "Loud and clear horn for safety and communication.",
    brand: "Federal Parts",
    category: { id: "electrical", name: "Electrical Parts" },
    images: ["/images/HORN.jpg"]
  },
  "paket-v-belt": {
    id: "paket-v-belt",
    name: "Paket V-Belt",
    description: "High-quality V-belt for CVT systems.",
    brand: "Federal Parts",
    category: { id: "transmission", name: "Transmission Parts" },
    images: ["/images/PAKET V-BELT.jpg"]
  },
  "pulley": {
    id: "pulley",
    name: "Pulley",
    description: "Precision pulley for CVT systems.",
    brand: "Federal Parts",
    category: { id: "transmission", name: "Transmission Parts" },
    images: ["/images/PULLEY.jpg"]
  },
  "race-set-steering": {
    id: "race-set-steering",
    name: "Race Set Steering",
    description: "Complete steering race set for smooth and precise steering control.",
    brand: "Federal Parts",
    category: { id: "steering", name: "Steering System" },
    images: ["/images/RACE_SET_STEERING.jpg"]
  },
  "roller-weight-set": {
    id: "roller-weight-set",
    name: "Roller Weight Set",
    description: "Complete roller weight set for CVT tuning.",
    brand: "Federal Parts",
    category: { id: "transmission", name: "Transmission Parts" },
    images: ["/images/ROLLER WEIGHT SET.jpg"]
  },
  "slider-3pcsset": {
    id: "slider-3pcsset",
    name: "Slider 3pcs Set",
    description: "Set of 3 sliders for CVT systems.",
    brand: "Federal Parts",
    category: { id: "transmission", name: "Transmission Parts" },
    images: ["/images/SLIDER 3PCSSET.jpg"]
  },
  "spark-plug": {
    id: "spark-plug",
    name: "Spark Plug",
    description: "High-performance spark plug for reliable ignition.",
    brand: "Federal Parts",
    category: { id: "engine", name: "Engine Parts" },
    images: ["/images/SPARK PLUG.jpg"]
  },
  "washer-2pc": {
    id: "washer-2pc",
    name: "Washer 2pc",
    description: "Set of 2 high-quality washers for various applications.",
    brand: "Federal Parts",
    category: { id: "hardware", name: "Hardware" },
    images: ["/images/WASHER 2PC.jpg"]
  },
  "weight-set-primary-clutch": {
    id: "weight-set-primary-clutch",
    name: "Weight Set Primary Clutch",
    description: "Complete weight set for primary clutch system.",
    brand: "Federal Parts",
    category: { id: "clutch", name: "Clutch System" },
    images: ["/images/WEIGHT SET PRIMARY CLUTCH.jpg"]
  }
};

const Categories = () => {
  const navigate = useNavigate();
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleBrandClick = (brand) => {
    setSelectedBrand(brand);
    setSelectedModel(null);
    setSearchTerm("");
  };

  const handleModelClick = (model) => {
    setSelectedModel(model);
  };

  const handleBackToBrands = () => {
    setSelectedBrand(null);
    setSelectedModel(null);
  };

  const handleBackToModels = () => {
    setSelectedModel(null);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      const results = Object.values(staticProducts).filter(product =>
        product.name.toLowerCase().includes(term.toLowerCase()) ||
        product.description.toLowerCase().includes(term.toLowerCase()) ||
        product.category.name.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  // Product Card Component
  const ProductCard = ({ product }) => {
    return (
      <div
        onClick={() => navigate(`/product/${product.id}`)}
        className="group bg-gradient-to-b from-gray-900 to-black rounded-xl border border-gray-800 overflow-hidden hover:border-red-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10 cursor-pointer"
      >
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-900 to-black">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-white text-sm line-clamp-1">{product.name}</h3>
          <p className="text-xs text-gray-400 line-clamp-2 mt-2">{product.description}</p>
        </div>
      </div>
    );
  };

  // Render Brands
  const renderBrands = () => (
    <div className="bg-gradient-to-b from-gray-900 to-black rounded-xl border border-gray-800 p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <Bike className="w-6 h-6 text-red-400" />
        <div>
          <h2 className="text-xl font-bold text-white">Choose Your Brand</h2>
          <p className="text-sm text-gray-400">Select a brand to view available motorcycle models</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {brands.map((brand) => (
          <div
            key={brand.id}
            onClick={() => handleBrandClick(brand)}
            className="group cursor-pointer"
          >
            <div className="relative overflow-hidden rounded-xl border border-gray-800 group-hover:border-red-500/50 transition-all duration-300 bg-gradient-to-b from-gray-900 to-black shadow-lg group-hover:shadow-xl group-hover:shadow-red-500/10">
              <div className="aspect-square overflow-hidden">
                <img
                  src={brand.image}
                  alt={brand.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h4 className="font-bold text-white text-sm text-center">{brand.name}</h4>
                  <p className="text-xs text-gray-300 text-center mt-1">{brand.models.length} models</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Models for selected brand
  const renderModels = () => (
    <div className="bg-gradient-to-b from-gray-900 to-black rounded-xl border border-gray-800 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToBrands}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white">{selectedBrand.name} Models</h2>
            <p className="text-sm text-gray-400">Select a model to view compatible parts</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {selectedBrand.models.map((model) => (
          <div
            key={model.id}
            onClick={() => handleModelClick(model)}
            className="group cursor-pointer"
          >
            <div className="relative overflow-hidden rounded-xl border border-gray-800 group-hover:border-green-500/50 transition-all duration-300 bg-gradient-to-b from-gray-900 to-black shadow-lg group-hover:shadow-xl group-hover:shadow-green-500/10">
              <div className="aspect-square overflow-hidden">
                <img
                  src={model.image}
                  alt={model.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h4 className="font-bold text-white text-sm text-center">{model.name}</h4>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Products for selected model
  const renderProducts = () => {
    const products = Object.values(staticProducts);
    return (
      <div className="bg-gradient-to-b from-gray-900 to-black rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToModels}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-white">Parts for {selectedModel.name}</h2>
              <p className="text-sm text-gray-400">Browse compatible parts for this motorcycle</p>
            </div>
          </div>
          <span className="text-sm text-gray-400">{products.length} products available</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    );
  };

  // Render Search Results
  const renderSearchResults = () => (
    <div className="bg-gradient-to-b from-gray-900 to-black rounded-xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Search Results</h2>
          <p className="text-sm text-gray-400">Found {searchResults.length} products matching "{searchTerm}"</p>
        </div>
        <button
          onClick={() => setSearchTerm("")}
          className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          Clear Search
        </button>
      </div>
      {searchResults.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {searchResults.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No products found</h3>
          <p className="text-gray-400">Try searching with different keywords</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative pt-20 pb-12 overflow-hidden bg-black">
        <div className="absolute inset-0">
          <img
            src="/newbanner/destktop website Federal (Category).png"
            alt="Federal Parts Categories Banner"
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm text-gray-300 mb-6">
            <Link to="/" className="hover:text-red-400 flex items-center gap-1">
              <Home className="w-4 h-4" />
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-500" />
            <span className="text-white font-medium">Categories</span>
          </nav>
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-[#cc0000]">
              Browse Categories
            </h1>
            <p className="text-gray-200 max-w-2xl mx-auto mb-8">
              Search brands, motorcycles, and products - All in one place
            </p>
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-black/60 backdrop-blur-sm border border-gray-700 focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {searchTerm ? (
          renderSearchResults()
        ) : selectedModel ? (
          renderProducts()
        ) : selectedBrand ? (
          renderModels()
        ) : (
          renderBrands()
        )}
      </div>
    </div>
  );
};

export default Categories;
