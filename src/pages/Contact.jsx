import React, { useState } from "react";
import { Phone, Mail, MapPin, Send, Clock, MessageSquare } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    topic: "",
    message: "",
    newsletter: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setFormData({
      name: "",
      email: "",
      phone: "",
      topic: "",
      message: "",
      newsletter: false,
    });
    alert("Message sent successfully!");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      detail: "+63 (44) 123-4567",
      description: "Mon-Sat 8AM-5PM PHT",
      additional: "Globe: +63 917 123 4567",
    },
    {
      icon: Mail,
      title: "Email",
      detail: "ph.office@federalparts.com",
      description: "Response within 24 hours",
      additional: "inquiries@federalparts.ph",
    },
    {
      icon: MapPin,
      title: "Location",
      detail: "Fochun Warehouse",
      description: "Balagtas, Bulacan, Philippines",
    },
    {
      icon: Clock,
      title: "Business Hours",
      detail: "Monday - Saturday",
      description: "8:00 AM - 5:00 PM",
      additional: "Sunday: Closed",
    },
  ];

  const topics = [
    "General Inquiry",
    "Product Information",
    "Dealer Partnership",
    "Technical Specifications",
    "Pricing Inquiry",
    "Bulk Order Request",
    "Warehouse Visit Request",
    "Other",
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 pt-24 md:pt-32">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        <div className="text-center mb-16">
          <h1 className="font-bebas text-5xl md:text-6xl mb-4 text-white">
            Contact Federal Parts PH
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Interested in our products or becoming a dealer? Contact our
            Philippine office for inquiries about Indonesian motorcycle parts
            distribution.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Contact Information Sidebar */}
          <div>
            <div className="bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-700 mb-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h2 className="font-bebas text-3xl text-white">
                  Philippine Office
                </h2>
              </div>

              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-3 hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-800/30">
                      <info.icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">
                        {info.title}
                      </h3>
                      <p className="text-blue-300 font-medium">{info.detail}</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {info.description}
                      </p>
                      {info.additional && (
                        <p className="text-gray-500 text-xs mt-1">
                          {info.additional}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-700">
              <h2 className="font-bebas text-3xl text-white mb-2">
                Send Us a Message
              </h2>
              <p className="text-gray-400 mb-8">
                Fill out the form below and our team will get back to you.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white placeholder-gray-400"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white placeholder-gray-400"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white placeholder-gray-400"
                      placeholder="+63 912 345 6789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">
                      Inquiry Type *
                    </label>
                    <select
                      name="topic"
                      value={formData.topic}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white"
                    >
                      <option value="" className="bg-gray-800">
                        Select inquiry type
                      </option>
                      {topics.map((topic, index) => (
                        <option
                          key={index}
                          value={topic}
                          className="bg-gray-800"
                        >
                          {topic}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white placeholder-gray-400"
                    placeholder="Tell us about your inquiry or partnership interest..."
                  />
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                  <input
                    type="checkbox"
                    name="newsletter"
                    id="newsletter"
                    checked={formData.newsletter}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500 mt-1 bg-gray-600 border-gray-500"
                  />
                  <div>
                    <label
                      htmlFor="newsletter"
                      className="text-sm text-white cursor-pointer"
                    >
                      Subscribe to updates about new products and dealer
                      opportunities
                    </label>
                    <p className="text-gray-400 text-xs mt-1">
                      Receive monthly updates about our latest products from
                      Indonesia and special offers for dealers.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 text-lg"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
