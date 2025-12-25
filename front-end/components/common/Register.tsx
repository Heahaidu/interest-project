"use client";

import { Button } from "../ui/button";
import { useState } from "react";
import api, { endpoints } from "@/lib/APIs";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type RegisterProps = {
  onSuccess?: () => void;
};

export default function Register({ onSuccess }: RegisterProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Vui lòng nhập email');
    if (!password) return toast.error('Vui lòng nhập mật khẩu');
    if (password !== confirm) return toast.error('Password và Confirm không khớp');

    try {
      setLoading(true);

      const res = await api.post(endpoints.register, {
        email: email,
        password: password,
      });

      toast.success(res.data?.message || 'Đã gửi OTP tới email của bạn');
      setShowOtpModal(true);
    } catch (err: any) {
      console.error('register error', err);
      toast.error(err.response?.data?.message || err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return toast.error('Vui lòng nhập mã OTP');
    try {
      setLoading(true);
      // call backend verifyEmail endpoint which expects email and otp as request params
      const res = await api.post('/user/verify-email', null, { params: { email, otp } });
      toast.success(res.data?.message || 'Xác thực thành công');
      setShowOtpModal(false);
      // notify parent (if Register is rendered inside a modal) to close it
      onSuccess?.();
      // then redirect to landing/login page
      router.push('/');
    } catch (err: any) {
      console.error('otp verify error', err);
      toast.error(err.response?.data?.message || err.message || 'Xác thực không thành công');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 text-zinc-900 dark:text-white">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">interest.</h2>
        <h3 className="text-2xl font-bold">Sign up your account.</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Enter your email" className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-black focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-black focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Confirm Password</label>
          <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" placeholder="Confirm your password" className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-black focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>

        <Button disabled={loading} type="submit" className="text-md rounded-lg w-full py-[22px] mt-4 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 border border-transparent">{loading ? 'Đang gửi...' : 'Sign up'}</Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500">Or</span></div>
      </div>

      <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors bg-white dark:bg-transparent">
        <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
        Sign up with Google
      </button>

      <div className="mt-6 text-center text-sm">Already have an account? <span className="text-indigo-500 cursor-pointer font-medium">Log in</span>
      </div>

      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowOtpModal(false)} />
          <div className="relative bg-white dark:bg-[#0b0b0b] rounded-lg p-6 w-full max-w-md z-10">
            <h3 className="text-lg font-semibold mb-2">Nhập mã OTP</h3>
            <p className="text-sm text-zinc-500 mb-4">Chúng tôi đã gửi mã OTP tới <strong>{email}</strong>. Vui lòng kiểm tra email và nhập mã.</p>
            <form onSubmit={handleOtpSubmit} className="space-y-3">
              <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-black outline-none" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowOtpModal(false)} className="px-4 py-2 rounded-md border">Cancel</button>
                <Button type="submit" disabled={loading}>{loading ? 'Đang xác thực...' : 'Xác thực'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}