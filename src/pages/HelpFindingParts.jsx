// file location: src/pages/HelpFindingParts.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  HelpCircle,
  Search,
  Headphones,
  Shield,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  Wrench,
  ArrowRight,
  Clock,
  Users,
  Star,
  Bike, // Use Bike instead of Motorcycle
} from "lucide-react";

const HelpFindingParts = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    motorcycleMake: "",
    motorcycleModel: "",
    year: "",
    partType: "",
    description: "",
    preferredContact: "email",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setIsSubmitted(true);

    // Reset form after submission
    setTimeout(() => {
      setFormData({
        name: "",
        email: "",
        phone: "",
        motorcycleMake: "",
        motorcycleModel: "",
        year: "",
        partType: "",
        description: "",
        preferredContact: "email",
      });
      setIsSubmitted(false);
    }, 3000);
  };

  const motorcycleMakes = [
    "Honda",
    "Yamaha",
    "Suzuki",
    "Kawasaki",
    "Harley-Davidson",
    "Ducati",
    "BMW",
    "KTM",
    "Triumph",
    "Other",
  ];

  const partTypes = [
    "Engine Parts",
    "Brake System",
    "Suspension",
    "Electrical",
    "Exhaust",
    "Tires & Wheels",
    "Body & Frame",
    "Accessories",
    "Transmission",
    "Cooling System",
    "Fuel System",
    "Other",
  ];

  const contactMethods = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Live Chat",
      description: "Chat with our experts in real-time",
      action: "Start Chat",
      color: "bg-blue-500",
      link: "#chat",
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone Support",
      description: "Call us directly at 1-800-PARTS-NOW",
      action: "Call Now",
      color: "bg-green-500",
      link: "tel:18007278766",
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Support",
      description: "Send us your questions and photos",
      action: "Send Email",
      color: "bg-purple-500",
      link: "mailto:support@federalparts.com",
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Schedule Call",
      description: "Book a consultation at your convenience",
      action: "Schedule",
      color: "bg-orange-500",
      link: "#schedule",
    },
  ];

  const experts = [
    {
      name: "Mike Rodriguez",
      role: "Lead Technician",
      experience: "15+ years",
      specialty: "Engine & Performance",
      image:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
    },
    {
      name: "Sarah Chen",
      role: "Parts Specialist",
      experience: "12+ years",
      specialty: "Electrical & Brakes",
      image:
        "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop",
    },
    {
      name: "James Wilson",
      role: "Technical Advisor",
      experience: "20+ years",
      specialty: "Suspension & Tires",
      image:
        "https://images.unsplash.com/photo-1542740348-39501cd6e2b4?w=400&h=400&fit=crop",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-black/40"></div>
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=600&fit=crop"
            alt="Motorcycle parts"
            className="w-full h-full object-cover opacity-30"
          />
        </div>

        <div className="container-custom relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6">
              <HelpCircle className="w-12 h-12 text-red-500" />
              <h1 className="font-bebas text-5xl md:text-6xl text-white">
                NEED HELP FINDING PARTS?
              </h1>
            </div>

            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Our expert team is ready to help you find the exact parts you need
              for your motorcycle. Get personalized recommendations and
              technical support to ensure perfect fit and optimal performance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact-form"
                className="btn-primary bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-lg flex items-center gap-3 justify-center"
              >
                <Headphones className="w-5 h-5" />
                Contact Support
              </a>
              <Link
                to="/shop"
                className="btn-secondary border-2 border-gray-700 hover:border-red-600 text-white hover:text-red-600 px-8 py-4 rounded-lg font-bold text-lg text-center"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-gray-900">
        <div className="container-custom max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800 rounded-xl p-8 text-center hover:bg-gray-700 transition-colors duration-300">
              <div className="bg-red-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Expert Recommendations
              </h3>
              <p className="text-gray-400">
                Get personalized part suggestions based on your motorcycle model
                and needs
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-8 text-center hover:bg-gray-700 transition-colors duration-300">
              <div className="bg-red-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Headphones className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Technical Support
              </h3>
              <p className="text-gray-400">
                24/7 assistance from certified motorcycle technicians
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-8 text-center hover:bg-gray-700 transition-colors duration-300">
              <div className="bg-red-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Quality Assurance
              </h3>
              <p className="text-gray-400">
                All parts verified for compatibility and performance
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="py-20 px-4">
        <div className="container-custom max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-bebas text-4xl text-white mb-6">
              Get Personalized Assistance
            </h2>
            <p className="text-gray-400 text-lg">
              Fill out the form below and our experts will help you find the
              perfect parts
            </p>
          </div>

          {isSubmitted ? (
            <div className="bg-green-900/30 border border-green-500 rounded-xl p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">
                Request Submitted!
              </h3>
              <p className="text-gray-300 mb-6">
                Thank you for your inquiry. Our expert team will contact you
                within 24 hours with personalized recommendations for your
                motorcycle parts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/shop"
                  className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Continue Shopping
                </Link>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Submit Another Request
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <Users className="w-6 h-6 text-red-500" />
                    Your Information
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-gray-400 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none"
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none"
                        placeholder="(123) 456-7890"
                      />
                    </div>
                  </div>
                </div>

                {/* Motorcycle Information */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <Bike className="w-6 h-6 text-red-500" />{" "}
                    {/* Changed from Motorcycle to Bike */}
                    Motorcycle Details
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-gray-400 mb-2">Make *</label>
                      <select
                        name="motorcycleMake"
                        value={formData.motorcycleMake}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none"
                      >
                        <option value="">Select Make</option>
                        {motorcycleMakes.map((make) => (
                          <option key={make} value={make}>
                            {make}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-2">
                        Model *
                      </label>
                      <input
                        type="text"
                        name="motorcycleModel"
                        value={formData.motorcycleModel}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none"
                        placeholder="e.g., CBR600RR"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-2">Year *</label>
                      <input
                        type="number"
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        required
                        min="1900"
                        max="2024"
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none"
                        placeholder="2023"
                      />
                    </div>
                  </div>
                </div>

                {/* Part Information */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <Wrench className="w-6 h-6 text-red-500" />
                    Part Information
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-400 mb-2">
                        Part Type *
                      </label>
                      <select
                        name="partType"
                        value={formData.partType}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none"
                      >
                        <option value="">Select Part Type</option>
                        {partTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-2">
                        Describe What You Need *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows="4"
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none resize-none"
                        placeholder="Describe the part you need, any symptoms/issues, and any specific requirements..."
                      />
                    </div>
                  </div>
                </div>

                {/* Preferred Contact Method */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <Headphones className="w-6 h-6 text-red-500" />
                    Preferred Contact Method
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {["Email", "Phone", "Text", "Any"].map((method) => (
                      <label
                        key={method}
                        className={`flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.preferredContact === method.toLowerCase()
                            ? "border-red-500 bg-red-500/10"
                            : "border-gray-700 bg-gray-900 hover:border-gray-600"
                        }`}
                      >
                        <input
                          type="radio"
                          name="preferredContact"
                          value={method.toLowerCase()}
                          checked={
                            formData.preferredContact === method.toLowerCase()
                          }
                          onChange={handleInputChange}
                          className="hidden"
                        />
                        <span className="text-white font-medium">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Submit Request to Our Experts
                  </button>
                  <p className="text-gray-500 text-sm text-center mt-4">
                    By submitting, you agree to our Terms of Service and Privacy
                    Policy. Our team typically responds within 2-4 hours during
                    business hours.
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Expert Team Section */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="container-custom max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-bebas text-4xl text-white mb-6">
              Meet Our Expert Team
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Our certified technicians have decades of combined experience
              helping riders find the perfect parts
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {experts.map((expert, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-xl overflow-hidden hover:transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={expert.image}
                    alt={expert.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {expert.name}
                      </h3>
                      <p className="text-red-500">{expert.role}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-4 h-4 text-yellow-500 fill-current"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">
                        {expert.experience} experience
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">
                        Specialty: {expert.specialty}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Contact Methods */}
      <section className="py-16 px-4">
        <div className="container-custom max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-bebas text-4xl text-white mb-6">
              Quick Contact Options
            </h2>
            <p className="text-gray-400">
              Need immediate assistance? Choose your preferred contact method
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.link}
                className="bg-gray-800 rounded-xl p-6 text-center hover:bg-gray-700 transition-all duration-300 group"
              >
                <div
                  className={`${method.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  {method.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {method.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {method.description}
                </p>
                <div className="inline-flex items-center gap-2 text-red-500 font-semibold group-hover:gap-3 transition-all">
                  {method.action}
                  <ArrowRight className="w-4 h-4" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-4">
        <div className="container-custom max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-red-900/40 to-gray-900 rounded-2xl p-8 text-center">
            <h2 className="font-bebas text-3xl md:text-4xl text-white mb-6">
              EXPERT ASSISTANCE AVAILABLE
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Chat with our specialists now for immediate help finding your
              motorcycle parts
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact-form"
                className="bg-white hover:bg-gray-100 text-red-600 px-8 py-4 rounded-lg font-bold text-lg flex items-center gap-3 justify-center"
              >
                <MessageSquare className="w-5 h-5" />
                Start Live Chat
              </a>
              <a
                href="tel:18007278766"
                className="bg-transparent border-2 border-white hover:bg-white hover:text-red-600 text-white px-8 py-4 rounded-lg font-bold text-lg flex items-center gap-3 justify-center"
              >
                <Phone className="w-5 h-5" />
                Call Now: 1-800-PARTS-NOW
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpFindingParts;
