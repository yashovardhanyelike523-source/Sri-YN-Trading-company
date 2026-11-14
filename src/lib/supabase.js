// ==============================================================================
// SRI YN TRADING COMPANY — SUPABASE CLIENT CONFIGURATION
// Supports runtime credentials and .env configuration
// ==============================================================================

import { createClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'sri_yn_supabase_url';
const STORAGE_KEY_ANON = 'sri_yn_supabase_anon';

export function getSupabaseCredentials() {
  const localUrl = localStorage.getItem(STORAGE_KEY_URL);
  const localKey = localStorage.getItem(STORAGE_KEY_ANON);

  return {
    url: localUrl || import.meta.env.VITE_SUPABASE_URL || 'https://wjhokworfozzjnbmlfng.supabase.co',
    key: localKey || import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqaG9rd29yZm96empuYm1sZm5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxOTc5NTcsImV4cCI6MjEwODc3Mzk1N30.7PR4HGlahLU1mBtK1KYTDX5WKh1aHl885p41lqPX0bk',
  };
}

export function saveRuntimeCredentials(url, key) {
  if (url && key) {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_ANON, key.trim());
    window.location.reload();
  }
}

export function isSupabaseConfigured() {
  const { url, key } = getSupabaseCredentials();
  return Boolean(url && key && url.includes('supabase.co'));
}

const { url, key } = getSupabaseCredentials();
export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export async function testSupabaseConnection() {
  try {
    const { error } = await supabase.from('cold_storages').select('id', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Connected to Supabase PostgreSQL database successfully!' };
  } catch (err) {
    return { success: false, message: err.message || 'Connection test failed.' };
  }
}
