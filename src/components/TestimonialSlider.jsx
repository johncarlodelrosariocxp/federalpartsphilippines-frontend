import React, { useState, useEffect } from "react";

// Using inline SVG icons as fallback if lucide-react has issues
const ChevronLeftIcon = () => (
  <svg
    className="w-6 h-6 text-white"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M15 19l-7-7 7-7"
    />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    className="w-6 h-6 text-white"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 5l7 7-7 7"
    />
  </svg>
);

const testimonials = [
  [
    {
      id: 1,
      name: "Alex R.",
      role: "Track Enthusiast",
      text: "Federal Parts' brake pads transformed my stopping power. Minimal fade and consistent performance lap after lap.",
      avatar:
        "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=64&h=64&fit=crop&crop=face",
    },
    {
      id: 2,
      name: "Sam K.",
      role: "Workshop Owner",
      text: "Their engine components are reliable and installed with perfect fitment every time. My go-to supplier.",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
    },
    {
      id: 3,
      name: "Maya T.",
      role: "Long-distance Rider",
      text: "The lithium battery is ultra-light and dependable. Perfect for my touring setup.",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b786d4d8?w=64&h=64&fit=crop&crop=face",
    },
  ],
  [
    {
      id: 4,
      name: "Diego P.",
      role: "Daily Commuter",
      text: "Fast delivery and great customer service. Federal Parts keeps my bike running flawlessly.",
      avatar:
        "https://images.unsplash.com/photo-1507591064344-4c6ce005-128?w=64&h=64&fit=crop&crop=face",
    },
    {
      id: 5,
      name: "Jenna L.",
      role: "Cafe Racer Builder",
      text: "Accessories are top-notch—clean design and durable. Elevates the bike's look instantly.",
      avatar:
        "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=64&h=64&fit=crop&crop=face",
    },
    {
      id: 6,
      name: "Ken I.",
      role: "Amateur Racer",
      text: "Chains and sprockets from Federal Parts are rock-solid. Smooth, efficient power transfer.",
      avatar:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=64&h=64&fit=crop&crop=face",
    },
  ],
];

const TestimonialSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  useEffect(() => {
    if (!isMounted) return;

    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isMounted]);

  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials[0].map((testimonial) => (
          <div
            key={testimonial.id}
            className="bg-gray-800 rounded-xl p-6 animate-pulse"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-700" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-700 rounded" />
                <div className="h-3 w-20 bg-gray-700 rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-gray-700 rounded" />
              <div className="h-3 w-3/4 bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {testimonials.map((slide, index) => (
            <div key={index} className="w-full flex-shrink-0 px-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {slide.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="bg-gray-800 rounded-xl p-6 hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-accent"
                        loading="lazy"
                      />
                      <div>
                        <h4 className="font-bold text-white">
                          {testimonial.name}
                        </h4>
                        <p className="text-accent text-sm">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-300 italic leading-relaxed">
                      "{testimonial.text}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={prevSlide}
          className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Previous testimonial"
        >
          <ChevronLeftIcon />
        </button>
        <button
          onClick={nextSlide}
          className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Next testimonial"
        >
          <ChevronRightIcon />
        </button>
      </div>

      <div className="flex justify-center gap-2 mt-6">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-accent w-8"
                : "bg-gray-600 hover:bg-gray-500"
            }`}
            aria-label={`Go to testimonial slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialSlider;
