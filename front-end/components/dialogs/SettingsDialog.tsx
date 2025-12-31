'use client'

import React, { useState, useEffect, useContext, useRef } from 'react';
import { User, Bell, Shield, X, Monitor, Sun, Moon, Globe, Clock, ChevronRight, Mail, Trash2, LogOut, AtSign } from 'lucide-react';
import { Theme, UserProfile } from '@/lib/types';
import { AuthContext } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { authApi } from '@/lib/api/auth';
import ChangePasswordDialog from './ChangePasswordDialog';
import { toast } from 'sonner';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ isOpen, onClose }) => {
  const { user, reloadUser, signOut } = useContext(AuthContext)
  const [activeTab, setActiveTab] = useState('My account');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const emptyProfile: UserProfile = {
    uuid: '',
    name: '',
    username: '',
    email: '',
    avatarUrl: '',
    city: '',
    country: '',
    timezone: '',
    // profile fields
    firstName: '',
    lastName: '',
    bio: '',
    dateOfBirth: ''
  }

  // Password state
  // const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  // const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [privacySettings, setPrivacySettings] = useState({ isPrivate: false, showActivity: true });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDirty, setIsDirty] = useState(false);
  const { theme, setTheme } = useTheme();


  const [formData, setFormData] = useState<UserProfile>(emptyProfile);


  useEffect(() => {
    if (user) {
      setFormData(user);
      setAvatarFile(null);
      setIsDirty(false);
    }
  }, [user, isOpen]);

  useEffect(() => {
    setIsDirty(false);
  }, [activeTab]);

  if (!isOpen || !user || !formData) return null;

  const sidebarGroups = [
    {
      title: 'Account',
      items: [
        { id: 'My account', icon: User, label: 'My account' },
        { id: 'My settings', icon: Shield, label: 'My settings' },
        { id: 'Language & region', icon: Globe, label: 'Language & region' },
        { id: 'Notifications', icon: Bell, label: 'Notifications' },
      ]
    }
  ];
  console.log(user)
  console.log(formData)

  const getInitials = () => {
    const first = (formData.firstName || '').trim();
    const last = (formData.lastName || '').trim();
    if (first || last) {
      return `${(first[0] || '')}${(last[0] || '')}`.toUpperCase();
    }
    return (formData.name || '').substring(0, 2).toUpperCase();
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    const url = URL.createObjectURL(file);
    setAvatarFile(file);
    // store preview in avatarUrl so UI shows preview
    setFormData(prev => ({ ...prev, avatarUrl: url }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    // Construct location string from city/country
    const locationStr = `${formData.city || ''}${formData.city && formData.country ? ', ' : ''}${formData.country || ''}`;
    const displayName = [formData.firstName, formData.lastName].filter(Boolean).join(' ').trim();
    const updatedUser = { ...formData, location: locationStr, name: displayName || formData.name, privacySettings };

    setIsSaving(true);
    try {
      await authApi.updateInformation(updatedUser, avatarFile || undefined);
      // refresh user from server
      await reloadUser();
      setIsDirty(false);
      toast.success('Profile updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  // Open confirm modal (do not immediately delete)
  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  // Perform deletion after user confirms in modal
  const performDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await authApi.deleteAccount();
      toast.success('Account deleted successfully.');
      // Sign out and close dialogs
      signOut();
      setShowDeleteModal(false);
      onClose();
    } catch (err: any) {
      console.error(err);
      const resp = err?.response?.data;
      const msg = typeof resp === 'string' ? resp : (resp?.message || 'Failed to delete account.');
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }; 

  const countries = ['USA', 'United Kingdom', 'Canada', 'Germany', 'France', 'Japan', 'Vietnam', 'Australia', 'Other'];
  const timezones = [
    'UTC (GMT+0)',
    'EST (GMT-5)',
    'PST (GMT-8)',
    'CET (GMT+1)',
    'IST (GMT+5:30)',
    'JST (GMT+9)',
    'ICT (GMT+7)'
  ];

  return (
    isOpen &&
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-xs" onClick={handleBackdropClick} >
      <div className="bg-white dark:bg-[#191919] w-full max-w-5xl h-[650px] rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-200 font-sans">

        {/* SIDEBAR */}
        <div className="hidden md:flex w-[220px] bg-[#F7F7F5] dark:bg-[#202020] border-r border-gray-200 dark:border-[#2f2f2f] flex flex-col">

          <div className="flex-1 overflow-y-auto px-2 space-y-6 mt-3">

            {sidebarGroups.map((group, idx) => (
              <div key={idx}>
                <div className="px-3 mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {group.title}
                </div>
                <ul className="space-y-0.5">
                  {group.items.map(item => (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveTab(item.id)}
                        className={`cursor-pointer w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === item.id
                          ? 'bg-gray-200/60 dark:bg-white/10 text-gray-900 dark:text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                          }`}
                      >
                        <item.icon size={16} strokeWidth={2} />
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-[#2f2f2f]">
            <button onClick={onClose} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
              <LogOut size={16} /> Log out
            </button>
          </div>
        </div>
        {/* SIDEBAR - MOBILE (Horizontal Header & Nav) */}
        <div className="md:hidden w-full bg-[#F7F7F5] dark:bg-[#202020] border-b border-gray-200 dark:border-[#2f2f2f] flex flex-col shrink-0">
          {/* Mobile Header */}
          <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200 dark:border-[#353535]">
            <span className="font-bold text-gray-900 dark:text-white text-base">Settings</span>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400">
              <X size={20} />
            </button>
          </div>
          {/* Horizontal Scroll Nav */}
          <div className="flex items-center gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
            {sidebarGroups.flatMap(g => g.items).map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`cursor-pointer whitespace-nowrap flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-colors border ${activeTab === item.id
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-black border-transparent'
                  : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10'
                  }`}
              >
                <item.icon size={14} />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-white dark:bg-[#191919] relative">

          {/* Header */}
          <div className="h-14 px-8 border-b border-gray-100 dark:border-[#2f2f2f] flex items-center justify-between shrink-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{activeTab}</h2>
            <button onClick={onClose} className="hidden md:flex p-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 md:p-8 scroll-smooth overscroll-contain">

            {/* --- TAB: MY ACCOUNT --- */}
            {activeTab === 'My account' && (
              <div className="max-w-2xl mx-auto space-y-10 overscroll-contain overflow-y">
                {/* Photo Section */}
                <div className="flex items-center gap-6 pb-6 border-b border-gray-100 dark:border-[#2f2f2f]">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden border border-gray-200 dark:border-white/10">
                      {formData.avatarUrl ? (
                        <img
                          src={formData.avatarUrl}
                          className="w-full h-full object-cover"
                          alt="avatar"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl font-medium text-gray-400">
                          {getInitials()}
                        </div>
                      )} 

                    </div>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium">
                      Change
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-900 dark:text-white">Profile photo</h3>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-3">Upload a new avatar. Larger images will be resized automatically.</div>
                    <button onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer text-sm border border-gray-300 dark:border-[#3f3f3f] px-3 py-1 rounded hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-700 dark:text-gray-200">
                      Upload photo
                    </button>
                  </div>
                </div>

                {/* Personal Info */}
                <div className="space-y-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Personal Information</h3>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-[#3f3f3f] rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-[#3f3f3f] rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Username</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 pl-9 bg-transparent border border-gray-300 dark:border-[#3f3f3f] rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                        />
                        <AtSign size={15} className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 pl-9 bg-transparent border border-gray-300 dark:border-[#3f3f3f] rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                        />
                        <Mail size={16} className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                      <textarea
                        name="bio"
                        value={formData.bio || ''}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-[#3f3f3f] rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date of birth</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth ? formData.dateOfBirth.slice(0, 10) : ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-[#3f3f3f] rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="pt-6 border-t border-gray-100 dark:border-[#2f2f2f]">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Password & Security</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Password</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Set a permanent password to login to your account.</div>
                    </div>
                    <button
                      onClick={() => setShowChangePasswordDialog(true)}
                      className="text-sm border border-gray-300 dark:border-[#3f3f3f] px-3 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-700 dark:text-gray-200"
                    >
                      Change password
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="pt-6 border-t border-gray-100 dark:border-[#2f2f2f]">
                  <h3 className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-4">Danger Zone</h3>
                  <div className="flex items-center justify-between group">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Delete account</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Permanently remove your account and all of its contents.</div>
                    </div>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className={`text-sm px-3 py-1.5 rounded transition-colors flex items-center gap-2 ${isDeleting ? 'bg-red-300 text-white cursor-not-allowed' : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10'}`}
                    >
                      <Trash2 size={14} /> {isDeleting ? 'Deleting...' : 'Delete account'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB: MY SETTINGS (Appearance & Privacy) --- */}
            {activeTab === 'My settings' && (
              <div className="max-w-2xl mx-auto space-y-10">
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Appearance</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Interface theme</div>
                      <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-lg p-1">
                        {[
                          { id: 'light', label: 'Light', icon: Sun },
                          { id: 'dark', label: 'Dark', icon: Moon },
                          { id: 'system', label: 'System', icon: Monitor },
                        ].map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => setTheme(opt.id as Theme)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${theme === opt.id
                              ? 'bg-white dark:bg-[#2f2f2f] text-gray-900 dark:text-white shadow-sm'
                              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                              }`}
                          >
                            <opt.icon size={12} /> {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-[#2f2f2f]">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Privacy</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">Private Profile</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mt-0.5">When enabled, your profile will only be visible to users you approve.</div>
                      </div>
                      <button
                        onClick={() => { setPrivacySettings(p => ({ ...p, isPrivate: !p.isPrivate })); setIsDirty(true); }}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${privacySettings.isPrivate ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${privacySettings.isPrivate ? 'translate-x-4.5' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">Show Activity Status</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mt-0.5">Allow the people you follow to see when you are active.</div>
                      </div>
                      <button
                        onClick={() => { setPrivacySettings(p => ({ ...p, showActivity: !p.showActivity })); setIsDirty(true); }}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${privacySettings.showActivity ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${privacySettings.showActivity ? 'translate-x-4.5' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB: LANGUAGE & REGION --- */}
            {activeTab === 'Language & region' && (
              <div className="max-w-2xl mx-auto space-y-10">
                <div className="space-y-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Region</h3>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
                      <div className="relative">
                        <select
                          name="country"
                          value={formData.country || ''}
                          onChange={handleInputChange}
                          className="w-full appearance-none px-3 py-2 bg-transparent border border-gray-300 dark:border-[#3f3f3f] rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                        >
                          <option value="" disabled>Select Country</option>
                          {countries.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronRight size={16} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none rotate-90" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city || ''}
                        onChange={handleInputChange}
                        placeholder="e.g. San Francisco"
                        className="w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-[#3f3f3f] rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-[#2f2f2f]">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Date & Time</h3>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Timezone</label>
                    <div className="relative">
                      <select
                        name="timezone"
                        value={formData.timezone || ''}
                        onChange={handleInputChange}
                        className="w-full appearance-none px-3 py-2 bg-transparent border border-gray-300 dark:border-[#3f3f3f] rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                      >
                        <option value="" disabled>Select Timezone</option>
                        {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                      </select>
                      <Clock size={16} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your timezone is currently determined by your device location.</p>
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB: NOTIFICATIONS --- */}
            {activeTab === 'Notifications' && (
              <div className="max-w-2xl mx-auto py-12 text-center">
                <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="text-gray-400" size={24} />
                </div>
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">You're all caught up</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">Check back later for new notification settings and preferences.</p>
              </div>
            )}
          </div>

          {/* Floating Save Action Bar (Notion style: pops up or sticks bottom) */}
          {isDirty && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 dark:bg-white/10 backdrop-blur-md text-white dark:text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-200 z-10">
              <span className="text-sm font-medium">Unsaved changes</span>
              <div className="h-4 w-[1px] bg-white/20"></div>
              <button onClick={() => { setAvatarFile(null); setFormData(user); setPrivacySettings(user?.privacySettings ?? { isPrivate: false, showActivity: true }); setIsDirty(false); }} className="text-xs hover:underline opacity-80 hover:opacity-100">Reset</button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${isSaving ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
              >
                {isSaving ? 'Updating...' : 'Update'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Dialog */}
      <ChangePasswordDialog isOpen={showChangePasswordDialog} onClose={() => setShowChangePasswordDialog(false)} />

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDeleteModal(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-[#191919] rounded-xl shadow-2xl p-6 z-10">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Confirm account deletion</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Bạn có chắc muốn xóa tài khoản? Hành động này sẽ xóa toàn bộ dữ liệu và không thể hoàn tác.</p>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setShowDeleteModal(false)} className="px-3 py-1.5 rounded-md text-sm border border-gray-300 dark:border-[#3f3f3f]">Cancel</button>
              <button onClick={performDeleteAccount} disabled={isDeleting} className={`px-3 py-1.5 rounded-md text-sm font-semibold ${isDeleting ? 'bg-red-300 text-white cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}>
                {isDeleting ? 'Deleting...' : 'Delete account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsDialog;
