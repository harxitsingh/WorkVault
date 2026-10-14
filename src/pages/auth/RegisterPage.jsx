import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, Briefcase, Code, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

const RegisterPage = () => {
  const [role, setRole] = useState('client');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { user, register: registerUser } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate(`/${user.role || 'client'}/dashboard`, { replace: true });
    }
  }, [user, navigate]);

  const password = watch("password");

  const onSubmit = async (data) => {
    setIsLoading(true);
    setAuthError('');
    try {
      const newUser = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: role // Strictly 'client' or 'freelancer'
      });
      const targetRole = newUser?.role || role;
      navigate(`/${targetRole}/dashboard`);
    } catch (error) {
      setAuthError(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
          <div className="h-10 w-10 rounded-xl bg-[#2F5BEA] flex items-center justify-center text-white shadow-xs">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">WorkVault</span>
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Create your account
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-[#2F5BEA] hover:text-[#2446BD]">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-5 sm:px-8 shadow-sm rounded-2xl border border-slate-200/90">
          
          {authError && (
            <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2.5" role="alert">
              <span>{authError}</span>
            </div>
          )}

          {/* Role Selection (Strictly Client vs Freelancer) */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-700 mb-2.5">
              Select account type:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button" 
                onClick={() => setRole('client')}
                aria-pressed={role === 'client'}
                className={`p-3.5 rounded-xl border-2 flex flex-col items-center text-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F5BEA] ${
                  role === 'client' 
                    ? 'border-[#2F5BEA] bg-blue-50/60 text-[#2F5BEA]' 
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                }`}
              >
                <Briefcase className={`h-6 w-6 mb-1.5 ${role === 'client' ? 'text-[#2F5BEA]' : 'text-slate-400'}`} />
                <span className="text-xs font-bold text-slate-900">Hire Talent</span>
                <span className="text-[10px] text-slate-500 mt-0.5">I want to hire</span>
              </button>

              <button
                type="button" 
                onClick={() => setRole('freelancer')}
                aria-pressed={role === 'freelancer'}
                className={`p-3.5 rounded-xl border-2 flex flex-col items-center text-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F5BEA] ${
                  role === 'freelancer' 
                    ? 'border-[#2F5BEA] bg-blue-50/60 text-[#2F5BEA]' 
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                }`}
              >
                <Code className={`h-6 w-6 mb-1.5 ${role === 'freelancer' ? 'text-[#2F5BEA]' : 'text-slate-400'}`} />
                <span className="text-xs font-bold text-slate-900">Work as Talent</span>
                <span className="text-[10px] text-slate-500 mt-0.5">I offer services</span>
              </button>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4.5 w-4.5" />
                </div>
                <input
                  id="name"
                  {...register("name", { required: "Full name is required" })}
                  className={`block w-full pl-10 pr-3 py-2 text-sm bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F5BEA] transition-all ${errors.name ? 'border-rose-300' : 'border-slate-300'}`}
                  placeholder="Karan Sharma"
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  id="reg-email"
                  {...register("email", { 
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" }
                  })}
                  type="email"
                  autoComplete="email"
                  className={`block w-full pl-10 pr-3 py-2 text-sm bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F5BEA] transition-all ${errors.email ? 'border-rose-300' : 'border-slate-300'}`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="reg-password"
                  {...register("password", { 
                    required: "Password is required",
                    minLength: { value: 6, message: "Password must be at least 6 characters" }
                  })}
                  type="password"
                  autoComplete="new-password"
                  className={`block w-full pl-10 pr-3 py-2 text-sm bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F5BEA] transition-all ${errors.password ? 'border-rose-300' : 'border-slate-300'}`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="confirmPassword"
                  {...register("confirmPassword", { 
                    required: "Please confirm your password",
                    validate: value => value === password || "Passwords do not match"
                  })}
                  type="password"
                  autoComplete="new-password"
                  className={`block w-full pl-10 pr-3 py-2 text-sm bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F5BEA] transition-all ${errors.confirmPassword ? 'border-rose-300' : 'border-slate-300'}`}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-rose-600">{errors.confirmPassword.message}</p>}
            </div>

            <div className="flex items-start mt-3">
              <input
                {...register("terms", { required: "You must accept the terms to create an account" })}
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-[#2F5BEA] focus:ring-[#2F5BEA] border-slate-300 rounded-md mt-0.5"
              />
              <label htmlFor="terms" className="ml-2 block text-xs text-slate-600 leading-normal">
                I agree to the <Link to="/about" className="font-semibold text-[#2F5BEA] hover:underline">Terms of Service</Link> and <Link to="/about" className="font-semibold text-[#2F5BEA] hover:underline">Escrow Policies</Link>.
              </label>
            </div>
            {errors.terms && <p className="mt-1 text-xs text-rose-600">{errors.terms.message}</p>}

            <div className="pt-2">
              <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
                Create Account
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
