import React from 'react';
import { ShieldCheck, Handshake, Lock, CheckCircle2, Scale, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';

const AboutPage = () => {
  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <section className="bg-white border-b border-slate-200/80 py-16 lg:py-24 text-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2F5BEA] text-xs font-semibold mb-4">
            <ShieldCheck className="h-4 w-4" />
            <span>Platform Architecture & Trust Model</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-5">
            About WorkVault
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            WorkVault is a purpose-built freelance marketplace built around a single non-negotiable principle: 
            neither client nor freelancer should take uncollateralized financial risk during freelance engagements.
          </p>
        </div>
      </section>

      {/* Escrow Architecture Overview */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 shadow-xs mb-12">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-4">Why Escrow Protection Matters</h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-8 max-w-4xl">
            In traditional freelancing models, freelancers risk working for weeks without guaranteed payment, while clients risk paying advance deposits for substandard or non-delivered work. WorkVault eliminates this conflict by utilizing an escrow ledger system.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-[#F8FAFC] border border-slate-200/80">
              <div className="h-10 w-10 rounded-lg bg-blue-50 text-[#2F5BEA] flex items-center justify-center mb-4">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Funded Before Start</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Work begins only when the deal milestone is funded into escrow, verifying that the client has deposited the necessary capital.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#F8FAFC] border border-slate-200/80">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Satisfaction Release</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Escrow funds are only released upon explicit client review and acceptance of completed deliverables.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#F8FAFC] border border-slate-200/80">
              <div className="h-10 w-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                <Scale className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Impartial Arbitration</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                If expectations diverge, either party can trigger formal dispute arbitration, with platform administrators assessing evidence.
              </p>
            </div>
          </div>
        </div>

        {/* Operating Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-4">For Clients</h3>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Search verified freelancer profiles with transparent pricing and real portfolio work.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Fund project milestones securely without releasing payment before inspection.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Full access to formal milestone dispute mechanisms if deliverables do not match agreed criteria.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-4">For Freelancers</h3>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Publish custom service offerings with defined turnaround times and package tiers.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Never work on speculative invoices: start execution only after milestone funding is confirmed.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Instant balance release upon deal completion with verifiable payment ledgers.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center p-10 rounded-2xl bg-[#0E1525] text-white">
          <h2 className="text-2xl font-bold mb-3">Ready to start collaborating?</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto mb-6">
            Join WorkVault as a client seeking specialized talent or as a freelancer offering expert services.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/services">
              <Button variant="primary" size="md">
                Browse Marketplace
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary" size="md">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
