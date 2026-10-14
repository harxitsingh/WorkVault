import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Globe, MessageCircle, Mail, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1 */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <Briefcase className="h-8 w-8 text-indigo-400" />
              <span className="text-xl font-bold tracking-tight">WorkVault</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              The trusted freelance marketplace connecting top Indian talent with businesses worldwide. Secure, transparent, and built for success.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Website">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
                <ExternalLink className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Community">
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Email">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase mb-4 text-gray-200">Platform</h3>
            <ul className="space-y-3">
              <li><Link to="/services" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">Browse Services</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">How It Works</Link></li>
              <li><Link to="/pricing" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">Pricing</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase mb-4 text-gray-200">Support</h3>
            <ul className="space-y-3">
              <li><Link to="/help" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">Contact Us</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase mb-4 text-gray-200">For Freelancers</h3>
            <ul className="space-y-3">
              <li><Link to="/register" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">Become a Freelancer</Link></li>
              <li><Link to="/resources" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">Resources & Guides</Link></li>
              <li><Link to="/community" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">Community Forum</Link></li>
              <li><Link to="/success-stories" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">Success Stories</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} WorkVault. All rights reserved.
          </p>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>Made with</span>
            <span className="text-red-500">♥</span>
            <span>in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
