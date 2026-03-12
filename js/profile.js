document.addEventListener("DOMContentLoaded", async () => {
    const session = await requireAuth();
    if (!session) return;

    const emailInput = document.getElementById("profEmail");
    const nameInput = document.getElementById("profName");
    const dpName = document.getElementById("profileNameDisplay");
    const dpEmail = document.getElementById("profileEmailDisplay");
    const dpAvatar = document.getElementById("profileAvatar");

    if (emailInput && nameInput) {
        emailInput.value = session.auth.email;
        nameInput.value = session.profile.nombre;

        dpName.textContent = session.profile.nombre;
        dpEmail.textContent = session.auth.email;
        dpAvatar.textContent = session.profile.nombre.charAt(0).toUpperCase();

        const pForm = document.getElementById("profileForm");
        pForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Guardando...';
            btn.disabled = true;

            const newName = nameInput.value;

            try {
                // Actualizar en auth_users 
                await supabase.auth.updateUser({
                    data: { nombre: newName }
                });

                // Actualizar tabla unificada
                const { error } = await supabase
                    .from('users')
                    .update({ nombre: newName })
                    .eq('id', session.auth.id);

                if (error) throw error;

                showSuccess("profileMsg", "Perfil actualizado correctamente.");

                dpName.textContent = newName;
                dpAvatar.textContent = newName.charAt(0).toUpperCase();

                setTimeout(() => {
                    document.getElementById("profileMsg").style.display = 'none';
                }, 3000);

            } catch (error) {
                alert("Error: " + error.message);
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });

        // Evento Reiniciar Clave
        const resetBtn = document.getElementById("resetPasswordBtn");
        resetBtn.addEventListener("click", async () => {
            try {
                const { error } = await supabase.auth.resetPasswordForEmail(session.auth.email);
                if (error) throw error;
                alert("¡Enlace enviado a tu correo!");
            } catch (e) {
                alert("Error: " + e.message);
            }
        });
    }
});
