/** Utilidades de la Interfaz de Usuario */

function showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
        el.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        el.style.display = 'flex';
    }
}

function hideError(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.style.display = 'none';
}

function showSuccess(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
        el.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        el.style.display = 'block';
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(amount);
}

// Toggle contraseñas general
document.addEventListener("DOMContentLoaded", () => {
    const toggleIcon = document.getElementById("togglePassword");
    const pwdInput = document.getElementById("password");
    if (toggleIcon && pwdInput) {
        toggleIcon.addEventListener("click", () => {
            const type = pwdInput.getAttribute("type") === "password" ? "text" : "password";
            pwdInput.setAttribute("type", type);
            toggleIcon.className = type === "password" ? "fas fa-eye password-toggle" : "fas fa-eye-slash password-toggle";
        });
    }

    // Toggle menu móvil
    const mobileBtn = document.getElementById("mobileMenuBtn");
    const sidebar = document.getElementById("sidebar");
    if (mobileBtn && sidebar) {
        mobileBtn.addEventListener("click", () => {
            sidebar.classList.toggle("active");
        });
    }

    // Cierre click fuera del modal
    const modals = document.querySelectorAll(".modal-overlay");
    modals.forEach(m => {
        m.addEventListener("click", (e) => {
            if (e.target === m) {
                m.classList.remove("active");
            }
        });
    });
});
