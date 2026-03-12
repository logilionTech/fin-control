document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("recordForm");

    if (form) {
        // Seleccionar automáticamente salario en categoría si eligen Ingreso
        const rTipo = document.getElementById("rTipo");
        const rCat = document.getElementById("rCategoria");

        rTipo.addEventListener("change", () => {
            if (rTipo.value === 'ingreso') {
                rCat.value = 'salario';
            } else {
                rCat.value = 'comida';
            }
        });

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const session = await getCurrentUser();
            if (!session) return;

            const tipo = document.getElementById("rTipo").value;
            const valor = parseFloat(document.getElementById("rValor").value);
            const categoria = document.getElementById("rCategoria").value;
            const fecha = document.getElementById("rFecha").value;
            const descripcion = document.getElementById("rDesc").value;

            // Bloquear botón
            const btn = e.target.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Guardando...';
            btn.disabled = true;

            try {
                // Verificar límites de plan gratuito (Simulado / Frontend check)
                if (session.profile.plan === 'gratuito') {
                    const { count, error: countErr } = await supabase
                        .from('expenses')
                        .select('id', { count: 'exact', head: true })
                        .eq('user_id', session.auth.id);

                    if (count >= 50) {
                        throw new Error("Límite de 50 registros alcanzado para el Plan Gratuito. Por favor, actualiza tu suscripción.");
                    }
                }

                // Guardar en DB
                const { error } = await supabase.from('expenses').insert({
                    user_id: session.auth.id,
                    tipo,
                    valor,
                    categoria,
                    fecha,
                    descripcion
                });

                if (error) throw error;

                // Cerrar modal y limpiar
                document.getElementById("recordModal").classList.remove("active");
                form.reset();

                // Recargar dashboard
                await loadDashboardData(session.auth.id);

            } catch (e) {
                alert("Error al guardar registro: " + e.message);
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }
});
