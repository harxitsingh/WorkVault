import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, Search } from 'lucide-react';
import Button from '../../components/common/Button';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 bg-[#F8FAFC]">
      <div className="h-16 w-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-6 shadow-xs">
        <ShieldAlert className="h-8 w-8 text-slate-500" />
      </div>

      <p className="text-xs font-bold uppercase tracking-wider text-[#2F5BEA] mb-2">Error 404</p>
      
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
        Page Not Found
      </h1>

      <p className="text-sm text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
        The link you followed may be broken, or the page may have been moved or removed.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link to="/">
          <Button variant="primary" icon={<Home className="h-4 w-4" />}>
            WorkVault Home
          </Button>
        </Link>
        <Link to="/services">
          <Button variant="outline" icon={<Search className="h-4 w-4" />}>
            Explore Services
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
