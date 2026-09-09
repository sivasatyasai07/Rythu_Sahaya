import { useState } from 'react';
import type { Language } from './i18n/translations';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { FarmerForecastTab } from './components/FarmerForecastTab';
import { PriceTrendsTab } from './components/PriceTrendsTab';
import { CropDiseaseTab } from './components/CropDiseaseTab';
import { WeatherTab } from './components/WeatherTab';
import { GovernmentSchemesTab } from './components/GovernmentSchemesTab';
import { MandiMitraChatbot } from './components/MandiMitraChatbot';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('forecast');
  const [language, setLanguage] = useState<Language>('en');

  return (
    <AuthProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden' }}>
        
        {/* Header Bar with Logo & Title */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          language={language}
          setLanguage={setLanguage}
        />

        {/* Fixed Background Watermark */}
        <div
          className="watermark-background"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 0,
            pointerEvents: 'none',
            opacity: 0.08,
            width: 'min(720px, 85vw)',
            maxHeight: '70vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
          }}
          aria-hidden="true"
        >
          <img
            src="/watermark_clean.png"
            alt="NRI Institute of Technology Watermark"
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
            }}
          />
        </div>

        {/* Main Container */}
        <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '1.5rem 1rem', position: 'relative', zIndex: 1 }}>
          {activeTab === 'forecast' && <FarmerForecastTab language={language} onNavigateTab={setActiveTab} />}
          {activeTab === 'trends' && <PriceTrendsTab language={language} />}
          {activeTab === 'disease' && <CropDiseaseTab language={language} />}
          {activeTab === 'weather' && <WeatherTab language={language} />}
          {activeTab === 'schemes' && <GovernmentSchemesTab language={language} />}
        </main>

        {/* Floating Mandi Mitra AI Chatbot */}
        <MandiMitraChatbot language={language} />

        {/* Mobile Fixed Bottom Navigation Bar (Phones/Tablets) */}
        <MobileBottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          language={language}
        />

      </div>
    </AuthProvider>
  );
}

export default App;
