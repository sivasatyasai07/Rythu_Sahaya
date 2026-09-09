import { api } from '../api';
import { supabase } from '../lib/supabase';
import type {
  DiseaseAnalysisResponse,
  DiseaseHistoryListResponse,
  DiseaseHistoryItem,
} from '../types/disease';

export interface AnalyzeCropRequest {
  imageFile?: File;
  imageFiles?: File[];
  crop?: string;
  plantPart?: string;
  symptoms?: string;
  notes?: string;
  location?: string;
  growthStage?: string;
  language?: string;
}

export interface DiseaseHistoryFilter {
  crop?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

/**
 * Upload an image file to Supabase Storage bucket 'disease-images'
 */
export async function uploadDiseaseImageToSupabase(
  file: File,
  userId: string,
  analysisId: string
): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `${userId}/${analysisId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('disease-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.warn('Supabase image upload failed:', uploadError.message);
      return null;
    }

    const { data } = supabase.storage
      .from('disease-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    console.warn('Error uploading image to Supabase Storage:', err);
    return null;
  }
}

/**
 * Save disease analysis result to Supabase disease_history table
 */
export async function saveDiseaseHistoryToSupabase(
  userId: string,
  analysisId: string,
  imageUrl: string | null,
  response: DiseaseAnalysisResponse,
  req: AnalyzeCropRequest
): Promise<void> {
  try {
    const res = response.result;
    const detectedCrop =
      res.detected_crop ||
      (typeof res.crop === 'object' ? res.crop?.name : res.crop) ||
      req.crop ||
      'Plant Leaf';

    const plantPart =
      (typeof res.plant_part === 'object' ? res.plant_part?.name : res.plant_part) ||
      req.plantPart ||
      'Leaf';

    const healthStatus =
      (typeof res.health_status === 'object' ? (res.health_status as any)?.status : res.health_status) ||
      'healthy';

    const diseaseName =
      res.disease?.name ||
      res.primary_diagnosis?.name ||
      (healthStatus === 'healthy' ? 'Healthy Plant' : 'Crop Disease');

    const confidence =
      res.disease?.confidence ??
      res.primary_diagnosis?.confidence ??
      (typeof res.crop === 'object' ? res.crop?.confidence : null) ??
      0.92;

    const payload = {
      id: analysisId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? analysisId : undefined,
      user_id: userId,
      image_url: imageUrl,
      crop: detectedCrop,
      plant_part: plantPart,
      health_status: healthStatus,
      disease_name: diseaseName,
      confidence: confidence,
      symptoms: res.symptoms || [],
      possible_causes: res.possible_causes || [],
      management: res.management || res.immediate_actions || [],
      prevention: res.prevention || [],
      risk_level: res.risk_level || 'Moderate',
      analysis_status: res.analysis_status || 'completed',
      language: req.language || 'en',
      created_at: response.created_at || new Date().toISOString(),
    };

    const { error } = await supabase
      .from('disease_history')
      .insert(payload);

    if (error) {
      console.warn('Failed to insert into disease_history:', error.message);
    }
  } catch (err) {
    console.warn('Error saving to Supabase disease_history:', err);
  }
}

async function getAuthUserId(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) return user.id;
  } catch {
    // ignore
  }

  const token = localStorage.getItem('cropmandi_auth_token');
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const decoded = JSON.parse(atob(parts[1]));
        if (decoded.sub || decoded.id) return String(decoded.sub || decoded.id);
      }
    } catch {
      // ignore
    }
  }

  const storedUser = localStorage.getItem('cropmandi_user_cache');
  if (storedUser) {
    try {
      const u = JSON.parse(storedUser);
      if (u.id) return String(u.id);
    } catch {
      // ignore
    }
  }

  return null;
}

/**
 * Main disease analysis endpoint
 * 1. Executes Gemini Vision analysis via FastAPI backend
 * 2. If user is authenticated, saves diagnosis to history
 * 3. If guest / anonymous, returns result without saving to personal history
 */
export async function analyzeCrop(
  req: AnalyzeCropRequest,
  signal?: AbortSignal
): Promise<DiseaseAnalysisResponse> {
  const formData = new FormData();
  const primaryFile = req.imageFiles && req.imageFiles.length > 0 ? req.imageFiles[0] : req.imageFile;

  // Append images to multipart request
  if (req.imageFiles && req.imageFiles.length > 0) {
    req.imageFiles.slice(0, 3).forEach((f) => {
      formData.append('files', f);
    });
    formData.append('file', req.imageFiles[0]);
  } else if (req.imageFile) {
    formData.append('file', req.imageFile);
    formData.append('files', req.imageFile);
  }

  if (req.crop) formData.append('crop', req.crop);
  if (req.plantPart) formData.append('plant_part', req.plantPart);
  if (req.symptoms) formData.append('symptoms', req.symptoms);
  if (req.notes) formData.append('notes', req.notes);
  if (req.location) formData.append('location', req.location);
  if (req.growthStage) formData.append('growth_stage', req.growthStage);
  if (req.language) formData.append('language', req.language);

  // 1. Call FastAPI backend for Gemini Vision AI analysis
  const res = await api.post<DiseaseAnalysisResponse>('/disease/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 300000,
    signal,
  });

  const responseData = res.data;

  // 2. If user is logged in, persist to disease_history
  const userId = await getAuthUserId();
  if (userId && responseData) {
    const resPayload = responseData.result;
    const historyItem: DiseaseHistoryItem = {
      analysis_id: responseData.analysis_id,
      created_at: responseData.created_at || new Date().toISOString(),
      detected_crop: resPayload.detected_crop || (typeof resPayload.crop === 'object' ? resPayload.crop?.name : resPayload.crop) || req.crop || 'Plant Leaf',
      selected_crop: req.crop,
      plant_part: req.plantPart || 'Leaf',
      health_status: (typeof resPayload.health_status === 'object' ? (resPayload.health_status as any)?.status : resPayload.health_status) || 'healthy',
      disease_status: resPayload.health_status,
      language: req.language || 'en',
      original_confidence: {
        crop: resPayload.plantnet_score ?? 0.9,
        primary_diagnosis: resPayload.plantnet_score ?? 0.9,
      },
      primary_diagnosis: {
        name: (typeof resPayload.disease === 'object' ? resPayload.disease?.name : resPayload.disease) || resPayload.primary_diagnosis?.name || 'Healthy Plant',
        confidence: resPayload.plantnet_score ?? 0.9,
        evidence: resPayload.symptoms || [],
      },
      symptoms: resPayload.symptoms || [],
      possible_causes: resPayload.possible_causes || [],
      immediate_actions: resPayload.management || resPayload.immediate_actions || [],
      prevention: resPayload.prevention || [],
    };

    // Save to user-scoped LocalStorage
    try {
      const storageKey = `cropmandi_disease_history_${userId}`;
      const existingRaw = localStorage.getItem(storageKey);
      const existing: DiseaseHistoryItem[] = existingRaw ? JSON.parse(existingRaw) : [];
      const updated = [historyItem, ...existing.filter((item) => item.analysis_id !== historyItem.analysis_id)].slice(0, 100);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (lsErr) {
      console.warn('LocalStorage save failed:', lsErr);
    }

    // Save to Supabase Storage & Database
    try {
      let imageUrl: string | null = null;
      if (primaryFile) {
        imageUrl = await uploadDiseaseImageToSupabase(primaryFile, userId, responseData.analysis_id);
      }
      await saveDiseaseHistoryToSupabase(userId, responseData.analysis_id, imageUrl, responseData, req);
    } catch (saveErr) {
      console.warn('Background Supabase persistence skipped:', saveErr);
    }
  }

  return responseData;
}

/**
 * Fetch disease history from LocalStorage, Supabase, and FastAPI backend
 */
export async function fetchDiseaseHistory(
  filter?: DiseaseHistoryFilter,
  signal?: AbortSignal
): Promise<DiseaseHistoryListResponse> {
  const userId = await getAuthUserId();
  if (!userId) {
    return { analyses: [], total_count: 0, user_id: '' };
  }

  let localItems: DiseaseHistoryItem[] = [];
  try {
    const storageKey = `cropmandi_disease_history_${userId}`;
    const existingRaw = localStorage.getItem(storageKey);
    if (existingRaw) {
      localItems = JSON.parse(existingRaw);
    }
  } catch (err) {
    console.warn('Error reading local disease history:', err);
  }

  let supabaseItems: DiseaseHistoryItem[] = [];
  try {
    let query = supabase
      .from('disease_history')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (filter?.crop) {
      query = query.ilike('crop', `%${filter.crop}%`);
    }
    if (filter?.status) {
      query = query.eq('health_status', filter.status);
    }
    if (filter?.limit) {
      query = query.limit(filter.limit);
    }

    const { data, error } = await query;

    if (!error && data) {
      supabaseItems = data.map((row: any) => ({
        analysis_id: row.id,
        created_at: row.created_at,
        detected_crop: row.crop || 'Plant Leaf',
        selected_crop: row.crop,
        plant_part: row.plant_part || 'Leaf',
        health_status: row.health_status || 'disease',
        disease_status: row.health_status,
        image_url: row.image_url,
        has_image: !!row.image_url,
        language: row.language || 'en',
        original_confidence: {
          crop: row.confidence,
          primary_diagnosis: row.confidence,
        },
        primary_diagnosis: {
          name: row.disease_name || 'Crop Diagnosis',
          confidence: row.confidence,
          evidence: Array.isArray(row.symptoms) ? row.symptoms : [],
        },
        symptoms: Array.isArray(row.symptoms) ? row.symptoms : [],
        possible_causes: Array.isArray(row.possible_causes) ? row.possible_causes : [],
        immediate_actions: Array.isArray(row.management) ? row.management : [],
        prevention: Array.isArray(row.prevention) ? row.prevention : [],
      }));
    }
  } catch (supabaseErr) {
    console.warn('Supabase disease_history query failed:', supabaseErr);
  }

  let backendItems: DiseaseHistoryItem[] = [];
  try {
    const res = await api.get<DiseaseHistoryListResponse>('/disease/history', {
      params: filter,
      signal,
    });
    if (res.data?.analyses) {
      backendItems = res.data.analyses;
    }
  } catch {
    // ignore
  }

  // Merge and deduplicate all records
  const itemMap = new Map<string, DiseaseHistoryItem>();
  for (const item of [...localItems, ...supabaseItems, ...backendItems]) {
    if (item.analysis_id && !itemMap.has(item.analysis_id)) {
      itemMap.set(item.analysis_id, item);
    }
  }

  const merged = Array.from(itemMap.values()).sort(
    (a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
  );

  return {
    analyses: filter?.limit ? merged.slice(0, filter.limit) : merged,
    total_count: merged.length,
    user_id: userId,
  };
}

/**
 * Fetch detail of a single disease history record
 */
export async function fetchDiseaseHistoryDetail(
  analysisId: string,
  signal?: AbortSignal
): Promise<DiseaseHistoryItem> {
  const { data: row, error } = await supabase
    .from('disease_history')
    .select('*')
    .eq('id', analysisId)
    .single();

  if (!error && row) {
    return {
      analysis_id: row.id,
      created_at: row.created_at,
      detected_crop: row.crop || 'Plant Leaf',
      selected_crop: row.crop,
      plant_part: row.plant_part || 'Leaf',
      health_status: row.health_status || 'disease',
      image_url: row.image_url,
      has_image: !!row.image_url,
      language: row.language || 'en',
      original_confidence: {
        crop: row.confidence,
        primary_diagnosis: row.confidence,
      },
      primary_diagnosis: {
        name: row.disease_name || 'Crop Diagnosis',
        confidence: row.confidence,
        evidence: Array.isArray(row.symptoms) ? row.symptoms : [],
      },
      symptoms: Array.isArray(row.symptoms) ? row.symptoms : [],
      possible_causes: Array.isArray(row.possible_causes) ? row.possible_causes : [],
      immediate_actions: Array.isArray(row.management) ? row.management : [],
      prevention: Array.isArray(row.prevention) ? row.prevention : [],
    };
  }

  const res = await api.get<DiseaseHistoryItem>(`/disease/history/${analysisId}`, { signal });
  return res.data;
}

/**
 * Delete a disease history record from Supabase disease_history and Storage
 */
export async function deleteDiseaseHistory(
  analysisId: string
): Promise<{ success: boolean; message: string }> {
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    try {
      // 1. Delete from Supabase database
      const { error: dbError } = await supabase
        .from('disease_history')
        .delete()
        .eq('id', analysisId);

      if (dbError) {
        console.warn('Supabase DB delete error:', dbError.message);
      }

      // 2. Delete from Supabase storage if file exists
      try {
        const filePath = `${user.id}/${analysisId}.jpg`;
        await supabase.storage.from('disease-images').remove([filePath]);
      } catch (stErr) {
        console.warn('Storage delete skipped:', stErr);
      }

      return { success: true, message: 'Record deleted successfully.' };
    } catch (e: any) {
      console.warn('Supabase delete failed, falling back to backend:', e);
    }
  }

  const res = await api.delete<{ success: boolean; message: string }>(
    `/disease/history/${analysisId}`
  );
  return res.data;
}

/**
 * Get Image URL for disease thumbnail/preview
 */
export function getDiseaseImageUrl(analysisId: string, directUrl?: string): string {
  if (directUrl) return directUrl;

  const token = localStorage.getItem('cropmandi_auth_token');
  const rawBase = (import.meta as any).env?.VITE_API_BASE_URL;
  const baseUrl = rawBase
    ? `${rawBase.replace(/\/+$/, '')}/api/v1`
    : 'http://127.0.0.1:8000/api/v1';

  return token
    ? `${baseUrl}/disease/image/${analysisId}?token=${encodeURIComponent(token)}`
    : `${baseUrl}/disease/image/${analysisId}`;
}
