import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PasswordInput } from './PasswordInput';
import { PasswordRequirements } from './PasswordRequirements';
import { UserPlus, AlertCircle, CheckCircle2, Mail, RefreshCw, LogIn, Phone } from 'lucide-react';

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  onSwitchToPhoneOtp?: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, onSwitchToLogin, onSwitchToPhoneOtp }) => {
  const { signup, resendVerificationEmail } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Verification required state
  const [verificationPending, setVerificationPending] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  const isPasswordValid =
    password.length >= 6 &&
    /[A-Z]/.test(password) &&
    /[^A-Za-z0-9\s]/.test(password) &&
    !/\s/.test(password);

  const isFormReady =
    email.trim().length > 0 &&
    isPasswordValid &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const handleResend = async () => {
    if (!registeredEmail) return;
    setResendLoading(true);
    setResendSuccess(null);
    try {
      await resendVerificationEmail(registeredEmail);
      setResendSuccess('Verification link resent! Please check your inbox and spam folder.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmError(null);
    setSuccessMsg(null);

    let hasError = false;
    const cleanEmail = email.trim().toLowerCase();

    // Email check
    if (!cleanEmail) {
      setEmailError('Email is required.');
      hasError = true;
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
      setEmailError('Enter a valid email address.');
      hasError = true;
    }

    // Password check
    if (!password) {
      setPasswordError('Password is required.');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Password must contain at least 6 characters.');
      hasError = true;
    } else if (!/[A-Z]/.test(password)) {
      setPasswordError('Password must contain at least one capital letter.');
      hasError = true;
    } else if (!/[^A-Za-z0-9\s]/.test(password)) {
      setPasswordError('Password must contain at least one symbol.');
      hasError = true;
    } else if (/\s/.test(password)) {
      setPasswordError('Password must not contain spaces.');
      hasError = true;
    }

    // Confirm password check
    if (!confirmPassword) {
      setConfirmError('Please confirm your password.');
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmError('Passwords do not match.');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    try {
      const res = await signup({
        email: cleanEmail,
        password,
        confirm_password: confirmPassword,
        full_name: fullName.trim() || undefined,
      });

      if (res.access_token) {
        // Instant login without confirmation
        setSuccessMsg('Account created successfully! Logging you in...');
        if (onSuccess) {
          setTimeout(onSuccess, 800);
        }
      } else {
        // Confirmation required by Supabase
        setRegisteredEmail(cleanEmail);
        setVerificationPending(true);
      }
    } catch (err: any) {
      let msg = err.message || 'An error occurred during signup.';
      if (msg.includes('User already registered') || msg.includes('already exists')) {
        msg = 'An account with this email address already exists. Please try logging in.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  if (verificationPending) {
    return (
      <div style={{ width: '100%', textAlign: 'center', padding: '0.5rem 0' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#fef3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            color: '#d97706',
          }}
        >
          <Mail size={32} />
        </div>

        <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>
          Verify Your Email Address
        </h3>

        <p style={{ fontSize: '0.92rem', color: '#475569', marginBottom: '1.25rem', lineHeight: '1.5' }}>
          We've sent a verification link to <strong>{registeredEmail}</strong>.<br />
          Please open your email inbox and click the link to activate your account.
        </p>

        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '0.85rem 1rem',
            fontSize: '0.82rem',
            color: '#64748b',
            marginBottom: '1.5rem',
            textAlign: 'left',
          }}
        >
          <strong>⚠️ Don't see the email?</strong>
          <ul style={{ margin: '0.35rem 0 0 1.2rem', padding: 0 }}>
            <li>Check your <strong>Spam</strong> or <strong>Junk</strong> folder.</li>
            <li>Allow 1-2 minutes for the email to arrive.</li>
            <li>If you are running in local/test mode, you can disable <em>"Confirm email"</em> in your Supabase Auth settings for instant access.</li>
          </ul>
        </div>

        {resendSuccess && (
          <div
            style={{
              padding: '0.65rem 0.9rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid #6ee7b7',
              color: '#059669',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{resendSuccess}</span>
          </div>
        )}

        {errorMsg && (
          <div
            style={{
              padding: '0.65rem 0.9rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #fca5a5',
              color: '#dc2626',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {onSwitchToLogin && (
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
            >
              <LogIn size={18} />
              <span>Go to Login</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading}
            style={{
              background: 'transparent',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '0.65rem',
              fontSize: '0.88rem',
              fontWeight: 600,
              color: '#475569',
              cursor: resendLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <RefreshCw size={15} className={resendLoading ? 'animate-spin' : ''} />
            <span>{resendLoading ? 'Resending Link...' : 'Resend Verification Link'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ width: '100%' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '0.25rem' }}>
        Create Rythu Sahaya Account
      </h3>
      <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.25rem' }}>
        Register to save your price forecasts & crop disease diagnosis history.
      </p>

      {errorMsg && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #fca5a5',
            color: '#dc2626',
            fontSize: '0.88rem',
            fontWeight: 600,
            marginBottom: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid #6ee7b7',
            color: '#059669',
            fontSize: '0.88rem',
            fontWeight: 600,
            marginBottom: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Full Name Field */}
      <div style={{ marginBottom: '1rem' }}>
        <label
          htmlFor="signup-name"
          style={{
            display: 'block',
            fontSize: '0.88rem',
            fontWeight: 700,
            color: 'var(--primary-dark)',
            marginBottom: '0.4rem',
          }}
        >
          Full Name / Farmer Name
        </label>
        <input
          id="signup-name"
          type="text"
          className="form-input"
          style={{ width: '100%' }}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. Ramesh Kumar"
          autoComplete="name"
        />
      </div>

      {/* Email Field */}
      <div style={{ marginBottom: '1rem' }}>
        <label
          htmlFor="signup-email"
          style={{
            display: 'block',
            fontSize: '0.88rem',
            fontWeight: 700,
            color: 'var(--primary-dark)',
            marginBottom: '0.4rem',
          }}
        >
          Email Address <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          id="signup-email"
          type="email"
          className="form-input"
          style={{
            borderColor: emailError ? '#ef4444' : undefined,
            width: '100%',
          }}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError(null);
          }}
          placeholder="farmer@example.com"
          autoComplete="email"
          required
        />
        {emailError && (
          <p style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: '0.35rem', fontWeight: 500 }}>
            {emailError}
          </p>
        )}
      </div>

      {/* Password Field */}
      <PasswordInput
        id="signup-password"
        label="Password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (passwordError) setPasswordError(null);
        }}
        autocomplete="new-password"
        error={passwordError || undefined}
        required
      />

      {/* Confirm Password Field */}
      <PasswordInput
        id="signup-confirm-password"
        label="Confirm Password"
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          if (confirmError) setConfirmError(null);
        }}
        autocomplete="new-password"
        placeholder="Re-enter password"
        error={confirmError || undefined}
        required
      />

      {/* Password Requirements Checklist */}
      <PasswordRequirements
        password={password}
        confirmPassword={confirmPassword}
        showConfirmCheck
      />

      {/* Submit Button */}
      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading || !isFormReady}
        style={{
          width: '100%',
          padding: '0.75rem',
          fontSize: '1rem',
          fontWeight: 700,
          marginTop: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          opacity: isFormReady && !loading ? 1 : 0.7,
        }}
      >
        {loading ? (
          <span>Creating Account...</span>
        ) : (
          <>
            <UserPlus size={18} />
            <span>Create Account</span>
          </>
        )}
      </button>

      {/* Switch to Phone OTP */}
      {onSwitchToPhoneOtp && (
        <div style={{ textAlign: 'center', marginTop: '0.85rem' }}>
          <button
            type="button"
            onClick={onSwitchToPhoneOtp}
            style={{
              background: 'none',
              border: 'none',
              color: '#059669',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Phone size={14} />
            <span>Prefer SMS OTP? Login with Mobile Number</span>
          </button>
        </div>
      )}

      {/* Switch to Login */}
      {onSwitchToLogin && (
        <p style={{ textAlign: 'center', fontSize: '0.88rem', color: '#64748b', marginTop: '1.25rem' }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            Log In
          </button>
        </p>
      )}
    </form>
  );
};
