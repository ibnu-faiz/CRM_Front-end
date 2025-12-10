'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  // State Tahapan (Step 1: Email, Step 2: OTP & Password)
  const [step, setStep] = useState<1 | 2>(1);
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- STEP 1: KIRIM OTP ---
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authAPI.forgotPassword(email);
      setStep(2); // Pindah ke step input OTP
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: RESET PASSWORD ---
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authAPI.resetPassword(email, otp, newPassword);
      alert('Password successfully updated! Please login.');
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP or failed to reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden w-full max-w-md p-8 md:p-12">
        
        {/* Tombol Back Kecil (Hanya di Step 2) */}
        <div className="mb-6 h-6">
            {step === 2 && (
                <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Change Email
                </button>
            )}
        </div>

        <h1 className="text-2xl font-bold text-center mb-2 text-gray-900">
            {step === 1 ? 'Forgot Password?' : 'Reset Password'}
        </h1>
        <p className="text-center text-gray-500 mb-8 text-sm">
            {step === 1 
                ? "Enter your email address and we'll send you a code." 
                : `Enter the code sent to ${email} and your new password.`
            }
        </p>

        {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center animate-in fade-in slide-in-from-top-2">
            {error}
            </div>
        )}

        {step === 1 ? (
            // --- FORM STEP 1: EMAIL ---
            <form onSubmit={handleRequestOtp} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
                    <input
                        type="email"
                        placeholder="example@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-6 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 transition-all"
                        required
                        disabled={loading}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-70 shadow-lg flex justify-center items-center gap-2"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading ? 'SENDING...' : 'SEND CODE'}
                </button>
            </form>
        ) : (
            // --- FORM STEP 2: OTP & PASSWORD ---
            <form onSubmit={handleResetPassword} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 ml-1">OTP Code</label>
                    <input
                        type="text"
                        placeholder="------"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full px-6 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 transition-all text-center tracking-[0.5em] font-mono text-lg font-bold placeholder:tracking-normal"
                        required
                        maxLength={6}
                        disabled={loading}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 ml-1">New Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-6 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 transition-all"
                            required
                            disabled={loading}
                            minLength={6}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 ml-1">Minimum 6 characters</p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-70 shadow-lg flex justify-center items-center gap-2"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading ? 'RESETTING...' : 'CONFIRM CHANGE'}
                </button>
            </form>
        )}

        <div className="text-center mt-8 pt-6 border-t border-gray-100">
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors flex justify-center items-center gap-2">
              <span>Return to Sign In</span>
            </Link>
        </div>

      </div>
    </div>
  );
}