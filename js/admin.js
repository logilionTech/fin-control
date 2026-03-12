document.addEventListener("DOMContentLoaded", async () => {
    const tbody = document.getElementById("usersTableBody");
    if (!tbody) return;

    const session = await requireAuth();
    if (session.profile.rol !== 'admin') {
        alert("Acceso denegado. No eres administrador.");
        window.location.href = "dashboard.html";
        return;
    }

    await loadUsers();
});

async function loadUsers() {
    const tbody = document.getElementById("usersTableBody");

    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .order('fecha_registro', { ascending: false });

        if (error) throw error;

        tbody.innerHTML = "";

        users.forEach(u => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>
                    <div style="font-weight:600;">${u.nombre}</div>
                    <small style="color:var(--text-light);">${u.rol === 'admin' ? '🎖️ Superadmin' : 'Usuario'}</small>
                </td>
                <td>${u.email}</td>
                <td>${new Date(u.fecha_registro).toLocaleDateString()}</td>
                <td>
                    <select class="form-control" style="width:130px; padding:5px;" onchange="updatePlan('${u.id}', this.value)" ${u.rol === 'admin' ? 'disabled' : ''}>
                        <option value="gratuito" ${u.plan === 'gratuito' ? 'selected' : ''}>Gratuito</option>
                        <option value="profesional" ${u.plan === 'profesional' ? 'selected' : ''}>Pro</option>
                        <option value="empresarial" ${u.plan === 'empresarial' ? 'selected' : ''}>Empresarial</option>
                    </select>
                </td>
                <td>
                    <span class="status-badge ${u.estado}">${capitalize(u.estado)}</span>
                </td>
                <td>
                    ${u.rol !== 'admin' ? `
                    <div class="action-btns">
                        <button class="action-btn" title="${u.estado === 'activo' ? 'Bloquear' : 'Desbloquear'}" onclick="toggleStatus('${u.id}', '${u.estado}')">
                            <i class="fas ${u.estado === 'activo' ? 'fa-lock' : 'fa-unlock'}"></i>
                        </button>
                    </div>` : ''}
                </td>
            `;

            tbody.appendChild(row);
        });

    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="error-msg text-center">Error: ${e.message}</td></tr>`;
    }
}

async function updatePlan(userId, newPlan) {
    const { error } = await supabase
        .from('users')
        .update({ plan: newPlan })
        .eq('id', userId);

    if (error) alert("Error actualizando plan: " + error.message);
}

async function toggleStatus(userId, currentStatus) {
    const newStatus = currentStatus === 'activo' ? 'bloqueado' : 'activo';

    // Supabase Auth API admin es necesario para un disable real; 
    // a nivel frontend manejamos el 'estado' de la tabla users que luego se puede validar con RLS.
    const { error } = await supabase
        .from('users')
        .update({ estado: newStatus })
        .eq('id', userId);

    if (error) {
        alert("Error cambiando estado: " + error.message);
    } else {
        await loadUsers();
    }
}

function capitalize(str) {
    return str.replace(/\b\w/g, c => c.toUpperCase());
}

