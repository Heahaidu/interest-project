
import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { UserProfile } from '@/lib/types';

interface FollowListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string; // 'Followers' or 'Following'
  users: UserProfile[]; // Mock data for now
}

const FollowListDialog: React.FC<FollowListDialogProps> = ({ isOpen, onClose, title, users }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#121212] w-full max-w-md h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/5">
            <h3 className="font-bold text-gray-900 dark:text-white capitalize">{title}</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500">
                <X size={20} />
            </button>
        </div>

        {/* Search */}
        <div className="p-4 pb-2">
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand-purple/50 dark:text-white"
                />
            </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredUsers.length === 0 ? (
                <div className="text-center text-gray-500 text-sm mt-10">No users found.</div>
            ) : (
                filteredUsers.map((user, idx) => (
                    <div key={user.uuid || idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img 
                                src={user.avatarUrl} 
                                alt={user.name} 
                                className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-white/10"
                            />
                            <div>
                                <div className="text-sm font-bold text-gray-900 dark:text-white leading-none">{user.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user.username}</div>
                            </div>
                        </div>
                        <button className="px-4 py-1.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white text-xs font-bold rounded-lg transition-colors">
                            {title === 'Following' ? 'Unfollow' : 'Remove'}
                        </button>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};

export default FollowListDialog;
