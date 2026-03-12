document.addEventListener('DOMContentLoaded', async () => {
    // Ver si viene de un recovery link (reseteo de contraseña)
    if (window.location.hash.includes('type=recovery')) {
        document.getElementById('resetPasswordSection').classList.remove('hidden');
    } else {
        // Solo redirigir si no estamos en modo recovery y comprobamos la sesión
        const user = await getCurrentUser();
        if (user) {
            window.location.href = "dashboard.html";
        }
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideError('generalError');

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            // Recordar sesión usualmente lo maneja Supabase por defecto

            if (!supabase) {
                showError('generalError', 'Falta configuración de Supabase.');
                return;
            }

            const btn = document.getElementById('loginBtn');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Ingresando...';
            btn.disabled = true;

            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) {
                    if (error.message.includes('Email not confirmed')) {
                        throw new Error("Por favor confirma tu correo electrónico antes de iniciar sesión.");
                    }
                    throw new Error("Credenciales inválidas.");
                }

                // Esperar un poco a que el trigger DB se sincronice si es primer inicio
                setTimeout(() => window.location.href = "dashboard.html", 500);
            } catch (err) {
                showError('generalError', err.message);
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }

    // Modal Recuperar Contraseña
    const forgotLnk = document.getElementById('forgotPasswordLink');
    if (forgotLnk) {
        forgotLnk.addEventListener("click", (e) => {
            e.preventDefault();
            document.getElementById('forgotPasswordSection').classList.remove('hidden');
        });
    }

    const forgotForm = document.getElementById('forgotForm');
    if (forgotForm) {
        forgotForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            // Ocultar mensajes previos
            hideError('forgotError');
            document.getElementById('forgotMsg').style.display = 'none';

            const emailToReset = document.getElementById("forgotEmail").value;

            try {
                const { error } = await supabase.auth.resetPasswordForEmail(emailToReset);
                if (error) throw error;
                showSuccess('forgotMsg', 'Si el correo existe, enviaremos un enlace de recuperación pronto.');
                setTimeout(() => {
                    document.getElementById('forgotPasswordSection').classList.add('hidden');
                }, 3000);
            } catch (e) {
                showError('forgotError', 'Hubo un error al enviar el correo. ' + e.message);
            }
        });
    }

    const resetForm = document.getElementById('resetForm');
    if (resetForm) {
        resetForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const errorDiv = document.getElementById('resetError');
            if (errorDiv) errorDiv.style.display = 'none';
            
            const newPassword = document.getElementById("newPassword").value;
            if (newPassword.length < 6) {
                if (errorDiv) {
                    errorDiv.textContent = 'La contraseña debe tener al menos 6 caracteres.';
                    errorDiv.style.display = 'block';
                }
                return;
            }

            const btn = document.getElementById('resetBtn');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Guardando...';
            btn.disabled = true;

            try {
                const { error } = await supabase.auth.updateUser({
                    password: newPassword
                });
                
                if (error) throw error;
                
                showSuccess('resetMsg', 'Contraseña actualizada exitosamente. Redirigiendo al dashboard...');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
            } catch (err) {
                if (errorDiv) {
                    errorDiv.textContent = 'Error actualizando contraseña: ' + err.message;
                    errorDiv.style.display = 'block';
                }
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }
});
