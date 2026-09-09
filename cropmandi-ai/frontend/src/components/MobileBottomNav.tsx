import React from 'react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import { TrendingUp, Sprout, Sparkles, CloudSun, Landmark } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: Language;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  language,
}) => {
  const t = translations[language] || translations.en;

  const getDiseaseTabLabel = () => {
    switch (language) {
      case 'te': return 'వ్యాధులు';
      case 'hi': return 'फसल रोग';
      case 'ta': return 'நோய்';
      case 'ml': return 'രോഗങ്ങൾ';
      default: return 'Disease';
    }
  };

  const getShortTabLabel = (id: string, fullLabel: string) => {
    if (id === 'disease') return getDiseaseTabLabel();
    if (language === 'te') {
      if (id === 'forecast') return 'ధర అంచనా';
      if (id === 'trends') return 'ట్రెండ్స్';
      if (id === 'weather') return 'వాతావరణం';
      if (id === 'schemes') return 'పథకాలు';
    }
    if (language === 'hi') {
      if (id === 'forecast') return 'भाव अनुमान';
      if (id === 'trends') return 'ट्रेंड्स';
      if (id === 'weather') return 'मौसम';
      if (id === 'schemes') return 'योजनाएं';
    }
    if (language === 'ta') {
      if (id === 'forecast') return 'விலை கணிப்பு';
      if (id === 'trends') return 'போக்குகள்';
      if (id === 'weather') return 'வானிலை';
      if (id === 'schemes') return 'திட்டங்கள்';
    }
    if (language === 'ml') {
      if (id === 'forecast') return 'വില പ്രവചനം';
      if (id === 'trends') return 'ട്രെൻഡുകൾ';
      if (id === 'weather') return 'കാലാവസ്ഥ';
      if (id === 'schemes') return 'പദ്ധതികൾ';
    }
    // English defaults
    if (id === 'forecast') return 'Forecast';
    if (id === 'trends') return 'Trends';
    if (id === 'weather') return 'Weather';
    if (id === 'schemes') return 'Schemes';
    return fullLabel;
  };

  const tabs = [
    { id: 'forecast', label: getShortTabLabel('forecast', t.tabs.forecast), icon: TrendingUp },
    { id: 'trends', label: getShortTabLabel('trends', t.tabs.trends), icon: Sprout },
    { id: 'disease', label: getShortTabLabel('disease', 'Disease'), icon: Sparkles },
    { id: 'weather', label: getShortTabLabel('weather', t.tabs.weather), icon: CloudSun },
    { id: 'schemes', label: getShortTabLabel('schemes', t.tabs.schemes), icon: Landmark },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            aria-selected={isActive}
            aria-label={tab.label}
          >
            <div className="mobile-nav-icon-wrap">
              <Icon size={20} color={isActive ? 'var(--primary-dark)' : '#64748b'} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
