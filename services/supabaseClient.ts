
import { createClient } from '@supabase/supabase-js';

// Helper to safely access process.env without crashing in browser environments
const getEnv = (key: string): string | undefined => {
    try {
        // @ts-ignore
        if (typeof process !== 'undefined' && process.env) {
            // @ts-ignore
            return process.env[key];
        }
        // Check for Vite-style env vars if process is missing but import.meta.env exists
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            // @ts-ignore
            return import.meta.env[`VITE_${key}`] || import.meta.env[key];
        }
    } catch (e) {
        // Ignore errors
    }
    return undefined;
};

// Try to get config from Environment Variables first, then LocalStorage
const envUrl = getEnv('SUPABASE_URL');
const envKey = getEnv('SUPABASE_ANON_KEY');

const storedUrl = typeof localStorage !== 'undefined' ? localStorage.getItem('sb_url') : null;
const storedKey = typeof localStorage !== 'undefined' ? localStorage.getItem('sb_key') : null;

const supabaseUrl = envUrl || storedUrl;
const supabaseKey = envKey || storedKey;

// Check if configuration exists
export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

// Initialize Supabase client
// We provide fallback placeholders to prevent initialization crash, 
// but the app will redirect to the setup screen via 'isSupabaseConfigured' check in App.tsx
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co', 
    supabaseKey || 'placeholder-key'
);

// Helper to save config manually from the UI
export const setupSupabaseManual = (url: string, key: string) => {
    localStorage.setItem('sb_url', url);
    localStorage.setItem('sb_key', key);
    window.location.reload();
};

// Helper to clear config
export const clearSupabaseConfig = () => {
    localStorage.removeItem('sb_url');
    localStorage.removeItem('sb_key');
    window.location.reload();
};
