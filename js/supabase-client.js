import SUPABASE_CONFIG from './config.js';

// Initialize the Supabase client
// Note: We are using the CDN version in the HTML files, but this helper
// ensures we have a consistent way to access the client across the app.
const supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

export { supabase };
