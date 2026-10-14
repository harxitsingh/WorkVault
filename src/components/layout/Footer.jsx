import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Shield, CheckCircle2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0E1525] text-white border-t border-[#1E293B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Brand & Escrow Trust */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#2F5BEA] flex items-center justify-center text-white">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">WorkVault</span>
            </Link>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              The premier freelance marketplace powered by verifiable milestone escrow protection. Connect with verified talent, fund milestones safely, and release on satisfaction.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Shield className="h-4 w-4 text-[#2F5BEA]" />
              <span>100% Escrow Milestone Protection</span>
            </div>
          </div>

          {/* Column 2: Platform Links */}
          <div>
            <h3 className="text-xs font-bold tracking-wider uppercase mb-4 text-slate-200">Marketplace</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/services" className="text-slate-400 hover:text-white transition-colors">
                  Explore Services
                </Link>
              </li>
              <li>
                <Link to="/services?sort=rating" className="text-slate-400 hover:text-white transition-colors">
                  Top-Rated Freelancers
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-white transition-colors">
                  How Escrow Works
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-white transition-colors">
                  Milestone Dispute Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Policies */}
          <div>
            <h3 className="text-xs font-bold tracking-wider uppercase mb-4 text-slate-200">Trust & Security</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li className="flex items-center text-slate-400">
                <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-emerald-400" />
                <span>Zero Upfront Risk</span>
              </li>
              <li className="flex items-center text-slate-400">
                <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-emerald-400" />
                <span>Strict Arbitrated Escrow</span>
              </li>
              <li className="flex items-center text-slate-400">
                <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-emerald-400" />
                <span>Verified Client Reviews</span>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-white transition-colors">
                  Platform Terms & Escrow FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Join WorkVault */}
          <div>
            <h3 className="text-xs font-bold tracking-wider uppercase mb-4 text-slate-200">Get Started</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/register" className="text-slate-400 hover:text-white transition-colors">
                  Create Client Account
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-slate-400 hover:text-white transition-colors">
                  Offer Freelancer Services
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-400 hover:text-white transition-colors">
                  Sign In to Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#1E293B] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} WorkVault Inc. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Escrow Gateway Operational</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
