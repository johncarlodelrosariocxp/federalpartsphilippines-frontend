import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#cc0000] text-white pt-12 pb-12">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg">
                <img
                  src="/federal-parts-logo-white.svg"
                  alt="Federal Parts Logo"
                  className="h-16 w-auto object-contain"
                  onError={(e) => {
                    console.error("Logo failed to load, using fallback");
                    e.target.style.display = "none";
                    const fallback = document.createElement("div");
                    fallback.className =
                      "font-bebas text-3xl tracking-wider text-white";
                    fallback.textContent = "Federal Parts";
                    e.target.parentNode.appendChild(fallback);
                  }}
                />
              </div>
            </div>
            <p className="text-gray-100 text-sm max-w-md">
              Your trusted source for premium motorcycle spare parts and
              accessories. We deliver OEM-grade components with nationwide
              shipping and expert support.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mt-4">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-white flex-shrink-0" />
                <span className="text-gray-100 text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-white flex-shrink-0" />
                <span className="text-gray-100 text-sm">
                  support@federalparts.com
                </span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-white flex-shrink-0" />
                <span className="text-gray-100 text-sm">
                  Fochun Warehouse, Balagtas, Bulacan, Philippines
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links - Updated to match Header navigation */}
          <div>
            <h3 className="font-bebas text-xl mb-6 text-white border-b border-red-800 pb-2">
              Quick Links
            </h3>
            <div className="space-y-3">
              <Link
                to="/"
                className="block text-gray-100 hover:text-white transition-all duration-300 text-sm hover:translate-x-1 flex items-center gap-2 group"
              >
                <span className="w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Home
              </Link>
              <Link
                to="/shop"
                className="block text-gray-100 hover:text-white transition-all duration-300 text-sm hover:translate-x-1 flex items-center gap-2 group"
              >
                <span className="w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Shop All Products
              </Link>
              <Link
                to="/categories"
                className="block text-gray-100 hover:text-white transition-all duration-300 text-sm hover:translate-x-1 flex items-center gap-2 group"
              >
                <span className="w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Categories
              </Link>
              <Link
                to="/about"
                className="block text-gray-100 hover:text-white transition-all duration-300 text-sm hover:translate-x-1 flex items-center gap-2 group"
              >
                <span className="w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                About Us
              </Link>
              <Link
                to="/contact"
                className="block text-gray-100 hover:text-white transition-all duration-300 text-sm hover:translate-x-1 flex items-center gap-2 group"
              >
                <span className="w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Contact Us
              </Link>
            </div>
          </div>

          {/* Facebook Section */}
          <div>
            <h3 className="font-bebas text-xl mb-6 text-white border-b border-red-800 pb-2">
              Connect With Us
            </h3>

            <div className="mb-6">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 p-4 bg-red-800 rounded-lg hover:bg-red-900 transition-all duration-300 hover:scale-105 w-full justify-center group"
                aria-label="Visit our Facebook page"
              >
                <Facebook className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Follow on Facebook</span>
              </a>
            </div>

           
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-red-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <span className="text-gray-100 text-sm">
                © {currentYear} Federal Parts. All rights reserved.
              </span>
              <p className="text-gray-200 text-xs mt-1">
                Premium Motorcycle Parts & Accessories
              </p>
            </div>
            
           
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;