import React, { useState, useEffect, useRef } from "react";
import { Calendar, Clock, Share2, ExternalLink, Video, MessageSquare, Newspaper, ChevronLeft, ChevronRight, Play } from "lucide-react";

const News = () => {
  const [animate, setAnimate] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const galleryRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    setAnimate(true);
  }, []);

  // Auto slide functionality
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
      }, 5000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying]);

  const galleryImages = [
    {
      id: 2,
      src: "/federal-launching-picture/IMG_0596.jpg",
      alt: "Federal Parts Launch Celebration",
      caption: "Celebrating with dealers and partners"
    },
    {
      id: 3,
      src: "/federal-launching-picture/IMG_4258.jpg",
      alt: "Federal Parts Showcase",
      caption: "Quality motorcycle parts on display"
    },
    {
      id: 4,
      src: "/federal-launching-picture/IMG_4087.jpg",
      alt: "Federal Parts Exhibition",
      caption: "Product exhibition and demonstration"
    },
    {
      id: 5,
      src: "/federal-launching-picture/IMG_4165.jpg",
      alt: "Federal Parts Networking",
      caption: "Networking with industry partners"
    },
    {
      id: 6,
      src: "/federal-launching-picture/IMG_4189.jpg",
      alt: "Federal Parts Presentation",
      caption: "Company presentation and vision"
    },
    {
      id: 8,
      src: "/federal-launching-picture/IMG_1169.jpg",
      alt: "Federal Parts Team",
      caption: "Our dedicated team and brand ambassadors"
    },
    {
      id: 9,
      src: "/federal-launching-picture/IMG_1163.jpg",
      alt: "Federal Parts Booth",
      caption: "Official launch booth setup"
    },
    {
      id: 10,
      src: "/federal-launching-picture/IMG_1162.jpg",
      alt: "Federal Parts Crowd",
      caption: "Engaged audience during the launch"
    },
    {
      id: 11,
      src: "/federal-launching-picture/IMG_1103.jpg",
      alt: "Federal Parts Celebration",
      caption: "Grand celebration with partners"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
      }, 5000);
    }
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
      }, 5000);
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
      }, 5000);
    }
  };

  const toggleSlideshow = () => {
    setIsPlaying(!isPlaying);
  };

  const newsCategories = [
    { id: "all", label: "All News" }
  ];

  const newsItems = [
    {
      id: 2,
      type: "announcement",
      category: "announcement",
      title: "Federal Parts Philippines Expansion",
      description: "Exciting news about our warehouse expansion in Bulacan to serve more dealers nationwide",
      date: "December 12, 2024",
      readTime: "3 min read",
      embed: `<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2FFederalPartsPhilippines%2Fposts%2Fpfbid038G4RMnfND7FicUseZu22UXYfSmMxXC42qxa3CPF8JtgziSSik4tZfCYGc6pmjKiCl&show_text=true&width=500" width="500" height="793" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`
    },
    {
      id: 3,
      type: "product",
      category: "product",
      title: "New Product Line Announcement",
      description: "Introducing our latest line of high-performance motorcycle parts directly from Indonesia",
      date: "December 10, 2024",
      readTime: "2 min read",
      embed: `<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2FFederalPartsPhilippines%2Fposts%2Fpfbid02wRfWhdvANHwuYrecdoVAG3hnuUUjn9rzXdVUkab1UehK6apfEwKAbquMPM7fsB5Gl&show_text=true&width=500" width="500" height="250" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`
    },
    {
      id: 4,
      type: "industry",
      category: "industry",
      title: "Motorcycle Industry Trends 2024",
      description: "Latest trends and developments in the Philippine motorcycle parts industry",
      date: "December 8, 2024",
      readTime: "4 min read",
      embed: `<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2FFederalPartsPhilippines%2Fposts%2F1345753304096812%3A1345753304096812&show_text=true&width=500" width="500" height="423" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`
    },
    {
      id: 5,
      type: "announcement",
      category: "announcement",
      title: "Warehouse Operating Hours Update",
      description: "Important update regarding our warehouse schedule for the holiday season",
      date: "December 5, 2024",
      readTime: "1 min read",
      embed: `<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2FFederalPartsPhilippines%2Fposts%2Fpfbid02wRfWhdvANHwuYrecdoVAG3hnuUUjn9rzXdVUkab1UehK6apfEwKAbquMPM7fsB5Gl&show_text=true&width=500" width="500" height="280" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`
    },
    {
      id: 6,
      type: "product",
      category: "product",
      title: "Engine Parts Quality Standards",
      description: "Learn about our rigorous quality control process for all engine components",
      date: "December 3, 2024",
      readTime: "3 min read",
      embed: `<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2FFederalPartsPhilippines%2Fposts%2Fpfbid038G4RMnfND7FicUseZu22UXYfSmMxXC42qxa3CPF8JtgziSSik4tZfCYGc6pmjKiCl&show_text=true&width=500" width="500" height="350" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`
    }
  ];

  const filteredNews = activeCategory === "all" 
    ? newsItems 
    : newsItems.filter(item => item.category === activeCategory);

  const shareNews = (title, url) => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: `Check out this news from Federal Parts Philippines: ${title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case "video": return <Video className="w-4 h-4" />;
      case "announcement": return <MessageSquare className="w-4 h-4" />;
      case "product": return <Newspaper className="w-4 h-4" />;
      case "industry": return <Newspaper className="w-4 h-4" />;
      default: return <Newspaper className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case "video": return "bg-red-500/20 border-red-500/50 text-red-400";
      case "announcement": return "bg-blue-500/20 border-blue-500/50 text-blue-400";
      case "product": return "bg-green-500/20 border-green-500/50 text-green-400";
      case "industry": return "bg-purple-500/20 border-purple-500/50 text-purple-400";
      default: return "bg-gray-500/20 border-gray-500/50 text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 overflow-hidden">
      {/* Hero Section with Fixed Banner - Added margin-top */}
      <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden mt-1">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/federal-launching-picture/627820225_122114271801166784_7167461996686783009_n.jpg')"
          }}
        >
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent"></div>
        <div className="absolute top-1/4 right-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Sliding Gallery Section */}
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl -mt-8 relative z-10">
        <div 
          className={`bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden mb-12 transition-all duration-1000 transform ${
            animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          {/* Gallery Header */}
          <div className="p-6 md:p-8 border-b border-gray-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-bebas text-3xl md:text-4xl text-white mb-2">
                  Official Launch
                </h2>
                <p className="text-gray-300">
                  Relive the moments from our grand launch event at Centris Elements, Quezon City
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleSlideshow}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-all duration-300"
                    aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
                  >
                    {isPlaying ? (
                      <div className="w-5 h-5 border-2 border-white rounded flex items-center justify-center">
                        <div className="w-2 h-2 bg-white"></div>
                      </div>
                    ) : (
                      <Play className="w-5 h-5 text-white" />
                    )}
                  </button>
                  <span className="text-sm text-gray-400">
                    {isPlaying ? "Auto-playing" : "Paused"}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  {currentSlide + 1} / {galleryImages.length}
                </div>
              </div>
            </div>

            {/* Gallery Description */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <p className="text-gray-200 mb-2">
                <strong className="text-white">Federal Parts Philippines has officially arrived!</strong>
              </p>
              <p className="text-gray-300 text-sm">
                On January 30 at Centris Elements, Quezon City, we proudly celebrated the Official Brand Launch—marking the beginning of a new era for Filipino riders.
                The event brought together our dealers, media partners, and brand ambassadors, all united to welcome a brand built on:
               Japanese-leveled engineering • Indonesian DNA • China-level affordability
              </p>
            </div>
          </div>

          {/* Gallery Content */}
          <div className="relative p-4 md:p-6 bg-black">
            {/* Main Image */}
            <div className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden">
              {galleryImages.map((image, index) => (
                <div
                  key={image.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                  {/* Image Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-white text-lg md:text-xl font-medium">
                        {image.caption}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Navigation Buttons */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 border border-gray-700"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 border border-gray-700"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Thumbnail Strip */}
            <div className="mt-6 overflow-x-auto pb-2">
              <div className="flex gap-3 min-w-max px-2">
                {galleryImages.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => goToSlide(index)}
                    className={`flex-shrink-0 w-24 h-16 md:w-32 md:h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      index === currentSlide 
                        ? 'border-red-500 scale-105' 
                        : 'border-gray-700 hover:border-gray-500'
                    } hover:scale-105`}
                    aria-label={`Go to image ${index + 1}`}
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* News Hub Section */}
        <div className="text-center mb-12">
          <div 
            className={`inline-block px-6 py-3 bg-gray-900 rounded-2xl border border-gray-800 mb-6 transition-all duration-1000 transform ${
              animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <h3 className="font-bebas text-3xl md:text-4xl text-white">
              News & Updates Hub
            </h3>
          </div>
          <p 
            className={`text-gray-300 max-w-2xl mx-auto text-lg transition-all duration-1000 delay-300 transform ${
              animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            Stay updated with the latest news, announcements, and industry insights from Federal Parts Philippines
          </p>
        </div>

        {/* Category Filter */}
        <div 
          className={`flex flex-wrap gap-3 mb-8 justify-center transition-all duration-1000 delay-500 transform ${
            animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          {newsCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${
                activeCategory === category.id 
                  ? 'bg-white text-black border-white' 
                  : 'bg-gray-900 text-gray-300 border-gray-700 hover:border-gray-500 hover:text-white'
              } hover:scale-105 active:scale-95`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* News Grid */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {filteredNews.map((item, index) => (
            <div
              key={item.id}
              className={`bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden transition-all duration-700 transform hover:scale-[1.02] hover:border-gray-600 ${
                animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
              style={{
                transitionDelay: `${index * 100 + 600}ms`,
                animationDelay: `${index * 100 + 600}ms`
              }}
            >
              {/* News Header */}
              <div className="p-6 md:p-8 border-b border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${getTypeColor(item.type)}`}>
                      {getTypeIcon(item.type)}
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </span>
                  </div>
                  <button
                    onClick={() => shareNews(item.title)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-all duration-300 hover:scale-110"
                    aria-label="Share news"
                  >
                    <Share2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                
                <h2 className="font-bebas text-2xl md:text-3xl text-white mb-3">
                  {item.title}
                </h2>
                <p className="text-gray-300 mb-4">
                  {item.description}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {item.date}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {item.readTime}
                  </div>
                </div>
              </div>

              {/* Embed Container */}
              <div className="relative bg-gray-950 p-4">
                <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
                  <div 
                    className="absolute inset-0 rounded-lg overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: item.embed }}
                  />
                </div>
                <div className="absolute top-4 right-4">
                  <a
                    href="#"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-black/80 backdrop-blur-sm text-white text-xs rounded-lg border border-gray-700 hover:bg-black hover:border-gray-500 transition-all duration-300 hover:scale-105"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Facebook
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* News Footer */}
              <div className="p-4 md:p-6 bg-gray-900/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-xs font-bold">FP</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">Federal Parts PH</p>
                      <p className="text-xs text-gray-400">Official Page</p>
                    </div>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-gray-800 text-gray-300">
                    #{item.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Featured News Banner */}
        {filteredNews.length > 0 && (
          <div 
            className={`mt-12 bg-gradient-to-r from-gray-900 to-black rounded-2xl border border-gray-800 p-6 md:p-8 transition-all duration-1000 delay-1000 transform ${
              animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="font-bebas text-3xl md:text-4xl text-white mb-3">
                  Stay Connected
                </h3>
                <p className="text-gray-300 mb-4">
                  Follow us on Facebook for real-time updates, exclusive content, and special announcements about Indonesian motorcycle parts.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://www.facebook.com/FederalPartsPhilippines"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Follow on Facebook
                  </a>
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-200 text-black rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    Contact Sales Team
                  </a>
                </div>
              </div>
              <div className="md:w-1/3">
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-lg font-bold">FP</span>
                    </div>
                    <div>
                      <p className="font-bold text-white">Federal Parts PH</p>
                      <p className="text-sm text-gray-400">@FederalPartsPhilippines</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">
                    📍 Balagtas, Bulacan • 🏍️ Indonesian Parts • 📦 Bulk Orders Available
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Results Message */}
        {filteredNews.length === 0 && (
          <div 
            className={`text-center py-16 transition-all duration-1000 delay-500 transform ${
              animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center">
              <Newspaper className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="font-bebas text-3xl text-white mb-3">No News Available</h3>
            <p className="text-gray-300 max-w-md mx-auto">
              There are currently no news items in this category. Please check back later or select another category.
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .transition-all {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .delay-300 {
          animation-delay: 300ms;
          animation-name: fadeInUp;
          animation-duration: 800ms;
          animation-fill-mode: both;
        }
        
        .delay-500 {
          animation-delay: 500ms;
          animation-name: fadeInUp;
          animation-duration: 800ms;
          animation-fill-mode: both;
        }
        
        .delay-600 {
          animation-delay: 600ms;
          animation-name: fadeInUp;
          animation-duration: 800ms;
          animation-fill-mode: both;
        }
        
        .delay-700 {
          animation-delay: 700ms;
          animation-name: fadeInUp;
          animation-duration: 800ms;
          animation-fill-mode: both;
        }
        
        .delay-800 {
          animation-delay: 800ms;
          animation-name: fadeInUp;
          animation-duration: 800ms;
          animation-fill-mode: both;
        }
        
        .delay-900 {
          animation-delay: 900ms;
          animation-name: fadeInUp;
          animation-duration: 800ms;
          animation-fill-mode: both;
        }
        
        .delay-1000 {
          animation-delay: 1000ms;
          animation-name: fadeInUp;
          animation-duration: 800ms;
          animation-fill-mode: both;
        }
        
        iframe {
          width: 100% !important;
          height: 100% !important;
          min-height: 300px;
        }
      `}</style>
    </div>
  );
};

export default News;