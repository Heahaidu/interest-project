'use client'

import React, { useState } from 'react';
import { X, Eye, EyeOff, Lock } from 'lucide-react';
import { authApi } from '@/lib/api/auth';
import { toast } from 'sonner';

interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    if (!currentPassword) {
      return 'Please enter your current password.';
    }
    if (!newPassword || newPassword.length < 6) {
      return 'New password must be at least 6 characters.';
    }
    if (newPassword !== confirmPassword) {
      return 'Passwords do not match.';
    }
    return null;
  };

  const handleSubmit = async () => {
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setIsSaving(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      toast.success('Change password successfully!');
      // Reset fields and close
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err: any) {
      console.error(err);
      const resp = err?.response?.data;
      const msg = typeof resp === 'string' ? resp : (resp?.message || 'Failed to change password.');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 backdrop-blur-xs" onClick={handleBackdropClick}>
      <div className="bg-white dark:bg-[#191919] w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="h-14 px-4 border-b border-gray-100 dark:border-[#2f2f2f] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock size={16} />
            <h3 className="text-sm font-semibold">Change password</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Current password</label>
            <div className="relative">
              <input
                type={show.current ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-[#3f3f3f] rounded-md text-sm outline-none dark:text-white"
              />
              <button type="button" onClick={() => setShow(s => ({ ...s, current: !s.current }))} className="absolute right-2 top-2 text-gray-500">
                {show.current ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">New password</label>
            <div className="relative">
              <input
                type={show.new ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-[#3f3f3f] rounded-md text-sm outline-none dark:text-white"
                placeholder="At least 6 characters"
              />
              <button type="button" onClick={() => setShow(s => ({ ...s, new: !s.new }))} className="absolute right-2 top-2 text-gray-500">
                {show.new ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm new password</label>
            <div className="relative">
              <input
                type={show.confirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-[#3f3f3f] rounded-md text-sm outline-none dark:text-white"
              />
              <button type="button" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))} className="absolute right-2 top-2 text-gray-500">
                {show.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && <div className="text-sm text-red-500">{error}</div>}

          <div className="flex items-center justify-end gap-2">
            <button onClick={onClose} className="px-3 py-1.5 rounded-md text-sm border border-gray-300 dark:border-[#3f3f3f]">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold ${isSaving ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              {isSaving ? 'Saving...' : 'Change password'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ChangePasswordDialog;
