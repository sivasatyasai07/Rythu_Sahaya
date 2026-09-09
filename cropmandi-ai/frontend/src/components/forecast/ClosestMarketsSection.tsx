import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import type { ClosestMarketItem, ClosestMarketsResponse, Market } from '../../api';
import type { Language } from '../../i18n/translations';
import { getLocalizedCommodityName, getLocalizedMarketName, getLocalizedDistrictName } from '../../utils/i18nData';
import { MapPin, Navigation, Compass, AlertCircle, CheckCircle2, BarChart2, ChevronDown } from 'lucide-react';

export interface ClosestMarketsSectionProps {
  selectedCrop: string;
  selectedMarketName: string;
  onSelectMarket: (marketName: string) => void;
  onViewPrices?: (marketName: string) => void;
  language?: Language;
}

export const ClosestMarketsSection: React.FC<ClosestMarketsSectionProps> = ({
  selectedCrop,
  selectedMarketName,
  onSelectMarket,
  onViewPrices,
  language = 'en',
}) => {
  const [manualLatStr, setManualLatStr] = useState<string>('');
  const [manualLonStr, setManualLonStr] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [displayLimit, setDisplayLimit] = useState<number>(6);

  const [closestMarkets, setClosestMarkets] = useState<ClosestMarketItem[]>([]);
  const [cropAvailableMarkets, setCropAvailableMarkets] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState<boolean>(false);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCrop) {
      checkCropAvailability(selectedCrop);
    }
  }, [selectedCrop]);

  const checkCropAvailability = async (crop: string) => {
    try {
      const res = await api.get<Market[]>('/markets', { params: { commodity_name: crop } });
      const names = new Set((res.data || []).map((m) => m.canonical_name));
      setCropAvailableMarkets(names);
    } catch (e) {
      console.error('Failed to check crop market availability', e);
    }
  };

  const fetchClosest = async (lat: number, lon: number, _source: 'browser' | 'manual') => {
    setLoading(true);
    setErrorMessage(null);
    setPermissionDenied(false);

    try {
      const res = await api.get<ClosestMarketsResponse>('/markets/closest', {
        params: { latitude: lat, longitude: lon, limit: 16 },
      });
      setClosestMarkets(res.data.markets || []);
    } catch (e: any) {
      const msg = e.response?.data?.detail || 'Could not calculate closest markets from server.';
      setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setPermissionDenied(false);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setManualLatStr(lat.toFixed(4));
        setManualLonStr(lon.toFixed(4));
        fetchClosest(lat, lon, 'browser');
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionDenied(true);
        } else {
          setErrorMessage('Could not determine GPS location. Please enter coordinates manually.');
        }
      },
      { timeout: 8000 }
    );
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(manualLatStr);
    const lon = parseFloat(manualLonStr);

    if (isNaN(lat) || isNaN(lon)) {
      setErrorMessage('Please enter valid numerical latitude and longitude.');
      return;
    }

    fetchClosest(lat, lon, 'manual');
  };

  const visibleMarkets = closestMarkets.slice(0, displayLimit);

  return (
    <div
      className="glass-panel responsive-card-pad"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '100%',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Compass size={20} color="#16a34a" />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {language === 'te' ? 'సమీప మండి మార్కెట్లు' :
               language === 'hi' ? 'निकटतम एपीएमसी मंडियां' :
               language === 'ta' ? 'அருகிலுள்ள மண்டி சந்தைகள்' :
               language === 'ml' ? 'ഏറ്റവും അടുത്തുള്ള വിപണികൾ' : 'Closest Mandi Markets'}
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.1rem 0 0 0' }}>
              {language === 'te' ? 'మీ స్థానానికి సమీపంలోని అన్ని APMC మార్కెట్లు' :
               language === 'hi' ? 'आपके स्थान के निकटतम एपीएमसी मंडियों की दूरी सूची' :
               language === 'ta' ? 'உங்கள் இருப்பிடத்திற்கு அருகிலுள்ள மண்டிகள்' :
               language === 'ml' ? 'നിങ്ങളുടെ പ്രദേശത്തിന് അടുത്തുള്ള മാർക്കറ്റുകൾ' :
               'Distance ranked APMC yards near your location'}
            </p>
          </div>
        </div>

        {/* Location Action Buttons */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={loading}
            className="btn-primary"
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.8rem',
              minHeight: '40px',
            }}
          >
            <Navigation size={14} className={loading ? 'spin' : ''} />
            <span>
              {loading ? (
                language === 'te' ? 'గుర్తిస్తోంది…' :
                language === 'hi' ? 'खोज रहा है…' :
                language === 'ta' ? 'கண்டறிகிறது…' :
                language === 'ml' ? 'തിരയുന്നു…' : 'Locating…'
              ) : (
                language === 'te' ? 'నా స్థానాన్ని గుర్తించు' :
                language === 'hi' ? 'मेरा स्थान पहचानें' :
                language === 'ta' ? 'எனது இருப்பிடம்' :
                language === 'ml' ? 'എന്റെ സ്ഥാനം കണ്ടെത്തുക' : 'Use My Location'
              )}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowManualInput(!showManualInput)}
            className="btn-secondary"
            style={{
              padding: '0.45rem 0.75rem',
              fontSize: '0.8rem',
              minHeight: '40px',
            }}
          >
            <MapPin size={14} color="#64748b" />
            <span>
              {showManualInput ? (
                language === 'te' ? 'దాచు' :
                language === 'hi' ? 'छुपाएं' :
                language === 'ta' ? 'மறை' :
                language === 'ml' ? 'മറയ്ക്കുക' : 'Hide'
              ) : (
                language === 'te' ? 'మ్యాన్యువల్ GPS' :
                language === 'hi' ? 'मैनुअल GPS' :
                language === 'ta' ? 'கைமுறை GPS' :
                language === 'ml' ? 'മാനുവൽ GPS' : 'Manual GPS'
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Manual Input Form */}
      {showManualInput && (
        <form
          onSubmit={handleManualSubmit}
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '0.85rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '0.65rem',
            alignItems: 'end',
            width: '100%',
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>
              Latitude
            </label>
            <input
              type="text"
              placeholder="e.g. 13.5500"
              value={manualLatStr}
              onChange={(e) => setManualLatStr(e.target.value)}
              className="form-input"
              style={{ minHeight: '38px', fontSize: '0.85rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>
              Longitude
            </label>
            <input
              type="text"
              placeholder="e.g. 78.5000"
              value={manualLonStr}
              onChange={(e) => setManualLonStr(e.target.value)}
              className="form-input"
              style={{ minHeight: '38px', fontSize: '0.85rem' }}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', minHeight: '38px', fontSize: '0.82rem' }}
            >
              {language === 'te' ? 'దూరం లెక్కించు' :
               language === 'hi' ? 'दूरी की गणना करें' :
               language === 'ta' ? 'தூரம் கணக்கிடு' :
               language === 'ml' ? 'ദൂരം കണക്കാക്കുക' : 'Calculate Distance'}
            </button>
          </div>
        </form>
      )}

      {/* Permission Denied Compact Banner */}
      {permissionDenied && (
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '10px',
            padding: '0.65rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#92400e',
            fontSize: '0.78rem',
            fontWeight: 600,
          }}
        >
          <AlertCircle size={16} color="#d97706" style={{ flexShrink: 0 }} />
          <span>
            {language === 'te' ? 'లొకేషన్ అనుమతి నిరాకరించబడింది. పై మాన్యువల్ GPS ఉపయోగించండి.' :
             language === 'hi' ? 'स्थान अनुमति अस्वीकृत। ऊपर दिए गए मैनुअल GPS का उपयोग करें।' :
             language === 'ta' ? 'இருப்பிட அனுமதி மறுக்கப்பட்டது. கைமுறை GPS ஐப் பயன்படுத்தவும்.' :
             language === 'ml' ? 'ലൊക്കേഷൻ അനുമതി നിഷേധിച്ചു. മാനുവൽ GPS ഉപയോഗിക്കുക.' :
             'Location access was denied. Use Manual GPS above to calculate distance.'}
          </span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            padding: '0.65rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#dc2626',
            fontSize: '0.78rem',
            fontWeight: 600,
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Ranked Market Cards (Vertical Stack on Mobile) */}
      {visibleMarkets.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', width: '100%' }}>
          {visibleMarkets.map((m, idx) => {
            const isSelected = selectedMarketName === m.market_name;
            const hasCrop = cropAvailableMarkets.has(m.market_name);

            return (
              <div
                key={m.market_name}
                style={{
                  background: isSelected ? '#f0fdf4' : '#ffffff',
                  border: isSelected ? '1.5px solid #16a34a' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  width: '100%',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: idx === 0 ? '#16a34a' : '#f1f5f9',
                        color: idx === 0 ? '#ffffff' : '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        flexShrink: 0,
                      }}
                    >
                      #{idx + 1}
                    </div>

                    <div className="min-w-0" style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }} className="break-words">
                        {getLocalizedMarketName(m.market_name, language)}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {getLocalizedDistrictName(m.district, language)}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
                      {m.distance_km.toFixed(1)} km
                    </div>
                    {hasCrop && (
                      <span style={{ fontSize: '0.68rem', color: '#15803d', fontWeight: 700 }}>
                        {getLocalizedCommodityName(selectedCrop, language)} {language === 'te' ? 'లభ్యం' : (language === 'hi' ? 'सक्रिय' : (language === 'ta' ? 'செயலில்' : (language === 'ml' ? 'സജീവം' : 'Active')))}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => onSelectMarket(m.market_name)}
                    style={{
                      flex: 1,
                      minHeight: '38px',
                      padding: '0.4rem 0.65rem',
                      borderRadius: '8px',
                      border: isSelected ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                      background: isSelected ? '#16a34a' : '#ffffff',
                      color: isSelected ? '#ffffff' : 'var(--primary-dark)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    {isSelected ? <CheckCircle2 size={13} /> : null}
                    <span>
                      {isSelected ? (
                        language === 'te' ? 'ఎంచుకోబడింది' :
                        language === 'hi' ? 'चयनित' :
                        language === 'ta' ? 'தேர்ந்தெடுக்கப்பட்டது' :
                        language === 'ml' ? 'തിരഞ്ഞെടുത്തു' : 'Selected'
                      ) : (
                        language === 'te' ? 'మార్కెట్ ఎంచుకోండి' :
                        language === 'hi' ? 'मंडी चुनें' :
                        language === 'ta' ? 'மண்டியைத் தேர்ந்தெடு' :
                        language === 'ml' ? 'വിപണി തിരഞ്ഞെടുക്കുക' : 'Select Market'
                      )}
                    </span>
                  </button>

                  {onViewPrices && (
                    <button
                      type="button"
                      onClick={() => onViewPrices(m.market_name)}
                      style={{
                        padding: '0.4rem 0.75rem',
                        minHeight: '38px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        background: '#f8fafc',
                        color: '#334155',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <BarChart2 size={13} />
                      <span>
                        {language === 'te' ? 'ట్రెండ్స్ చూడండి' :
                         language === 'hi' ? 'ट्रेंड्स देखें' :
                         language === 'ta' ? 'போக்குகள் பார்க்க' :
                         language === 'ml' ? 'ട്രെൻഡുകൾ കാണുക' : 'View Trends'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Show More Markets Toggle */}
          {closestMarkets.length > visibleMarkets.length && (
            <button
              type="button"
              onClick={() => setDisplayLimit((prev) => prev + 6)}
              className="btn-secondary"
              style={{ width: '100%', minHeight: '40px', fontSize: '0.82rem', marginTop: '0.25rem' }}
            >
              <ChevronDown size={14} />
              <span>
                {language === 'te' ? `మరిన్ని మార్కెట్లను చూపించు (${closestMarkets.length - visibleMarkets.length} మిగిలి ఉన్నాయి)` :
                 language === 'hi' ? `और मंडियां दिखाएं (${closestMarkets.length - visibleMarkets.length} शेष)` :
                 language === 'ta' ? `மேலும் சந்தைகளைக் காட்டு (${closestMarkets.length - visibleMarkets.length} மீதம்)` :
                 language === 'ml' ? `കൂടുതൽ വിപണികൾ കാണിക്കുക (${closestMarkets.length - visibleMarkets.length} ബാക്കി)` :
                 `Show More Markets (${closestMarkets.length - visibleMarkets.length} remaining)`}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
