import React, { useEffect, useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({ isOpen, onClose, children, className = '', size = 'md' }:ModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300); 
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-5xl'
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-300`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose}
      />
      
      {/* Content */}
      <div className={`
        relative w-full ${sizeClasses[size]} 
        bg-white dark:bg-zinc-900 
        rounded-2xl shadow-2xl overflow-hidden
        transform transition-all duration-300 ease-out
        ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}
        border border-zinc-200 dark:border-zinc-800
        ${className}
      `}>
        {children}
      </div>
    </div>
  );
};
