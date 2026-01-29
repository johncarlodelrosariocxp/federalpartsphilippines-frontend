import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const About = () => {
  useEffect(() => {
    // Create Intersection Observer for scroll animations
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Add animation class when element is visible
          if (entry.target.classList.contains("fade-up")) {
            entry.target.classList.add("animate-fade-up");
          }
          if (entry.target.classList.contains("fade-in")) {
            entry.target.classList.add("animate-fade-in");
          }
          if (entry.target.classList.contains("scale-in")) {
            entry.target.classList.add("animate-scale-in");
          }
          if (entry.target.classList.contains("slide-left")) {
            entry.target.classList.add("animate-slide-left");
          }
          if (entry.target.classList.contains("slide-right")) {
            entry.target.classList.add("animate-slide-right");
          }
        }
      });
    }, observerOptions);

    // Observe all elements with animation classes
    document.querySelectorAll(".fade-up, .fade-in, .scale-in, .slide-left, .slide-right").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const values = [
    {
      title: "Quality Assurance",
      description:
        "Every part undergoes rigorous testing to ensure OEM-level quality and reliability standards.",
    },
    {
      title: "Partnership",
      description:
        "Strong collaboration between Indonesia and Philippines for seamless supply chain.",
    },
    {
      title: "Local Presence",
      description:
        "Established warehouse in Bulacan serving the entire Philippine market.",
    },
    {
      title: "Local Delivery",
      description:
        "Fast delivery across Luzon, Visayas, and Mindanao with strategic logistics partners.",
    },
    {
      title: "Market Focus",
      description:
        "Specialized in serving Philippine motorcycle enthusiasts and repair shops.",
    },
    {
      title: "Global Quality, Local Service",
      description:
        "Indonesian quality standards combined with Filipino customer service excellence.",
    },
  ];

  const partnershipBenefits = [
    {
      title: "Indonesian Manufacturing Expertise",
      description:
        "Leveraging Indonesia's world-class motorcycle parts manufacturing industry.",
    },
    {
      title: "Philippine Market Knowledge",
      description:
        "Deep understanding of Filipino riders' needs and local motorcycle culture.",
    },
    {
      title: "Competitive Pricing",
      description:
        "Direct factory-to-market pricing eliminating unnecessary middlemen.",
    },
    {
      title: "Technical Support",
      description:
        "Bilingual technical support team (Filipino-English) for product inquiries.",
    },
  ];

  return (
    <>
      <style>
        {`
          /* Animation Keyframes */
          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          @keyframes slideLeft {
            from {
              opacity: 0;
              transform: translateX(50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes slideRight {
            from {
              opacity: 0;
              transform: translateX(-50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          /* Animation Classes */
          .animate-fade-up {
            animation: fadeUp 0.8s ease-out forwards;
          }
          
          .animate-fade-in {
            animation: fadeIn 1s ease-out forwards;
          }
          
          .animate-scale-in {
            animation: scaleIn 0.7s ease-out forwards;
          }
          
          .animate-slide-left {
            animation: slideLeft 0.8s ease-out forwards;
          }
          
          .animate-slide-right {
            animation: slideRight 0.8s ease-out forwards;
          }
          
          /* Initial states for elements to be animated */
          .fade-up {
            opacity: 0;
          }
          
          .fade-in {
            opacity: 0;
          }
          
          .scale-in {
            opacity: 0;
            transform: scale(0.9);
          }
          
          .slide-left {
            opacity: 0;
            transform: translateX(50px);
          }
          
          .slide-right {
            opacity: 0;
            transform: translateX(-50px);
          }
          
          /* Stagger delay classes for sequential animations */
          .delay-100 {
            animation-delay: 100ms;
          }
          .delay-200 {
            animation-delay: 200ms;
          }
          .delay-300 {
            animation-delay: 300ms;
          }
          .delay-400 {
            animation-delay: 400ms;
          }
          .delay-500 {
            animation-delay: 500ms;
          }
        `}
      </style>
      
      <div className="min-h-screen bg-black text-gray-100">
        <div className="container-custom py-8 pt-30 md:pt-40">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="font-bebas text-5xl md:text-6xl mb-6 text-white fade-up">
              About Federal Parts Philippines
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto fade-up delay-100">
              The official Philippine partner of Indonesia's premier motorcycle
              parts manufacturer. Bringing world-class quality and reliability to
              Filipino riders since 2010.
            </p>
          </div>

          {/* Indonesia-Philippines Partnership Story */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 lg:order-1 fade-in">
              <div className="relative">
                <img
                  src="/newbanner/Gemini_Generated_Image_66pbb466pbb466pb.png"
                  alt="Indonesia-Philippines business partnership showcasing motorcycle parts collaboration"
                  className="rounded-2xl shadow-2xl border border-gray-800 w-full h-auto object-cover scale-in"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/40 to-transparent" />
                {/* Flags Badge - Using image files */}
                <div className="absolute bottom-6 right-6 flex gap-2 fade-up delay-300">
                  {/* Indonesia Flag */}
                  <div className="p-2 rounded-lg shadow-lg">
                    <img
                      src="/newbanner/OIP.jpg"
                      alt="Indonesia Flag"
                      className="w-12 h-8 object-cover rounded-sm"
                    />
                    <div className="text-xs text-white-700 text-center mt-1">
                      Indonesia
                    </div>
                  </div>
                  {/* Philippines Flag */}
                  <div className="p-2 rounded-lg shadow-lg">
                    <img
                      src="/newbanner/philippines-7554304_1280.png"
                      alt="Philippines Flag"
                      className="w-12 h-8 object-cover rounded-sm"
                    />
                    <div className="text-xs text-white-700 text-center mt-1">
                      Philippines
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="font-bebas text-4xl mb-6 text-white slide-left">
                Strategic Partnership
              </h2>
              <div className="space-y-4 text-gray-300">
                <p className="slide-left delay-100">
                  Federal Parts Philippines represents a successful collaboration
                  between Indonesia's leading motorcycle parts manufacturer and
                  Philippine automotive experts. This partnership combines
                  Indonesian manufacturing excellence with deep understanding of
                  the Philippine motorcycle market.
                </p>
                <p className="slide-left delay-200">
                  As the official Philippine partner, we ensure that every part
                  meets the stringent quality standards set by our Indonesian
                  principals while being tailored to suit local riding conditions
                  and preferences.
                </p>
                <p className="slide-left delay-300">
                  Our mission is to provide Filipino riders, mechanics, and
                  motorcycle enthusiasts with access to premium-quality parts that
                  offer exceptional value, reliability, and performance.
                </p>
              </div>
            </div>
          </div>

          {/* Partnership Benefits */}
          <div className="mb-20">
            <h2 className="font-bebas text-4xl mb-12 text-center text-white fade-up">
              Benefits of Our Partnership
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {partnershipBenefits.map((benefit, index) => (
                <div
                  key={index}
                  className="bg-gray-900 rounded-xl p-6 hover:shadow-2xl transition-all duration-300 border border-gray-800 hover:border-green-500/30 fade-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="font-bold text-lg text-white">
                      {benefit.title}
                    </h3>
                  </div>
                  <p className="text-gray-300">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Values */}
          <div className="mb-20">
            <h2 className="font-bebas text-4xl mb-12 text-center text-white fade-up">
              Our Core Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="bg-gray-900 rounded-xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-800 hover:border-blue-500/30 fade-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="font-bold text-lg text-white">
                      {value.title}
                    </h3>
                  </div>
                  <p className="text-gray-300">{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Philippine Warehouse Location */}
          <div className="mb-20">
            <h2 className="font-bebas text-4xl mb-12 text-center text-white fade-up">
              Our Philippine Distribution Center
            </h2>
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Map */}
              <div className="rounded-2xl overflow-hidden shadow-xl h-[400px] border border-gray-800 slide-right">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3856.4431363700674!2d120.91040347603536!3d14.856479270758955!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397ad00441cc14b%3A0xade40585e5114878!2sCXP%20MOTOZONE!5e0!3m2!1sen!2sph!4v1769656176739!5m2!1sen!2sph"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  title="CXP MOTOZONE - Balagtas, Bulacan"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale-50 contrast-125"
                ></iframe>
              </div>

              {/* Location Details */}
              <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 slide-left delay-100">
                <div className="flex items-center gap-3 mb-6">
                  <div>
                    <h3 className="font-bebas text-2xl text-white">
                      Bulacan Warehouse
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Main Distribution Center for Luzon
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4 fade-in delay-200">
                    <div>
                      <p className="font-semibold mb-1 text-white">Address</p>
                      <p className="text-gray-300">
                        CXP MOTOZONE, Balagtas, Bulacan, Philippines
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 fade-in delay-300">
                    <div>
                      <p className="font-semibold mb-1 text-white">
                        Philippine Contact
                      </p>
                      <p className="text-gray-300">09543827627 / 09171440541</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 fade-in delay-400">
                    <div>
                      <p className="font-semibold mb-1 text-white">Email</p>
                      <p className="text-gray-300">cxpmotozone@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 fade-in delay-500">
                    <div>
                      <p className="font-semibold mb-1 text-white">
                        Business Hours
                      </p>
                      <div className="text-gray-300 space-y-1">
                        <p>Monday - Saturday: 8:00 AM - 5:00 PM</p>
                        <p>Sunday: Closed</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-green-900/20 rounded-lg border border-green-800/30 fade-in">
                  <p className="text-sm text-green-200">
                    <span className="font-semibold">Note:</span> This is our main
                    Philippine distribution center. For dealer inquiries, bulk
                    orders, or partnership opportunities, please schedule an
                    appointment.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Partnership Call to Action */}
          <div className="text-center bg-gray-900 rounded-2xl p-8 md:p-12 border border-gray-800 fade-up">
            <h2 className="font-bebas text-4xl md:text-5xl mb-6 text-white">
              Interested in Becoming a Dealer?
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto mb-8 text-lg">
              We're expanding our dealer network across the Philippines. Partner
              with us to bring premium Indonesian motorcycle parts to your local
              market.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-300 text-lg border border-gray-700 scale-in delay-200"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;