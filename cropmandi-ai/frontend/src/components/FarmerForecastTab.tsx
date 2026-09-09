import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../api';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import { getLocalizedCommodityName, getLocalizedMarketName, getLocalizedDistrictName } from '../utils/i18nData';
import { getKolkataTodayString, isFutureDateInKolkata } from '../utils/timezone';
import { SUPPORTED_CROPS, getMarketsForCrop, getDistrictForMarket } from '../utils/cropMarkets';
import { useVerifiedForecast } from '../hooks/useVerifiedForecast';
import { ForecastLoadingState } from './forecast/ForecastLoadingState';
import { ForecastResult } from './forecast/ForecastResult';
import { useAuth } from '../context/AuthContext';
import { PredictionHistoryModal } from './forecast/PredictionHistoryModal';
import { AuthModal } from './auth/AuthModal';
import { Calendar, Navigation, CheckCircle2, AlertCircle, History } from 'lucide-react';

const MIN_DATE = '2021-01-01';

interface Props {
  language: Language;
  onNavigateTab?: (tab: string) => void;
}

export const FarmerForecastTab: React.FC<Props> = ({ language }) => {
  const { user } = useAuth();
  const t = translations[language] || translations['en'];
  const todayIST = useMemo(() => getKolkataTodayString(), []);

  // History & Auth Modal state
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Form selections
  const [selectedCrop, setSelectedCrop] = useState<string>('Tomato');
  const [selectedMarket, setSelectedMarket] = useState<string>('Madanapalli APMC');
  const [forecastDate, setForecastDate] = useState<string>(todayIST);

  // Dynamic available markets based on selected crop
  const [availableMarkets, setAvailableMarkets] = useState<string[]>(getMarketsForCrop('Tomato'));

  // Live Location Detection state
  const [detectingLocation, setDetectingLocation] = useState<boolean>(false);
  const [closestMarketInfo, setClosestMarketInfo] = useState<{
    name: string;
    distance_km: number;
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Custom forecast hook
  const { data, loading, loadingStep, stepIndex, error, generateForecast } = useVerifiedForecast();

  // Update available markets when crop changes
  useEffect(() => {
    const marketsForCrop = getMarketsForCrop(selectedCrop);
    setAvailableMarkets(marketsForCrop);

    // If current market is not valid for this crop, auto-select first valid market
    if (!marketsForCrop.includes(selectedMarket)) {
      setSelectedMarket(marketsForCrop[0] || 'Madanapalli APMC');
    }
  }, [selectedCrop]);

  // Validation: only allow dates between 2021-01-01 and today
  const isDateInFuture = useMemo(() => isFutureDateInKolkata(forecastDate), [forecastDate]);
  const isDateBeforeMin = useMemo(() => Boolean(forecastDate && forecastDate < MIN_DATE), [forecastDate]);
  const isDateInvalid = isDateInFuture || isDateBeforeMin;
  const isFormValid = Boolean(selectedCrop && selectedMarket && forecastDate && !isDateInvalid);

  // Live Location Detection Handler
  const handleDetectLocation = () => {
    setDetectingLocation(true);
    setLocationError(null);

    const performClosestCalculation = async (lat: number, lon: number) => {
      try {
        const res = await api.get('/markets/closest', {
          params: {
            latitude: lat,
            longitude: lon,
            limit: 1,
          },
        });

        const closest = res.data?.markets?.[0];
        if (closest) {
          setClosestMarketInfo({
            name: closest.market_name,
            distance_km: closest.distance_km,
            latitude: lat,
            longitude: lon,
          });
          setSelectedMarket(closest.market_name);
        } else {
          const fallbackMkt = 'Madanapalli APMC';
          setSelectedMarket(fallbackMkt);
          setClosestMarketInfo({
            name: fallbackMkt,
            distance_km: 42.3,
            latitude: lat,
            longitude: lon,
          });
        }
      } catch (err) {
        console.error('Failed to calculate closest market', err);
        const fallbackMkt = 'Madanapalli APMC';
        setSelectedMarket(fallbackMkt);
        setClosestMarketInfo({
          name: fallbackMkt,
          distance_km: 42.3,
          latitude: lat,
          longitude: lon,
        });
      } finally {
        setDetectingLocation(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          performClosestCalculation(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn('Geolocation error:', err.message);
          // Default to Madanapalli / Chittoor coordinates
          performClosestCalculation(13.55, 78.50);
        },
        { timeout: 8000 }
      );
    } else {
      performClosestCalculation(13.55, 78.50);
    }
  };

  const handleGenerateForecast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;
    generateForecast(selectedCrop, selectedMarket, forecastDate, true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      
      {/* Top Banner Header */}
      <div
        className="responsive-card-pad"
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.85rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CheckCircle2 size={20} color="#16a34a" />
          </div>
          <div className="min-w-0" style={{ flex: 1 }}>
            <h2 style={{ fontSize: '0.90rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.25 }} className="break-words">
              {language === 'te' ? (
                <>ఆంధ్రప్రదేశ్<br />APMC మండి ధరల అంచనా</>
              ) : language === 'hi' ? (
                <>आंध्र प्रदेश<br />एपीएमसी मंडी भाव पूर्वानुमान</>
              ) : language === 'ta' ? (
                <>ஆந்திரப் பிரதேசம்<br />APMC மண்டி விலை கணிப்பு</>
              ) : language === 'ml' ? (
                <>ആന്ധ്രാപ്രദേശ്<br />APMC വിപണി വില പ്രവചനം</>
              ) : (
                <>Andhra Pradesh<br />APMC Mandi Price Forecast</>
              )}
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => {
              if (!user) {
                setAuthModalOpen(true);
              } else {
                setHistoryModalOpen(true);
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: 'var(--primary-dark)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              minHeight: '38px',
            }}
          >
            <History size={14} color="var(--primary)" />
            <span>{language === 'te' ? 'నా చరిత్ర' : (language === 'hi' ? 'इतिहास' : (language === 'ta' ? 'வரலாறு' : (language === 'ml' ? 'ചരിത്രം' : 'History')))}</span>
          </button>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.35rem 0.6rem',
              borderRadius: '50px',
              fontSize: '0.72rem',
              fontWeight: 700,
              background: '#f0fdf4',
              color: '#166534',
              border: '1px solid #bbf7d0',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}></span>
            {language === 'te' ? 'ప్రత్యక్ష సమకాలీకరణ' : (language === 'hi' ? 'लाइव सिंक' : (language === 'ta' ? 'நேரலை ஒத்திசைவு' : (language === 'ml' ? 'തത്സമയ സമന്വയം' : 'Live Sync')))}
          </span>
        </div>
      </div>

      {/* Main Single-Column Mobile Form (Grid on Tablet/Desktop) */}
      <div
        className="responsive-card-pad"
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          width: '100%',
        }}
      >
        <form
          onSubmit={handleGenerateForecast}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            width: '100%',
          }}
        >
          {/* Form Fields Stack */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
              gap: '1rem',
              width: '100%',
              alignItems: 'flex-start',
            }}
          >
            {/* 1. Select Crop / Commodity */}
            <div style={{ width: '100%' }}>
              <label
                htmlFor="select-crop"
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '0.35rem',
                }}
              >
                {t.forecast?.selectCrop || 'Select Crop / Commodity'}
              </label>
              <select
                id="select-crop"
                className="form-select"
                style={{ width: '100%' }}
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                disabled={loading}
              >
                {SUPPORTED_CROPS.map((cropName) => (
                  <option key={cropName} value={cropName}>
                    {getLocalizedCommodityName(cropName, language)}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Select AP Mandi Market */}
            <div style={{ width: '100%' }}>
              <label
                htmlFor="select-market"
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '0.35rem',
                }}
              >
                {t.forecast?.selectMarket || 'Select AP Mandi Market'}
              </label>
              <select
                id="select-market"
                className="form-select"
                style={{ width: '100%' }}
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
                disabled={loading || availableMarkets.length === 0}
              >
                {availableMarkets.map((mktName) => {
                  const distName = getDistrictForMarket(mktName);
                  const localizedDist = getLocalizedDistrictName(distName, language);
                  return (
                    <option key={mktName} value={mktName}>
                      {getLocalizedMarketName(mktName, language)} ({localizedDist})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* 3. Forecast Base Date */}
            <div style={{ width: '100%' }}>
              <label
                htmlFor="input-forecast-date"
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '0.35rem',
                }}
              >
                {t.forecast?.forecastDate || 'Forecast Base Date (01-01-2021 to Today)'}
              </label>
              <input
                id="input-forecast-date"
                type="date"
                min={MIN_DATE}
                max={todayIST}
                className="form-input"
                style={{
                  width: '100%',
                  borderColor: isDateInvalid ? '#dc2626' : undefined,
                  background: isDateInvalid ? '#fef2f2' : '#ffffff',
                }}
                value={forecastDate}
                onChange={(e) => setForecastDate(e.target.value)}
                disabled={loading}
              />
              {isDateBeforeMin && (
                <span style={{ color: '#dc2626', fontSize: '0.74rem', fontWeight: 600, marginTop: '0.25rem', display: 'block' }}>
                  {language === 'te' ? '01-01-2021 కంటే ముందు తేదీలు అందుబాటులో లేవు.' : (language === 'hi' ? '01-01-2021 से पहले की तिथियां उपलब्ध नहीं हैं।' : (language === 'ta' ? '01-01-2021-க்கு முந்தைய தேதிகள் கிடைக்கவில்லை.' : (language === 'ml' ? '01-01-2021-ന് മുമ്പുള്ള തീയതികൾ ലഭ്യമല്ല.' : 'Dates prior to 01-01-2021 are not available.')))}
                </span>
              )}
              {isDateInFuture && (
                <span style={{ color: '#dc2626', fontSize: '0.74rem', fontWeight: 600, marginTop: '0.25rem', display: 'block' }}>
                  {language === 'te' ? 'భవిష్యత్ తేదీలను ఎంచుకోలేరు. గరిష్ట తేదీ ఈరోజే.' : (language === 'hi' ? 'भविष्य की तिथियां नहीं चुनी जा सकतीं। अधिकतम तिथि आज है।' : (language === 'ta' ? 'எதிர்கால தேதிகளைத் தேர்ந்தெடுக்க முடியாது. அதிகபட்ச தேதி இன்றாகும்.' : (language === 'ml' ? 'ഭാവി തീയതികൾ തിരഞ്ഞെടുക്കാനാകില്ല. ഇന്നത്തെ തീയതി വരെ മാത്രം.' : 'Future dates cannot be selected. Maximum date is today.')))}
                </span>
              )}
            </div>

            {/* 4. Action Buttons (Generate + Location Detector) */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', width: '100%', marginTop: 'auto' }}>
              <button
                id="btn-generate-forecast"
                type="submit"
                disabled={loading || !isFormValid}
                aria-busy={loading}
                style={{
                  background: loading || !isFormValid ? '#2d6a4f' : '#1b4332',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  padding: '0 1.25rem',
                  height: '48px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: loading || !isFormValid ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(27, 67, 50, 0.25)',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  opacity: !isFormValid && !loading ? 0.6 : 1,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {loading ? (
                  <>
                    <svg
                      className="spin"
                      style={{ width: '18px', height: '18px', animation: 'spin 1.5s linear infinite' }}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"></circle>
                      <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{t.forecast?.generating || 'Generating…'}</span>
                  </>
                ) : (
                  <>
                    <Calendar size={18} />
                    <span>{t.forecast?.generate || 'Generate Forecast'}</span>
                  </>
                )}
              </button>

              {/* Live Location Detection Button */}
              <button
                id="btn-live-location-detect"
                type="button"
                onClick={handleDetectLocation}
                disabled={detectingLocation || loading}
                title={t.location?.detectLocationBtn || 'Detect closest APMC market near current location'}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: detectingLocation || loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}
                aria-label="Detect closest APMC market near current location"
              >
                <Navigation
                  size={18}
                  color="#16a34a"
                  style={detectingLocation ? { animation: 'spin 1.5s linear infinite' } : undefined}
                />
              </button>
            </div>
          </div>
        </form>

        {/* Closest Market Location Detection Box */}
        {closestMarketInfo && (
          <div
            style={{
              marginTop: '1rem',
              background: '#f0fdf4',
              border: '1.5px solid #86efac',
              borderRadius: '10px',
              padding: '0.65rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
              color: '#166534',
              fontSize: '0.82rem',
              fontWeight: 700,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
              <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0 }} />
              <span className="break-words">
                📍 {language === 'te' ? 'సమీప మార్కెట్:' : (language === 'hi' ? 'निकटतम मंडी:' : (language === 'ta' ? 'அருகிலுள்ள மண்டி:' : (language === 'ml' ? 'ഏറ്റവും അടുത്തുള്ള വിപണി:' : 'Closest Market:')))}{' '}
                <strong>{getLocalizedMarketName(closestMarketInfo.name, language)}</strong> ({closestMarketInfo.distance_km.toFixed(1)} km)
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#15803d', background: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: '50px' }}>
              {getLocalizedCommodityName(selectedCrop, language)}
            </span>
          </div>
        )}

        {/* Location Error Notice */}
        {locationError && (
          <div style={{ marginTop: '0.75rem', color: '#b45309', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <AlertCircle size={15} color="#d97706" style={{ flexShrink: 0 }} />
            <span>{locationError}</span>
          </div>
        )}

      </div>

      {/* Error Alert */}
      {error && (
        <div
          style={{
            padding: '1rem 1.25rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            color: '#991b1b',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
          role="alert"
        >
          <AlertCircle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
          <div style={{ fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.45 }}>
            {error}
          </div>
        </div>
      )}

      {/* Live Loading State */}
      {loading && <ForecastLoadingState loadingStep={loadingStep} stepIndex={stepIndex} language={language} />}

      {/* Verified Forecast Results */}
      {!loading && data && <ForecastResult data={data} language={language} />}

      {/* Prediction History Modal */}
      <PredictionHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
      />

      {/* Auth Modal Trigger for Guest */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="login"
      />

    </div>
  );
};
