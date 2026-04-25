const API = "https://demospring-tibp.onrender.com";

async function login() {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const error = document.getElementById("error");

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    error.textContent = "";

    // Validación básica
    if (!email || !password) {
        mostrarError("Completa todos los campos");
        return;
    }

    // Deshabilitar botón para evitar múltiples clicks
    const btn = document.querySelector("button");
    btn.disabled = true;
    btn.textContent = "Ingresando...";

    try {
        const res = await fetch(`${API}/Inicio/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        //  Manejo de errores HTTP
        if (res.status === 401) {
            mostrarError("Credenciales incorrectas");
            return;
        }

        if (res.status === 404) {
            mostrarError("Usuario no encontrado");
            return;
        }

        if (res.status >= 500) {
            mostrarError("Error en el servidor");
            return;
        }

        const data = await res.json();

        // 🔹 Validación de respuesta
        if (!data || !data.id) {
            mostrarError("Email o contraseña incorrectos");
            return;
        }

        // 🔹 Guardar sesión
        localStorage.setItem("userId", data.id);

        // (opcional) guardar más info
        if (data.email) {
            localStorage.setItem("userEmail", data.email);
        }

        // 🔹 Redirección
        window.location.href = "proyectos.html";

    } catch (err) {
        mostrarError("No se pudo conectar con el servidor");
    } finally {
        // 🔹 Rehabilitar botón
        btn.disabled = false;
        btn.textContent = "Ingresar";
    }
}

// Mostrar error
function mostrarError(msg) {
    const error = document.getElementById("error");
    error.innerText = msg;
}

//Redirección a registro
function register() {
    window.location.href = "register.html";
}

// Enter para login
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("password").addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            login();
        }
    });
});