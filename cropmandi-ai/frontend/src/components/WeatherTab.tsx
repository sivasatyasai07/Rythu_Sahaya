import React, { useState, useEffect } from 'react';
import { api } from '../api';
import type { WeatherObservation, Market } from '../api';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import { getLocalizedMarketName, getLocalizedDistrictName } from '../utils/i18nData';
import { calculateHaversineDistance, reverseGeocode } from '../utils/location';
import { CloudSun, CloudRain, AlertTriangle, RefreshCw, MapPin, Navigation, Droplets, Wind, ChevronDown, ChevronUp, Clock } from 'lucide-react';

interface Props {
  language: Language;
}

interface CurrentLocationWeather {
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  temp: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  dailyForecast: Array<{
    date: string;
    maxTemp: number;
    minTemp: number;
    rainSum: number;
    windMax: number;
  }>;
}

export const WeatherTab: React.FC<Props> = ({ language }) => {
  const t = translations[language].weather;
  const locT = translations[language].location;

  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarketId, setSelectedMarketId] = useState<number>(1);
  const [mandiForecast, setMandiForecast] = useState<WeatherObservation[]>([]);
  const [mandiHistory, setMandiHistory] = useState<WeatherObservation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);

  // User location state
  const [userWeather, setUserWeather] = useState<CurrentLocationWeather | null>(null);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    loadMarkets();
    detectUserLocationAndFetchWeather();
  }, []);

  const FALLBACK_APMC_MARKETS: Market[] = [
    { id: 1, canonical_name: 'Madanapalle APMC', original_name: 'Madanapalle', district: 'Annamayya', state: 'Andhra Pradesh', latitude: 13.55, longitude: 78.50, is_active: true },
    { id: 2, canonical_name: 'Kurnool APMC', original_name: 'Kurnool', district: 'Kurnool', state: 'Andhra Pradesh', latitude: 15.8281, longitude: 78.0373, is_active: true },
    { id: 3, canonical_name: 'Tenali APMC', original_name: 'Tenali', district: 'Guntur', state: 'Andhra Pradesh', latitude: 16.2430, longitude: 80.6400, is_active: true },
    { id: 4, canonical_name: 'Rajahmundry APMC', original_name: 'Rajahmundry', district: 'East Godavari', state: 'Andhra Pradesh', latitude: 17.0005, longitude: 81.8040, is_active: true },
    { id: 5, canonical_name: 'Ananthapur APMC', original_name: 'Ananthapur', district: 'Anantapur', state: 'Andhra Pradesh', latitude: 14.6819, longitude: 77.6006, is_active: true },
    { id: 6, canonical_name: 'Pattikonda APMC', original_name: 'Pattikonda', district: 'Kurnool', state: 'Andhra Pradesh', latitude: 15.40, longitude: 77.5167, is_active: true },
    { id: 7, canonical_name: 'Guntur APMC', original_name: 'Guntur', district: 'Guntur', state: 'Andhra Pradesh', latitude: 16.3067, longitude: 80.4365, is_active: true },
    { id: 8, canonical_name: 'Eluru APMC', original_name: 'Eluru', district: 'Eluru', state: 'Andhra Pradesh', latitude: 16.7107, longitude: 81.0952, is_active: true },
  ];

  const loadMarkets = async () => {
    try {
      const res = await api.get<Market[]>('/markets');
      let validMarkets = res.data.filter(
        (m) => m.latitude !== null && m.longitude !== null && m.latitude !== undefined && m.longitude !== undefined
      );
      if (validMarkets.length === 0) {
        validMarkets = FALLBACK_APMC_MARKETS;
      }
      setMarkets(validMarkets);
      if (validMarkets.length > 0) {
        setSelectedMarketId(validMarkets[0].id);
        fetchMandiWeather(validMarkets[0].id);
      }
    } catch (e) {
      console.error(e);
      setMarkets(FALLBACK_APMC_MARKETS);
      if (FALLBACK_APMC_MARKETS.length > 0) {
        setSelectedMarketId(FALLBACK_APMC_MARKETS[0].id);
        fetchMandiWeather(FALLBACK_APMC_MARKETS[0].id);
      }
    }
  };

  const fetchMandiWeather = async (mId: number) => {
    setLoading(true);
    try {
      const [fRes, hRes] = await Promise.all([
        api.get<WeatherObservation[]>('/weather/forecast', { params: { market_id: mId } }),
        api.get<WeatherObservation[]>('/weather/history', { params: { market_id: mId, days: 5 } })
      ]);
      setMandiForecast(fRes.data ? fRes.data.slice(0, 5) : []);
      setMandiHistory(hRes.data ? hRes.data.slice(0, 5) : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const detectUserLocationAndFetchWeather = () => {
    if (!navigator.geolocation) {
      setLocationError(locT.permissionDenied);
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        try {
          const geo = await reverseGeocode(lat, lon);
          const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,relative_humidity_2m_max&timezone=auto`;
          const omRes = await fetch(openMeteoUrl);
          
          if (omRes.ok) {
            const omData = await omRes.json();
            const curr = omData.current_weather;
            const daily = omData.daily;

            const forecastDays = (daily.time || []).map((dateStr: string, idx: number) => ({
              date: dateStr,
              maxTemp: daily.temperature_2m_max?.[idx] ?? 30,
              minTemp: daily.temperature_2m_min?.[idx] ?? 22,
              rainSum: daily.precipitation_sum?.[idx] ?? 0,
              windMax: daily.windspeed_10m_max?.[idx] ?? 10,
            }));

            setUserWeather({
              city: geo.city,
              state: geo.state,
              latitude: lat,
              longitude: lon,
              temp: curr?.temperature ?? 28,
              humidity: daily.relative_humidity_2m_max?.[0] ?? 65,
              windSpeed: curr?.windspeed ?? 12,
              precipitation: daily.precipitation_sum?.[0] ?? 0,
              dailyForecast: forecastDays,
            });

            if (markets.length > 0) {
              let nearestId = markets[0].id;
              let minDist = Infinity;
              markets.forEach((m) => {
                if (m.latitude && m.longitude) {
                  const d = calculateHaversineDistance(lat, lon, m.latitude, m.longitude);
                  if (d < minDist) {
                    minDist = d;
                    nearestId = m.id;
                  }
                }
              });
              setSelectedMarketId(nearestId);
              fetchMandiWeather(nearestId);
            }
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLocationLoading(false);
        }
      },
      (err) => {
        console.warn(err);
        setLocationError(locT.permissionDenied);
        setLocationLoading(false);
      }
    );
  };

  const selectedMandi = markets.find((m) => m.id === selectedMarketId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      
      {/* Top Controls & Geolocation Button */}
      <div className="glass-panel responsive-card-pad" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <CloudSun size={26} color="var(--primary)" style={{ flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>{t.title}</h3>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {t.subtitle}
            </div>
          </div>
        </div>

        {/* Controls Layout: Compact inline on PC, stacked full-width on Mobile */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
          <button
            type="button"
            onClick={detectUserLocationAndFetchWeather}
            className="btn-secondary"
            disabled={locationLoading}
            style={{ 
              flex: '0 0 auto', 
              minWidth: '180px',
              minHeight: '42px',
              padding: '0.55rem 1rem' 
            }}
          >
            <Navigation size={16} className={locationLoading ? 'spin' : ''} color="var(--primary)" />
            <span>{locationLoading ? t.detectingLocation : locT.detectLocationBtn}</span>
          </button>

          <div style={{ flex: '1 1 260px', maxWidth: '420px', minWidth: '220px' }}>
            <select
              className="form-select"
              value={selectedMarketId}
              onChange={(e) => {
                const mId = Number(e.target.value);
                setSelectedMarketId(mId);
                fetchMandiWeather(mId);
              }}
              style={{ width: '100%', minHeight: '42px' }}
              aria-label="Select APMC Mandi"
            >
              {markets.map((m) => (
                <option key={m.id} value={m.id}>
                  {getLocalizedMarketName(m.canonical_name, language)} ({getLocalizedDistrictName(m.district, language)})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {locationError && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#92400e', fontSize: '0.78rem' }}>
          <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0 }} />
          <span>{locationError}</span>
        </div>
      )}

      {/* 1. USER CURRENT LOCATION WEATHER BANNER */}
      {userWeather && (
        <div className="glass-panel responsive-card-pad" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)', borderLeft: '5px solid var(--accent-gold)', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <span className="badge badge-gold" style={{ marginBottom: '0.25rem', fontSize: '0.68rem' }}>
                <MapPin size={12} />
                {locT.locationDetected}
              </span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#78350f', margin: 0 }} className="break-words">
                {userWeather.city}, {userWeather.state}
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
              <CloudSun size={32} color="#d97706" />
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#78350f', lineHeight: 1 }}>{userWeather.temp}°C</div>
                <div style={{ fontSize: '0.72rem', color: '#92400e', fontWeight: 600 }}>{t.liveWeather}</div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 110px), 1fr))', gap: '0.5rem' }}>
            <div style={{ background: '#ffffff', padding: '0.5rem 0.65rem', borderRadius: '10px', border: '1px solid rgba(217, 119, 6, 0.2)' }}>
              <div style={{ fontSize: '0.68rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Droplets size={12} /> {t.humidity || 'Humidity'}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#78350f' }}>{userWeather.humidity}%</div>
            </div>

            <div style={{ background: '#ffffff', padding: '0.5rem 0.65rem', borderRadius: '10px', border: '1px solid rgba(217, 119, 6, 0.2)' }}>
              <div style={{ fontSize: '0.68rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Wind size={12} /> {t.wind || 'Wind'}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#78350f' }}>{userWeather.windSpeed} km/h</div>
            </div>

            <div style={{ background: '#ffffff', padding: '0.5rem 0.65rem', borderRadius: '10px', border: '1px solid rgba(217, 119, 6, 0.2)' }}>
              <div style={{ fontSize: '0.68rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CloudRain size={12} /> {t.rain || 'Precipitation'}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#78350f' }}>{userWeather.precipitation} mm</div>
            </div>
          </div>

          {/* 7-Day Local Forecast Grid / Scroll */}
          {userWeather.dailyForecast && userWeather.dailyForecast.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#78350f', marginBottom: '0.45rem' }}>
                {language === 'te' ? '7 రోజుల స్థానిక వాతావరణ అంచనా' : (language === 'hi' ? '7-दिवसीय स्थानीय मौसम आउटलुक' : (language === 'ta' ? '7 நாள் உள்ளூர் வானிலை முன்னறிவிப்பு' : (language === 'ml' ? '7 ദിവസത്തെ പ്രാദേശിക കാലാവസ്ഥാ പ്രവചനം' : '7-Day Local Weather Outlook')))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 100px), 1fr))', gap: '0.5rem' }}>
                {userWeather.dailyForecast.map((d, i) => (
                  <div key={i} style={{ background: '#ffffff', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(217,119,6,0.15)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b' }}>{d.date.slice(5)}</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#78350f', margin: '0.15rem 0' }}>
                      {Math.round(d.maxTemp)}° / {Math.round(d.minTemp)}°
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#2563eb' }}>🌧️ {d.rainSum}mm</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. SELECTED APMC MANDI FORECAST */}
      <div className="glass-panel responsive-card-pad" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }} className="break-words">
              {selectedMandi ? getLocalizedMarketName(selectedMandi.canonical_name, language) : ''}{' '}
              {language === 'te' ? 'వాతావరణ అంచనా' : (language === 'hi' ? 'मौसम पूर्वानुमान' : (language === 'ta' ? 'வானிலை முன்னறிவிப்பு' : (language === 'ml' ? 'കാലാവസ്ഥാ പ്രവചനം' : 'Weather Forecast')))}
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {language === 'te' ? 'వ్యవసాయ మార్కెట్ యార్డ్ వాతావరణ పరిస్థితులు' : (language === 'hi' ? 'कृषि मंडी मौसम की स्थिति' : (language === 'ta' ? 'வேளாண் சந்தை வானிலை நிலவரம்' : (language === 'ml' ? 'കാർഷിക വിപണിയിലെ കാലാവസ്ഥാ വിവരങ്ങൾ' : 'Agricultural market yard weather conditions')))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => selectedMandi && fetchMandiWeather(selectedMandi.id)}
            className="btn-secondary"
            disabled={loading}
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem', minHeight: '36px' }}
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            <span>{translations[language]?.common?.refresh || 'Refresh'}</span>
          </button>
        </div>

        {mandiForecast.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b', fontSize: '0.85rem' }}>
            {t.unavailable || 'No forecast data available for this market yard.'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '0.65rem' }}>
            {mandiForecast.map((w, idx) => (
              <div
                key={idx}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>{w.observation_date}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
                  {w.temperature_max ? `${w.temperature_max.toFixed(1)}°C` : '—'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                  {t.humidity || 'Humidity'}: {w.humidity ? `${w.humidity.toFixed(0)}%` : '—'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#2563eb' }}>
                  {t.rain || 'Rainfall'}: {w.precipitation ? `${w.precipitation.toFixed(1)} mm` : '0 mm'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. DETAILED METEOROLOGICAL HISTORY ACCORDION */}
      {mandiHistory.length > 0 && (
        <div className="accordion-card">
          <button
            type="button"
            className="accordion-header-btn"
            onClick={() => setHistoryOpen(!historyOpen)}
            aria-expanded={historyOpen}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
              <Clock size={16} color="var(--primary)" />
              <span>
                {language === 'te' ? 'మరిన్ని వాతావరణ వివరాలు: గత 5 రోజుల APMC రికార్డులు' : (language === 'hi' ? 'अधिक मौसम विवरण: पिछले 5 दिनों के APMC रिकॉर्ड' : (language === 'ta' ? 'கூடுதல் வானிலை விவரங்கள்: கடந்த 5 நாள் APMC பதிவுகள்' : (language === 'ml' ? 'കൂടുതൽ കാലാവസ്ഥാ വിവരങ്ങൾ: കഴിഞ്ഞ 5 ദിവസത്തെ രേഖകൾ' : 'More Weather Details: Past 5-Day APMC Observations')))}
              </span>
            </div>
            {historyOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {historyOpen && (
            <div className="accordion-body-content" style={{ padding: '0.75rem 1rem 1rem 1rem' }}>
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left', minWidth: '400px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                      <th style={{ padding: '0.5rem' }}>{t.date || 'Date'}</th>
                      <th style={{ padding: '0.5rem' }}>{t.maxTemp || 'Max Temp'}</th>
                      <th style={{ padding: '0.5rem' }}>{t.humidity || 'Humidity'}</th>
                      <th style={{ padding: '0.5rem' }}>{t.rain || 'Rainfall'}</th>
                      <th style={{ padding: '0.5rem' }}>{t.wind || 'Wind'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mandiHistory.map((h, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.5rem', fontWeight: 700 }}>{h.observation_date}</td>
                        <td style={{ padding: '0.5rem' }}>{h.temperature_max?.toFixed(1)}°C</td>
                        <td style={{ padding: '0.5rem' }}>{h.humidity?.toFixed(0)}%</td>
                        <td style={{ padding: '0.5rem' }}>{h.precipitation ? `${h.precipitation.toFixed(1)} mm` : '0 mm'}</td>
                        <td style={{ padding: '0.5rem' }}>{h.wind_speed?.toFixed(1)} km/h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Info */}
      <div style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', padding: '0 0.5rem' }}>
        <span>
          {language === 'te' ? 'డేటా మూలం: ఓపెన్-మెటియో API & APMC వాతావరణ కేంద్రాలు' : (language === 'hi' ? 'डेटा स्रोत: Open-Meteo API एवं APMC मौसम केंद्र' : (language === 'ta' ? 'தரவு ஆதாரம்: Open-Meteo API & APMC வானிலை நிலையங்கள்' : (language === 'ml' ? 'ഡാറ്റാ ഉറവിടം: Open-Meteo API & APMC കാലാവസ്ഥാ കേന്ദ്രങ്ങൾ' : 'Data Source: Open-Meteo API & APMC Weather Stations')))}
        </span>
        <span>
          {language === 'te' ? 'ఆటోమేటిక్‌గా నవీకరించబడింది' : (language === 'hi' ? 'स्वचालित रूप से अपडेट' : (language === 'ta' ? 'தானாக புதுப்பிக்கப்பட்டது' : (language === 'ml' ? 'സ്വയമേവ പുതുക്കി' : 'Updated automatically')))}
        </span>
      </div>

    </div>
  );
};
