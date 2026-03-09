import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, MapPin, Phone, Mail, Clock, Heart } from 'lucide-react';
import FooterImg from "../assets/footer-bg.png"

function Footer() {
  return (
    <footer
      className="bg-gray-900 text-white relative overflow-hidden"
      style={{
        backgroundImage: `url(${FooterImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold text-[#ffbe00] mb-4">ProWell</h3>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Your trusted source for premium gym supplements. From protein powders to pre-workouts, we help you achieve your fitness goals.
            </p>
            <div className="flex space-x-4 mt-6">
              {[
                { icon: <Facebook className="w-5 h-5" />, name: 'facebook' },
                { icon: <Twitter className="w-5 h-5" />, name: 'twitter' },
                { icon: <Instagram className="w-5 h-5" />, name: 'instagram' },
                { icon: <Youtube className="w-5 h-5" />, name: 'youtube' }
              ].map((platform) => (
                <a
                  key={platform.name}
                  href="#"
                  className="w-10 h-10 bg-[#ffbe00] bg-opacity-20 rounded-full flex items-center justify-center text-black transition-all duration-300"
                >
                  <span className="sr-only">{platform.name}</span>
                  {platform.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-[#ffbe00] mb-4 pb-2 border-b border-[#ffbe00] inline-block">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {['Shop', 'About Us', 'Contact', 'My Account', 'Help & Support'].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-[#ffbe00] transition-colors duration-200 flex items-center group"
                  >
                    <span className="w-3 h-3 text-[#ffbe00] mr-2 opacity-0 group-hover:opacity-100 transition-opacity">›</span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-[#ffbe00] mb-4 pb-2 border-b border-[#ffbe00] inline-block">
              Contact Info
            </h4>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-[#ffbe00] mt-0.5 flex-shrink-0" />
                <span>123 Fitness Avenue, Gym District, Muscle City, MC 56789</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-[#ffbe00] flex-shrink-0" />
                <span>+91 7907770534</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-[#ffbe00] flex-shrink-0" />
                <span>support@prowell.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-[#ffbe00] flex-shrink-0" />
                <span>Mon - Sun: 6:00 AM - 10:00 PM</span>
              </div>
              <div className="flex items-center space-x-3 text-[#ffbe00] font-semibold mt-4">
                <Heart className="w-5 h-5 flex-shrink-0" />
                <span>Always Open for Your Fitness!</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-lg font-semibold text-[#ffbe00] mb-4 pb-2 border-b border-[#ffbe00] inline-block">
              Our Services
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {[
                { text: 'Premium Supplements', desc: 'Protein, Creatine, Pre-Workout' },
                { text: 'Fast Delivery', desc: 'Get it within 2-3 days' },
                { text: 'Secure Payment', desc: '100% safe & trusted' },
                { text: 'Expert Advice', desc: 'Fitness guidance included' }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 bg-transparent bg-opacity-50 p-3 rounded-lg border border-gray-700 hover:border-[#ffbe00] transition-all duration-300 group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{feature.icon}</span>
                  <div>
                    <div className="text-[#ffbe00] font-semibold">{feature.text}</div>
                    <div className="text-gray-400 text-sm">{feature.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="bg-transparent bg-opacity-50 rounded-lg p-6 mb-8 border border-[#ffbe00] border-opacity-30">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h4 className="text-xl font-bold text-[#ffbe00] mb-2">Stay Updated</h4>
              <p className="text-gray-300">Get the latest deals on supplements delivered to your inbox</p>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-3 rounded-l-lg w-full md:w-64 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ffbe00]"
              />
              <button className="bg-[#ffbe00] text-white font-semibold px-6 py-3 rounded-r-lg hover:bg-[#e6ab00] transition-colors duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-700 my-8"></div>
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap justify-center md:justify-start space-x-6 text-sm">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((link) => (
              <a key={link} href="#" className="text-gray-400 hover:text-[#ffbe00] transition-colors duration-200">
                {link}
              </a>
            ))}
          </div>
          <div className="text-center md:text-right">
            <p className="text-gray-400 text-sm">
              © 2024 ProWell. All rights reserved. | Made for fitness enthusiasts
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
