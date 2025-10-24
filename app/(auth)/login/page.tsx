// src/app/auth/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Kirim ke backend API teman Anda
      const response = await fetch('https://your-backend-api.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        // Simpan token ke localStorage atau cookie
        localStorage.setItem('token', data.token);
        // Redirect ke dashboard
        router.push('/dashboard');
      } else {
        alert('Login failed! Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Network error! Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect ke Google OAuth endpoint backend
    window.location.href = 'https://your-backend-api.com/api/auth/google';
  };

  const handleFacebookLogin = () => {
    // Redirect ke Facebook OAuth endpoint backend
    window.location.href = 'https://your-backend-api.com/api/auth/facebook';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-4xl w-full flex">
        {/* Left Side - Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-center mb-6">Sign In</h1>
          
          {/* Social Login Buttons */}
          <div className="flex justify-center gap-4 mb-4">
            <button
              onClick={handleGoogleLogin}
              className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition"
            >
              <span className="text-xl font-semibold">G</span>
            </button>
            <button
              onClick={handleFacebookLogin}
              className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition"
            >
              <span className="text-xl font-semibold">f</span>
            </button>
          </div>

          <p className="text-center text-gray-400 text-sm mb-6">
            or use your email password
          </p>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-6 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
              required
            />
            
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-6 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                Forget Your Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gray-300 text-gray-600 rounded-full font-semibold hover:bg-gray-400 transition disabled:opacity-50"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>
        </div>

        {/* Right Side - Sign Up Prompt */}
        <div className="hidden md:flex md:w-1/2 bg-gray-200 items-center justify-center p-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Hello, Cmlabs</h2>
            <p className="text-gray-600 mb-8">
              Register with your personal details<br />
              to use all of site features
            </p>
            <Link
              href="/register"
              className="inline-block px-12 py-3 bg-gray-800 text-white rounded-full font-semibold hover:bg-gray-900 transition"
            >
              SIGN UP
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}