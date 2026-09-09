import React, { useState, useEffect } from 'react';
import { api } from '../api';
import type { AdminStatus } from '../api';
import { 
  ShieldCheck, 
  Play, 
  Database, 
  CheckCircle2, 
  RefreshCw, 
  Cpu, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle,
  Server,
  Layers
} from 'lucide-react';

export const AdminTab: React.FC = () => {
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);
  const [qualityReport, setQualityReport] = useState<any>(null);
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Accordion open/collapse states
  const [openSections, setOpenSections] = useState<{
    overview: boolean;
    controls: boolean;
    metrics: boolean;
    quality: boolean;
  }>({
    overview: true,
    controls: true,
    metrics: false,
    quality: false,
  });

  const [confirmRetrain, setConfirmRetrain] = useState<boolean>(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [sRes, qRes, mRes] = await Promise.all([
        api.get<AdminStatus>('/admin/status'),
        api.get('/ingestion/data-quality-report/latest'),
        api.get('/models')
      ]);
      setAdminStatus(sRes.data);
      setQualityReport(qRes.data.report);
      setModels(mRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const triggerCleaning = async () => {
    setActionMessage('Running Data Cleaning Pipeline...');
    try {
      const res = await api.post('/ingestion/clean');
      setQualityReport(res.data.cleaning_report);
      setActionMessage('Data Cleaning Completed Successfully!');
      fetchAdminData();
    } catch (e: any) {
      setActionMessage(`Cleaning Error: ${e.message}`);
    }
  };

  const triggerRetraining = async () => {
    setConfirmRetrain(false);
    setActionMessage('Training CatBoost Direct 3-Horizon Models...');
    try {
      const res = await api.post('/models/train', {
        train_start: '2021-01-01',
        train_end: '2025-12-31',
        test_start: '2026-01-01'
      });
      setActionMessage(`Model Retrained! New Active Version: ${res.data.model_version}`);
      fetchAdminData();
    } catch (e: any) {
      setActionMessage(`Training Error: ${e.message}`);
    }
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const activeModel = models.find(m => m.is_active) || models[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', maxWidth: '100%' }}>
      
      {/* Top Header Card */}
      <div className="glass-panel responsive-card-pad">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            <div style={{ width: 42, height: 42, borderRadius: '10px', background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck size={24} color="var(--primary-dark)" />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--primary-dark)' }}>
                System & ML Admin
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Pipeline observability & operations
              </div>
            </div>
          </div>

          <button 
            className="btn-secondary" 
            onClick={fetchAdminData}
            style={{ minHeight: '44px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.86rem' }}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> 
            <span>Refresh</span>
          </button>
        </div>

        {actionMessage && (
          <div style={{ marginTop: '1rem', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.75rem 1rem', borderRadius: '8px', color: '#047857', fontSize: '0.86rem', fontWeight: 600 }}>
            {actionMessage}
          </div>
        )}
      </div>

      {/* Accordion 1: System Status Overview */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <button
          type="button"
          onClick={() => toggleSection('overview')}
          style={{
            width: '100%',
            padding: '1rem 1.25rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            textAlign: 'left'
          }}
          aria-expanded={openSections.overview}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
            <Server size={18} color="var(--primary)" />
            <span style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-main)' }}>Pipeline Health & Record Status</span>
          </div>
          {openSections.overview ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
        </button>

        {openSections.overview && (
          <div style={{ padding: '0 1.25rem 1.25rem 1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.85rem' }}>
              
              <div className="agricultural-card" style={{ padding: '1rem', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Raw Market Records</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-dark)', marginTop: '0.2rem' }}>
                  {adminStatus?.total_raw_records || 0}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '0.2rem', fontWeight: 600 }}>Source: data.gov.in & CSV</div>
              </div>

              <div className="agricultural-card" style={{ padding: '1rem', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Cleaned Records</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', marginTop: '0.2rem' }}>
                  {adminStatus?.total_cleaned_records || 0}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Normalized & Audited</div>
              </div>

              <div className="agricultural-card" style={{ padding: '1rem', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Active ML Version</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#2563eb', marginTop: '0.2rem', wordBreak: 'break-all' }}>
                  {adminStatus?.active_model_version || 'CatBoost-APMC-v1'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>CatBoost Direct 3-Horizon</div>
              </div>

              <div className="agricultural-card" style={{ padding: '1rem', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Operational Health</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#059669', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle2 size={16} /> Operational
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>All microservices ready</div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Accordion 2: Pipeline Execution Controls */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <button
          type="button"
          onClick={() => toggleSection('controls')}
          style={{
            width: '100%',
            padding: '1rem 1.25rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            textAlign: 'left'
          }}
          aria-expanded={openSections.controls}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
            <Play size={18} color="var(--primary)" />
            <span style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-main)' }}>Pipeline Execution Controls</span>
          </div>
          {openSections.controls ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
        </button>

        {openSections.controls && (
          <div style={{ padding: '0 1.25rem 1.25rem 1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              
              <button 
                className="btn-primary" 
                onClick={triggerCleaning}
                style={{ width: '100%', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.88rem' }}
              >
                <Database size={16} /> Run Data Ingestion & Cleaning
              </button>

              {!confirmRetrain ? (
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', minHeight: '44px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.88rem' }} 
                  onClick={() => setConfirmRetrain(true)}
                >
                  <Cpu size={16} /> Retrain CatBoost ML Models
                </button>
              ) : (
                <div style={{ padding: '0.85rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#b91c1c', fontWeight: 700 }}>
                    <AlertTriangle size={16} /> Confirm Retraining
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-main)', margin: 0 }}>
                    This will train CatBoost models for Horizons 1, 2, and 3 across APMC commodities.
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <button 
                      className="btn-primary" 
                      style={{ flex: 1, minHeight: '40px', background: '#dc2626', fontSize: '0.82rem' }}
                      onClick={triggerRetraining}
                    >
                      Yes, Retrain Now
                    </button>
                    <button 
                      className="btn-secondary" 
                      style={{ flex: 1, minHeight: '40px', fontSize: '0.82rem' }}
                      onClick={() => setConfirmRetrain(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Accordion 3: Active Model Performance Metrics */}
      {activeModel && activeModel.metrics_json && (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => toggleSection('metrics')}
            style={{
              width: '100%',
              padding: '1rem 1.25rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              textAlign: 'left'
            }}
            aria-expanded={openSections.metrics}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
              <Layers size={18} color="#2563eb" />
              <span style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-main)' }}>
                CatBoost Horizon Diagnostics ({activeModel.model_version || 'APMC-v1'})
              </span>
            </div>
            {openSections.metrics ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
          </button>

          {openSections.metrics && (
            <div style={{ padding: '0 1.25rem 1.25rem 1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '0.85rem' }}>
                {Object.entries(activeModel.metrics_json).map(([hKey, m]: [string, any]) => (
                  <div key={hKey} className="agricultural-card" style={{ padding: '1rem', borderLeft: '4px solid var(--primary)', border: '1px solid var(--border-color)' }}>
                    <div style={{ textTransform: 'uppercase', fontWeight: 800, fontSize: '0.82rem', color: 'var(--primary-dark)', marginBottom: '0.6rem' }}>
                      {hKey.replace('_', ' ')} Evaluation
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem', fontSize: '0.8rem' }}>
                      <div>MAE: <strong style={{ color: 'var(--text-main)' }}>₹{m.mae}</strong></div>
                      <div>RMSE: <strong style={{ color: 'var(--text-main)' }}>₹{m.rmse}</strong></div>
                      <div>MAPE: <strong style={{ color: '#2563eb' }}>{m.mape}%</strong></div>
                      <div>WAPE: <strong style={{ color: '#2563eb' }}>{m.wape}%</strong></div>
                      <div>sMAPE: <strong style={{ color: '#2563eb' }}>{m.smape}%</strong></div>
                      <div>R² Score: <strong style={{ color: '#059669' }}>{m.r2}</strong></div>
                    </div>

                    {m.coverage && (
                      <div style={{ marginTop: '0.65rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        80% Interval Coverage: <strong style={{ color: '#d97706' }}>{m.coverage}%</strong> (Avg: ₹{m.avg_width})
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Accordion 4: Data Quality Report Breakdown */}
      {qualityReport && (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => toggleSection('quality')}
            style={{
              width: '100%',
              padding: '1rem 1.25rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              textAlign: 'left'
            }}
            aria-expanded={openSections.quality}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
              <FileText size={18} color="#059669" />
              <span style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-main)' }}>Data Quality Audit Report</span>
            </div>
            {openSections.quality ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
          </button>

          {openSections.quality && (
            <div style={{ padding: '0 1.25rem 1.25rem 1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '0.75rem', fontSize: '0.82rem' }}>
                <div className="agricultural-card" style={{ padding: '0.75rem', border: '1px solid var(--border-color)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Total Raw Rows</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', marginTop: '0.15rem' }}>{qualityReport.total_input_rows}</div>
                </div>
                <div className="agricultural-card" style={{ padding: '0.75rem', border: '1px solid var(--border-color)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Valid Cleaned Rows</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#059669', marginTop: '0.15rem' }}>{qualityReport.valid_rows}</div>
                </div>
                <div className="agricultural-card" style={{ padding: '0.75rem', border: '1px solid var(--border-color)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Rejected Anomalies</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#dc2626', marginTop: '0.15rem' }}>{qualityReport.invalid_rows}</div>
                </div>
                <div className="agricultural-card" style={{ padding: '0.75rem', border: '1px solid var(--border-color)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Duplicates Deduplicated</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', marginTop: '0.15rem' }}>{qualityReport.duplicate_counts}</div>
                </div>
              </div>
              {qualityReport.date_range && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Date Horizon: <strong>{qualityReport.date_range.start}</strong> to <strong>{qualityReport.date_range.end}</strong>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
