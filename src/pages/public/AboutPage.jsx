import React from 'react';
import { Target, Users, Shield, TrendingUp, Handshake } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-indigo-50 py-20 lg:py-28 text-center px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">About WorkVault</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          We're on a mission to create the most secure, transparent, and efficient marketplace for Indian freelance talent and global clients.
        </p>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-indigo-600">10,000+</p>
              <p className="text-sm font-medium text-gray-500 mt-2 uppercase tracking-wide">Active Users</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-indigo-600">25,000+</p>
              <p className="text-sm font-medium text-gray-500 mt-2 uppercase tracking-wide">Projects Done</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-indigo-600">₹50Cr+</p>
              <p className="text-sm font-medium text-gray-500 mt-2 uppercase tracking-wide">Transacted</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-indigo-600">4.8/5</p>
              <p className="text-sm font-medium text-gray-500 mt-2 uppercase tracking-wide">Avg Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Values */}
      <div className="py-20 lg:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-4xl">
            Freelancing should be freeing, not stressful. For too long, freelancers have dealt with late payments and scope creep, while clients have struggled with unreliable delivery and lack of transparency. WorkVault was built to fix this broken system with our secure escrow-style payments, rigid milestone tracking, and dedicated dispute resolution.
          </p>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-10">Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-gray-50 p-8 rounded-2xl">
            <Shield className="h-10 w-10 text-indigo-600 mb-5" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Security First</h3>
            <p className="text-gray-600">Every payment is secured in our escrow system. We protect both the client's money and the freelancer's time.</p>
          </div>
          <div className="bg-gray-50 p-8 rounded-2xl">
            <Handshake className="h-10 w-10 text-indigo-600 mb-5" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Fair Play</h3>
            <p className="text-gray-600">We believe in transparent terms, clear deliverables, and unbiased dispute resolution to keep things fair for everyone.</p>
          </div>
          <div className="bg-gray-50 p-8 rounded-2xl">
            <TrendingUp className="h-10 w-10 text-indigo-600 mb-5" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Empowering Talent</h3>
            <p className="text-gray-600">We aim to elevate Indian freelance talent on the global stage, providing them with the tools they need to run a successful business.</p>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="bg-gray-900 py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-16">The Team Behind WorkVault</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { name: 'Rahul Sharma', role: 'Founder & CEO', init: 'RS' },
              { name: 'Priya Patel', role: 'Head of Product', init: 'PP' },
              { name: 'Amit Singh', role: 'CTO', init: 'AS' },
              { name: 'Neha Gupta', role: 'Community Lead', init: 'NG' }
            ].map((member, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="h-32 w-32 rounded-full bg-gray-800 flex items-center justify-center text-3xl font-bold text-gray-500 mb-6 border-4 border-gray-700">
                  {member.init}
                </div>
                <h4 className="text-lg font-bold">{member.name}</h4>
                <p className="text-gray-400">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
