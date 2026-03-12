document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideError('generalError');
            hideError('pwdError');
            document.getElementById('successMsg').style.display = 'none';

            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirm = document.getElementById('confirmPassword').value;

            if (password !== confirm) {
                showError('pwdError', 'Las contraseñas no coinciden');
                return;
            }

            if (!supabase) {
                showError('generalError', 'Falta configuración de Supabase.');
                return;
            }

            const btn = document.getElementById('registerBtn');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Cargando...';
            btn.disabled = true;

            try {
                // Registrar usuario con Supabase Auth
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            nombre: fullname
                        }
                    }
                });

                if (error) {
                    throw error;
                }

                showSuccess('successMsg', '¡Registro exitoso! Redirigiendo al inicio de sesión...');
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1500);
            } catch (err) {
                showError('generalError', err.message || 'Error al registrar.');
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }
});
