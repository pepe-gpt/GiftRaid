import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mecjaydtuxkvwrvnsqqj.supabase.co'; // твой Supabase URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lY2pheWR0dXhrdndydm5zcXFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMzUyOTUsImV4cCI6MjA2NDcxMTI5NX0.h95WbmbWgExW_E_FUiK8S0tHTBOOBarDQdEDOfmDLJU'; // сюда вставь свой анонимный ключ

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
