import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';

const ForgotPasswordPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100 text-center">
          
          {!isSubmitted ? (
            <>
              <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <Mail className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset your password</h2>
              <p className="text-sm text-gray-500 mb-8">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6 text-left">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 sm:text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
                  Send Reset Link
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="mx-auto h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
              <p className="text-sm text-gray-500 mb-8">
                We've sent a password reset link to <strong>{email}</strong>.
              </p>
              <Button onClick={() => setIsSubmitted(false)} variant="outline" className="w-full">
                Didn't receive it? Try again
              </Button>
            </>
          )}

          <div className="mt-8">
            <Link to="/login" className="flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
