'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google'; // 1. Import Hook Google

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- 2. LOGIKA GOOGLE LOGIN ---
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        // Panggil endpoint login yang baru
        await authAPI.googleLogin(tokenResponse.access_token);
        
        // Jika sukses (akun ada), masuk dashboard
        router.push('/dashboard');
      } catch (err: any) {
        console.error('Google Login Error:', err);
        // Tampilkan pesan error dari backend (misal: "Account not found")
        setError(err.message || 'Failed to login with Google');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google Login Failed');
    },
  });
  // -----------------------------

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await authAPI.login(formData.email, formData.password);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-4">
      
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden w-full max-w-4xl flex flex-col md:flex-row">
        
        {/* Bagian Kiri - Form Login */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-center mb-6">Sign In</h1>
          
          {/* Social Buttons */}
          <div className="flex justify-center gap-4 mb-4">
            <button 
              // 3. PASANG HANDLER DI SINI
              onClick={() => handleGoogleLogin()} 
              disabled={loading}
              className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition disabled:opacity-50"
            >
              {/* Ikon Google */}
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            </button>
          </div>

          <p className="text-center text-gray-400 text-sm mb-6">or use your email password</p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-6 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-800 transition-all"
              required
              disabled={loading}
            />
            
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-6 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-800 transition-all"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="text-right">
              <Link href="/forgot-password" className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">
                Forgot Your Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gray-900 text-white rounded-full font-bold hover:bg-gray-800 transition disabled:opacity-70 disabled:cursor-not-allowed mt-4 shadow-lg flex justify-center items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>

          {/* Link Sign Up untuk Mobile */}
          <div className="mt-6 text-center md:hidden">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-gray-900 font-bold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Bagian Kanan - Sign Up Prompt */}
        <div className="hidden md:flex md:w-1/2 bg-gray-900 text-white items-center justify-center p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-gray-800 opacity-50 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-gray-700 opacity-50 blur-3xl"></div>

            <div className="text-center relative z-10">
                <h2 className="text-3xl font-bold mb-4">Hello, Cmlabs</h2>
                <p className="text-gray-300 mb-8 leading-relaxed">
                    Enter your personal details and start<br/>journey with us
                </p>
                <Link
                    href="/register"
                    className="inline-block px-12 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-gray-900 transition duration-300"
                >
                    SIGN UP
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}