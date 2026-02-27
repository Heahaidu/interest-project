"use client";

import { useState } from 'react';
import Login from './Login';
import Register from './Register';

type AuthMode = 'login' | 'register';

interface AuthModalProps {
  initialMode?: AuthMode;
  onSuccess?: () => void;
}

export default function AuthModal({ initialMode = 'login', onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  return (
    <div className="relative">
      {mode === 'login' ? (
        <Login
          onSuccess={onSuccess}
          openRegister={() => setMode('register')}
        />
      ) : (
        <Register
          onSuccess={onSuccess}
          openLogin={() => setMode('login')}
        />
      )}
    </div>
  );
}