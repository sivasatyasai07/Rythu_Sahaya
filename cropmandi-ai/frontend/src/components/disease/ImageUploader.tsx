import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Camera, AlertCircle, Plus, X, RotateCcw, Check, RefreshCw } from 'lucide-react';
import type { Language } from '../../i18n/translations';
import { getDiseaseI18n } from '../../utils/i18nDisease';

export interface ImageUploaderProps {
  selectedFile: File | null;
  selectedFiles?: File[];
  language?: Language;
  onFileSelect: (file: File | null) => void;
  onFilesSelect?: (files: File[]) => void;
  disabled?: boolean;
}

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  selectedFile,
  selectedFiles = [],
  language = 'en',
  onFileSelect,
  onFilesSelect,
  disabled = false,
}) => {
  const dI18n = getDiseaseI18n(language);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Native input refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Live Camera state
  const [cameraModalOpen, setCameraModalOpen] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const allFiles = selectedFiles.length > 0 ? selectedFiles : (selectedFile ? [selectedFile] : []);

  const validateAndAddFiles = useCallback((incomingFiles: FileList | File[]) => {
    setErrorMessage(null);
    const valid: File[] = [...allFiles];

    for (let i = 0; i < incomingFiles.length; i++) {
      const file = incomingFiles[i];
      if (valid.length >= 3) {
        setErrorMessage(dI18n.maxFilesWarning);
        break;
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
        setErrorMessage('Only JPG, PNG, and WEBP images are supported.');
        continue;
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setErrorMessage('Image size must not exceed 10 MB.');
        continue;
      }

      valid.push(file);
    }

    if (valid.length > 0) {
      onFileSelect(valid[0]);
      if (onFilesSelect) onFilesSelect(valid);
    }
  }, [allFiles, onFileSelect, onFilesSelect, dI18n.maxFilesWarning]);

  // Handle Drag & Drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  }, [disabled, validateAndAddFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
    }
    // reset input value so re-taking with the same filename works
    e.target.value = '';
  };

  const handleRemoveIndex = (index: number) => {
    const updated = allFiles.filter((_, i) => i !== index);
    if (updated.length > 0) {
      onFileSelect(updated[0]);
      if (onFilesSelect) onFilesSelect(updated);
    } else {
      onFileSelect(null);
      if (onFilesSelect) onFilesSelect([]);
    }
    setErrorMessage(null);
  };

  // --- Live Camera Functions ---
  const startCamera = async (mode: 'environment' | 'user' = 'environment') => {
    if (disabled) return;
    setErrorMessage(null);
    setCapturedDataUrl(null);
    setFacingMode(mode);
    setCameraLoading(true);

    // Stop previous stream
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      // Fallback to native capture input if WebRTC camera is unavailable
      setCameraLoading(false);
      if (cameraInputRef.current) cameraInputRef.current.click();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setCameraStream(stream);
      setCameraModalOpen(true);
      setCameraLoading(false);
    } catch (err: any) {
      console.warn('[CAMERA] Direct stream failed, falling back to native device camera:', err);
      setCameraLoading(false);
      setCameraModalOpen(false);
      // Fallback immediately to native camera capture input
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setCameraModalOpen(false);
    setCapturedDataUrl(null);
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedDataUrl(dataUrl);
    }
  };

  const confirmCapturedPhoto = () => {
    if (!capturedDataUrl) return;
    fetch(capturedDataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], `crop_photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        validateAndAddFiles([file]);
        stopCamera();
      })
      .catch((err) => {
        console.error('Error creating photo file:', err);
        stopCamera();
      });
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    startCamera(nextMode);
  };

  // Attach stream to video tag
  useEffect(() => {
    if (cameraModalOpen && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(console.error);
    }
  }, [cameraModalOpen, cameraStream]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      
      {/* Hidden File & Camera Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
        disabled={disabled}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        disabled={disabled}
      />

      {/* Main Upload / Camera Launch Area */}
      {allFiles.length === 0 ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragActive ? '#10b981' : '#cbd5e1'}`,
            borderRadius: '16px',
            background: dragActive ? '#ecfdf5' : '#f8fafc',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
          }}
          onClick={() => {
            if (!disabled) startCamera('environment');
          }}
        >
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: '#dcfce7',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              color: '#16a34a',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.15)',
            }}
          >
            <Camera size={34} strokeWidth={2.2} />
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
            Click to Open Camera or Take Photo
          </h3>

          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 1.25rem 0' }}>
            {dI18n.dragDropText}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.4rem',
                borderRadius: '10px',
                fontSize: '0.92rem',
                fontWeight: 700,
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(22, 163, 74, 0.25)',
              }}
              onClick={() => startCamera('environment')}
              disabled={disabled || cameraLoading}
            >
              <Camera size={18} />
              <span>{cameraLoading ? 'Opening Camera...' : `${dI18n.takePhoto} (Open Camera)`}</span>
            </button>

            <button
              type="button"
              className="btn btn-outline"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.4rem',
                borderRadius: '10px',
                fontSize: '0.92rem',
                fontWeight: 700,
                background: '#ffffff',
                color: '#334155',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
              }}
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.click();
              }}
              disabled={disabled}
            >
              <Upload size={18} />
              <span>{dI18n.browseFiles}</span>
            </button>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '1rem' }}>
            {dI18n.supportedFormatsText} • Direct live camera viewfinder & capture supported
          </div>
        </div>
      ) : (
        /* Image Preview Gallery */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {allFiles.map((file, idx) => {
              const url = URL.createObjectURL(file);
              return (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                    background: '#f8fafc',
                    aspectRatio: '4/3',
                  }}
                >
                  <img
                    src={url}
                    alt={`Crop preview ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      background: 'rgba(15, 23, 42, 0.75)',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '50px',
                    }}
                  >
                    Image {idx + 1}
                  </div>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handleRemoveIndex(idx)}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'rgba(239, 68, 68, 0.9)',
                        color: '#ffffff',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                      title="Remove image"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              );
            })}

            {allFiles.length < 3 && !disabled && (
              <div
                onClick={() => startCamera('environment')}
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  aspectRatio: '4/3',
                  background: '#f8fafc',
                  color: '#64748b',
                  padding: '1rem',
                  textAlign: 'center',
                }}
              >
                <Plus size={24} color="#16a34a" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, marginTop: '0.35rem' }}>Add Another Photo</span>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Open camera or upload</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Validation / Format Error Banner */}
      {errorMessage && (
        <div
          style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '10px',
            padding: '0.65rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#991b1b',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          <AlertCircle size={17} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* --- LIVE CAMERA MODAL VIEW --- */}
      {cameraModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={stopCamera}
        >
          <div
            style={{
              position: 'relative',
              background: '#0f172a',
              borderRadius: '20px',
              overflow: 'hidden',
              maxWidth: '680px',
              width: '100%',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Controls */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.25rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                <Camera size={20} color="#22c55e" />
                <span>Camera Viewfinder</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                    padding: '0.45rem 0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  }}
                  title="Flip camera (front / back)"
                >
                  <RefreshCw size={15} />
                  <span>Flip Camera</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    color: '#ef4444',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Close Camera"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Video Feed / Snapshot View */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                background: '#000000',
                aspectRatio: '4/3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {capturedDataUrl ? (
                <img
                  src={capturedDataUrl}
                  alt="Captured Crop"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {/* Framing Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12%',
                      left: '12%',
                      right: '12%',
                      bottom: '12%',
                      border: '2px dashed rgba(255, 255, 255, 0.5)',
                      borderRadius: '16px',
                      pointerEvents: 'none',
                    }}
                  />
                </>
              )}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            {/* Shutter / Action Controls */}
            <div
              style={{
                padding: '1.25rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '1.5rem',
                background: '#0f172a',
              }}
            >
              {capturedDataUrl ? (
                <>
                  <button
                    type="button"
                    onClick={() => setCapturedDataUrl(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      background: 'rgba(255, 255, 255, 0.12)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.7rem 1.4rem',
                      borderRadius: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    <RotateCcw size={16} />
                    <span>Retake</span>
                  </button>

                  <button
                    type="button"
                    onClick={confirmCapturedPhoto}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      background: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.7rem 1.6rem',
                      borderRadius: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)',
                    }}
                  >
                    <Check size={18} />
                    <span>Use Photo</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={captureSnapshot}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: '4px solid #22c55e',
                    boxShadow: '0 0 20px rgba(34, 197, 94, 0.6)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.1s ease',
                  }}
                  onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
                  onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  title="Capture Photo"
                >
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: '#22c55e',
                    }}
                  />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
