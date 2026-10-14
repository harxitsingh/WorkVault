import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ShieldAlert, KeyRound } from 'lucide-react';
import Button from '../../components/common/Button';

const ForgotPasswordPage = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-5 sm:px-8 shadow-sm rounded-2xl border border-slate-200/90 text-center">
          
          <div className="mx-auto h-12 w-12 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-center justify-center mb-5 text-amber-600">
            <KeyRound className="h-6 w-6" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-2">Password Recovery Notice</h2>
          
          <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Self-Service Reset Unavailable</span>
            </div>
            <p className="leading-relaxed">
              Automated SMTP email dispatch is not configured in this local environment. To access existing test accounts, use the canonical seeded credentials below:
            </p>
            <div className="p-2.5 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 space-y-1">
              <div>Client: client@example.com (password123)</div>
              <div>Freelancer: freelancer@example.com (password123)</div>
              <div>Admin: admin@example.com (password123)</div>
            </div>
          </div>

          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            For personal production accounts, please contact platform administrators at <span className="font-semibold text-slate-700">support@workvault.local</span> for credential re-issuance.
          </p>

          <Link to="/login" className="block w-full">
            <Button variant="primary" className="w-full">
              Back to Sign In
            </Button>
          </Link>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link to="/" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
