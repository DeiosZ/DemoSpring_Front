const API = "https://demospring-tibp.onrender.com";

document.getElementById("formRegistro").addEventListener("submit", registrar);

async function registrar(e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const mensaje = document.getElementById("mensaje");
    const btn = document.getElementById("btnRegistrar");

    mensaje.textContent = "";

    // VALIDACIONES
    if (!nombre || !apellido || !email || !password) {
        mostrarMensaje("Completa todos los campos", "red");
        return;
    }

    if (!validarEmail(email)) {
        mostrarMensaje("Email inválido", "red");
        return;
    }

    if (password.length < 6) {
        mostrarMensaje("La contraseña debe tener al menos 6 caracteres", "red");
        return;
    }

    // LOADING
    btn.disabled = true;
    btn.textContent = "Registrando...";

    try {
        const response = await fetch(`${API}/Inicio/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: nombre,
                lastname: apellido,
                email,
                password
            })
        });

        if (response.ok) {
            mostrarMensaje("Usuario registrado correctamente ", "green");

            // limpiar campos
            document.getElementById("formRegistro").reset();

        } else {
            const error = await response.text();

            // 🔹 personaliza si backend responde algo específico
            if (error.includes("email")) {
                mostrarMensaje("El email ya está registrado", "red");
            } else {
                mostrarMensaje("Error: " + error, "red");
            }
        }

    } catch (err) {
        mostrarMensaje("No se pudo conectar con el servidor", "red");
    } finally {
        btn.disabled = false;
        btn.textContent = "Registrarse";
    }
}

// Helpers
function mostrarMensaje(msg, color) {
    const mensaje = document.getElementById("mensaje");
    mensaje.textContent = msg;
    mensaje.style.color = color;
}

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function volverLogin() {
    window.location.href = "index.html";
}