import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';

const NotFoundPage = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-9xl font-extrabold text-indigo-600 tracking-widest">404</h1>
      <div className="bg-indigo-600 text-white px-2 text-sm rounded rotate-12 absolute">
        Page Not Found
      </div>
      <h2 className="mt-8 text-3xl font-bold text-gray-900 tracking-tight sm:text-4xl">
        Oops! We can't find that page.
      </h2>
      <p className="mt-4 text-gray-500 text-lg max-w-md mx-auto">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <div className="mt-10">
        <Link to="/">
          <Button variant="primary" size="lg">Go Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
