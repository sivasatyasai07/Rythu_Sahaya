import React, { useState } from 'react';
import type { VerifiedForecastResponse, ForecastRecord } from '../../services/forecastService';
import type { Language } from '../../i18n/translations';
import { t } from '../../i18n/translations';
import { Check, TrendingUp, TrendingDown, Minus, AlertTriangle, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { getDistrictForMarket } from '../../utils/cropMarkets';
import { getLocalizedDistrictName, getLocalizedMarketName } from '../../utils/i18nData';
import { DataVerificationPanel } from './DataVerificationPanel';

export interface ForecastResultProps {
  data: VerifiedForecastResponse;
  language?: Language;
}

export const ForecastResult: React.FC<ForecastResultProps> = ({ data, language = 'en' }) => {
  const [expandedCardIndex, setExpandedCardIndex] = useState<number | null>(null);

  if (!data || !data.records || data.records.length === 0) {
    return null;
  }

  const allRecords = data.records;
  const baseRecord = allRecords[0];
  const displayRecords: ForecastRecord[] = allRecords.length >= 4 ? allRecords.slice(1, 4) : allRecords;

  const serverTodayStr = String(data.server_today || data.server_date || '');
  const selectedDateStr = String(data.selected_date || '');
  const isSelectedToday = Boolean(serverTodayStr && selectedDateStr && serverTodayStr === selectedDateStr);

  const todayOfficialExists = Boolean(
    data.latest_value_is_today === true ||
    (baseRecord && baseRecord.is_observed === true && String(baseRecord.target_date || baseRecord.date) === selectedDateStr)
  );

  const showSimpleTodayView = isSelectedToday && todayOfficialExists;

  const basePrice = (data.latest_observed_price !== undefined && data.latest_observed_price !== null)
    ? data.latest_observed_price
    : (baseRecord?.modal_price ?? 0);

  const observationDateStr = baseRecord?.observation_date 
    ? String(baseRecord.observation_date) 
    : (data.latest_observed_date || selectedDateStr);

  // Trend logic
  const lastRecord = displayRecords[displayRecords.length - 1];
  const lastPrice = lastRecord?.modal_price ?? basePrice;
  const overallDiff = (lastPrice !== null && basePrice !== null) ? lastPrice - basePrice : 0;
  const overallPct = (basePrice && basePrice > 0) ? (overallDiff / basePrice) * 100 : 0;

  let trendLabel = t('forecast.stableTrend', {}, language);
  let trendColor = '#334155';
  let TrendIcon = Minus;

  if (data.trend_direction === 'upward' || overallPct > 1.0) {
    trendLabel = t('forecast.upwardTrend', {}, language);
    trendColor = '#15803d';
    TrendIcon = TrendingUp;
  } else if (data.trend_direction === 'downward' || overallPct < -1.0) {
    trendLabel = t('forecast.downwardTrend', {}, language);
    trendColor = '#dc2626';
    TrendIcon = TrendingDown;
  } else if (data.trend_direction === null || basePrice === null || lastPrice === null) {
    trendLabel = t('forecast.trendUnavailable', {}, language);
    trendColor = '#64748b';
    TrendIcon = Minus;
  }

  // 2-Day Sell / Hold Recommendation Logic
  const day2Record = displayRecords.length >= 2 ? displayRecords[1] : displayRecords[0];
  const day3Record = displayRecords.length >= 3 ? displayRecords[2] : day2Record;
  const targetFuturePrice = day2Record?.modal_price ?? day3Record?.modal_price ?? basePrice;
  const twoDayDiff = (targetFuturePrice !== null && basePrice !== null) ? targetFuturePrice - basePrice : 0;
  const twoDayPct = (basePrice && basePrice > 0) ? (twoDayDiff / basePrice) * 100 : 0;

  let recTitle = t('forecast.holdCrop', {}, language);
  let recDescription = `Prices are projected to increase by ₹${Math.abs(twoDayDiff).toFixed(2)}/quintal (+${Math.abs(twoDayPct).toFixed(1)}%) over the next 2 days. Holding harvest is recommended.`;
  let recBadgeText = `📈 ${t('forecast.hold', {}, language)}`;
  let recColor = '#15803d';
  let recBg = '#f0fdf4';
  let recBorder = '#86efac';
  let recIconBg = '#dcfce7';
  let recBadgeBg = '#dcfce7';
  let RecIcon = TrendingUp;

  if (twoDayDiff < -10 || twoDayPct < -1.0) {
    recTitle = t('forecast.sellNow', {}, language);
    recDescription = `Prices are projected to decline by ₹${Math.abs(twoDayDiff).toFixed(2)}/quintal (-${Math.abs(twoDayPct).toFixed(1)}%) over the next 2 days. Selling at current price is advised to avoid losses.`;
    recBadgeText = `📉 ${t('forecast.sell', {}, language)}`;
    recColor = '#b91c1c';
    recBg = '#fef2f2';
    recBorder = '#fca5a5';
    recIconBg = '#fee2e2';
    recBadgeBg = '#fee2e2';
    RecIcon = TrendingDown;
  } else if (Math.abs(twoDayDiff) <= 10) {
    recTitle = t('forecast.sellOrHold', {}, language);
    recDescription = `Prices are expected to remain steady around ₹${(basePrice ?? 0).toFixed(2)}/quintal over the next 2 days. You may sell now or hold based on your convenience.`;
    recBadgeText = `⚖️ ${t('forecast.sellOrHold', {}, language)}`;
    recColor = '#0369a1';
    recBg = '#f0f9ff';
    recBorder = '#7dd3fc';
    recIconBg = '#e0f2fe';
    recBadgeBg = '#e0f2fe';
    RecIcon = Minus;
  }

  // Localized description overrides for major languages
  if (language === 'te') {
    if (twoDayDiff > 10 || twoDayPct > 1.0) {
      recTitle = 'పంటను నిల్వ ఉంచండి (2 రోజులు వేచి ఉండండి)';
      recDescription = `రాబోయే 2 రోజుల్లో ధర క్వింటాలుకు ₹${Math.abs(twoDayDiff).toFixed(2)} పెరిగే అవకాశం ఉంది. అధిక లాభం కోసం నిల్వ ఉంచడం మంచిది.`;
    } else if (twoDayDiff < -10 || twoDayPct < -1.0) {
      recTitle = 'వెంటనే అమ్మండి (ధర తగ్గే అవకాశం)';
      recDescription = `రాబోయే 2 రోజుల్లో ధర క్వింటాలుకు ₹${Math.abs(twoDayDiff).toFixed(2)} తగ్గే అవకాశం ఉంది. నేటి ధర వద్ద అమ్మడం మంచిది.`;
    } else {
      recTitle = 'అమ్మండి లేదా నిల్వ ఉంచండి (స్థిరమైన ధరలు)';
      recDescription = `రాబోయే 2 రోజుల్లో ధరలు స్థిరంగా ఉండే అవకాశం ఉంది. మీ వీలును బట్టి నిర్ణయం తీసుకోండి.`;
    }
  } else if (language === 'hi') {
    if (twoDayDiff > 10 || twoDayPct > 1.0) {
      recTitle = 'फसल रोकें (2 दिन प्रतीक्षा करें)';
      recDescription = `अगले 2 दिनों में भाव में ₹${Math.abs(twoDayDiff).toFixed(2)}/क्विंटल की वृद्धि का अनुमान है। बेहतर लाभ के लिए फसल रोकना उचित है।`;
    } else if (twoDayDiff < -10 || twoDayPct < -1.0) {
      recTitle = 'अभी बेचें (भाव गिरने की संभावना)';
      recDescription = `अगले 2 दिनों में भाव में ₹${Math.abs(twoDayDiff).toFixed(2)}/क्विंटल की गिरावट का अनुमान है। हानि से बचने के लिए अभी बेचना उचित है।`;
    } else {
      recTitle = 'बेचें या रोकें (स्थिर मंडी भाव)';
      recDescription = `अगले 2 दिनों में भाव स्थिर रहने की संभावना है। अपनी सुविधा के अनुसार निर्णय लें।`;
    }
  } else if (language === 'ml') {
    if (twoDayDiff > 10 || twoDayPct > 1.0) {
      recTitle = 'വിള സൂക്ഷിക്കുക (2 ദിവസം കാത്തിരിക്കുക)';
      recDescription = `അടുത്ത 2 ദിവസങ്ങളിൽ വില ക്വിന്റലിന് ₹${Math.abs(twoDayDiff).toFixed(2)} വർദ്ധിക്കാൻ സാധ്യതയുണ്ട്. കൂടുതൽ ലാഭത്തിനായി വിള സൂക്ഷിക്കുന്നത് നല്ലതാണ്.`;
    } else if (twoDayDiff < -10 || twoDayPct < -1.0) {
      recTitle = 'ഇപ്പോൾ വിൽക്കുക (വില കുറയാൻ സാധ്യത)';
      recDescription = `അടുത്ത 2 ദിവസങ്ങളിൽ വില ക്വിന്റലിന് ₹${Math.abs(twoDayDiff).toFixed(2)} കുറയാൻ സാധ്യതയുണ്ട്. നഷ്ടം ഒഴിവാക്കാൻ നിലവിലെ വിലയിൽ വിൽക്കുന്നത് നല്ലതാണ്.`;
    } else {
      recTitle = 'വിൽക്കുകയോ സൂക്ഷിക്കുകയോ ചെയ്യുക (സ്ഥിരതയുള്ള വിലകൾ)';
      recDescription = `അടുത്ത 2 ദിവസങ്ങളിൽ വിലകൾ മാറ്റമില്ലാതെ തുടരാൻ സാധ്യതയുണ്ട്. നിങ്ങളുടെ സൗകര്യത്തിനനുസരിച്ച് തീരുമാനിക്കാം.`;
    }
  } else if (language === 'ta') {
    if (twoDayDiff > 10 || twoDayPct > 1.0) {
      recTitle = 'பயிரை வைத்திருக்கவும் (2 நாட்கள் காத்திருக்கவும்)';
      recDescription = `அடுத்த 2 நாட்களில் விலை குவிண்டாலுக்கு ₹${Math.abs(twoDayDiff).toFixed(2)} அதிகரிக்க வாய்ப்புள்ளது. அதிக லாபத்திற்கு பயிரை வைத்திருப்பது நல்லது.`;
    } else if (twoDayDiff < -10 || twoDayPct < -1.0) {
      recTitle = 'உடனே விற்கவும் (விலை குறைய வாய்ப்புள்ளது)';
      recDescription = `அடுத்த 2 நாட்களில் விலை குவிண்டாலுக்கு ₹${Math.abs(twoDayDiff).toFixed(2)} குறைய வாய்ப்புள்ளது. இழப்பைத் தவிர்க்க தற்போதைய விலையில் விற்பது நல்லது.`;
    } else {
      recTitle = 'விற்கவும் அல்லது வைத்திருக்கவும் (நிலையான விலை)';
      recDescription = `அடுத்த 2 நாட்களில் விலை நிலையாக இருக்க வாய்ப்புள்ளது. உங்கள் வசதிக்கேற்ப முடிவு செய்யலாம்.`;
    }
  }

  const topBorderAccents = ['#10b981', '#f59e0b', '#3b82f6'];
  const dayPills = [t('forecast.day1', {}, language), t('forecast.day2', {}, language), t('forecast.day3', {}, language)];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.25rem', width: '100%' }}>
      
      {/* 1. Today Unavailable / Stale Warning */}
      {!todayOfficialExists && isSelectedToday && (
        <div
          style={{
            background: '#fffbeb',
            border: '1.5px solid #fde68a',
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            color: '#92400e',
            fontSize: '0.82rem',
            fontWeight: 600,
          }}
        >
          <AlertTriangle size={18} color="#b45309" strokeWidth={2.2} style={{ flexShrink: 0 }} />
          <div className="min-w-0 break-words">
            <span>{t('forecast.todayOfficialUnavailable', {}, language)} </span>
            <span style={{ fontWeight: 700 }}>{t('forecast.showingLatestOfficialValue', {}, language)}</span>
            {data.data_age_days !== undefined && data.data_age_days > 0 && (
              <span style={{ marginLeft: '0.35rem', color: '#b45309' }}>
                ({t('forecast.dataAge', {}, language)}: {data.data_age_days} days)
              </span>
            )}
          </div>
        </div>
      )}

      {/* 2. Hero Card: Clean Current Price View */}
      <div
        className="responsive-card-pad"
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          width: '100%',
        }}
      >
        {/* Top: Observed Price */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', minWidth: 0, flex: 1 }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: showSimpleTodayView ? '#dcfce7' : '#e0f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '0.15rem',
              }}
            >
              {showSimpleTodayView ? (
                <Check size={22} color="#16a34a" strokeWidth={2.8} />
              ) : (
                <ShieldCheck size={22} color="#0284c7" strokeWidth={2.2} />
              )}
            </div>

            <div className="min-w-0" style={{ flex: 1 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.3px', display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                <span>
                  {showSimpleTodayView
                    ? `${t('forecast.currentPriceCardTitle', {}, language)} (${observationDateStr})`
                    : `${t('forecast.latestObserved', {}, language)} (${observationDateStr})`
                  }
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e293b', marginTop: '0.15rem' }} className="break-words">
                📍 {getLocalizedMarketName(data.market, language)} • {getLocalizedDistrictName(data.district && data.district !== 'Andhra Pradesh' ? data.district : getDistrictForMarket(data.market), language)}
              </div>
              
              <div className="responsive-hero-price" style={{ fontWeight: 800, color: '#000000', lineHeight: 1.15, marginTop: '0.35rem' }}>
                {basePrice !== null && basePrice > 0 ? (
                  <>
                    ₹{basePrice.toFixed(2)}
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b', marginLeft: '0.35rem' }}>
                      {t('common.unitQuintal', {}, language)}
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: '1.15rem', color: '#94a3b8' }}>{t('forecast.priceUnavailable', {}, language)}</span>
                )}
              </div>
            </div>
          </div>

          {/* 1-Day / Expected Trend Badge Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '0.55rem 0.95rem',
              borderRadius: '12px',
              flexShrink: 0,
            }}
          >
            <TrendIcon size={20} color={trendColor} strokeWidth={2.5} />
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                {showSimpleTodayView ? t('forecast.currentOneDayTrend', {}, language) : t('forecast.expectedTrend', {}, language)}
              </div>
              <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                {trendLabel}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Farmer Decision Advisory Card */}
      {basePrice !== null && basePrice > 0 && (
        <div
          className="responsive-card-pad"
          style={{
            background: recBg,
            border: `1.5px solid ${recBorder}`,
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', minWidth: 0, flex: 1 }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: recIconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <RecIcon size={20} color={recColor} strokeWidth={2.5} />
              </div>
              <div className="min-w-0" style={{ flex: 1 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: recColor, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  {t('forecast.advisoryTitle', {}, language)}
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '0.1rem' }} className="break-words">
                  {recTitle}
                </div>
                <p style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 500, margin: '0.25rem 0 0 0', lineHeight: 1.45 }} className="break-words">
                  {recDescription}
                </p>
              </div>
            </div>

            <div
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '50px',
                fontWeight: 800,
                fontSize: '0.82rem',
                background: recBadgeBg,
                color: recColor,
                border: `1.5px solid ${recBorder}`,
                alignSelf: 'flex-start',
                flexShrink: 0,
              }}
            >
              {recBadgeText}
            </div>
          </div>
        </div>
      )}

      {/* 4. Forecast Target-Date Cards */}
      {!showSimpleTodayView && (
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.35rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {t('forecast.threeDayForecast', {}, language)}
            </h3>
            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
              {t('forecast.forecastOrigin', {}, language)}: {selectedDateStr}
            </span>
          </div>

          {/* Stack vertically on mobile, multi-column on tablet/desktop */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
              gap: '0.85rem',
              width: '100%',
            }}
          >
            {displayRecords.map((record, index) => {
              const targetDateStr = record.target_date || record.date ? String(record.target_date || record.date) : '';
              const currentPrice = record.modal_price;
              
              const isOfficialApi = record.price_source === 'official_api';
              const isOfficialCsv = record.price_source === 'official_csv';
              const isOfficialDb = record.price_source === 'official_database';
              const isObserved = isOfficialApi || isOfficialCsv || isOfficialDb || (record.is_observed && !record.is_predicted);
              
              const isTrainedModel = (
                record.price_source === 'predicted_model' &&
                record.prediction_method === 'trained_model' &&
                record.prediction_executed === true &&
                record.model_predict_called === true
              );

              const isFallback = (
                record.price_source === 'fallback_last_observed' ||
                record.price_source === 'fallback_rolling_average' ||
                record.prediction_method === 'fallback'
              );

              const isUnavailable = record.price_source === 'unavailable' || currentPrice === null;

              // Price difference relative to base date
              let diffFromBase = 0;
              let isDiffZero = true;
              let isDiffPositive = false;

              if (currentPrice !== null && basePrice !== null) {
                diffFromBase = currentPrice - basePrice;
                isDiffZero = Math.abs(diffFromBase) < 0.01;
                isDiffPositive = diffFromBase > 0;
              }

              let cardHeaderTitle = t('forecast.predictedPrice', {}, language);
              let cardHeaderSub = '(AI Model)';
              let cardBadgeText = 'CatBoost ML';
              let cardHeaderColor = '#0284c7';
              let cardBadgeBg = '#e0f2fe';
              let cardBadgeColor = '#0369a1';

              if (isOfficialApi) {
                cardHeaderTitle = t('forecast.officialApiValue', {}, language);
                cardHeaderSub = '(Recorded)';
                cardBadgeText = 'DATA.GOV.IN API';
                cardHeaderColor = '#15803d';
                cardBadgeBg = '#dcfce7';
                cardBadgeColor = '#166534';
              } else if (isOfficialDb) {
                cardHeaderTitle = t('forecast.officialDatabaseValue', {}, language);
                cardHeaderSub = '(Recorded)';
                cardBadgeText = 'Database Official';
                cardHeaderColor = '#15803d';
                cardBadgeBg = '#dcfce7';
                cardBadgeColor = '#166534';
              } else if (isOfficialCsv) {
                cardHeaderTitle = t('forecast.officialCsvValue', {}, language);
                cardHeaderSub = '(Recorded)';
                cardBadgeText = 'Official Recorded';
                cardHeaderColor = '#15803d';
                cardBadgeBg = '#dcfce7';
                cardBadgeColor = '#166534';
              } else if (isTrainedModel) {
                cardHeaderTitle = t('forecast.predictedModelValue', {}, language);
                cardHeaderSub = '(AI Model)';
                cardBadgeText = 'CatBoost ML';
                cardHeaderColor = '#0284c7';
                cardBadgeBg = '#e0f2fe';
                cardBadgeColor = '#0369a1';
              } else if (isFallback) {
                cardHeaderTitle = t('forecast.fallbackValue', {}, language);
                cardHeaderSub = '(Last Observed)';
                cardBadgeText = 'Fallback Estimate';
                cardHeaderColor = '#c2410c';
                cardBadgeBg = '#ffedd5';
                cardBadgeColor = '#9a3412';
              } else if (isUnavailable) {
                cardHeaderTitle = t('forecast.priceUnavailable', {}, language);
                cardHeaderSub = '(No Data)';
                cardBadgeText = 'Unavailable';
                cardHeaderColor = '#b91c1c';
                cardBadgeBg = '#fee2e2';
                cardBadgeColor = '#991b1b';
              }

              const isCardExpanded = expandedCardIndex === index;

              return (
                <div
                  key={`card-${index}-${targetDateStr}`}
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    borderTop: `4px solid ${topBorderAccents[index % 3]}`,
                    padding: '1rem',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                    width: '100%',
                  }}
                >
                  {/* Header: Day Pill & Target Date */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        background: isObserved ? '#dcfce7' : (isTrainedModel ? '#e0f2fe' : (isFallback ? '#ffedd5' : '#fee2e2')),
                        color: isObserved ? '#166534' : (isTrainedModel ? '#0369a1' : (isFallback ? '#9a3412' : '#991b1b')),
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.65rem',
                        borderRadius: '9999px',
                      }}
                    >
                      {dayPills[index % 3]}
                    </span>
                    <span style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.82rem' }}>
                      {targetDateStr}
                    </span>
                  </div>

                  {/* Sub-header Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.35rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: cardHeaderColor, textTransform: 'uppercase' }}>
                      {cardHeaderTitle} <span style={{ fontWeight: 600 }}>{cardHeaderSub}</span>
                    </div>
                    <span
                      style={{
                        background: cardBadgeBg,
                        color: cardBadgeColor,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2px',
                      }}
                    >
                      {cardBadgeText}
                    </span>
                  </div>

                  {/* Price Row */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                      {currentPrice !== null ? (
                        <>
                          <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#000000', lineHeight: 1 }}>
                            ₹{currentPrice % 1 === 0 ? currentPrice : currentPrice.toFixed(2)}
                          </span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#64748b' }}>
                            {t('common.unitQuintal', {}, language)}
                          </span>
                        </>
                      ) : (
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#94a3b8' }}>
                          {t('forecast.priceUnavailable', {}, language)}
                        </span>
                      )}
                    </div>

                    {/* Price Difference from Base Date */}
                    {currentPrice !== null && basePrice !== null ? (
                      <div style={{ marginTop: '0.35rem', fontSize: '0.78rem', fontWeight: 700 }}>
                        {isDiffZero ? (
                          <span style={{ color: '#475569' }}>
                            — 0.00 {t('common.unitQuintal', {}, language)}
                          </span>
                        ) : isDiffPositive ? (
                          <span style={{ color: '#16a34a' }}>
                            ↗ +{diffFromBase.toFixed(2)} {t('common.unitQuintal', {}, language)}
                          </span>
                        ) : (
                          <span style={{ color: '#dc2626' }}>
                            ↘ {diffFromBase.toFixed(2)} {t('common.unitQuintal', {}, language)}
                          </span>
                        )}
                      </div>
                    ) : null}
                  </div>

                  {/* Expandable Details Button */}
                  <button
                    type="button"
                    onClick={() => setExpandedCardIndex(isCardExpanded ? null : index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: '0.2rem 0',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      marginTop: 'auto',
                    }}
                  >
                    <span>
                      {isCardExpanded
                        ? (language === 'te' ? 'వివరాలు దాచు' : (language === 'hi' ? 'विवरण छिपाएं' : (language === 'ta' ? 'விவரங்களை மறை' : (language === 'ml' ? 'വിശദാംശങ്ങൾ മറയ്ക്കുക' : 'Hide details'))))
                        : (language === 'te' ? 'వివరాలు చూడండి' : (language === 'hi' ? 'विवरण देखें' : (language === 'ta' ? 'விவரங்களைப் பார்க்க' : (language === 'ml' ? 'വിശദാംശങ്ങൾ കാണുക' : 'View details'))))
                      }
                    </span>
                    {isCardExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>

                  {/* Expanded Interval & Metadata */}
                  {isCardExpanded && (
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '0.65rem 0.75rem',
                        marginTop: '0.25rem',
                      }}
                    >
                      {record.interval_available && record.lower_bound != null && record.upper_bound != null ? (
                        <>
                          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                            {t('forecast.confidenceInterval', {}, language)}
                          </div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#000000', display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                            <span>{t('forecast.low', {}, language)}: ₹{record.lower_bound.toFixed(2)}</span>
                            <span>{t('forecast.high', {}, language)}: ₹{record.upper_bound.toFixed(2)}</span>
                          </div>
                        </>
                      ) : isObserved ? (
                        <>
                          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                            {t('forecast.officialDatabaseValue', {}, language)}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                            {language === 'te' ? 'నమోదైన అధికారిక పరిశీలన' : (language === 'hi' ? 'दर्ज आधिकारिक अवलोकन' : (language === 'ta' ? 'பதிவு செய்யப்பட்ட அதிகாரப்பூர்வ தரவு' : (language === 'ml' ? 'രേഖപ്പെടുത്തിയ ഔദ്യോഗിക വിവരങ്ങൾ' : 'Recorded observation')))} ({targetDateStr})
                          </div>
                        </>
                      ) : isFallback ? (
                        <>
                          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9a3412', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                            {t('forecast.fallbackValue', {}, language)}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            {record.fallback_reason || t('warnings.fallbackUsed', {}, language)}
                          </div>
                        </>
                      ) : (
                        <div style={{ fontSize: '0.7rem', color: '#991b1b' }}>
                          {t('forecast.priceUnavailable', {}, language)}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Data Verification Panel (Accordion) */}
      <DataVerificationPanel data={data} language={language} />

      {/* 6. Disclaimer */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          fontSize: '0.75rem',
          color: '#64748b',
          lineHeight: 1.45,
          width: '100%',
        }}
      >
        <span style={{ fontWeight: 700, color: '#475569' }}>{t('forecast.disclaimerTitle', {}, language)}: </span>
        {t('forecast.disclaimerText', {}, language)}
      </div>

    </div>
  );
};
