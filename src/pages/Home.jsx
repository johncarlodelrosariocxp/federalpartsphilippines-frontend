import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  ArrowRight,
  Target,
  TrendingDown,
  Bike,
  Headphones,
  Truck,
  RotateCcw,
  ChevronLeft,
} from "lucide-react";

// Static motorcycles data
const motorcycles = [
  // Honda Motorcycles
  { id: "honda-genio", name: "Genio", brand: "Honda", image: "/motorcycle/honda/Genio_Redpng.png", description: "Stylish and efficient scooter perfect for city commuting." },
  { id: "honda-adv-150", name: "ADV 150", brand: "Honda", image: "/motorcycle/honda/honda-adv-150.png", description: "Adventure-style scooter with premium features." },
  { id: "honda-airblade-160", name: "AirBlade 160", brand: "Honda", image: "/motorcycle/honda/Honda-AirBlade160-1.png", description: "Sporty scooter with powerful engine." },
  { id: "honda-beat", name: "Beat", brand: "Honda", image: "/motorcycle/honda/honda-beat.png", description: "Lightweight and fuel-efficient daily rider." },
  { id: "honda-click-125", name: "Click 125", brand: "Honda", image: "/motorcycle/honda/honda-Click-125-4.png", description: "Popular and reliable automatic scooter." },
  { id: "honda-pcx-160", name: "PCX 160", brand: "Honda", image: "/motorcycle/honda/Honda-pcx160-abs-1.png", description: "Premium scooter with advanced features." },
  { id: "honda-scoopy", name: "Scoopy", brand: "Honda", image: "/motorcycle/honda/honda-scoopy.png", description: "Retro-styled scooter with modern features." },
  { id: "honda-wave", name: "Wave", brand: "Honda", image: "/motorcycle/honda/Honda-Wave.png", description: "Classic underbone motorcycle." },
  { id: "honda-click-160", name: "Click 160", brand: "Honda", image: "/motorcycle/honda/NEW-CLICK-160-RED.png", description: "New generation Click with enhanced performance." },
  // Yamaha Motorcycles
  { id: "yamaha-fazzio", name: "Fazzio", brand: "Yamaha", image: "/motorcycle/yamaha/Fazzio.png", description: "Retro-modern scooter with classic styling." },
  { id: "yamaha-gear-ultimate", name: "Gear Ultimate", brand: "Yamaha", image: "/motorcycle/yamaha/gear-ultimate-125-hybrid-1.png", description: "Practical scooter with hybrid technology." },
  { id: "yamaha-matte-green", name: "Matte Green", brand: "Yamaha", image: "/motorcycle/yamaha/matte-green.png", description: "Sporty scooter with premium finish." },
  { id: "yamaha-mio-sporty", name: "Mio Sporty", brand: "Yamaha", image: "/motorcycle/yamaha/MIO-SPORTY_Matte-Black.png", description: "Agile and sporty scooter." },
  { id: "yamaha-racing-blue", name: "Racing Blue", brand: "Yamaha", image: "/motorcycle/yamaha/Racing-Blue.png", description: "Performance-oriented scooter." },
  { id: "yamaha-vega", name: "Vega", brand: "Yamaha", image: "/motorcycle/yamaha/vega.png", description: "Reliable underbone motorcycle." },
  { id: "yamaha-xmax", name: "XMax", brand: "Yamaha", image: "/motorcycle/yamaha/xmax.png", description: "Premium maxi-scooter." },
  // Suzuki Motorcycles
  { id: "suzuki-skydrive", name: "Skydrive", brand: "Suzuki", image: "/motorcycle/suzuki/suzuki-skydrive.png", description: "Reliable and fuel-efficient scooter." }
];

// Static products data
const staticProducts = {
  "back-plate": {
    id: "back-plate",
    name: "Back Plate",
    description: "High-quality back plate for motorcycle transmission system. Made from premium materials for durability and performance.",
    longDescription: "The Federal Parts Back Plate is engineered to exact OEM specifications, ensuring perfect fitment and optimal performance. Manufactured using high-grade materials, this back plate provides exceptional strength and durability for your motorcycle's transmission system.",
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
    longDescription: "Federal Parts premium bearings are manufactured to the highest standards, providing smooth operation and extended service life. Each bearing undergoes rigorous quality control to ensure consistent performance.",
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
    longDescription: "Federal Parts brake pads are engineered for maximum stopping power and consistent performance. Whether you're commuting or riding in challenging conditions, these brake pads deliver reliable braking when you need it most.",
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
    longDescription: "Federal Parts brake shoes are manufactured using high-friction materials that provide reliable stopping power for drum brake systems. Designed for long-lasting performance and consistent operation.",
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
    longDescription: "Federal Parts bushings are designed to provide superior vibration dampening and smooth operation for your motorcycle's suspension and chassis components.",
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
    longDescription: "Federal Parts cap suppressors are manufactured to the highest standards, ensuring reliable electrical connections and protection against interference.",
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
    longDescription: "Federal Parts center springs are engineered for optimal tension and durability in transmission systems. Made from high-quality spring steel for long-lasting performance.",
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
    longDescription: "Federal Parts clutch springs provide smooth engagement and reliable operation for your motorcycle's clutch system. Manufactured to OEM specifications.",
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
    longDescription: "Federal Parts drive faces are precision-engineered for optimal power transfer in CVT systems. Made from high-strength materials for durability.",
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
    longDescription: "Complete face assembly set includes all components needed for CVT system maintenance. Pre-assembled for easy installation.",
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
    longDescription: "Federal Parts horns deliver loud, clear sound for safety and communication on the road. Weather-resistant design ensures reliable operation.",
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
    longDescription: "Federal Parts V-belts are manufactured using high-quality materials for smooth power transfer and extended service life in CVT systems.",
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
    longDescription: "Federal Parts pulleys are precision-engineered for smooth operation and optimal performance in CVT systems.",
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
    longDescription: "Federal Parts steering race sets provide smooth and precise steering control. Complete set includes all necessary components.",
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
    longDescription: "Federal Parts roller weight sets allow for CVT tuning to optimize acceleration and performance. Various weight options available.",
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
    longDescription: "Federal Parts sliders provide smooth operation and reduced friction in CVT systems. Set includes 3 pieces for complete replacement.",
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
    longDescription: "Federal Parts spark plugs deliver reliable ignition and efficient combustion for optimal engine performance and fuel economy.",
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
    longDescription: "Federal Parts washers are precision-manufactured for reliable performance in various applications. Set includes 2 pieces.",
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
    longDescription: "Federal Parts primary clutch weight sets allow for tuning and optimization of clutch engagement and performance.",
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

const Home = () => {
  const navigate = useNavigate();
  const [selectedMotorcycle, setSelectedMotorcycle] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const products = Object.values(staticProducts);

  const handleMotorcycleClick = (motorcycle) => {
    setSelectedMotorcycle(motorcycle);
    setSelectedProduct(null);
  };

  const handleBackToMotorcycles = () => {
    setSelectedMotorcycle(null);
    setSelectedProduct(null);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleBackToProducts = () => {
    setSelectedProduct(null);
  };

  // Product Detail Component
  const ProductDetail = ({ product, onBack }) => {
    return (
      <div className="bg-gradient-to-b from-gray-900 to-black rounded-2xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Products
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 md:p-8">
          <div className="relative aspect-square bg-gray-900 rounded-xl overflow-hidden">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-gray-400">{product.brand}</span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400">{product.category.name}</span>
            </div>

            <p className="text-gray-300 mb-6 leading-relaxed">{product.longDescription || product.description}</p>

            <div className="mb-6">
              <h3 className="font-bold text-white mb-3">Key Features:</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-300">
                    <span className="text-red-500 mt-1">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => alert(`Inquiry sent for ${product.name}`)}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg transition-all duration-300 font-medium"
            >
              Inquire Now
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Product Card Component
  const ProductCard = ({ product }) => {
    return (
      <div
        onClick={() => handleProductClick(product)}
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
          <h3 className="font-semibold text-white text-sm line-clamp-1 mb-2">{product.name}</h3>
          <p className="text-xs text-gray-400 line-clamp-2">{product.description}</p>
        </div>
      </div>
    );
  };

  // Motorcycle Card Component
  const MotorcycleCard = ({ motorcycle }) => (
    <div
      onClick={() => handleMotorcycleClick(motorcycle)}
      className="group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-xl border border-gray-800 group-hover:border-red-500/50 transition-all duration-300 bg-gradient-to-b from-gray-900 to-black shadow-lg group-hover:shadow-xl group-hover:shadow-red-500/10">
        <div className="aspect-square overflow-hidden">
          <img
            src={motorcycle.image}
            alt={motorcycle.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h4 className="font-bold text-white text-lg text-center">{motorcycle.name}</h4>
            <p className="text-sm text-gray-300 text-center mt-1">{motorcycle.brand}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Products Section for selected motorcycle
  const ProductsSection = () => {
    const brandProducts = products;

    return (
      <div className="bg-gradient-to-b from-gray-900 to-black rounded-2xl border border-gray-800 p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBackToMotorcycles}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white">Parts for {selectedMotorcycle.name}</h2>
            <p className="text-sm text-gray-400">Browse compatible parts for {selectedMotorcycle.brand} {selectedMotorcycle.name}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {brandProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    );
  };

  // Render Motorcycles
  const renderMotorcycles = () => (
    <div className="bg-gradient-to-b from-gray-900 to-black rounded-2xl border border-gray-800 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Bike className="w-6 h-6 text-red-400" />
        <div>
          <h2 className="text-xl font-bold text-white">Choose Your Motorcycle</h2>
          <p className="text-sm text-gray-400">Select a motorcycle to view compatible parts</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {motorcycles.map((motorcycle) => (
          <MotorcycleCard key={motorcycle.id} motorcycle={motorcycle} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-black">
        <div className="relative w-full">
          <img
            src="/banner/banner.jpg"
            alt="Federal Parts Banner"
            className="w-full h-auto max-w-full block"
          />
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="font-bold text-4xl text-[#cc0000] mb-3">
              {selectedProduct ? "Product Details" : selectedMotorcycle ? `${selectedMotorcycle.name} Parts` : "Browse Motorcycles"}
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {selectedProduct 
                ? selectedProduct.name
                : selectedMotorcycle 
                ? `Shop compatible parts for ${selectedMotorcycle.brand} ${selectedMotorcycle.name}`
                : "Select your motorcycle to find the perfect parts"}
            </p>
          </div>

          {selectedProduct ? (
            <ProductDetail product={selectedProduct} onBack={handleBackToProducts} />
          ) : selectedMotorcycle ? (
            <ProductsSection />
          ) : (
            renderMotorcycles()
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="font-bold text-4xl text-[#cc0000] mb-3">Quality You Can Trust</h2>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Experience the perfect balance of premium quality and exceptional value with Federal Parts
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="font-bold text-2xl text-[#cc0000] mb-6">About Federal Parts</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Cutting-edge innovative technology Federal Parts is one of the brands of motorcycle spare parts 
                marketed by PT Astra Otoparts Tbk's Domestic business unit. Consumers can easily obtain Federal 
                Parts products due to the extensive marketing network, which includes 50 main dealers, 23 sales 
                offices, and nearly 10,000 shops or workshops.
              </p>
              <p className="text-gray-300 mb-8 leading-relaxed">
                Federal Parts is well known for its quality because it is manufactured according to OEM standards 
                and is suitable for all motorcycle brands such as Honda, Kawasaki, Suzuki, and Yamaha. It is also 
                supported by the large variety of products offered.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                  <Shield className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-white">Japanese-level Engineering</h4>
                    <p className="text-sm text-gray-400">Precision engineering meets world-class quality standards</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                  <Target className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-white">Indonesia-DNA</h4>
                    <p className="text-sm text-gray-400">Locally manufactured, nationally trusted</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                  <TrendingDown className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-white">China-level Affordability</h4>
                    <p className="text-sm text-gray-400">Competitive pricing without compromising on quality</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-800">
                <img
                  src="/newbanner/Desktop (about federal parts.png"
                  alt="About Federal Parts"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gray-900/50 border-t border-gray-800">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <Truck className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <h4 className="font-bold text-white">Free Shipping</h4>
              <p className="text-sm text-gray-400">On orders over ₱2,000</p>
            </div>
            <div className="text-center">
              <RotateCcw className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <h4 className="font-bold text-white">7-Day Returns</h4>
              <p className="text-sm text-gray-400">Money-back guarantee</p>
            </div>
            <div className="text-center">
              <Shield className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <h4 className="font-bold text-white">2-Year Warranty</h4>
              <p className="text-sm text-gray-400">On all products</p>
            </div>
            <div className="text-center">
              <Headphones className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <h4 className="font-bold text-white">24/7 Support</h4>
              <p className="text-sm text-gray-400">Customer service</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
