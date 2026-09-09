import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { TrendingUp, BarChart2, Filter, ArrowRightLeft, CheckCircle, AlertCircle, Database, Calendar, ArrowUpDown, Clock } from 'lucide-react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import { getLocalizedCommodityName, getLocalizedMarketName, getLocalizedDistrictName } from '../utils/i18nData';
import {
  fetchRecentCommodities,
  fetchRecentMarkets,
  fetchPriceTrends,
  fetchPriceComparison,
  type RecentCommodity,
  type RecentMarket,
  type TrendPoint,
  type CompareMarketItem,
  type ExcludedMarketItem
} from '../services/forecastService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Props {
  language: Language;
}

export const PriceTrendsTab: React.FC<Props> = ({ language }) => {
  const t = translations[language] || translations.en;
  const [commodities, setCommodities] = useState<RecentCommodity[]>([]);
  const [selectedCommodity, setSelectedCommodity] = useState<string>('Tomato');
  
  const [markets, setMarkets] = useState<RecentMarket[]>([]);
  const [primaryMarket, setPrimaryMarket] = useState<string>('');
  const [compareMarket, setCompareMarket] = useState<string>('');

  const [primaryTrends, setPrimaryTrends] = useState<TrendPoint[]>([]);
  const [compareTrends, setCompareTrends] = useState<TrendPoint[]>([]);

  const [comparisonMarkets, setComparisonMarkets] = useState<CompareMarketItem[]>([]);
  const [excludedMarkets, setExcludedMarkets] = useState<ExcludedMarketItem[]>([]);
  const [maxAgeDays, setMaxAgeDays] = useState<number>(30);
  const [sortBy, setSortBy] = useState<'price_desc' | 'price_asc' | 'freshness' | 'alphabetical'>('price_desc');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load available recent commodities
  useEffect(() => {
    loadRecentCommodities();
  }, []);

  const loadRecentCommodities = async () => {
    try {
      setLoading(true);
      setError(null);
      const commList = await fetchRecentCommodities(30, 3);
      setCommodities(commList);
      if (commList && commList.length > 0) {
        const initialCrop = commList[0].canonical_name;
        setSelectedCommodity(initialCrop);
        await loadRecentMarketsForCrop(initialCrop);
      }
    } catch (err: any) {
      console.error('Failed to load recent commodities', err);
      setError('Failed to load recent commodities with official records.');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentMarketsForCrop = async (cropName: string) => {
    try {
      setLoading(true);
      const mktList = await fetchRecentMarkets(cropName, 30, 3);
      setMarkets(mktList);

      if (mktList && mktList.length > 0) {
        const m1 = mktList[0].canonical_name;
        const m2 = mktList.length > 1 ? mktList[1].canonical_name : '';
        setPrimaryMarket(m1);
        setCompareMarket(m2);
        await fetchAllData(cropName, m1, m2, maxAgeDays);
      } else {
        setPrimaryMarket('');
        setCompareMarket('');
        setPrimaryTrends([]);
        setCompareTrends([]);
        setComparisonMarkets([]);
        setExcludedMarkets([]);
      }
    } catch (err: any) {
      console.error('Failed to load recent markets for crop', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async (cropName: string, m1Name: string, m2Name: string, ageDays: number = maxAgeDays) => {
    if (!cropName || !m1Name) return;
    setLoading(true);
    setError(null);
    try {
      const promises: Promise<any>[] = [
        fetchPriceTrends({ commodity: cropName, market: m1Name, days: 30, force_refresh: false }),
        fetchPriceComparison({ commodity: cropName, max_age_days: ageDays, force_refresh: false })
      ];

      if (m2Name) {
        promises.push(
          fetchPriceTrends({ commodity: cropName, market: m2Name, days: 30, force_refresh: false })
        );
      }

      const results = await Promise.all(promises);
      setPrimaryTrends(results[0] || []);
      
      const compRes = results[1];
      if (compRes) {
        setComparisonMarkets(compRes.markets || []);
        setExcludedMarkets(compRes.excluded_markets || []);
      }

      if (m2Name && results[2]) {
        setCompareTrends(results[2] || []);
      } else {
        setCompareTrends([]);
      }
    } catch (err: any) {
      console.error('Error fetching trend/compare data', err);
      setError('Unable to fetch official observed data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCommodityChange = async (cropName: string) => {
    setSelectedCommodity(cropName);
    await loadRecentMarketsForCrop(cropName);
  };

  const handlePrimaryMarketChange = async (m1Name: string) => {
    setPrimaryMarket(m1Name);
    if (m1Name === compareMarket) {
      const remaining = markets.filter(m => m.canonical_name !== m1Name);
      const newM2 = remaining.length > 0 ? remaining[0].canonical_name : '';
      setCompareMarket(newM2);
      await fetchAllData(selectedCommodity, m1Name, newM2, maxAgeDays);
    } else {
      await fetchAllData(selectedCommodity, m1Name, compareMarket, maxAgeDays);
    }
  };

  const handleCompareMarketChange = async (m2Name: string) => {
    setCompareMarket(m2Name);
    await fetchAllData(selectedCommodity, primaryMarket, m2Name, maxAgeDays);
  };

  const handleAgeDaysChange = async (days: number) => {
    setMaxAgeDays(days);
    await fetchAllData(selectedCommodity, primaryMarket, compareMarket, days);
  };

  // Build Unified Date Labels across both markets
  const allDatesSet = Array.from(new Set([
    ...primaryTrends.map(p => p.date),
    ...compareTrends.map(p => p.date)
  ])).sort();

  const p1Map = new Map(primaryTrends.map(p => [p.date, p]));
  const p2Map = new Map(compareTrends.map(p => [p.date, p]));

  const chartData1 = allDatesSet.map(d => p1Map.get(d)?.modal_price ?? null);
  const chartData2 = allDatesSet.map(d => p2Map.get(d)?.modal_price ?? null);

  const formatDateLabel = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const day = parts[2];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthIndex = parseInt(parts[1], 10) - 1;
        return `${day} ${monthNames[monthIndex] || parts[1]}`;
      }
    } catch {
      // fallback
    }
    return dateStr;
  };

  const lineChartData = {
    labels: allDatesSet.map(formatDateLabel),
    datasets: [
      {
        label: `${getLocalizedMarketName(primaryMarket, language)} (₹/qtl)`,
        data: chartData1,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        tension: 0.25,
        fill: false,
        pointRadius: 3.5,
        pointHoverRadius: 6,
        pointBackgroundColor: '#10b981',
        borderWidth: 2.5,
        spanGaps: true,
      },
      ...(compareMarket ? [{
        label: `${getLocalizedMarketName(compareMarket, language)} (₹/qtl)`,
        data: chartData2,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        tension: 0.25,
        fill: false,
        pointRadius: 3.5,
        pointHoverRadius: 6,
        pointBackgroundColor: '#3b82f6',
        borderWidth: 2.5,
        spanGaps: true,
      }] : [])
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#334155', font: { family: 'Plus Jakarta Sans', weight: 700, size: 11 } }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          title: (items: any) => {
            if (items && items[0]) {
              const idx = items[0].dataIndex;
              return allDatesSet[idx] ? `Date: ${allDatesSet[idx]}` : items[0].label;
            }
            return '';
          },
          label: (context: any) => {
            const val = context.parsed.y;
            if (val === null || val === undefined) return '';
            const isP1 = context.datasetIndex === 0;
            const dateStr = allDatesSet[context.dataIndex];
            const pt = isP1 ? p1Map.get(dateStr) : p2Map.get(dateStr);
            const srcLabel = pt ? pt.source_label : 'Official';
            return `${context.dataset.label.split(' (')[0]}: ₹${val.toLocaleString('en-IN')}/qtl [${srcLabel}]`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(0, 0, 0, 0.04)' },
        ticks: {
          color: '#64748b',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 7,
          font: { size: 10, weight: 600 }
        }
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.04)' },
        ticks: { color: '#64748b', font: { size: 10 } },
        title: { display: false }
      }
    }
  };

  // Sort comparison markets
  const sortedComparisonMarkets = useMemo(() => {
    const list = [...comparisonMarkets];
    if (sortBy === 'price_desc') {
      return list.sort((a, b) => (b.modal_price || 0) - (a.modal_price || 0));
    }
    if (sortBy === 'price_asc') {
      return list.sort((a, b) => (a.modal_price || 0) - (b.modal_price || 0));
    }
    if (sortBy === 'freshness') {
      return list.sort((a, b) => (a.data_age_days || 0) - (b.data_age_days || 0));
    }
    if (sortBy === 'alphabetical') {
      return list.sort((a, b) => a.market.localeCompare(b.market));
    }
    return list;
  }, [comparisonMarkets, sortBy]);

  const barChartData = {
    labels: sortedComparisonMarkets.slice(0, 8).map(c => getLocalizedMarketName(c.market, language)),
    datasets: [
      {
        label: 'Latest Modal Price (₹/qtl)',
        data: sortedComparisonMarkets.slice(0, 8).map(c => c.modal_price),
        backgroundColor: sortedComparisonMarkets.slice(0, 8).map(c =>
          c.market === primaryMarket ? '#10b981' :
          c.market === compareMarket ? '#3b82f6' : '#94a3b8'
        ),
        borderRadius: 6,
      }
    ]
  };

  const getSourceBadgeClass = (source: string) => {
    if (source === 'official_api') return 'badge-green';
    if (source === 'official_database') return 'badge-blue';
    return 'badge-amber';
  };

  const p1Latest = primaryTrends.length > 0 ? primaryTrends[primaryTrends.length - 1] : null;
  const p2Latest = compareTrends.length > 0 ? compareTrends[compareTrends.length - 1] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      
      {/* Selector Control Panel */}
      <div className="glass-panel responsive-card-pad" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.92rem' }}>
          <Filter size={16} />
          <span>{language === 'te' ? 'అధికారిక ఫిల్టర్లు' : (language === 'hi' ? 'आधिकारिक फ़िल्टर' : (language === 'ta' ? 'அதிகாரப்பூர்வ வடிகட்டிகள்' : (language === 'ml' ? 'ഔദ്യോഗിക ഫിൽട്ടറുകൾ' : 'Official Data Filters')))}</span>
        </div>

        {/* Filters: Vertical stack on mobile, 3-col on desktop */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '0.85rem', width: '100%' }}>
          {/* Select Commodity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {t.common?.selectCrop || 'Crop / Commodity'}
            </label>
            <select
              className="form-select"
              value={selectedCommodity}
              onChange={(e) => handleCommodityChange(e.target.value)}
              disabled={loading || commodities.length === 0}
            >
              {commodities.map(c => (
                <option key={c.canonical_name} value={c.canonical_name}>
                  {getLocalizedCommodityName(c.canonical_name, language)}
                </option>
              ))}
            </select>
          </div>

          {/* Primary Market */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#059669' }}>
              {language === 'te' ? 'ప్రాథమిక మండి' : (language === 'hi' ? 'प्राथमिक मंडी' : (language === 'ta' ? 'முதன்மை மண்டி' : (language === 'ml' ? 'പ്രധാന വിപണി' : 'Primary Market')))}
            </label>
            <select
              className="form-select"
              style={{ borderColor: '#10b981' }}
              value={primaryMarket}
              onChange={(e) => handlePrimaryMarketChange(e.target.value)}
              disabled={loading || markets.length === 0}
            >
              {markets.length === 0 ? (
                <option value="">{language === 'te' ? 'తాజా డేటా లేదు' : (language === 'hi' ? 'कोई हालिया डेटा नहीं' : (language === 'ta' ? 'சமீபத்திய தரவு இல்லை' : (language === 'ml' ? 'ഡാറ്റ ലഭ്യമല്ല' : 'No markets with recent data')))}</option>
              ) : (
                markets.map(m => (
                  <option key={m.canonical_name} value={m.canonical_name}>
                    {getLocalizedMarketName(m.canonical_name, language)} ({getLocalizedDistrictName(m.district, language)})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Compare Market */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563eb' }}>
              {language === 'te' ? 'పోలిక కోసం మండి (ఐచ్ఛికం)' : (language === 'hi' ? 'तुलना के लिए मंडी (वैकल्पिक)' : (language === 'ta' ? 'ஒப்பீட்டு மண்டி (விருப்பத்தேர்வு)' : (language === 'ml' ? 'താരതമ്യ വിപണി (ഓപ്ഷണൽ)' : 'Compare Market (Optional)')))}
            </label>
            <select
              className="form-select"
              style={{ borderColor: '#3b82f6' }}
              value={compareMarket}
              onChange={(e) => handleCompareMarketChange(e.target.value)}
              disabled={loading || markets.length < 2}
            >
              <option value="">
                {language === 'te' ? '-- ఒక్కటే మండి (పోలిక లేదు) --' : (language === 'hi' ? '-- एकल मंडी (कोई तुलना नहीं) --' : (language === 'ta' ? '-- ஒற்றை மண்டி (ஒப்பீடு இல்லை) --' : (language === 'ml' ? '-- ഒറ്റ വിപണി (താരതമ്യമില്ല) --' : '-- None (Single Market) --')))}
              </option>
              {markets
                .filter(m => m.canonical_name !== primaryMarket)
                .map(m => (
                  <option key={m.canonical_name} value={m.canonical_name}>
                    {getLocalizedMarketName(m.canonical_name, language)} ({getLocalizedDistrictName(m.district, language)})
                  </option>
                ))}
            </select>
          </div>

        </div>
      </div>

      {error && (
        <div style={{ padding: '0.85rem 1rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid #f87171', borderRadius: '10px', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }} role="alert">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Comparison Summary Card (If 2 markets selected) */}
      {compareMarket && p1Latest && p2Latest && (
        <div
          className="responsive-card-pad"
          style={{
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <ArrowRightLeft size={20} color="#2563eb" style={{ flexShrink: 0 }} />
            <div className="min-w-0">
              <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary-dark)' }} className="break-words">
                {getLocalizedMarketName(primaryMarket, language)} vs {getLocalizedMarketName(compareMarket, language)}
              </h4>
              <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {getLocalizedCommodityName(selectedCommodity, language)} {language === 'te' ? 'ధరల పోలిక' : 'Mandi Comparison'}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '0.65rem' }}>
            <div style={{ background: '#ffffff', padding: '0.6rem 0.75rem', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, display: 'block' }}>{getLocalizedMarketName(primaryMarket, language)}</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-dark)' }}>₹{p1Latest.modal_price} / qtl</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>{p1Latest.date} ({p1Latest.data_age_days}d ago)</span>
            </div>

            <div style={{ background: '#ffffff', padding: '0.6rem 0.75rem', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <span style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 700, display: 'block' }}>{getLocalizedMarketName(compareMarket, language)}</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-dark)' }}>₹{p2Latest.modal_price} / qtl</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>{p2Latest.date} ({p2Latest.data_age_days}d ago)</span>
            </div>

            <div style={{ background: '#ffffff', padding: '0.6rem 0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>
                {language === 'te' ? 'అధిక ధర లభించిన మండి' : (language === 'hi' ? 'अधिक भाव वाली मंडी' : (language === 'ta' ? 'அதிக விலை கிடைத்த மண்டி' : (language === 'ml' ? 'കൂടുതൽ വില ലഭിച്ച വിപണി' : 'Higher Realized Mandi')))}
              </span>
              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle size={14} />
                {p1Latest.modal_price >= p2Latest.modal_price ? getLocalizedMarketName(primaryMarket, language) : getLocalizedMarketName(compareMarket, language)} (+₹{Math.abs(p1Latest.modal_price - p2Latest.modal_price)})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Historical 30-Day Trends Chart */}
      <div className="glass-panel responsive-card-pad" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.65rem', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem', margin: 0 }}>
              <TrendingUp size={18} color="var(--primary)" />
              {t.trends?.title || 'Historical Price Trends'}
            </h3>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {t.trends?.subtitle || 'Official observed APMC mandi prices from the last 30 days.'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {p1Latest && (
              <span className={`badge ${getSourceBadgeClass(p1Latest.price_source)}`} style={{ fontSize: '0.68rem' }}>
                <Database size={11} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
                {p1Latest.source_label} ({p1Latest.date})
              </span>
            )}
          </div>
        </div>

        {primaryTrends.length < 2 ? (
          <div style={{ height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b', textAlign: 'center', padding: '1rem' }}>
            <Calendar size={24} color="#94a3b8" style={{ marginBottom: '0.35rem' }} />
            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
              {t.trends?.noRecentData || 'Not enough recent official mandi data is available to display a trend.'}
            </span>
            <span style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>
              {t.trends?.officialOnly || 'Only valid observed APMC records from the last 30 days are displayed.'}
            </span>
          </div>
        ) : (
          <div className="chart-container-responsive">
            <Line data={lineChartData} options={lineOptions} />
          </div>
        )}
      </div>

      {/* Cross Market Comparison Grid & Stacked Cards */}
      <div className="glass-panel responsive-card-pad" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem', margin: 0 }}>
              <BarChart2 size={18} color="#60a5fa" />
              {t.comparison?.title || 'Market Comparison Overview'}
            </h3>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {language === 'te' ? `గత ${maxAgeDays} రోజుల్లో అధికారిక లావాదేవీలు నమోదైన మార్కెట్లు.` : (language === 'hi' ? `पिछले ${maxAgeDays} दिनों में लेनदेन दर्ज मंडियों का विवरण।` : (language === 'ta' ? `கடந்த ${maxAgeDays} நாட்களில் பதிவு செய்யப்பட்ட மண்டிகள்.` : (language === 'ml' ? `കഴിഞ്ഞ ${maxAgeDays} ദിവസങ്ങളിലെ വിപണി നിരീക്ഷണങ്ങൾ.` : `Showing markets with official observations within ${maxAgeDays} days.`)))}
            </div>
          </div>

          {/* Time Window & Sort Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Freshness pills */}
            <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '0.2rem', borderRadius: '8px', gap: '0.2rem', border: '1px solid #e2e8f0' }}>
              {[30, 60].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => handleAgeDaysChange(days)}
                  style={{
                    padding: '0.25rem 0.55rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: maxAgeDays === days ? '#059669' : 'transparent',
                    color: maxAgeDays === days ? '#ffffff' : '#475569',
                    boxShadow: maxAgeDays === days ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {days}d
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.25rem 0.5rem' }}>
              <ArrowUpDown size={12} color="#64748b" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#334155',
                  outline: 'none',
                  cursor: 'pointer',
                }}
                aria-label="Sort comparison markets"
              >
                <option value="price_desc">{language === 'te' ? 'అత్యధిక ధర' : (language === 'hi' ? 'उच्चतम भाव' : (language === 'ta' ? 'அதிகபட்ச விலை' : (language === 'ml' ? 'ഏറ്റവും ഉയർന്ന വില' : 'Highest Price')))}</option>
                <option value="price_asc">{language === 'te' ? 'అత్యల్ప ధర' : (language === 'hi' ? 'न्यूनतम भाव' : (language === 'ta' ? 'குறைந்த விலை' : (language === 'ml' ? 'ഏറ്റവും കുറഞ്ഞ വില' : 'Lowest Price')))}</option>
                <option value="freshness">{language === 'te' ? 'తాజా డేటా' : (language === 'hi' ? 'नवीनतम डेटा' : (language === 'ta' ? 'சமீபத்திய தரவு' : (language === 'ml' ? 'പുതിയ ഡാറ്റ' : 'Freshest First')))}</option>
                <option value="alphabetical">{language === 'te' ? 'మార్కెట్ పేరు' : (language === 'hi' ? 'मंडी का नाम' : (language === 'ta' ? 'மண்டி பெயர்' : (language === 'ml' ? 'വിപണി നാമം' : 'Market Name')))}</option>
              </select>
            </div>
          </div>
        </div>

        {comparisonMarkets.length === 0 ? (
          <div
            style={{
              padding: '2rem 1rem',
              textAlign: 'center',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px dashed #cbd5e1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.65rem',
              margin: '0.75rem 0'
            }}
          >
            <AlertCircle size={30} color="#f59e0b" />
            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
              {language === 'te' ? `గత ${maxAgeDays} రోజుల్లో అధికారిక మండి పరిశీలనలు కనుగొనబడలేదు.` : (language === 'hi' ? `पिछले ${maxAgeDays} दिनों में कोई आधिकारिक मंडी रिकॉर्ड नहीं मिला।` : (language === 'ta' ? `கடந்த ${maxAgeDays} நாட்களில் அதிகாரப்பூர்வ பதிவுகள் எதுவும் கிடைக்கவில்லை.` : (language === 'ml' ? `കഴിഞ്ഞ ${maxAgeDays} ദിവസങ്ങളിൽ ഔദ്യോഗിക രേഖകൾ ഒന്നും ലഭ്യമല്ല.` : `No official mandi observations found within the last ${maxAgeDays} days.`)))}
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', maxWidth: '480px', lineHeight: 1.45 }}>
              {language === 'te' ? 'అందుబాటులో ఉన్న రికార్డులను చూడటానికి సమయ పరిధిని 60 రోజులకు పెంచండి.' : (language === 'hi' ? 'उपलब्ध रिकॉर्ड देखने के लिए समय सीमा को 60 दिनों तक बढ़ाएं।' : (language === 'ta' ? 'கிடைக்கக்கூடிய பதிவுகளைக் காண கால வரம்பை 60 நாட்களுக்கு விரிவாக்குங்கள்.' : (language === 'ml' ? 'ലഭ്യമായ രേഖകൾ കാണാൻ സമയപരിധി 60 ദിവസമായി മാറ്റുക.' : 'Try expanding the freshness window to 60 days to view available records.')))}
            </p>
            {maxAgeDays === 30 && (
              <button
                type="button"
                onClick={() => handleAgeDaysChange(60)}
                className="btn-primary"
                style={{ marginTop: '0.35rem', fontSize: '0.82rem', padding: '0.5rem 1rem', minHeight: '40px' }}
              >
                {language === 'te' ? 'సమయ పరిధిని 60 రోజులకు పెంచండి' : (language === 'hi' ? 'अवधि 60 दिन तक बढ़ाएं' : (language === 'ta' ? 'கால வரம்பை 60 நாட்களாக விரிவுபடுத்து' : (language === 'ml' ? 'കാലയളവ് 60 ദിവസമായി മാറ്റുക' : 'Expand Freshness Window to 60 Days')))}
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
            
            {/* Bar Chart Overview */}
            <div style={{ height: '240px', width: '100%' }}>
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { ticks: { color: '#64748b', font: { size: 9 }, maxRotation: 35, autoSkip: true } },
                    y: { ticks: { color: '#64748b', font: { size: 9 } } }
                  }
                }}
              />
            </div>

            {/* Mobile View: Stacked Comparison Cards (< 1024px) */}
            <div className="mobile-only" style={{ flexDirection: 'column', gap: '0.65rem', width: '100%' }}>
              {sortedComparisonMarkets.map((c) => (
                <div
                  key={c.market}
                  style={{
                    background: c.market === primaryMarket ? 'rgba(16, 185, 129, 0.06)' : c.market === compareMarket ? 'rgba(59, 130, 246, 0.06)' : '#ffffff',
                    border: c.market === primaryMarket ? '1.5px solid #10b981' : c.market === compareMarket ? '1.5px solid #3b82f6' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                    width: '100%',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div className="min-w-0">
                      <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }} className="break-words">
                        {getLocalizedMarketName(c.market, language)}
                        {c.market === primaryMarket && <span style={{ marginLeft: '0.35rem', fontSize: '0.68rem', color: '#059669', fontWeight: 800 }}>(M1)</span>}
                        {c.market === compareMarket && <span style={{ marginLeft: '0.35rem', fontSize: '0.68rem', color: '#2563eb', fontWeight: 800 }}>(M2)</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {getLocalizedDistrictName(c.district, language)}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-dark)', lineHeight: 1 }}>
                        ₹{c.modal_price}
                      </div>
                      <span style={{ fontSize: '0.68rem', color: '#64748b' }}>/ quintal</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.35rem', fontSize: '0.74rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.45rem', marginTop: '0.2rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>
                      Range: ₹{c.min_price} - ₹{c.max_price}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: c.data_age_days === 0 ? '#059669' : '#64748b', fontWeight: 600 }}>
                      <Clock size={11} />
                      {c.data_age_days === 0 ? 'Today' : `${c.data_age_days}d ago`} ({c.observation_date})
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Full Table (>= 1024px) */}
            <div className="desktop-only" style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '0.6rem' }}>{language === 'te' ? 'మార్కెట్' : (language === 'hi' ? 'मंडी' : (language === 'ta' ? 'மண்டி' : (language === 'ml' ? 'വിപണി' : 'Market')))}</th>
                    <th style={{ padding: '0.6rem' }}>{language === 'te' ? 'జిల్లా' : (language === 'hi' ? 'ज़िला' : (language === 'ta' ? 'மாவட்டம்' : (language === 'ml' ? 'ജില്ല' : 'District')))}</th>
                    <th style={{ padding: '0.6rem' }}>{t.trends?.modalPrice || 'Modal Price'}</th>
                    <th style={{ padding: '0.6rem' }}>{t.trends?.minMaxRange || 'Min - Max'}</th>
                    <th style={{ padding: '0.6rem' }}>{t.trends?.arrivalQuantity || 'Arrivals'}</th>
                    <th style={{ padding: '0.6rem' }}>{language === 'te' ? 'తేదీ' : (language === 'hi' ? 'तिथि' : (language === 'ta' ? 'தேதி' : (language === 'ml' ? 'തീയതി' : 'Observed Date')))}</th>
                    <th style={{ padding: '0.6rem' }}>{t.forecast?.dataAge || 'Data Age'}</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedComparisonMarkets.map((c) => (
                    <tr
                      key={c.market}
                      style={{
                        borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
                        backgroundColor: c.market === primaryMarket ? 'rgba(16, 185, 129, 0.08)' : c.market === compareMarket ? 'rgba(59, 130, 246, 0.08)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '0.65rem', fontWeight: 700 }}>
                        {getLocalizedMarketName(c.market, language)}
                        {c.market === primaryMarket && <span style={{ marginLeft: '0.4rem', fontSize: '0.7rem', color: '#059669', fontWeight: 800 }}>(M1)</span>}
                        {c.market === compareMarket && <span style={{ marginLeft: '0.4rem', fontSize: '0.7rem', color: '#2563eb', fontWeight: 800 }}>(M2)</span>}
                      </td>
                      <td style={{ padding: '0.65rem', color: 'var(--text-muted)' }}>{getLocalizedDistrictName(c.district, language)}</td>
                      <td style={{ padding: '0.65rem', fontWeight: 700, color: 'var(--primary-dark)' }}>₹{c.modal_price}</td>
                      <td style={{ padding: '0.65rem', color: 'var(--text-muted)' }}>₹{c.min_price} - ₹{c.max_price}</td>
                      <td style={{ padding: '0.65rem', color: 'var(--text-muted)' }}>{c.arrival_quantity ? `${c.arrival_quantity} qtl` : '—'}</td>
                      <td style={{ padding: '0.65rem', fontWeight: 600 }}>{c.observation_date}</td>
                      <td style={{ padding: '0.65rem', color: c.data_age_days === 0 ? '#059669' : '#64748b' }}>
                        {c.data_age_days === 0 ? (language === 'te' ? 'ఈరోజు' : (language === 'hi' ? 'आज' : (language === 'ta' ? 'இன்று' : (language === 'ml' ? 'ഇന്ന്' : 'Today')))) : `${c.data_age_days}d ago`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* Excluded Markets */}
        {excludedMarkets.length > 0 && (
          <div style={{ marginTop: '1.25rem', padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <h5 style={{ margin: '0 0 0.35rem 0', fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>
              {language === 'te' ? `మినహాయించబడిన మార్కెట్లు (గత ${maxAgeDays} రోజుల్లో లావాదేవీలు నమోదుకానివి):` : (language === 'hi' ? `बहिष्कृत मंडियां (पिछले ${maxAgeDays} दिनों में कोई अवलोकन नहीं):` : (language === 'ta' ? `விலக்கப்பட்ட மண்டிகள் (கடந்த ${maxAgeDays} நாட்களில் பதிவுகள் இல்லை):` : (language === 'ml' ? `ഒഴിവാക്കിയ വിപണികൾ (കഴിഞ്ഞ ${maxAgeDays} ദിവസങ്ങളിൽ നിരീക്ഷണങ്ങളില്ല):` : `Excluded Markets (${excludedMarkets.length} mandis with no observations in the last ${maxAgeDays} days):`)))}
            </h5>
            <ul style={{ margin: 0, paddingLeft: '1.15rem', fontSize: '0.75rem', color: '#64748b' }}>
              {excludedMarkets.map(ex => (
                <li key={ex.market} style={{ marginBottom: '0.15rem' }}>
                  <strong>{getLocalizedMarketName(ex.market, language)}</strong>: {ex.reason}
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>

    </div>
  );
};
