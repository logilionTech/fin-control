/** Funciones core de Autenticación con Supabase */

async function getCurrentUser() {
    if (!supabase) return null;
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) return null;

    // Obtener detalles adicionales del perfil de la tabla users
    const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (profileError) {
        console.error("Error obteniendo perfil: ", profileError);
        return { auth: session.user };
    }

    return { auth: session.user, profile: userProfile };
}

async function logout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.href = "login.html";
}

// Proteger rutas si no estás autenticado
async function requireAuth() {
    const user = await getCurrentUser();
    if (!user) {
        window.location.href = "login.html";
    }
    return user;
}

// Inicialización global para botones de logout (si detecta alguno)
document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            logout();
        });
    }
});
