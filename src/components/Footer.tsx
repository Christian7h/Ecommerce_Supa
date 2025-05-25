import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Mail,
  MapPin,
  Phone
} from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Products Column */}
          <div>
            <h5 className="font-bold text-lg mb-4 uppercase">Products</h5>
            <ul className="space-y-3">
              <li><Link to="/products?category=footwear" className="text-gray-300 hover:text-white transition-colors">Footwear</Link></li>
              <li><Link to="/products?category=clothing" className="text-gray-300 hover:text-white transition-colors">Clothing</Link></li>
              <li><Link to="/products?category=accessories" className="text-gray-300 hover:text-white transition-colors">Accessories</Link></li>
              <li><Link to="/products?category=outlet" className="text-gray-300 hover:text-white transition-colors">Outlet</Link></li>
              <li><Link to="/products?category=new-arrivals" className="text-gray-300 hover:text-white transition-colors">New Arrivals</Link></li>
            </ul>
          </div>
          
          {/* Sports Column */}
          <div>
            <h5 className="font-bold text-lg mb-4 uppercase">Sports</h5>
            <ul className="space-y-3">
              <li><Link to="/products?sport=running" className="text-gray-300 hover:text-white transition-colors">Running</Link></li>
              <li><Link to="/products?sport=football" className="text-gray-300 hover:text-white transition-colors">Football</Link></li>
              <li><Link to="/products?sport=basketball" className="text-gray-300 hover:text-white transition-colors">Basketball</Link></li>
              <li><Link to="/products?sport=training" className="text-gray-300 hover:text-white transition-colors">Training</Link></li>
              <li><Link to="/products?sport=outdoor" className="text-gray-300 hover:text-white transition-colors">Outdoor</Link></li>
            </ul>
          </div>
          
          {/* Company Column */}
          <div>
            <h5 className="font-bold text-lg mb-4 uppercase">Company</h5>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="text-gray-300 hover:text-white transition-colors">Careers</Link></li>
              <li><Link to="/press" className="text-gray-300 hover:text-white transition-colors">Press</Link></li>
              <li><Link to="/sustainability" className="text-gray-300 hover:text-white transition-colors">Sustainability</Link></li>
              <li><Link to="/affiliates" className="text-gray-300 hover:text-white transition-colors">Affiliates</Link></li>
            </ul>
          </div>
          
          {/* Support & Contact */}
          <div>
            <h5 className="font-bold text-lg mb-4 uppercase">Support</h5>
            <ul className="space-y-3">
              <li><Link to="/help" className="text-gray-300 hover:text-white transition-colors">Help</Link></li>
              <li><Link to="/shipping" className="text-gray-300 hover:text-white transition-colors">Shipping</Link></li>
              <li><Link to="/returns" className="text-gray-300 hover:text-white transition-colors">Returns</Link></li>
              <li><Link to="/size-charts" className="text-gray-300 hover:text-white transition-colors">Size Charts</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
            
            <h5 className="font-bold text-lg mt-6 mb-4 uppercase">Contact Us</h5>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Phone size={16} className="mr-2" />
                <span className="text-gray-300">+1 (800) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail size={16} className="mr-2" />
                <span className="text-gray-300">support@adidas.example.com</span>
              </li>
              <li className="flex items-start">
                <MapPin size={16} className="mr-2 mt-1" />
                <span className="text-gray-300">1234 Adidas Way, Portland, OR 97123, USA</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Social Media & Newsletter */}
        <div className="border-t border-gray-800 pt-8 pb-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-6 md:mb-0">
              <a href="https://facebook.com" className="text-gray-300 hover:text-white transition-colors" aria-label="Facebook">
                <Facebook size={24} />
              </a>
              <a href="https://twitter.com" className="text-gray-300 hover:text-white transition-colors" aria-label="Twitter">
                <Twitter size={24} />
              </a>
              <a href="https://instagram.com" className="text-gray-300 hover:text-white transition-colors" aria-label="Instagram">
                <Instagram size={24} />
              </a>
              <a href="https://youtube.com" className="text-gray-300 hover:text-white transition-colors" aria-label="Youtube">
                <Youtube size={24} />
              </a>
            </div>
            
            <div className="w-full md:w-auto">
              <form className="flex">
                <input 
                  type="email" 
                  placeholder="Sign up for our newsletter" 
                  className="px-4 py-2 w-full md:w-72 bg-gray-800 border border-gray-700 rounded-l-md focus:outline-none focus:ring-1 focus:ring-white text-white"
                />
                <button 
                  type="submit" 
                  className="bg-white text-black px-4 py-2 rounded-r-md font-medium hover:bg-gray-200 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
        
        {/* Copyright & Legal */}
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2025 Adidas Clone. All rights reserved. (This is a demo site)
          </div>
          
          <div className="flex flex-wrap justify-center space-x-4 text-sm text-gray-400">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/accessibility" className="hover:text-white transition-colors">Accessibility</Link>
            <Link to="/cookies" className="hover:text-white transition-colors">Cookie Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;