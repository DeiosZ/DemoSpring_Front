const API = "https://demospring-tibp.onrender.com";

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
    cargarPrioridades();
    cargarTags();
});

/* =========================
   MENSAJES
========================= */
function mostrarMensaje(msg, color = "green") {
    const el = document.getElementById("mensaje");
    el.textContent = msg;
    el.style.color = color;
}

/* =========================
   CARGAR PRIORIDADES
========================= */
async function cargarPrioridades() {
    try {
        const res = await fetch(`${API}/prioridades`);
        if (!res.ok) throw new Error();

        const data = await res.json();

        const select = document.getElementById("prioridad");
        select.innerHTML = "";

        data.forEach(p => {
            const option = document.createElement("option");
            option.value = p.id;
            option.text = p.name;
            option.style.color = p.color;
            select.appendChild(option);
        });

    } catch {
        mostrarMensaje("Error cargando prioridades", "red");
    }
}

/* =========================
   CARGAR TAGS
========================= */
async function cargarTags() {
    try {
        const res = await fetch(`${API}/tags`);
        if (!res.ok) throw new Error();

        const data = await res.json();

        const select = document.getElementById("tags");
        select.innerHTML = "";

        data.forEach(t => {
            const option = document.createElement("option");
            option.value = t.id;
            option.text = t.name;
            select.appendChild(option);
        });

    } catch {
        mostrarMensaje("Error cargando tags", "red");
    }
}

/* =========================
   CREAR TAREA
========================= */
async function crearTarea() {

    const btn = document.getElementById("btnGuardar");

    const proyectoId = localStorage.getItem("proyectoId");

    if (!proyectoId) {
        mostrarMensaje("No hay proyecto seleccionado", "red");
        window.location.href = "proyectos.html";
        return;
    }

    const name = document.getElementById("name").value.trim();
    const description = document.getElementById("description").value.trim();
    const startAt = document.getElementById("startAt").value;
    const prioridadId = document.getElementById("prioridad").value;

    const tagIds = Array.from(
        document.getElementById("tags").selectedOptions
    ).map(o => parseInt(o.value));

    // VALIDACIÓN
    if (!name) {
        mostrarMensaje("El nombre es obligatorio", "red");
        return;
    }

    if (!prioridadId) {
        mostrarMensaje("Selecciona una prioridad", "red");
        return;
    }

    btn.disabled = true;
    btn.textContent = "Guardando...";

    try {

        const res = await fetch(`${API}/tareas/proyecto/${proyectoId}/crear`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                description,
                startAt,
                prioridadId: parseInt(prioridadId),
                tagIds
            })
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(err);
        }

        mostrarMensaje("Tarea creada correctamente ");

        limpiarFormulario();

    } catch (error) {
        mostrarMensaje("Error al crear tarea", "red");
        console.error(error);
    } finally {
        btn.disabled = false;
        btn.textContent = "Guardar tarea";
    }
}

/* =========================
   LIMPIAR FORM
========================= */
function limpiarFormulario() {
    document.getElementById("name").value = "";
    document.getElementById("description").value = "";
    document.getElementById("startAt").value = "";
    document.getElementById("tags").selectedIndex = -1;
}

/* =========================
   VOLVER
========================= */
function volver() {
    window.location.href = "tareas.html";
}