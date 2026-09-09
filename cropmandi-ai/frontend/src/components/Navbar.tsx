import React from 'react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import { TrendingUp, Sprout, CloudSun, Globe, Landmark, Sparkles } from 'lucide-react';
import { AuthHeaderButton } from './auth/AuthHeaderButton';

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
  const t = translations[language];

  const getDiseaseTabLabel = () => {
    switch (language) {
      case 'te': return 'పంట వ్యాధులు';
      case 'hi': return 'फसल रोग';
      case 'ta': return 'பயிர் நோய்';
      case 'ml': return 'വിള രോഗങ്ങൾ';
      default: return 'Crop Disease';
    }
  };

  return (
    <header style={{ borderBottom: '1px solid var(--border-color)', background: '#ffffff', boxShadow: 'var(--shadow-sm)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="navbar-container">
        
        {/* Brand Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
          <img
            src="/logo.png"
            alt="Rythu Sahaya Logo"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid var(--primary)',
              boxShadow: 'var(--shadow-sm)',
              flexShrink: 0,
            }}
          />
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '0.35rem', margin: 0, lineHeight: 1.2 }}>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.appTitle}</span>
              <span className="badge badge-green desktop-only" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>APMC AI</span>
            </h1>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {t.appSubtitle}
            </div>
          </div>
        </div>

        {/* Right Navigation & 5-Language Selector */}
        <div className="navbar-right">
          
          {/* Desktop Navigation Tabs (Hidden on Mobile) */}
          <nav className="navbar-nav desktop-only">
            {[
              { id: 'forecast', label: t.tabs.forecast, icon: TrendingUp },
              { id: 'trends', label: t.tabs.trends, icon: Sprout },
              { id: 'disease', label: getDiseaseTabLabel(), icon: Sparkles },
              { id: 'weather', label: t.tabs.weather, icon: CloudSun },
              { id: 'schemes', label: t.tabs.schemes, icon: Landmark },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.55rem 0.95rem',
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
                >
                  <Icon size={16} color={isActive ? '#ffffff' : 'var(--primary)'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* 5-Language Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'var(--accent-gold-light)', padding: '0.35rem 0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(217,119,6,0.3)', flexShrink: 0 }}>
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

          {/* Top-Right Authentication Controls */}
          <AuthHeaderButton />

        </div>

      </div>
    </header>
  );
};
