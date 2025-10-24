// app/(auth)/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Kirim ke backend API teman Anda
      const response = await fetch('https://your-backend-api.com/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert('Failed to send reset email. Please try again.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      alert('Network error! Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-md w-full p-8 md:p-12">
        {!submitted ? (
          <>
            <h1 className="text-3xl font-bold text-center mb-4">Forgot Password?</h1>
            <p className="text-center text-gray-500 mb-8">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="email"
                name="email"
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gray-800 text-white rounded-full font-semibold hover:bg-gray-900 transition disabled:opacity-50"
              >
                {loading ? 'SENDING...' : 'SEND RESET LINK'}
              </button>
            </form>

            <div className="text-center mt-6">
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
              >
                ← Back to Sign In
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Check Your Email</h2>
            <p className="text-gray-600 mb-8">
              We've sent a password reset link to<br />
              <span className="font-semibold">{email}</span>
            </p>
            <Link
              href="/login"
              className="inline-block px-8 py-3 bg-gray-800 text-white rounded-full font-semibold hover:bg-gray-900 transition"
            >
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}