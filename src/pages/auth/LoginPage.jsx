import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { user, login } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate(`/${user.role || 'client'}/dashboard`, { replace: true });
    }
  }, [user, navigate]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setAuthError('');
    try {
      const loggedInUser = await login(data.email, data.password);
      const role = loggedInUser?.role || 'client';
      navigate(`/${role}/dashboard`);
    } catch (err) {
      setAuthError(err.message || 'Invalid email or password');
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
          Sign in to your account
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
          Or{' '}
          <Link to="/register" className="font-semibold text-[#2F5BEA] hover:text-[#2446BD]">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-5 sm:px-8 shadow-sm rounded-2xl border border-slate-200/90">
          
          {/* Seeded Accounts Demo Helper */}
          <div className="mb-6 bg-blue-50/70 border border-blue-200/80 p-4 rounded-xl text-xs text-blue-900 leading-relaxed">
            <p className="font-bold flex items-center gap-1.5 text-blue-950 mb-1">
              <AlertCircle className="h-4 w-4 text-[#2F5BEA] shrink-0" /> 
              Seeded Test Accounts (password: password123)
            </p>
            <div className="grid grid-cols-1 gap-1 pl-5 list-disc mt-2 text-blue-800">
              <div><span className="font-semibold">Client:</span> client@example.com</div>
              <div><span className="font-semibold">Freelancer:</span> freelancer@example.com</div>
              <div><span className="font-semibold">Admin:</span> admin@example.com</div>
            </div>
          </div>

          {authError && (
            <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2.5" role="alert">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{authError}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  id="email"
                  {...register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
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
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="password"
                  {...register("password", { required: "Password is required" })}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className={`block w-full pl-10 pr-10 py-2 text-sm bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F5BEA] transition-all ${errors.password ? 'border-rose-300' : 'border-slate-300'}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#2F5BEA] focus:ring-[#2F5BEA] border-slate-300 rounded-md"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600">
                  Remember me
                </label>
              </div>

              <div className="text-xs">
                <Link to="/forgot-password" className="font-semibold text-[#2F5BEA] hover:text-[#2446BD]">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
                Sign In
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
