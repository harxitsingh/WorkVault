import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, Briefcase, Code } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import Button from '../../components/common/Button';

const RegisterPage = () => {
  const [role, setRole] = useState('client');
  const [isLoading, setIsLoading] = useState(false);
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
    try {
      const newUser = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: role
      });
      const targetRole = newUser?.role || role;
      navigate(`/${targetRole}/dashboard`);
    } catch (error) {
      // Error is caught and displayed by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Briefcase className="h-12 w-12 text-indigo-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">I want to:</label>
            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => setRole('client')}
                className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center text-center transition-all ${role === 'client' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200'}`}
              >
                <Briefcase className={`h-8 w-8 mb-2 ${role === 'client' ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span className={`font-semibold ${role === 'client' ? 'text-indigo-900' : 'text-gray-700'}`}>Hire Talent</span>
              </div>
              <div 
                onClick={() => setRole('freelancer')}
                className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center text-center transition-all ${role === 'freelancer' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200'}`}
              >
                <Code className={`h-8 w-8 mb-2 ${role === 'freelancer' ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span className={`font-semibold ${role === 'freelancer' ? 'text-indigo-900' : 'text-gray-700'}`}>Work as Freelancer</span>
              </div>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("name", { required: "Name is required" })}
                  className="block w-full pl-10 sm:text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Karan Sharma"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("email", { 
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                  })}
                  type="email"
                  className="block w-full pl-10 sm:text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("password", { 
                    required: "Password is required",
                    minLength: { value: 8, message: "Password must be at least 8 characters" }
                  })}
                  type="password"
                  className="block w-full pl-10 sm:text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("confirmPassword", { 
                    required: "Please confirm your password",
                    validate: value => value === password || "Passwords do not match"
                  })}
                  type="password"
                  className="block w-full pl-10 sm:text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            <div className="flex items-center mt-4">
              <input
                {...register("terms", { required: "You must accept the terms" })}
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                I agree to the <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>
              </label>
            </div>
            {errors.terms && <p className="mt-1 text-sm text-red-600">{errors.terms.message}</p>}

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
