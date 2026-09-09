import React, { useState } from 'react';
import type { DiseaseAnalysisResult, ImageMetadata } from '../../types/disease';
import type { Language } from '../../i18n/translations';
import { getDiseaseI18n } from '../../utils/i18nDisease';
import {
  AlertTriangle,
  Activity,
  Sparkles,
  Leaf,
  CheckCircle2,
  XCircle,
  ServerCrash,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Wrench,
  CheckCheck,
  WifiOff,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import { DiagnosisConfidence } from './DiagnosisConfidence';

export interface DiseaseResultCardProps {
  result: DiseaseAnalysisResult;
  imageMeta?: ImageMetadata;
  imageUrl?: string;
  createdAt?: string;
  language?: Language;
}

export const DiseaseResultCard: React.FC<DiseaseResultCardProps> = ({
  result,
  language = 'en',
}) => {
  const [symptomsOpen, setSymptomsOpen] = useState<boolean>(false);
  const [preventionOpen, setPreventionOpen] = useState<boolean>(false);
  const [botanicalOpen, setBotanicalOpen] = useState<boolean>(false);

  const dI18n = getDiseaseI18n(language);
  const status = result.analysis_status || 'success';

  const isNetworkError =
    status === 'network_error' ||
    status === 'internet_offline' ||
    Boolean(
      result.validation_warnings?.some((w: any) => {
        const txt = (typeof w === 'string' ? w : (w.issue || '')).toLowerCase();
        return (
          txt.includes('getaddrinfo') ||
          txt.includes('11001') ||
          txt.includes('no internet') ||
          txt.includes('network connection') ||
          txt.includes('internet connection') ||
          txt.includes('name or service not known') ||
          txt.includes('temporary failure in name resolution') ||
          txt.includes('connecterror') ||
          txt.includes('failed to establish a new connection')
        );
      })
    );

  const isServiceError = [
    'service_error',
    'plantnet_authentication_error',
    'plantnet_unavailable',
    'plantnet_timeout',
    'plantnet_rate_limit_error',
    'plantnet_invalid_response',
  ].includes(status);

  const isInsufficientEvidence = status === 'insufficient_evidence';
  const isNonPlant = status === 'non_plant_image';

  // 0. NO INTERNET / NETWORK DISCONNECTION STATE
  if (isNetworkError) {
    return (
      <div
        className="responsive-card-pad"
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #fed7aa',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#ffedd5',
              color: '#ea580c',
              flexShrink: 0,
            }}
          >
            <WifiOff size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#9a3412' }}>
              {dI18n.networkErrorTitle}
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#c2410c', fontWeight: 600 }}>
              Network / Internet Offline
            </span>
          </div>
        </div>

        <div
          style={{
            background: '#fff7ed',
            border: '1px solid #ffedd5',
            borderRadius: '12px',
            padding: '1rem',
            color: '#9a3412',
            fontSize: '0.85rem',
            lineHeight: 1.5,
          }}
        >
          <p style={{ margin: '0 0 0.5rem 0' }}>{dI18n.networkErrorSubtitle}</p>
          <ul style={{ margin: 0, paddingLeft: '1.15rem', fontSize: '0.82rem', color: '#7c2d12', lineHeight: 1.5 }}>
            <li>{dI18n.networkCheckWifi}</li>
            <li>{dI18n.networkRetryPrompt}</li>
          </ul>
        </div>
      </div>
    );
  }

  // 1. SERVICE ERROR / PROVIDER UNAVAILABLE STATE
  if (isServiceError) {
    let errorTitle = 'Plant Identification Service Unavailable';
    let errorMessage = 'Plant identification service is temporarily unavailable. Please try again later.';

    if (status === 'plantnet_authentication_error') {
      errorTitle = 'PlantNet Authentication Error';
      errorMessage = 'PlantNet API authentication failed. Please verify the API key in backend.';
    } else if (status === 'plantnet_rate_limit_error') {
      errorTitle = 'PlantNet Rate Limit Reached';
      errorMessage = 'PlantNet API rate limit reached. Please wait a moment and try again.';
    } else if (status === 'plantnet_timeout') {
      errorTitle = 'PlantNet Connection Timeout';
      errorMessage = 'PlantNet service timed out. Please try again.';
    }

    return (
      <div
        className="responsive-card-pad"
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #fecaca',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#dc2626' }}>
          <ServerCrash size={24} style={{ flexShrink: 0 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
            {errorTitle}
          </h3>
        </div>

        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fee2e2',
            borderRadius: '12px',
            padding: '1rem',
            color: '#991b1b',
            fontSize: '0.88rem',
            lineHeight: 1.5,
          }}
        >
          <strong>{errorMessage}</strong>
        </div>
      </div>
    );
  }

  // 2. INSUFFICIENT EVIDENCE / NON-PLANT IMAGE STATE
  if (isInsufficientEvidence || isNonPlant) {
    return (
      <div
        className="responsive-card-pad"
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #fed7aa',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#c2410c' }}>
          <AlertTriangle size={24} style={{ flexShrink: 0 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
            {isNonPlant ? 'Non-Plant Image Detected' : 'Could Not Confidently Identify Plant'}
          </h3>
        </div>

        <div
          style={{
            background: '#fff7ed',
            border: '1px solid #ffedd5',
            borderRadius: '12px',
            padding: '1rem',
            color: '#9a3412',
            fontSize: '0.88rem',
            lineHeight: 1.5,
          }}
        >
          <strong>
            {isNonPlant
              ? 'Please upload a clear, well-lit photo of a crop leaf, fruit, flower, or foliage.'
              : 'Upload a clearer image showing the leaf, fruit, stem, or whole plant for confident diagnosis.'}
          </strong>
        </div>
      </div>
    );
  }

  // 3. SUCCESSFUL IDENTIFICATION & DISEASE DIAGNOSIS VIEW
  const cropName = result.detected_crop || (typeof result.crop === 'object' && result.crop !== null ? result.crop.name : (result.crop || 'Crop'));
  const scientificName = result.detected_scientific_name || result.plantnet_results?.[0]?.scientific_name || null;
  const plantnetScore = result.plantnet_score ?? (typeof result.crop === 'object' && result.crop !== null ? result.crop.confidence : null);
  const familyName = result.plantnet_results?.[0]?.family || null;

  const isMismatch = result.crop_match_status === 'mismatch';
  const selectedCrop = result.selected_crop;

  // Disease diagnosis details
  const diseaseName = (typeof result.disease === 'object' && result.disease !== null ? result.disease.name : result.disease) || result.primary_diagnosis?.name || 'Healthy Plant';
  const isHealthy = (result.health_status === 'healthy') || diseaseName.toLowerCase().includes('healthy');
  const symptoms = result.symptoms || [];
  const causes = result.possible_causes || [];
  const management = (result.management && result.management.length > 0 ? result.management : result.immediate_actions) || [];
  const prevention = result.prevention || [];
  const riskLevel = result.risk_level || (isHealthy ? 'low' : 'medium');

  return (
    <div
      className="responsive-card-pad"
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '100%',
      }}
    >
      {/* 1. TOP HERO SUMMARY GRID (Always visible on mobile) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
          gap: '0.75rem',
          width: '100%',
        }}
      >
        {/* Identified Plant */}
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#166534', fontSize: '0.75rem', fontWeight: 700 }}>
            <Leaf size={14} />
            <span>Identified Crop</span>
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#14532d' }} className="break-words">
            {cropName}
          </div>
          {scientificName && (
            <div style={{ fontSize: '0.75rem', color: '#15803d', fontStyle: 'italic' }} className="break-words">
              {scientificName}
            </div>
          )}
        </div>

        {/* Health Status */}
        <div
          style={{
            background: isHealthy ? '#f0fdf4' : '#fff1f2',
            border: isHealthy ? '1px solid #bbf7d0' : '1px solid #fecdd3',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: isHealthy ? '#166534' : '#9f1239', fontSize: '0.75rem', fontWeight: 700 }}>
            {isHealthy ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
            <span>Health Status</span>
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: isHealthy ? '#15803d' : '#be123c' }}>
            {isHealthy ? 'Healthy Plant' : 'Disease Detected'}
          </div>
          <div style={{ fontSize: '0.75rem', color: isHealthy ? '#166534' : '#9f1239', textTransform: 'capitalize' }}>
            Risk Level: <strong>{riskLevel}</strong>
          </div>
        </div>

        {/* Confidence */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#475569', fontSize: '0.75rem', fontWeight: 700 }}>
            <Sparkles size={14} />
            <span>Diagnosis Confidence</span>
          </div>
          <DiagnosisConfidence confidence={plantnetScore} scoreLabel="Confidence score" />
        </div>

        {/* Crop Match Banner (if applicable) */}
        {selectedCrop && (
          <div
            style={{
              background: isMismatch ? '#fff1f2' : '#f0fdf4',
              border: isMismatch ? '1px solid #fecdd3' : '1px solid #bbf7d0',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: isMismatch ? '#9f1239' : '#166534', fontSize: '0.75rem', fontWeight: 700 }}>
              {isMismatch ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
              <span>Crop Verification</span>
            </div>
            <div style={{ fontSize: '0.98rem', fontWeight: 800, color: isMismatch ? '#be123c' : '#15803d' }}>
              {isMismatch ? 'Selected Crop Mismatch' : 'Crop Match Confirmed'}
            </div>
            <div style={{ fontSize: '0.72rem', color: isMismatch ? '#9f1239' : '#166534', lineHeight: 1.3 }}>
              {isMismatch
                ? `Selected: '${selectedCrop}' • Detected: '${cropName}'`
                : `Matched selected '${selectedCrop}'.`}
            </div>
          </div>
        )}
      </div>

      {/* 2. PRIMARY DISEASE DIAGNOSIS CARD */}
      <div
        style={{
          background: isHealthy ? '#f0fdf4' : '#fffbeb',
          border: isHealthy ? '1.5px solid #86efac' : '1.5px solid #fde68a',
          borderRadius: '14px',
          padding: '1rem 1.15rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.65rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, flex: 1 }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: isHealthy ? '#dcfce7' : '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Stethoscope size={20} color={isHealthy ? '#16a34a' : '#d97706'} />
          </div>
          <div className="min-w-0" style={{ flex: 1 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: isHealthy ? '#166534' : '#92400e', textTransform: 'uppercase' }}>
              Primary Diagnosis
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isHealthy ? '#14532d' : '#78350f' }} className="break-words">
              {diseaseName}
            </div>
          </div>
        </div>

        <span
          style={{
            background: isHealthy ? '#dcfce7' : '#fef3c7',
            color: isHealthy ? '#15803d' : '#92400e',
            border: `1px solid ${isHealthy ? '#bbf7d0' : '#fde68a'}`,
            borderRadius: '20px',
            padding: '0.3rem 0.75rem',
            fontWeight: 700,
            fontSize: '0.78rem',
            flexShrink: 0,
          }}
        >
          {isHealthy ? 'No Active Infection' : 'Action Recommended'}
        </span>
      </div>

      {/* 3. MANAGEMENT ACTIONS (Highlighted / Expanded by default) */}
      {management.length > 0 && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '14px',
            padding: '1rem 1.15rem',
          }}
        >
          <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#166534', margin: '0 0 0.65rem 0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Wrench size={16} color="#16a34a" />
            Recommended Immediate Actions & Treatment
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {management.map((step, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  background: '#ffffff',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #dcfce7',
                  fontSize: '0.82rem',
                  color: '#14532d',
                  lineHeight: 1.45,
                }}
              >
                <CheckCheck size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span className="break-words">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SYMPTOMS & CAUSES ACCORDION */}
      {(symptoms.length > 0 || causes.length > 0) && (
        <div className="accordion-card">
          <button
            type="button"
            className="accordion-header-btn"
            onClick={() => setSymptomsOpen(!symptomsOpen)}
            aria-expanded={symptomsOpen}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
              <Activity size={16} color="var(--primary)" />
              <span>Visible Symptoms & Possible Causes ({symptoms.length + causes.length})</span>
            </div>
            {symptomsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {symptomsOpen && (
            <div className="accordion-body-content" style={{ padding: '0.75rem 1rem 1rem 1rem' }}>
              {symptoms.length > 0 && (
                <div style={{ marginBottom: causes.length > 0 ? '0.75rem' : 0 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Symptoms:</div>
                  <ul style={{ margin: 0, paddingLeft: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {symptoms.map((sym, idx) => (
                      <li key={idx} style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.4 }} className="break-words">
                        {sym}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {causes.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Possible Causes:</div>
                  <ul style={{ margin: 0, paddingLeft: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {causes.map((cause, idx) => (
                      <li key={idx} style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.4 }} className="break-words">
                        {cause}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. PREVENTATIVE CARE ACCORDION */}
      {prevention.length > 0 && (
        <div className="accordion-card">
          <button
            type="button"
            className="accordion-header-btn"
            onClick={() => setPreventionOpen(!preventionOpen)}
            aria-expanded={preventionOpen}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
              <ShieldCheck size={16} color="var(--primary)" />
              <span>Prevention & Field Hygiene Practices ({prevention.length})</span>
            </div>
            {preventionOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {preventionOpen && (
            <div className="accordion-body-content" style={{ padding: '0.75rem 1rem 1rem 1rem' }}>
              <ul style={{ margin: 0, paddingLeft: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {prevention.map((prev, idx) => (
                  <li key={idx} style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.45 }} className="break-words">
                    {prev}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 6. BOTANICAL & DIAGNOSTIC DETAILS ACCORDION */}
      {(scientificName || familyName || result.plantnet_results) && (
        <div className="accordion-card">
          <button
            type="button"
            className="accordion-header-btn"
            onClick={() => setBotanicalOpen(!botanicalOpen)}
            aria-expanded={botanicalOpen}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
              <Info size={16} color="#64748b" />
              <span>Botanical Classification & Image Trace</span>
            </div>
            {botanicalOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {botanicalOpen && (
            <div className="accordion-body-content" style={{ padding: '0.75rem 1rem 1rem 1rem', fontSize: '0.8rem', color: '#475569' }}>
              {scientificName && <div><strong>Scientific Name:</strong> <em>{scientificName}</em></div>}
              {familyName && <div style={{ marginTop: '0.25rem' }}><strong>Family:</strong> {familyName}</div>}
              {plantnetScore != null && <div style={{ marginTop: '0.25rem' }}><strong>PlantNet Score:</strong> {(plantnetScore * 100).toFixed(1)}%</div>}
            </div>
          )}
        </div>
      )}

      {/* 7. DISCLAIMER */}
      <div
        style={{
          background: '#f8fafc',
          borderLeft: '4px solid #94a3b8',
          padding: '0.75rem 0.95rem',
          borderRadius: '8px',
          fontSize: '0.75rem',
          color: '#64748b',
          lineHeight: 1.45,
        }}
      >
        <strong>Disclaimer:</strong> {result.disclaimer || 'This is an AI-assisted preliminary crop disease assessment. Confirm with your local agricultural extension officer or Krishi Vigyan Kendra (KVK) before applying chemical treatments.'}
      </div>
    </div>
  );
};
