'use client';

import { LogIn } from 'lucide-react';

interface LoginViewProps {
  onSignIn: () => void;
}

export default function LoginView({ onSignIn }: LoginViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-6">
          <span className="text-gray-900">Discover </span>
          <span className="text-purple-600">Events</span>
        </h1>
        
        <p className="text-lg text-gray-600 mb-12 max-w-md mx-auto">
          Connect with amazing events, meet new people, and create unforgettable memories
        </p>

        <div className="flex gap-4 justify-center flex-col sm:flex-row">
          <button
            onClick={onSignIn}
            className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 font-medium"
          >
            <LogIn size={20} />
            Sign In
          </button>
          
          <button
            onClick={onSignIn}
            className="bg-white text-gray-900 px-8 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition font-medium"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
