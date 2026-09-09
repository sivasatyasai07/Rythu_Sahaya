import { supabase } from '../lib/supabase';
import type { PredictionResponse } from '../api';

export interface PredictionHistoryRecord {
  id: string;
  user_id: string;
  crop: string;
  state?: string;
  district?: string;
  market: string;
  current_price: number;
  predicted_price: number;
  min_price?: number;
  max_price?: number;
  trend: string;
  forecast_days: number;
  prediction_date: string;
  model_name: string;
  created_at: string;
}

export interface SavePredictionParams {
  crop: string;
  market: string;
  state?: string;
  district?: string;
  predictionDate: string;
  predictionResponse: PredictionResponse;
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

export const predictionHistoryService = {
  /**
   * Save a newly generated forecast for authenticated user
   */
  async savePrediction(params: SavePredictionParams): Promise<PredictionHistoryRecord | null> {
    const userId = await getAuthUserId();
    if (!userId) {
      // Anonymous / guest user — do not persist history
      return null;
    }

    const { crop, market, state, district, predictionDate, predictionResponse } = params;
    
    // Calculate stats
    const currentPrice = predictionResponse.latest_observed_price || 0;
    const predictions = predictionResponse.predictions || [];
    const predictedPrices = predictions.map((p) => p.predicted_modal_price).filter((p) => typeof p === 'number');

    const firstPredicted = predictedPrices[0] ?? currentPrice;
    const minPrice = predictedPrices.length > 0 ? Math.min(...predictedPrices) : currentPrice;
    const maxPrice = predictedPrices.length > 0 ? Math.max(...predictedPrices) : currentPrice;

    const record: PredictionHistoryRecord = {
      id: `pred_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      crop: crop,
      market: market,
      state: state || 'Andhra Pradesh',
      district: district || '',
      current_price: currentPrice,
      predicted_price: firstPredicted,
      min_price: minPrice,
      max_price: maxPrice,
      trend: predictionResponse.trend_direction || 'stable',
      forecast_days: predictions.length || 3,
      prediction_date: predictionDate || new Date().toISOString().split('T')[0],
      model_name: `${predictionResponse.model_name || 'CatBoost'} v${predictionResponse.model_version || '1.0'}`,
      created_at: new Date().toISOString(),
    };

    // 1. Persist to user-scoped LocalStorage
    try {
      const storageKey = `cropmandi_prediction_history_${userId}`;
      const existingRaw = localStorage.getItem(storageKey);
      const existing: PredictionHistoryRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
      const updated = [record, ...existing.filter((item) => item.id !== record.id)].slice(0, 100);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (lsErr) {
      console.warn('LocalStorage save failed:', lsErr);
    }

    // 2. Persist to Supabase if available
    try {
      const { data, error } = await supabase
        .from('prediction_history')
        .insert({
          user_id: userId,
          crop: record.crop,
          market: record.market,
          state: record.state,
          district: record.district,
          current_price: record.current_price,
          predicted_price: record.predicted_price,
          min_price: record.min_price,
          max_price: record.max_price,
          trend: record.trend,
          forecast_days: record.forecast_days,
          prediction_date: record.prediction_date,
          model_name: record.model_name,
        })
        .select()
        .single();

      if (!error && data) {
        return data as PredictionHistoryRecord;
      }
    } catch (e) {
      console.warn('Supabase insertion skipped or failed:', e);
    }

    return record;
  },

  /**
   * Fetch all price predictions for the authenticated user
   */
  async fetchHistory(limit: number = 50): Promise<PredictionHistoryRecord[]> {
    const userId = await getAuthUserId();
    if (!userId) return [];

    let localRecords: PredictionHistoryRecord[] = [];
    try {
      const storageKey = `cropmandi_prediction_history_${userId}`;
      const existingRaw = localStorage.getItem(storageKey);
      if (existingRaw) {
        localRecords = JSON.parse(existingRaw);
      }
    } catch (err) {
      console.warn('Error reading local prediction history:', err);
    }

    let supabaseRecords: PredictionHistoryRecord[] = [];
    try {
      const { data, error } = await supabase
        .from('prediction_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!error && data) {
        supabaseRecords = data as PredictionHistoryRecord[];
      }
    } catch {
      // ignore
    }

    // Merge and deduplicate
    const combinedMap = new Map<string, PredictionHistoryRecord>();
    for (const r of [...localRecords, ...supabaseRecords]) {
      const key = `${r.crop}_${r.market}_${r.prediction_date}_${r.predicted_price}`;
      if (!combinedMap.has(key)) {
        combinedMap.set(key, r);
      }
    }

    const merged = Array.from(combinedMap.values()).sort(
      (a, b) => new Date(b.created_at || b.prediction_date).getTime() - new Date(a.created_at || a.prediction_date).getTime()
    );

    return merged.slice(0, limit);
  },

  /**
   * Delete a prediction record
   */
  async deleteRecord(id: string): Promise<boolean> {
    const userId = await getAuthUserId();
    if (userId) {
      try {
        const storageKey = `cropmandi_prediction_history_${userId}`;
        const existingRaw = localStorage.getItem(storageKey);
        if (existingRaw) {
          const existing: PredictionHistoryRecord[] = JSON.parse(existingRaw);
          const updated = existing.filter((item) => item.id !== id);
          localStorage.setItem(storageKey, JSON.stringify(updated));
        }
      } catch {
        // ignore
      }

      try {
        await supabase
          .from('prediction_history')
          .delete()
          .eq('id', id);
      } catch {
        // ignore
      }
    }
    return true;
  },
};
