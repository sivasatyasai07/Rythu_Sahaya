import React from 'react';
import { Trash2, RefreshCw } from 'lucide-react';

export interface ImagePreviewProps {
  imagePreviewUrl: string;
  fileName?: string;
  fileSizeMb?: number;
  onRemove: () => void;
  onReplace: () => void;
  disabled?: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imagePreviewUrl,
  fileName,
  fileSizeMb,
  onRemove,
  onReplace,
  disabled = false,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#f8fafc',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '1rem',
        gap: '0.85rem',
        width: '100%',
      }}
    >
      <div
        style={{
          width: '100%',
          maxHeight: '260px',
          borderRadius: '10px',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#0f172a',
        }}
      >
        <img
          src={imagePreviewUrl}
          alt="Crop Leaf Preview"
          style={{
            maxWidth: '100%',
            maxHeight: '260px',
            objectFit: 'contain',
            borderRadius: '10px',
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '0.65rem' }}>
        <div className="min-w-0" style={{ flex: 1 }}>
          {fileName && (
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }} className="truncate">
              {fileName}
            </div>
          )}
          {fileSizeMb !== undefined && (
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Size: {fileSizeMb.toFixed(2)} MB
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
          <button
            type="button"
            onClick={onReplace}
            disabled={disabled}
            className="btn-secondary"
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.78rem',
              minHeight: '38px',
            }}
          >
            <RefreshCw size={13} />
            <span>Replace</span>
          </button>

          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid #fecaca',
              background: '#fef2f2',
              color: '#dc2626',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: disabled ? 'not-allowed' : 'pointer',
              minHeight: '38px',
            }}
          >
            <Trash2 size={13} />
            <span>Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
};
