import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { PhoneOtpForm } from './PhoneOtpForm';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { X, LogIn, UserPlus, Phone, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'phone' | 'login' | 'signup';
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'phone',
}) => {
  const { signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'phone' | 'login' | 'signup'>(initialMode);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setGoogleError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setGoogleError(err.message || 'Failed to sign in with Google. Please try again.');
      setGoogleLoading(false);
    }
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '1rem',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        className="responsive-card-pad"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          width: '100%',
          maxWidth: '460px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          animation: 'fadeInScale 0.25s ease-out',
          margin: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '0.35rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s ease',
          }}
          aria-label="Close dialog"
        >
          <X size={22} />
        </button>

        {/* Google OAuth Button */}
        <div style={{ marginTop: '0.5rem', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            style={{
              width: '100%',
              minHeight: '44px',
              padding: '0.6rem 1rem',
              borderRadius: '10px',
              border: '1.5px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#1e293b',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.65rem',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease',
            }}
          >
            <GoogleIcon />
            <span>{googleLoading ? 'Connecting to Google…' : 'Continue with Google'}</span>
          </button>

          {googleError && (
            <div
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <AlertCircle size={14} />
              <span>{googleError}</span>
            </div>
          )}

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              margin: '1.15rem 0 0.85rem 0',
              color: '#94a3b8',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
            <span style={{ padding: '0 0.65rem' }}>OR CONTINUE WITH</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
          </div>
        </div>

        {/* 3-Way Mode Toggle (Phone OTP | Email Login | Sign Up) */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#f1f5f9',
            borderRadius: '10px',
            padding: '0.25rem',
            marginBottom: '1.25rem',
            gap: '0.2rem',
          }}
        >
          <button
            type="button"
            onClick={() => setMode('phone')}
            style={{
              flex: 1,
              padding: '0.55rem 0.4rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: mode === 'phone' ? '#ffffff' : 'transparent',
              color: mode === 'phone' ? 'var(--primary-dark)' : '#64748b',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: mode === 'phone' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <Phone size={14} color={mode === 'phone' ? 'var(--primary)' : '#64748b'} />
            <span>Phone OTP</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('login')}
            style={{
              flex: 1,
              padding: '0.55rem 0.4rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: mode === 'login' ? '#ffffff' : 'transparent',
              color: mode === 'login' ? 'var(--primary-dark)' : '#64748b',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: mode === 'login' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <LogIn size={14} color={mode === 'login' ? 'var(--primary)' : '#64748b'} />
            <span>Email</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('signup')}
            style={{
              flex: 1,
              padding: '0.55rem 0.4rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: mode === 'signup' ? '#ffffff' : 'transparent',
              color: mode === 'signup' ? 'var(--primary-dark)' : '#64748b',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: mode === 'signup' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <UserPlus size={14} color={mode === 'signup' ? 'var(--primary)' : '#64748b'} />
            <span>Sign Up</span>
          </button>
        </div>

        {/* Render Form based on Mode */}
        {mode === 'phone' && (
          <PhoneOtpForm
            onSuccess={onClose}
            onSwitchToEmailLogin={() => setMode('login')}
          />
        )}

        {mode === 'login' && (
          <LoginForm
            onSuccess={onClose}
            onSwitchToSignup={() => setMode('signup')}
            onSwitchToPhoneOtp={() => setMode('phone')}
          />
        )}

        {mode === 'signup' && (
          <SignupForm
            onSuccess={onClose}
            onSwitchToLogin={() => setMode('login')}
            onSwitchToPhoneOtp={() => setMode('phone')}
          />
        )}
      </div>
    </div>,
    document.body
  );
};
