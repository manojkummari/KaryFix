import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaClock, 
  FaUserCog, 
  FaRecycle, 
  FaMobileAlt, 
  FaCar, 
  FaBlender, 
  FaCogs, 
  FaTshirt, 
  FaLeaf, 
  FaBolt, 
  FaRobot, 
  FaMoneyBillWave,
  FaArrowRight,
  FaCheckCircle,
  FaQuestionCircle,
  FaChevronDown,
  FaChevronUp,
  FaTools,
  FaTruck,
  FaHome,
  FaGraduationCap
} from 'react-icons/fa';

const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans selection:bg-yellow-500 selection:text-black">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-neutral-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                KaryFix
              </span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-6">
                <a href="#about" className="hover:text-yellow-400 text-sm font-medium transition-colors">About</a>
                <a href="#services" className="hover:text-yellow-400 text-sm font-medium transition-colors">Services</a>
                <a href="#how-it-works" className="hover:text-yellow-400 text-sm font-medium transition-colors">How it Works</a>
                <a href="#faq" className="hover:text-yellow-400 text-sm font-medium transition-colors">FAQ</a>
                <Link to="/login" className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-md text-sm font-bold transition-transform hover:scale-105">
                  Login / Register
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-sm font-semibold tracking-wide">
            🚀 Revolutionizing Service Delivery in India
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Your All-in-One Solution for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Daily Life Hassles</span>
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-xl text-neutral-400 leading-relaxed">
            From <strong>Electronics Repair</strong> to <strong>Waste Management</strong>, we bridge the gap between reliable technicians and your doorstep. 
            Experience convenience, speed, and premium quality with KaryFix.
          </p>
          <div className="mt-10 flex justify-center gap-4 flex-wrap">
            <Link to="/register" className="px-8 py-4 bg-yellow-500 text-black font-bold rounded-full text-lg hover:bg-yellow-400 transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] flex items-center gap-2">
              Book a Service <FaArrowRight />
            </Link>
            <a href="#services" className="px-8 py-4 border border-white/20 hover:bg-white/5 rounded-full text-lg font-medium transition-all group">
              View All Services
            </a>
          </div>
        </div>
        
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10 opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/30 rounded-full blur-3xl mix-blend-screen"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl mix-blend-screen"></div>
        </div>
      </div>

       {/* Stats Section */}
       <div className="py-10 bg-neutral-800/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-yellow-500 mb-1">11+</div>
              <div className="text-sm text-neutral-400 uppercase tracking-widest">Service Categories</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-500 mb-1">24/7</div>
              <div className="text-sm text-neutral-400 uppercase tracking-widest">Emergency Support</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-1">100%</div>
              <div className="text-sm text-neutral-400 uppercase tracking-widest">Verified Experts</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-1">₹0</div>
              <div className="text-sm text-neutral-400 uppercase tracking-widest">Booking Fee</div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="py-20 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">About KaryFix</h2>
              <div className="h-1 w-20 bg-yellow-500 mb-8 rounded-full"></div>
              <p className="text-neutral-400 text-lg mb-6 leading-relaxed">
                In today's fast-paced world, managing daily tasks efficiently is crucial. KaryFix is an innovative mobile application designed to streamline service delivery across various sectors.
              </p>
              <p className="text-neutral-400 text-lg mb-8 leading-relaxed">
                We solve the problem of fragmented service delivery by integrating electronics repair, vehicle maintenance, laundry, tailoring, and sustainable waste management into a single, cohesive platform.
              </p>
              <ul className="space-y-4">
                {[
                  "Empowering local service providers",
                  "Promotes sustainability via waste recycling",
                  "Immediate assistance for urgent repairs"
                ].map((item, i) => (
                  <li key={i} className="flex items-center text-neutral-300">
                    <FaCheckCircle className="text-yellow-500 mr-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-800 p-6 rounded-2xl transform translate-y-8 border border-white/5 hover:border-yellow-500/30 transition-all">
                <FaUserCog className="text-4xl text-yellow-500 mb-4" />
                <h3 className="font-bold text-lg">Skilled Pros</h3>
                <p className="text-sm text-neutral-400 mt-2">Verified technicians for every job type.</p>
              </div>
              <div className="bg-neutral-800 p-6 rounded-2xl border border-white/5 hover:border-yellow-500/30 transition-all">
                 <FaClock className="text-4xl text-yellow-500 mb-4" />
                <h3 className="font-bold text-lg">Right on Time</h3>
                <p className="text-sm text-neutral-400 mt-2">Live tracking and punctual service delivery.</p>
              </div>
              <div className="bg-neutral-800 p-6 rounded-2xl transform translate-y-8 border border-white/5 hover:border-yellow-500/30 transition-all">
                 <FaMoneyBillWave className="text-4xl text-yellow-500 mb-4" />
                <h3 className="font-bold text-lg">Best Rates</h3>
                <p className="text-sm text-neutral-400 mt-2">Transparent pricing providing value for money.</p>
              </div>
              <div className="bg-neutral-800 p-6 rounded-2xl border border-white/5 hover:border-yellow-500/30 transition-all">
                 <FaRecycle className="text-4xl text-yellow-500 mb-4" />
                <h3 className="font-bold text-lg">Eco-Friendly</h3>
                <p className="text-sm text-neutral-400 mt-2">Recycle waste and earn credits for services.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="py-20 bg-neutral-800/30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-neutral-400 max-w-xl mx-auto">Get your tasks done in three simple steps. We make it effortless.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line for Desktop */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-yellow-500/20 -z-10"></div>

            <div className="text-center relative">
              <div className="w-24 h-24 bg-neutral-900 border-2 border-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Book a Service</h3>
              <p className="text-neutral-400 px-4">Choose from our wide range of services, select a time slot, or request immediate emergency assistance.</p>
            </div>

            <div className="text-center relative">
               <div className="w-24 h-24 bg-neutral-900 border-2 border-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Track & Relax</h3>
              <p className="text-neutral-400 px-4">Track your technician in real-time. Our professionals arrive equipped to handle the job efficiently.</p>
            </div>

            <div className="text-center relative">
               <div className="w-24 h-24 bg-neutral-900 border-2 border-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Pay & Rate</h3>
              <p className="text-neutral-400 px-4">Pay securely via the app, or use your Wallet credits earned from selling waste. Rate your experience.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Services Section */}
      <div id="services" className="py-20 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Comprehensive Services</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">We cover everything from your kitchen to your driveway.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Category 1 */}
            <div className="bg-neutral-800/40 rounded-xl p-6 border border-white/5 hover:border-yellow-500/50 transition-all hover:bg-neutral-800/60 group">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center text-2xl group-hover:bg-blue-500/20 transition-colors">
                  <FaMobileAlt />
                </div>
                <h3 className="text-xl font-bold ml-4">Electronics</h3>
              </div>
              <ul className="space-y-3 text-sm text-neutral-400">
                <li className="flex items-center"><span className="w-1 h-1 bg-neutral-500 rounded-full mr-2"></span>Mobile Screen & Battery Replacement</li>
                <li className="flex items-center"><span className="w-1 h-1 bg-neutral-500 rounded-full mr-2"></span>TV Display & Motherboard Repair</li>
                <li className="flex items-center"><span className="w-1 h-1 bg-neutral-500 rounded-full mr-2"></span>Laptop Upgrade (RAM/SSD)</li>
                <li className="flex items-center"><span className="w-1 h-1 bg-neutral-500 rounded-full mr-2"></span>Gaming Console Repair</li>
              </ul>
            </div>

            {/* Category 2 */}
            <div className="bg-neutral-800/40 rounded-xl p-6 border border-white/5 hover:border-yellow-500/50 transition-all hover:bg-neutral-800/60 group">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center text-2xl group-hover:bg-red-500/20 transition-colors">
                  <FaCar />
                </div>
                <h3 className="text-xl font-bold ml-4">Vehicles</h3>
              </div>
              <ul className="space-y-3 text-sm text-neutral-400">
                <li className="flex items-center"><span className="w-1 h-1 bg-neutral-500 rounded-full mr-2"></span>Bike & Car General Service</li>
                <li className="flex items-center"><span className="w-1 h-1 bg-neutral-500 rounded-full mr-2"></span>Roadside Breakdown Assistance</li>
                <li className="flex items-center"><span className="w-1 h-1 bg-neutral-500 rounded-full mr-2"></span>EV Battery & Motor Repair</li>
                <li className="flex items-center"><span className="w-1 h-1 bg-neutral-500 rounded-full mr-2"></span>Heavy Truck Repair on Highways</li>
              </ul>
            </div>

            {/* Category 3 */}
            <div className="bg-neutral-800/40 rounded-xl p-6 border border-white/5 hover:border-yellow-500/50 transition-all hover:bg-neutral-800/60 group">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center text-2xl group-hover:bg-orange-500/20 transition-colors">
                  <FaBlender />
                </div>
                <h3 className="text-xl font-bold ml-4">Kitchen</h3>
              </div>
              <ul className="space-y-3 text-sm text-neutral-400">
                <li className="flex items-center"><span className="w-1 h-1 bg-neutral-500 rounded-full mr-2"></span>Refrigerator & Microwave Fixes</li>
                <li className="flex items-center"><span className="w-1 h-1 bg-neutral-500 rounded-full mr-2"></span>Mixer, Toaster & Kettle Repair</li>
                <li className="flex items-center"><span className="w-1 h-1 bg-neutral-500 rounded-full mr-2"></span>Water Purifier Service</li>
                <li className="flex items-center"><span className="w-1 h-1 bg-neutral-500 rounded-full mr-2"></span>Dishwasher Installation</li>
              </ul>
            </div>

            {/* Category 4 */}
            <div className="bg-neutral-800/40 rounded-xl p-6 border border-white/5 hover:border-yellow-500/50 transition-all hover:bg-neutral-800/60 group">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center text-2xl group-hover:bg-purple-500/20 transition-colors">
                  <FaTshirt />
                </div>
                <h3 className="text-xl font-bold ml-4">Lifestyle</h3>
              </div>
               <ul className="space-y-3 text-sm text-neutral-400">
                <li className="flex items-center"><span className="w-1 h-1 bg-neutral-500 rounded-full mr-2"></span>Premium Laundry & Dry Cleaning</li>
                <li className="flex items-center"><span className="w-1 h-1 bg-neutral-500 rounded-full mr-2"></span>Doorstep Custom Tailoring</li>
                <li className="flex items-center"><span className="w-1 h-1 bg-neutral-500 rounded-full mr-2"></span>Maggam Work & Embroidery</li>
                <li className="flex items-center"><span className="w-1 h-1 bg-neutral-500 rounded-full mr-2"></span>Interior Design Consultation</li>
              </ul>
            </div>

            {/* Category 5 */}
             <div className="bg-neutral-800/40 rounded-xl p-6 border border-white/5 hover:border-yellow-500/50 transition-all hover:bg-neutral-800/60 group">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center text-2xl group-hover:bg-green-500/20 transition-colors">
                  <FaLeaf />
                </div>
                <h3 className="text-xl font-bold ml-4">Waste Mgmt</h3>
              </div>
               <ul className="space-y-3 text-sm text-neutral-400">
                <li className="flex items-center"><span className="w-1 h-1 bg-neutral-500 rounded-full mr-2"></span>Sell Paper, Plastic, Metal</li>
                <li className="flex items-center"><span className="w-1 h-1 bg-neutral-500 rounded-full mr-2"></span>Dispose E-Waste Responsibly</li>
                <li className="flex items-center"><span className="w-1 h-1 bg-neutral-500 rounded-full mr-2"></span>Earn Wallet Credits instantly</li>
                <li className="flex items-center"><span className="w-1 h-1 bg-neutral-500 rounded-full mr-2"></span>Promote Circular Economy</li>
              </ul>
            </div>

            {/* Category 6 */}
             <div className="bg-neutral-800/40 rounded-xl p-6 border border-white/5 hover:border-yellow-500/50 transition-all hover:bg-neutral-800/60 group">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-lg bg-pink-500/10 text-pink-500 flex items-center justify-center text-2xl group-hover:bg-pink-500/20 transition-colors">
                  <FaGraduationCap />
                </div>
                <h3 className="text-xl font-bold ml-4">Support</h3>
              </div>
               <ul className="space-y-3 text-sm text-neutral-400">
                <li className="flex items-center"><span className="w-1 h-1 bg-neutral-500 rounded-full mr-2"></span>Student Pickup/Drop Services</li>
                <li className="flex items-center"><span className="w-1 h-1 bg-neutral-500 rounded-full mr-2"></span>On-Demand Printing & Xerox</li>
                <li className="flex items-center"><span className="w-1 h-1 bg-neutral-500 rounded-full mr-2"></span>Project Binding & Lamination</li>
                <li className="flex items-center"><span className="w-1 h-1 bg-neutral-500 rounded-full mr-2"></span>Construction Material Logistics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

       {/* FAQ Section */}
       <div id="faq" className="py-20 bg-neutral-800/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <div className="h-1 w-20 bg-yellow-500 mx-auto rounded-full"></div>
          </div>

          <div className="space-y-4">
            {[
              { q: "How does the 'Waste-to-Wallet' feature work?", a: "It's simple! You schedule a pickup for your recyclable waste (paper, metal, plastic). Our collection partner weighs it and credits the equivalent amount to your KaryFix wallet, which you can use to pay for other services." },
              { q: "How quickly can I get emergency vehicle assistance?", a: "We prioritize emergency requests like breakdowns. Typically, a technician is dispatched immediately and you can track their location in real-time. Times vary by location but we strive for under 30 minutes." },
              { q: "Are your technicians verified?", a: "Yes, 100%. All our service providers undergo a background check and skill assessment before joining KaryFix to ensure safety and quality work." },
              { q: "Do you offer warranty on repairs?", a: "Most of our repairs come with a service warranty ranging from 7 to 30 days depending on the service type. Specific parts may have their own manufacturer warranties." },
              { q: "Can I book a tailored outfit online?", a: "Absolutely. You can choose designs, input measurements, and even request a home visit for measurements. The final stitched outfit is delivered to your doorstep." }
            ].map((item, idx) => (
              <div key={idx} className="bg-neutral-900 border border-white/5 rounded-lg overflow-hidden">
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-neutral-800/50 transition-colors"
                >
                  <span className="font-semibold text-neutral-200">{item.q}</span>
                  {openFaq === idx ? <FaChevronUp className="text-yellow-500" /> : <FaChevronDown className="text-neutral-500" />}
                </button>
                {openFaq === idx && (
                  <div className="px-6 py-4 text-neutral-400 border-t border-white/5 bg-neutral-800/20">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <footer className="bg-neutral-900 border-t border-white/10 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to experience the future of service?</h2>
          <p className="text-neutral-400 mb-10 max-w-xl mx-auto">Join thousands of satisfied customers and skilled professionals on KaryFix today.</p>
           <Link to="/register" className="px-10 py-4 bg-white text-black font-bold rounded-full text-lg hover:bg-gray-200 transition-all flex items-center gap-2 mx-auto w-fit">
              Join KaryFix Now <FaArrowRight />
            </Link>
            
            <div className="mt-20 border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-neutral-500 text-sm">
              <p>&copy; 2024 KaryFix. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-white">Privacy Policy</a>
                <a href="#" className="hover:text-white">Terms of Service</a>
                <a href="#" className="hover:text-white">Contact Us</a>
              </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
