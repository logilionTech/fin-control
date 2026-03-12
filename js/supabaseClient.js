// Configuración de Supabase
// Aquí debes colocar los valores de tu proyecto Supabase (Project URL y Anon Key)
const SUPABASE_URL = 'https://nzekxhgztavdfbbpuynb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56ZWt4aGd6dGF2ZGZiYnB1eW5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNzk5ODMsImV4cCI6MjA4ODg1NTk4M30.d3sKEnPr5pMWCtQ2qfDgsVw0WKiy-VQM0qeCS9z3Zq4';

// Inicializar Supabase sólo si existe el objeto en window
if (window.supabase) {
    try {
        window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch(e) {
         console.warn("Por favor configura TU_SUPABASE_URL y TU_SUPABASE_ANON_KEY para conectar tu base de datos.", e);
    }
} else {
    console.error("Supabase script no encontrado en el documento.");
}
