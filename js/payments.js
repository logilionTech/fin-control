document.addEventListener("DOMContentLoaded", async () => {
    const session = await requireAuth();
    if (!session) return;

    // Actualizar UI del plan actual
    const planDisplay = document.getElementById("currentPlanStatus");
    if (planDisplay) {
        planDisplay.textContent = capitalize(session.profile.plan);
    }
});

let currentSelectedPlan = '';
let currentPrice = 0;

function openPaymentModal(planType, price) {
    currentSelectedPlan = planType;
    currentPrice = price;

    document.getElementById("selectedPlan").textContent = planType;
    document.getElementById("selectedPrice").textContent = "$" + price;

    document.getElementById("paymentModal").classList.add("active");
}

document.addEventListener("DOMContentLoaded", () => {
    const pModal = document.getElementById("paymentModal");
    const pForm = document.getElementById("paymentForm");
    const closeBtn = document.getElementById("closePaymentBtn");

    if (closeBtn && pModal) {
        closeBtn.addEventListener("click", () => {
            pModal.classList.remove("active");
        });
    }

    if (pForm) {
        pForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const btn = e.target.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
            btn.disabled = true;

            try {
                // Simulación de Integration Stripe / MercadoPago 
                // En un entorno real se crearía un Checkout Session
                await new Promise(r => setTimeout(r, 2000));

                // Actualizar DB en Supabase
                const session = await getCurrentUser();
                const { error: err1 } = await supabase
                    .from('users')
                    .update({ plan: currentSelectedPlan.toLowerCase() })
                    .eq('id', session.auth.id);

                if (err1) throw err1;

                // Registro de Suscripción
                const { error: err2 } = await supabase
                    .from('subscriptions')
                    .insert({
                        user_id: session.auth.id,
                        plan: currentSelectedPlan.toLowerCase()
                    });

                if (err2) console.error("Error historial de suscripción: ", err2);

                alert("¡Pago exitoso! Tu plan ha sido actualizado a " + currentSelectedPlan);
                window.location.reload();

            } catch (err) {
                alert("Error procesando el pago: " + err.message);
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }
});

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
