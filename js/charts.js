// Variables globales de gráficos
let gMainChart, gCategoryChart;

window.addEventListener('DOMContentLoaded', async () => {
    // Estas funciones serán llamadas desde dashboard.js una vez que se cargan los datos
});

function initCharts(expenses, incomes) {
    const ctxMain = document.getElementById('mainChart');
    const ctxCat = document.getElementById('categoryChart');

    if (!ctxMain || !ctxCat) return;

    // Procesar datos para gráfico de líneas
    // Agrupar por meses (simplificado para demostración)
    const labels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const currentMonth = new Date().getMonth();

    // Data mocks basados en los registros reales
    const dGastos = Array(12).fill(0);
    const dIngresos = Array(12).fill(0);

    expenses.forEach(x => {
        const m = new Date(x.fecha).getMonth();
        if (x.tipo === 'gasto') dGastos[m] += x.valor;
        if (x.tipo === 'ingreso') dIngresos[m] += x.valor;
    });

    if (gMainChart) gMainChart.destroy();
    gMainChart = new Chart(ctxMain, {
        type: 'line',
        data: {
            labels: labels.slice(0, currentMonth + 1),
            datasets: [
                {
                    label: 'Ingresos',
                    data: dIngresos.slice(0, currentMonth + 1),
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Gastos',
                    data: dGastos.slice(0, currentMonth + 1),
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } }
        }
    });

    // Procesar datos para gráfico circular (sólo gastos por categoría)
    const catMap = {};
    expenses.filter(x => x.tipo === 'gasto').forEach(x => {
        catMap[x.categoria] = (catMap[x.categoria] || 0) + x.valor;
    });

    const catLabels = Object.keys(catMap);
    const catData = Object.values(catMap);

    if (gCategoryChart) gCategoryChart.destroy();
    gCategoryChart = new Chart(ctxCat, {
        type: 'doughnut',
        data: {
            labels: catLabels.length ? catLabels : ['Sin registros'],
            datasets: [{
                data: catData.length ? catData : [1],
                backgroundColor: [
                    '#3498db', '#9b59b6', '#f1c40f', '#e67e22', '#e74c3c', '#2ecc71', '#95a5a6'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { position: 'right' }
            }
        }
    });
}
