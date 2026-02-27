"use client";

import { Button } from "../ui/button";
import { useState, useContext, useEffect, useRef } from "react";
import { AuthContext } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Spinner } from "../ui/spinner";
import { authApi } from "@/lib/api/auth";

type LoginProps = {
  onSuccess?: () => void;
  openRegister: () => void;
};

export default function Login({ onSuccess, openRegister }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useContext(AuthContext);

  const otpContentRef = useRef<HTMLDivElement>(null);
  const [otpHeight, setOtpHeight] = useState(0);

  useEffect(() => {
    if (showOtpModal && otpContentRef.current) {
      setTimeout(() => {
        if (otpContentRef.current) {
          setOtpHeight(otpContentRef.current.offsetHeight);
        }
      }, 50);
    }
  }, [showOtpModal]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      console.log("Sign in successful");
      toast.success('Sign in successful');
      onSuccess?.();
    } catch (err: any) {
      const msg = err.response?.data || err.response?.data?.message || err.message;

      if (err.response?.status === 403 && typeof msg === 'string' && msg.toLowerCase().includes('email not verified')) {
        toast.info('Email not yet verified. An OTP code has been sent, please check your email.');
        setShowOtpModal(true);
        return;
      }

      toast.error(msg || "Sign in failed!");
    } finally {
      setLoading(false);
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return toast.error('Please enter the OTP code.');
    
    setLoading(true);
    try {
      const res = await authApi.verify(email, otp);
      toast.success('Verification successful');
      setShowOtpModal(false);

      try {
        await signIn(email, password);
        toast.success('Sign in successful');
        onSuccess?.();
      } catch (loginErr: any) {
        console.error('login after verify failed', loginErr);
        toast.error('Sign in failed');
      }
    } catch (err: any) {
      console.error('otp verify error', err);
      toast.error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="relative p-8 text-zinc-900 dark:text-white overflow-hidden"
      style={{ 
        height: showOtpModal && otpHeight ? `${otpHeight}px` : 'auto',
        transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Login Form - slide out */}
      <div 
        className="transition-all duration-700 ease-out"
        style={{
          opacity: showOtpModal ? 0 : 1,
          transform: showOtpModal ? 'translateX(-50px) scale(0.95)' : 'translateX(0) scale(1)',
          filter: showOtpModal ? 'blur(10px)' : 'blur(0px)',
          pointerEvents: showOtpModal ? 'none' : 'auto',
          position: showOtpModal ? 'absolute' : 'relative',
          width: '100%'
        }}
      >
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">interest.</h2>
          <h3 className="text-2xl font-bold">Hi, Welcome Back!</h3>
          <p className="text-zinc-500 mt-1">Log in to your Account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username or email</label>
            <input 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              type="text" 
              placeholder="Enter your email" 
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-black focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              type="password" 
              placeholder="••••••••" 
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-black focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300" />
              <span className="text-zinc-500">Remember me</span>
            </label>
            <a href="#" className="text-indigo-500 hover:text-indigo-400 transition-colors">Forgot password?</a>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="text-md rounded-lg py-[22px] w-full mt-4 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 border border-transparent transition-all"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner />
                Logging in...
              </div>
            ) : (
              "Log in"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          I don't have an account?{" "}
          <span 
            className="text-indigo-500 cursor-pointer font-medium hover:text-indigo-600 transition-colors" 
            onClick={openRegister}
          >
            Sign up for free
          </span>
        </div>
      </div>

      {/* OTP Modal - slide in */}
      {showOtpModal && (
        <div 
          ref={otpContentRef}
          className="transition-all duration-700 ease-out"
          style={{
            opacity: showOtpModal ? 1 : 0,
            transform: showOtpModal ? 'translateX(0) scale(1)' : 'translateX(50px) scale(0.95)',
            filter: showOtpModal ? 'blur(0px)' : 'blur(10px)',
          }}
        >
          <div className="max-w-md mx-auto">
            {/* Back button */}
            <button
              onClick={() => setShowOtpModal(false)}
              className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6 transition-all hover:gap-3 group"
              style={{
                animation: 'slideDown 0.5s ease-out 0.2s both'
              }}
            >
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to login
            </button>

            <h3 
              className="text-2xl font-bold mb-2"
              style={{
                animation: 'slideDown 0.5s ease-out 0.3s both'
              }}
            >
              Verify your email
            </h3>
            
            <p 
              className="text-sm text-zinc-500 mb-6"
              style={{
                animation: 'slideDown 0.5s ease-out 0.4s both'
              }}
            >
              We sent a verification code to <strong className="text-zinc-900 dark:text-white">{email}</strong>.
              Please check your email and enter the code below.
            </p>

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div
                style={{
                  animation: 'slideDown 0.5s ease-out 0.5s both'
                }}
              >
                <input 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  placeholder="Enter 6-digit code" 
                  autoFocus
                  maxLength={6}
                  className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest rounded-lg border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-black outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>

              <div 
                className="flex gap-3"
                style={{
                  animation: 'slideDown 0.5s ease-out 0.6s both'
                }}
              >
                <Button 
                  type="button" 
                  onClick={() => setShowOtpModal(false)} 
                  className="flex-1 px-4 py-2.5 rounded-lg border-2 border-zinc-200 dark:border-zinc-700 dark:bg-black dark:text-white bg-white text-black hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Spinner />
                      Verifying...
                    </div>
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>

              <div 
                className="text-center text-sm text-zinc-500"
                style={{
                  animation: 'slideDown 0.5s ease-out 0.7s both'
                }}
              >
                Didn't receive code?{" "}
                <button 
                  type="button"
                  className="text-indigo-500 hover:text-indigo-600 font-medium transition-colors"
                  onClick={() => toast.info('Resend feature coming soon')}
                >
                  Resend
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}