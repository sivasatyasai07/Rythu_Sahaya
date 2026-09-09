import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Phone, KeyRound, ArrowLeft, RefreshCw, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

interface PhoneOtpFormProps {
  onSuccess?: () => void;
  onSwitchToEmailLogin?: () => void;
}

const COUNTRY_CODES = [
  { code: '+91', country: 'IN', label: 'India (+91)' },
  { code: '+1', country: 'US', label: 'USA / Canada (+1)' },
  { code: '+44', country: 'GB', label: 'UK (+44)' },
  { code: '+971', country: 'AE', label: 'UAE (+971)' },
  { code: '+61', country: 'AU', label: 'Australia (+61)' },
  { code: '+65', country: 'SG', label: 'Singapore (+65)' },
  { code: '+60', country: 'MY', label: 'Malaysia (+60)' },
  { code: '+966', country: 'SA', label: 'Saudi Arabia (+966)' },
];

export const PhoneOtpForm: React.FC<PhoneOtpFormProps> = ({ onSuccess, onSwitchToEmailLogin }) => {
  const { sendPhoneOtp, verifyPhoneOtp } = useAuth();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [countryCode, setCountryCode] = useState<string>('+91');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [fullE164Phone, setFullE164Phone] = useState<string>('');
  
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for resend cooldown
  useEffect(() => {
    let timer: number;
    if (resendCooldown > 0) {
      timer = window.setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus first OTP box when entering OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  // Handle phone submission to send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanNum = phoneNumber.trim().replace(/\D/g, '');
    if (!cleanNum) {
      setErrorMsg('Please enter a valid mobile phone number.');
      return;
    }

    if (countryCode === '+91' && cleanNum.length !== 10) {
      setErrorMsg('Indian phone number must be exactly 10 digits.');
      return;
    }

    const formattedE164 = `${countryCode}${cleanNum}`;
    setFullE164Phone(formattedE164);
    setLoading(true);

    try {
      await sendPhoneOtp(formattedE164);
      setSuccessMsg(`Verification code sent via SMS to ${formattedE164}.`);
      setStep('otp');
      setOtpDigits(['', '', '', '', '', '']);
      setResendCooldown(30);
    } catch (err: any) {
      let msg = err.message || 'Failed to send SMS OTP. Please check the phone number.';
      if (msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('too many')) {
        msg = 'Too many attempts. Please wait a minute before requesting another OTP.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading || !fullE164Phone) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      await sendPhoneOtp(fullE164Phone);
      setSuccessMsg(`New 6-digit verification code sent to ${fullE164Phone}.`);
      setResendCooldown(30);
      setOtpDigits(['', '', '', '', '', '']);
      otpInputsRef.current[0]?.focus();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend SMS OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Handle individual OTP input changes
  const handleOtpChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = cleanVal;
    setOtpDigits(updated);

    // Auto-advance to next box
    if (cleanVal && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation in OTP input
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Handle pasting full 6-digit OTP
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (!pastedData) return;

    const digits = pastedData.slice(0, 6).split('');
    const updated = ['', '', '', '', '', ''];
    digits.forEach((d, idx) => {
      if (idx < 6) updated[idx] = d;
    });
    setOtpDigits(updated);

    const focusIdx = Math.min(digits.length, 5);
    otpInputsRef.current[focusIdx]?.focus();
  };

  // Handle OTP verification submission
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const fullOtp = otpDigits.join('').trim();
    if (fullOtp.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the verification code.');
      return;
    }

    setLoading(true);
    try {
      await verifyPhoneOtp(fullE164Phone, fullOtp);
      setSuccessMsg('Phone verified successfully! Logging you in...');
      if (onSuccess) {
        setTimeout(onSuccess, 400);
      }
    } catch (err: any) {
      let msg = err.message || 'Invalid or expired OTP. Please try again.';
      if (msg.toLowerCase().includes('token has expired') || msg.toLowerCase().includes('expired')) {
        msg = 'Verification code has expired. Please tap "Resend Code".';
      } else if (msg.toLowerCase().includes('invalid token') || msg.toLowerCase().includes('bad token')) {
        msg = 'Incorrect 6-digit code. Please check and re-enter.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Alert Banners */}
      {errorMsg && (
        <div
          style={{
            padding: '0.65rem 0.85rem',
            borderRadius: '10px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#b91c1c',
            fontSize: '0.82rem',
            fontWeight: 600,
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div
          style={{
            padding: '0.65rem 0.85rem',
            borderRadius: '10px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #86efac',
            color: '#15803d',
            fontSize: '0.82rem',
            fontWeight: 600,
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
          <span>{successMsg}</span>
        </div>
      )}

      {step === 'phone' ? (
        /* STEP 1: PHONE NUMBER INPUT */
        <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-dark)', margin: '0 0 0.25rem 0' }}>
              Farmer Phone Login
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Enter your mobile number to receive an instant SMS verification code.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              Mobile Number <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '0.45rem' }}>
              {/* Country Code Select */}
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="form-select"
                style={{
                  width: '100px',
                  minHeight: '44px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--primary-dark)',
                  backgroundColor: '#f8fafc',
                  flexShrink: 0,
                  borderRadius: '10px',
                }}
                aria-label="Country Code"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.country})
                  </option>
                ))}
              </select>

              {/* Phone Number Input */}
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="form-input"
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    paddingLeft: '2.5rem',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                    borderRadius: '10px',
                  }}
                  autoFocus
                  required
                />
                <Phone
                  size={16}
                  color="#64748b"
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
              We will send a 6-digit SMS verification code to this number.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              minHeight: '44px',
              fontSize: '0.92rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              borderRadius: '10px',
              marginTop: '0.25rem',
            }}
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="spin" />
                <span>Sending SMS Code…</span>
              </>
            ) : (
              <>
                <ShieldCheck size={17} />
                <span>Send SMS Verification Code</span>
              </>
            )}
          </button>
        </form>
      ) : (
        /* STEP 2: 6-DIGIT OTP VERIFICATION */
        <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>
                Enter 6-Digit OTP
              </h3>
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: 0,
                }}
              >
                <ArrowLeft size={13} />
                <span>Edit Number</span>
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Sent to <strong style={{ color: 'var(--text-main)' }}>{fullE164Phone}</strong> via SMS.
            </p>
          </div>

          {/* 6-Digit Segmented Box Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', textAlign: 'center' }}>
              Enter 6-Digit Verification Code
            </label>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.45rem',
                width: '100%',
              }}
            >
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    otpInputsRef.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  onPaste={idx === 0 ? handleOtpPaste : undefined}
                  style={{
                    width: 'min(46px, 13vw)',
                    height: '52px',
                    textAlign: 'center',
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    borderRadius: '10px',
                    border: digit ? '2px solid var(--primary)' : '1.5px solid #cbd5e1',
                    backgroundColor: digit ? 'var(--primary-subtle)' : '#ffffff',
                    color: 'var(--primary-dark)',
                    outline: 'none',
                    boxShadow: digit ? '0 2px 6px rgba(27, 67, 50, 0.15)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                  aria-label={`OTP Digit ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Resend Cooldown Section */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem', color: '#64748b' }}>
            {resendCooldown > 0 ? (
              <span>Resend code in <strong style={{ color: 'var(--primary-dark)' }}>{resendCooldown}s</strong></span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.2rem 0.4rem',
                }}
              >
                <RefreshCw size={13} className={loading ? 'spin' : ''} />
                <span>Resend Code</span>
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || otpDigits.join('').length !== 6}
            className="btn-primary"
            style={{
              width: '100%',
              minHeight: '44px',
              fontSize: '0.92rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              borderRadius: '10px',
            }}
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="spin" />
                <span>Verifying Code…</span>
              </>
            ) : (
              <>
                <KeyRound size={17} />
                <span>Verify & Login</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Switch to Email Login link */}
      {onSwitchToEmailLogin && (
        <div style={{ textAlign: 'center', marginTop: '1.25rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
          <button
            type="button"
            onClick={onSwitchToEmailLogin}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Prefer password? <strong style={{ color: 'var(--primary)' }}>Login with Email</strong>
          </button>
        </div>
      )}
    </div>
  );
};
