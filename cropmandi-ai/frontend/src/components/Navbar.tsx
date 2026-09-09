import React, { useState, useEffect, useRef } from 'react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import {
  TrendingUp,
  Sprout,
  CloudSun,
  Globe,
  Landmark,
  Sparkles,
  X,
  ShieldCheck,
  LogOut,
  Settings,
  LogIn,
  UserPlus,
  LayoutDashboard,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthHeaderButton } from './auth/AuthHeaderButton';
import { AuthModal } from './auth/AuthModal';
import { UserProfileModal } from './auth/UserProfileModal';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
}) => {
  const { user, profile, isAuthenticated, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const t = translations[language] || translations.en;

  const getDiseaseTabLabel = () => {
    switch (language) {
      case 'te': return 'పంట వ్యాధులు';
      case 'hi': return 'फसल रोग';
      case 'ta': return 'பயிர் நோய்';
      case 'ml': return 'വിള രോഗങ്ങൾ';
      default: return 'Crop Disease';
    }
  };

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawerOpen) {
        setDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const navItems = [
    { id: 'forecast', label: t.tabs.forecast, icon: TrendingUp, desc: 'AI modal price & 3-day forecast' },
    { id: 'trends', label: t.tabs.trends, icon: Sprout, desc: 'Historical trends & mandi comparison' },
    { id: 'disease', label: getDiseaseTabLabel(), icon: Sparkles, desc: 'Leaf pathology & organic advisory' },
    { id: 'weather', label: t.tabs.weather, icon: CloudSun, desc: 'APMC mandi microclimate radar' },
    { id: 'schemes', label: t.tabs.schemes, icon: Landmark, desc: 'Govt subsidies & welfare schemes' },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const displayName = profile?.full_name || user?.profile?.full_name || user?.email?.split('@')[0] || 'Farmer';
  const displayEmail = user?.email || '';

  return (
    <>
      <header
        style={{
          borderBottom: '1px solid var(--border-color)',
          background: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          width: '100%',
        }}
      >
        <div className="navbar-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '1280px', margin: '0 auto' }}>
          
          {/* Brand Logo & Title Area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flexShrink: 0 }}>
            <img
              src="/logo.png"
              alt="Rythu Sahaya Logo"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--primary)',
                boxShadow: 'var(--shadow-sm)',
                flexShrink: 0,
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: 'var(--primary-dark)',
                    lineHeight: 1.2,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Rythu Sahaya
                </span>
                <span
                  className="badge badge-green"
                  style={{ fontSize: '0.65rem', padding: '0.12rem 0.45rem', flexShrink: 0, fontWeight: 700 }}
                >
                  APMC AI
                </span>
              </div>
              <div
                className="desktop-only"
                style={{
                  fontSize: '0.74rem',
                  color: 'var(--text-muted)',
                  fontWeight: 500,
                  marginTop: '0.1rem',
                  whiteSpace: 'nowrap',
                }}
              >
                Better Market. Best Price. Save Time.
              </div>
            </div>
          </div>

          {/* Right Navigation Controls */}
          <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            
            {/* Desktop Navigation Tabs (Hidden on Mobile/Tablet < 1024px) */}
            <nav className="navbar-nav desktop-only" aria-label="Main Navigation" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {navItems.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleNavClick(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.55rem 0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      background: isActive ? 'var(--primary)' : 'transparent',
                      color: isActive ? '#ffffff' : 'var(--text-main)',
                      fontWeight: isActive ? 700 : 600,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                    }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={16} color={isActive ? '#ffffff' : 'var(--primary)'} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Desktop 5-Language Selector */}
            <div
              className="desktop-only"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: 'var(--accent-gold-light)',
                padding: '0.35rem 0.55rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(217,119,6,0.3)',
                flexShrink: 0,
              }}
            >
              <Globe size={15} color="#92400e" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#92400e',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  outline: 'none',
                  paddingRight: '0.2rem',
                }}
                aria-label="Select Language"
              >
                <option value="en">English</option>
                <option value="te">తెలుగు</option>
                <option value="hi">हिंदी</option>
                <option value="ml">മലയാളം</option>
                <option value="ta">தமிழ்</option>
              </select>
            </div>

            {/* Top-Right Account Trigger (Desktop) */}
            <div className="desktop-only">
              <AuthHeaderButton />
            </div>

            {/* Mobile Top-Right Language Quick Switcher */}
            <div
              className="mobile-only"
              style={{
                alignItems: 'center',
                gap: '0.25rem',
                background: 'var(--accent-gold-light)',
                padding: '0.25rem 0.45rem',
                borderRadius: '8px',
                border: '1px solid rgba(217,119,6,0.25)',
              }}
            >
              <Globe size={13} color="#92400e" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#92400e',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  outline: 'none',
                }}
                aria-label="Select Language"
              >
                <option value="en">EN</option>
                <option value="te">తె</option>
                <option value="hi">हि</option>
                <option value="ml">മ</option>
                <option value="ta">த</option>
              </select>
            </div>

          </div>
        </div>
      </header>

      {/* Left Mini Icon Dock (Visible on Mobile when Dashboard is Closed) */}
      <aside className="left-mini-dock mobile-only" aria-label="Page Quick Navigation Symbols">
        {/* Dashboard Open Button */}
        <button
          type="button"
          className="left-mini-dock-btn dashboard-trigger"
          onClick={() => setDrawerOpen(true)}
          title="Open Dashboard"
          aria-label="Open Full Dashboard Menu"
        >
          <LayoutDashboard size={19} />
        </button>

        {/* Divider */}
        <div style={{ width: '26px', height: '1px', background: '#e2e8f0', margin: '0.15rem 0' }} />

        {/* Symbols of Pages */}
        {navItems.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`left-mini-dock-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleNavClick(tab.id)}
              title={tab.label}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={18} color={isActive ? 'var(--primary-dark)' : '#64748b'} strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <span
                  style={{
                    position: 'absolute',
                    left: '2px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '3px',
                    height: '16px',
                    borderRadius: '2px',
                    background: 'var(--primary)',
                  }}
                />
              )}
            </button>
          );
        })}
      </aside>

      {/* Left-Side Mobile Dashboard Drawer */}
      {drawerOpen && (
        <div
          className="mobile-drawer-overlay"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        >
          <div
            className="mobile-drawer-content"
            ref={drawerRef}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Dashboard & Menu"
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '1.15rem 1.25rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--bg-primary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                  <LayoutDashboard size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--primary-dark)' }}>
                    Rythu Dashboard
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    APMC AI Mandi Intelligence
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  borderRadius: '8px',
                }}
                aria-label="Close dashboard"
              >
                <X size={22} />
              </button>
            </div>

            {/* Scrollable Dashboard Body */}
            <div style={{ padding: '1rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              
              {/* User Profile / Auth Status Card */}
              {isAuthenticated && user ? (
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: user.role === 'admin' ? '#7c3aed' : 'var(--primary)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1rem',
                        flexShrink: 0,
                      }}
                    >
                      {user.role === 'admin' ? <ShieldCheck size={20} /> : displayName.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--primary-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {displayName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {displayEmail}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.45rem', marginTop: '0.15rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setDrawerOpen(false);
                        setProfileModalOpen(true);
                      }}
                      className="btn-secondary"
                      style={{ flex: 1, padding: '0.45rem 0.65rem', fontSize: '0.8rem', minHeight: '38px' }}
                    >
                      <Settings size={14} />
                      <span>Edit Profile</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDrawerOpen(false);
                        logout();
                      }}
                      style={{
                        padding: '0.45rem 0.75rem',
                        fontSize: '0.8rem',
                        minHeight: '38px',
                        borderRadius: '8px',
                        border: '1px solid #fecaca',
                        background: '#fef2f2',
                        color: '#dc2626',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <LogOut size={14} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                    Welcome to Rythu Sahaya
                  </div>
                  <div style={{ display: 'flex', gap: '0.45rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setDrawerOpen(false);
                        setAuthMode('login');
                        setAuthModalOpen(true);
                      }}
                      className="btn-primary"
                      style={{ flex: 1, minHeight: '40px', fontSize: '0.82rem' }}
                    >
                      <LogIn size={15} />
                      <span>Log In</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDrawerOpen(false);
                        setAuthMode('signup');
                        setAuthModalOpen(true);
                      }}
                      className="btn-secondary"
                      style={{ flex: 1, minHeight: '40px', fontSize: '0.82rem' }}
                    >
                      <UserPlus size={15} />
                      <span>Sign Up</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation Modules */}
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                  APMC Mandi Services
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {navItems.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleNavClick(tab.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          width: '100%',
                          padding: '0.75rem 0.85rem',
                          borderRadius: '10px',
                          border: isActive ? '1.5px solid var(--primary)' : '1px solid #f1f5f9',
                          background: isActive ? 'var(--primary-subtle)' : '#ffffff',
                          color: isActive ? 'var(--primary-dark)' : 'var(--text-main)',
                          fontWeight: isActive ? 800 : 600,
                          fontSize: '0.92rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                          minHeight: '48px',
                          transition: 'all 0.15s ease',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                        }}
                      >
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
                            background: isActive ? 'var(--primary)' : '#f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Icon size={18} color={isActive ? '#ffffff' : 'var(--primary)'} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.92rem', fontWeight: 700 }}>{tab.label}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {tab.desc}
                          </div>
                        </div>
                        <ChevronRight size={16} color={isActive ? 'var(--primary)' : '#cbd5e1'} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5-Language Switcher */}
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Globe size={13} />
                  <span>Choose Language / భాష / भाषा</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'te', label: 'తెలుగు' },
                    { code: 'hi', label: 'हिंदी' },
                    { code: 'ml', label: 'മലയാളം' },
                    { code: 'ta', label: 'தமிழ்' },
                  ].map((lang) => {
                    const isSelected = language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setLanguage(lang.code as Language);
                        }}
                        style={{
                          padding: '0.55rem 0.65rem',
                          borderRadius: '8px',
                          border: isSelected ? '1.5px solid var(--primary)' : '1px solid #cbd5e1',
                          background: isSelected ? 'var(--primary-subtle)' : '#ffffff',
                          color: isSelected ? 'var(--primary-dark)' : '#334155',
                          fontWeight: isSelected ? 800 : 600,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          textAlign: 'center',
                          minHeight: '40px',
                        }}
                      >
                        {lang.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Sync Status Banner */}
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.76rem',
                  color: '#166534',
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={16} color="#16a34a" />
                <span>data.gov.in & APMC Live API Active</span>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Auth Modal Triggered from Drawer */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />

      {/* Profile Modal Triggered from Drawer */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  );
};
