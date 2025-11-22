
import { createClient } from '@supabase/supabase-js';

// ==========================================================================
// 🟢 KONFIGURASI SUPABASE (CONFIGURATION)
// ==========================================================================
// Silakan ganti nilai di bawah ini dengan URL dan Anon Key dari project Supabase Anda.
// Anda bisa mendapatkannya di Dashboard Supabase > Settings > API.

const SUPABASE_URL = 'https://rvtdvnegxljrgejzthtq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2dGR2bmVneGxqcmdlanp0aHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MDI0NTQsImV4cCI6MjA3OTM3ODQ1NH0.KlQYqkkJfHBhDKJpqfrKZt18HGdLR9QJNXvUq6oTMTs';

// ==========================================================================

export const isSupabaseConfigured = 
    SUPABASE_URL !== 'https://rvtdvnegxljrgejzthtq.supabase.co' && 
    SUPABASE_ANON_KEY !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2dGR2bmVneGxqcmdlanp0aHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MDI0NTQsImV4cCI6MjA3OTM3ODQ1NH0.KlQYqkkJfHBhDKJpqfrKZt18HGdLR9QJNXvUq6oTMTs';

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper functions (no longer needed for manual UI setup, but kept empty to prevent import errors)
export const setupSupabaseManual = (url: string, key: string) => {};
export const clearSupabaseConfig = () => {};
