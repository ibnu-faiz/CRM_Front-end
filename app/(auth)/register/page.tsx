// app/(auth)/register/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'viewer', // default role
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    setLoading(true);
    
    try {
      // Kirim ke backend API teman Anda
      const response = await fetch('https://your-backend-api.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          password: formData.password
        }),
      });

      if (response.ok) {
        alert('Registration successful! Please login.');
        router.push('/login');
      } else {
        alert('Registration failed! Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Network error! Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    // Redirect ke Google OAuth endpoint backend
    window.location.href = 'https://your-backend-api.com/api/auth/google';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-4xl w-full flex">
        {/* Left Side - Sign In Prompt */}
        <div className="hidden md:flex md:w-1/2 bg-gray-200 items-center justify-center p-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
            <p className="text-gray-600 mb-8">
              To keep connected with us please<br />
              login with your personal info
            </p>
            <Link
              href="/login"
              className="inline-block px-12 py-3 bg-gray-800 text-white rounded-full font-semibold hover:bg-gray-900 transition"
            >
              SIGN IN
            </Link>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-center mb-6">Sign Up</h1>
          
          {/* Social Register Buttons */}
          <div className="flex justify-center gap-4 mb-4">
            <button
              onClick={handleGoogleRegister}
              className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition"
            >
              <span className="text-xl font-semibold">G</span>
            </button>
          </div>

          <p className="text-center text-gray-400 text-sm mb-6">
            or use your email for registration
          </p>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-6 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
              required
            />

            <input
              type="email"
              name="email"
              placeholder="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-6 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
              required
            />

            <input
              type="tel"
              name="phone"
              placeholder="phone number"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-6 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
              required
            />

            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-6 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300 appearance-none cursor-pointer"
              required
            >
              <option value="viewer">Viewer</option>
              <option value="sales">Sales</option>
              <option value="admin">Admin</option>
            </select>
            
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

            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="confirm password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-6 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gray-800 text-white rounded-full font-semibold hover:bg-gray-900 transition disabled:opacity-50 mt-6"
            >
              {loading ? 'SIGNING UP...' : 'SIGN UP'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-gray-700 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}