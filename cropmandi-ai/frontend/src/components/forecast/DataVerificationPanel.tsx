import React, { useState } from 'react';
import type { VerifiedForecastResponse } from '../../services/forecastService';
import { formatKolkataDate } from '../../utils/timezone';
import { getLocalizedCommodityName, getLocalizedMarketName } from '../../utils/i18nData';
import type { Language } from '../../i18n/translations';
import { ShieldCheck, CheckCircle2, XCircle, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { PriceSourceBadge } from './PriceSourceBadge';

export interface DataVerificationPanelProps {
  data: VerifiedForecastResponse;
  language?: Language;
}

export const DataVerificationPanel: React.FC<DataVerificationPanelProps> = ({ data, language = 'en' }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const formattedSelectedDate = formatKolkataDate(data.selected_date);

  const dateRangeStr = data.date_range
    ? `${formatKolkataDate(data.date_range.start)} — ${formatKolkataDate(data.date_range.end)}`
    : `${formattedSelectedDate} (4-day sequence)`;

  const apiCheckedTimeStr = data.api_checked_time || new Date(data.fetched_at).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }) + ' IST';

  const apiCount = data.summary?.official_api_count ?? (data.summary?.official_values || 0);
  const csvCount = data.summary?.official_csv_count ?? 0;
  const predCount = data.summary?.predicted_count ?? (data.summary?.predicted_values || 0);
  const unavailCount = data.summary?.unavailable_count ?? (data.summary?.unavailable_values || 0);

  const locCrop = getLocalizedCommodityName(data.commodity, language);
  const locMarket = getLocalizedMarketName(data.market, language);

  return (
    <div
      className="accordion-card"
      style={{
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        marginTop: '0.75rem',
      }}
    >
      {/* Accordion Toggle Header */}
      <button
        type="button"
        className="accordion-header-btn"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '1rem 1.15rem',
          background: isExpanded ? '#f8fafc' : '#ffffff',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
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
            <ShieldCheck size={20} color="#16a34a" />
          </div>
          <div style={{ minWidth: 0 }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.3 }}>
              {language === 'te'
                ? 'డేటా మూలం వివరాలు & ధృవీకరణ'
                : (language === 'hi'
                    ? 'डेटा स्रोत विवरण एवं सत्यापन'
                    : (language === 'ta'
                        ? 'தரவு மூல விவரங்கள் & தணிக்கை'
                        : (language === 'ml'
                            ? 'ഡാറ്റാ ഉറവിട വിശദാംശങ്ങളും പരിശോധനയും'
                            : 'Data Source Details & Precedence Audit')))}
            </h4>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
              {apiCount} API • {csvCount} {language === 'te' ? 'రికార్డులు' : (language === 'hi' ? 'रिकॉर्ड' : (language === 'ta' ? 'பதிவுகள்' : (language === 'ml' ? 'രേഖകൾ' : 'Records')))} • {predCount} {language === 'te' ? 'అంచనాలు' : (language === 'hi' ? 'पूर्वानुमान' : (language === 'ta' ? 'கணிப்புகள்' : (language === 'ml' ? 'പ്രവചനങ്ങൾ' : 'Predictions')))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <span
            className="badge badge-green desktop-only"
            style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}
          >
            {language === 'te' ? 'ధృవీకరించిన ప్రాధాన్యత' : (language === 'hi' ? 'सत्यापित प्राथमिकता' : (language === 'ta' ? 'சரிபார்க்கப்பட்ட முன்னுரிமை' : (language === 'ml' ? 'പരിശോധിച്ച മുൻഗണന' : 'Verified Precedence')))}
          </span>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
            }}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </button>

      {/* Expanded Accordion Body */}
      {isExpanded && (
        <div className="accordion-body-content" style={{ padding: '1rem 1.15rem 1.25rem 1.15rem' }}>
          {/* Subtitle */}
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '1rem' }}>
            {locCrop} • {locMarket} ({dateRangeStr})
          </div>

          {/* Summary Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <div style={{ background: '#f0fdf4', padding: '0.6rem 0.75rem', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', display: 'block' }}>
                {language === 'te' ? 'అధికారిక API' : (language === 'hi' ? 'आधिकारिक API' : (language === 'ta' ? 'அதிகாரப்பூர்வ API' : (language === 'ml' ? 'ഔദ്യോഗിക API' : 'Official API')))}
              </span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#15803d' }}>{apiCount}</div>
            </div>

            <div style={{ background: '#e0f2fe', padding: '0.6rem 0.75rem', borderRadius: '10px', border: '1px solid #bae6fd' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', display: 'block' }}>
                {language === 'te' ? 'అధికారిక రికార్డు' : (language === 'hi' ? 'आधिकारिक रिकॉर्ड' : (language === 'ta' ? 'அதிகாரப்பூர்வ பதிவு' : (language === 'ml' ? 'ഔദ്യോഗിക രേഖ' : 'Official Recorded')))}
              </span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0284c7' }}>{csvCount}</div>
            </div>

            <div style={{ background: '#fef3c7', padding: '0.6rem 0.75rem', borderRadius: '10px', border: '1px solid #fde68a' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', display: 'block' }}>
                {language === 'te' ? 'AI అంచనాలు' : (language === 'hi' ? 'AI पूर्वानुमान' : (language === 'ta' ? 'AI கணிப்புகள்' : (language === 'ml' ? 'AI പ്രവചനങ്ങൾ' : 'AI Predictions')))}
              </span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#b45309' }}>{predCount}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.6rem 0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>
                {language === 'te' ? 'లభించనివి' : (language === 'hi' ? 'अनुपलब्ध' : (language === 'ta' ? 'கிடைக்கவில்லை' : (language === 'ml' ? 'ലഭ്യമല്ല' : 'Unavailable')))}
              </span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#475569' }}>{unavailCount}</div>
            </div>
          </div>

          {/* Per-Date Lookup Verification Table (Contained Scroll) */}
          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '1.25rem', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left', minWidth: '520px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700, color: '#475569' }}>
                    {language === 'te' ? 'తేదీ' : (language === 'hi' ? 'तिथि' : (language === 'ta' ? 'தேதி' : (language === 'ml' ? 'തീയതി' : 'Date')))}
                  </th>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700, color: '#475569' }}>
                    {language === 'te' ? 'API తనిఖీ' : (language === 'hi' ? 'API जांच' : (language === 'ta' ? 'API சரிபார்ப்பு' : (language === 'ml' ? 'API പരിശോധന' : 'API Found')))}
                  </th>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700, color: '#475569' }}>
                    {language === 'te' ? 'అధికారిక రికార్డు' : (language === 'hi' ? 'आधिकारिक रिकॉर्ड' : (language === 'ta' ? 'அதிகாரப்பூர்வ பதிவு' : (language === 'ml' ? 'ഔദ്യോഗിക രേഖ' : 'Official Record')))}
                  </th>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700, color: '#475569' }}>
                    {language === 'te' ? 'తుది మూలం' : (language === 'hi' ? 'स्रोत' : (language === 'ta' ? 'ஆதாரம்' : (language === 'ml' ? 'ഉറവിടം' : 'Source')))}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.records.map((r, idx) => {
                  const formattedDate = formatKolkataDate(r.date);
                  const apiFound = r.api_record_found || r.price_source === 'official_api';
                  const csvFound = r.master_csv_record_found || r.price_source === 'official_csv';

                  const yesText = language === 'te' ? 'అవును' : (language === 'hi' ? 'हाँ' : (language === 'ta' ? 'ஆம்' : (language === 'ml' ? 'അതെ' : 'Yes')));
                  const noText = language === 'te' ? 'కాదు' : (language === 'hi' ? 'नहीं' : (language === 'ta' ? 'இல்லை' : (language === 'ml' ? 'ഇല്ല' : 'No')));

                  return (
                    <tr key={r.date || idx} style={{ borderBottom: idx < data.records.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <td style={{ padding: '0.65rem 0.85rem', fontWeight: 800, color: '#0f172a' }}>
                        {formattedDate}
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        {apiFound ? (
                          <span style={{ color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            <CheckCircle2 size={13} /> {yesText}
                          </span>
                        ) : (
                          <span style={{ color: '#64748b', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            <XCircle size={13} /> {noText}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        {csvFound ? (
                          <span style={{ color: '#0284c7', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            <CheckCircle2 size={13} /> {yesText}
                          </span>
                        ) : (
                          <span style={{ color: '#64748b', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            <XCircle size={13} /> {noText}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <PriceSourceBadge priceSource={r.price_source} sourceLabel={r.source_label} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Freshness & Sync Diagnostics Panel */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '0.85rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.35rem' }}>
              <span>{language === 'te' ? 'సమకాలీకరణ & తాజాదన తనిఖీ' : (language === 'hi' ? 'सिंक एवं ताजगी ऑडिट' : (language === 'ta' ? 'ஒத்திசைவு & தணிக்கை' : (language === 'ml' ? 'സമന്വയവും പരിശോധനയും' : 'SYNC & FRESHNESS AUDIT')))}</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: data.data_refresh_status === 'failed' ? '#dc2626' : '#16a34a' }}>
                Status: {data.data_refresh_status?.toUpperCase() || 'SUCCESS'}
              </span>
            </div>

            {data.stale_data_warning && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.5rem 0.75rem', marginBottom: '0.65rem', fontSize: '0.75rem', color: '#92400e', fontWeight: 600 }}>
                ⚠️ {data.stale_data_warning}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', fontSize: '0.75rem' }}>
              <div style={{ background: '#ffffff', padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontSize: '0.68rem', display: 'block', fontWeight: 700 }}>
                  {language === 'te' ? 'లైవ్ API తనిఖీ' : (language === 'hi' ? 'लाइव API जांच' : (language === 'ta' ? 'நேரலை API சரிபார்ப்பு' : (language === 'ml' ? 'തത്സമയ API പരിശോധന' : 'LIVE API CHECKED')))}
                </span>
                <span style={{ fontWeight: 800, color: data.api_checked ? '#16a34a' : '#dc2626' }}>
                  {data.api_checked ? (language === 'te' ? 'అవును (data.gov.in)' : (language === 'hi' ? 'हाँ (data.gov.in)' : (language === 'ta' ? 'ஆம் (data.gov.in)' : (language === 'ml' ? 'അതെ (data.gov.in)' : 'Yes (data.gov.in)')))) : (language === 'te' ? 'కాదు' : 'No')}
                </span>
              </div>

              <div style={{ background: '#ffffff', padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontSize: '0.68rem', display: 'block', fontWeight: 700 }}>
                  {language === 'te' ? 'రికార్డులు సమకాలీకరించబడ్డాయి' : (language === 'hi' ? 'रिकॉर्ड सिंक किए गए' : (language === 'ta' ? 'பதிவுகள் ஒத்திசைக்கப்பட்டன' : (language === 'ml' ? 'റെക്കോർഡുകൾ ശേഖരിച്ചു' : 'RECORDS SYNCED')))}
                </span>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>
                  {data.records_fetched_count ?? 0} {language === 'te' ? 'రికార్డులు' : (language === 'hi' ? 'रिकॉर्ड' : (language === 'ta' ? 'பதிவுகள்' : (language === 'ml' ? 'രേഖകൾ' : 'records')))}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', fontSize: '0.74rem', color: '#64748b' }}>
            <div>
              {language === 'te' ? 'తనిఖీ సమయం:' : (language === 'hi' ? 'जांच समय:' : (language === 'ta' ? 'சரிபார்க்கப்பட்டது:' : (language === 'ml' ? 'പരിശോധിച്ച സമയം:' : 'Checked:')))} <strong>{apiCheckedTimeStr}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Calendar size={12} />
              <span>{language === 'te' ? 'ఆధార తేదీ:' : (language === 'hi' ? 'आधार तिथि:' : (language === 'ta' ? 'அடிப்படை தேதி:' : (language === 'ml' ? 'അടിസ്ഥാന തീയതി:' : 'Base:')))} <strong>{formattedSelectedDate}</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
