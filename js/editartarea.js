const API = "https://demospring-tibp.onrender.com";

const tareaId = localStorage.getItem("tareaId");

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
    if (!tareaId) {
        mostrarMensaje("No hay tarea seleccionada", "red");
        setTimeout(() => window.location.href = "tareas.html", 1500);
        return;
    }

    cargarDatos();
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
   CARGAR DATOS
========================= */
async function cargarDatos() {
    try {
        const res = await fetch(`${API}/tareas/${tareaId}`);
        if (!res.ok) throw new Error();

        const tarea = await res.json();

        document.getElementById("name").value = tarea.name;
        document.getElementById("description").value = tarea.description || "";
        document.getElementById("startAt").value =
            tarea.startAt ? tarea.startAt.slice(0, 16) : "";

        await cargarPrioridades(tarea);
        await cargarTags(tarea);

    } catch {
        mostrarMensaje("Error cargando tarea", "red");
    }
}

/* =========================
   PRIORIDADES
========================= */
async function cargarPrioridades(tarea) {
    try {
        const res = await fetch(`${API}/prioridades`);
        const data = await res.json();

        const select = document.getElementById("prioridad");
        select.innerHTML = "";

        data.forEach(p => {
            const option = document.createElement("option");
            option.value = p.id;
            option.text = p.name;

            if (p.name === tarea.priorityName) {
                option.selected = true;
            }

            select.appendChild(option);
        });

    } catch {
        mostrarMensaje("Error cargando prioridades", "red");
    }
}

/* =========================
   TAGS
========================= */
async function cargarTags(tarea) {
    try {
        const res = await fetch(`${API}/tags`);
        const data = await res.json();

        const container = document.getElementById("tags");
        container.innerHTML = "";

        data.forEach(tag => {
            const checked = tarea.tagNames?.includes(tag.name);

            const label = document.createElement("label");
            label.innerHTML = `
                <input type="checkbox" value="${tag.id}" ${checked ? "checked" : ""}>
                ${tag.name}
            `;

            container.appendChild(label);
        });

    } catch {
        mostrarMensaje("Error cargando tags", "red");
    }
}

/* =========================
   SUBMIT
========================= */
document.getElementById("formEditar").addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = document.getElementById("btnGuardar");

    const name = document.getElementById("name").value.trim();
    const description = document.getElementById("description").value;
    const startAt = document.getElementById("startAt").value;
    const prioridadId = document.getElementById("prioridad").value;

    const tagIds = Array.from(
        document.querySelectorAll("#tags input:checked")
    ).map(cb => Number(cb.value));

    if (!name) {
        mostrarMensaje("El nombre es obligatorio", "red");
        return;
    }

    btn.disabled = true;
    btn.textContent = "Guardando...";

    try {
        const res = await fetch(`${API}/tareas/${tareaId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                description,
                startAt,
                prioridadId: Number(prioridadId),
                tagIds
            })
        });

        if (!res.ok) throw new Error();

        mostrarMensaje("Tarea actualizada ");

        setTimeout(() => {
            window.location.href = "tareas.html";
        }, 1000);

    } catch {
        mostrarMensaje("Error al actualizar ", "red");
    } finally {
        btn.disabled = false;
        btn.textContent = "Guardar cambios";
    }
});

/* =========================
   VOLVER
========================= */
function volver() {
    window.location.href = "tareas.html";
}