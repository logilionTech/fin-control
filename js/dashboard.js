document.addEventListener("DOMContentLoaded", async () => {
    // Si no estamos en el dashboard, no ejecutamos esto
    if (!document.getElementById("totalBalance")) return;

    const session = await requireAuth();
    if (!session) return;

    // UI Setup
    setupSidebarInfo(session);

    // Cargar datos
    await loadDashboardData(session.auth.id);

    // Botón agregar registro
    const addBtn = document.getElementById("addRecordBtn");
    const modal = document.getElementById("recordModal");
    const closeBtn = document.getElementById("closeModalBtn");

    if (addBtn && modal) {
        addBtn.addEventListener("click", () => {
            modal.classList.add("active");
        });
        closeBtn.addEventListener("click", () => {
            modal.classList.remove("active");
            document.getElementById("recordForm").reset();
        });
    }
});

function setupSidebarInfo(session) {
    const pName = document.getElementById("sidebarName");
    const pPlan = document.getElementById("sidebarPlan");
    const pAvatar = document.getElementById("sidebarAvatar");

    if (pName && session.profile) {
        pName.textContent = session.profile.nombre;
        pPlan.textContent = "Plan " + capitalize(session.profile.plan || 'gratuito');
        pAvatar.textContent = session.profile.nombre.charAt(0).toUpperCase();

        // Si es admin, mostrar link al panel
        if (session.profile.rol === 'admin') {
            const adminLnk = document.getElementById("navAdmin");
            if (adminLnk) adminLnk.style.display = 'flex';
        }
    }
}

async function loadDashboardData(userId) {
    try {
        const { data: expenses, error } = await supabase
            .from('expenses')
            .select('*')
            .eq('user_id', userId)
            .order('fecha', { ascending: false });

        if (error) throw error;

        processMetrics(expenses);
        renderRecentTransactions(expenses);

        // Llamar a charts.js pasándole los datos
        if (typeof initCharts === "function") {
            initCharts(expenses, null);
        }

    } catch (e) {
        console.error("Error cargando dashboard: ", e);
    }
}

function processMetrics(records) {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let totalIncome = 0;
    let totalExpense = 0;
    let monthIncome = 0;
    let monthExpense = 0;

    records.forEach(r => {
        const d = new Date(r.fecha);
        const isCurrentMonth = d.getMonth() === currentMonth && d.getFullYear() === currentYear;

        if (r.tipo === 'ingreso') {
            totalIncome += r.valor;
            if (isCurrentMonth) monthIncome += r.valor;
        } else {
            totalExpense += r.valor;
            if (isCurrentMonth) monthExpense += r.valor;
        }
    });

    const balance = totalIncome - totalExpense;

    document.getElementById("totalBalance").textContent = formatCurrency(balance);
    document.getElementById("monthlyIncome").textContent = formatCurrency(monthIncome);
    document.getElementById("monthlyExpense").textContent = formatCurrency(monthExpense);

    // Promedio Diario (mes actual)
    const today = new Date().getDate();
    const avgDaily = today > 0 ? (monthExpense / today) : 0;
    document.getElementById("avgDailyExpense").textContent = formatCurrency(avgDaily);
}

function renderRecentTransactions(records) {
    const list = document.getElementById("transactionList");
    list.innerHTML = "";

    if (!records || records.length === 0) {
        list.innerHTML = `<div class="text-center" style="color:var(--text-light); padding:20px;">No hay movimientos recientes</div>`;
        return;
    }

    const recent = records.slice(0, 5);

    recent.forEach(r => {
        const icon = getCategoryIcon(r.categoria);
        const amountClass = r.tipo === 'ingreso' ? 'income' : 'expense';
        const sign = r.tipo === 'ingreso' ? '+' : '-';

        const itemStr = `
            <div class="transaction-item">
                <div class="t-info">
                    <div class="t-icon ${r.tipo}">${icon}</div>
                    <div class="t-details">
                        <h4>${r.descripcion || capitalize(r.categoria)}</h4>
                        <span>${r.fecha}</span>
                    </div>
                </div>
                <div class="t-amount ${amountClass}">${sign} ${formatCurrency(r.valor)}</div>
            </div>
        `;
        list.innerHTML += itemStr;
    });
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getCategoryIcon(cat) {
    const icons = {
        'comida': '<i class="fas fa-utensils"></i>',
        'transporte': '<i class="fas fa-car"></i>',
        'vivienda': '<i class="fas fa-home"></i>',
        'entretenimiento': '<i class="fas fa-film"></i>',
        'salud': '<i class="fas fa-heartbeat"></i>',
        'salario': '<i class="fas fa-money-bill-wave"></i>',
        'otros': '<i class="fas fa-box"></i>'
    };
    return icons[cat.toLowerCase()] || '<i class="fas fa-tag"></i>';
}
