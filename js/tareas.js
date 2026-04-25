const API = "https://demospring-tibp.onrender.com";

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  cargarTareas();
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
   CARGAR TAREAS
========================= */
async function cargarTareas() {
  const proyectoId = localStorage.getItem("proyectoId");

  if (!proyectoId) {
    window.location.href = "proyectos.html";
    return;
  }

  const pendientes = document.getElementById("pendientes");
  const completadas = document.getElementById("completadas");

  if (!pendientes || !completadas) {
    console.error("No existen los contenedores en el HTML");
    return;
  }

  pendientes.innerHTML = "Cargando...";
  completadas.innerHTML = "";

  try {
    const res = await fetch(`${API}/tareas/proyecto/${proyectoId}`);

    if (!res.ok) throw new Error();

    const data = await res.json();

    renderTareas(data);

  } catch (error) {
    console.error(error);
    pendientes.innerHTML = "<p>Error al cargar tareas</p>";
  }
}

/* =========================
   RENDER
========================= */
function renderTareas(data) {

  const pendientes = document.getElementById("pendientes");
  const completadas = document.getElementById("completadas");

  pendientes.innerHTML = "";
  completadas.innerHTML = "";

  if (!data || data.length === 0) {
    pendientes.innerHTML = "<p>No hay tareas</p>";
    return;
  }

  data.forEach(t => {

    const div = document.createElement("div");
    div.className = "card";

    const prioridad = t.priorityName || "Sin prioridad";
    const color = t.priorityColor || "#999";

    const tags = (t.tagNames || [])
      .map(tag => `<span class="tag">${tag}</span>`)
      .join("");

    div.innerHTML = `
      <div class="badge" style="background:${color}">
        ${prioridad}
      </div>

      <strong>${t.name}</strong>
      <p>${t.description || ""}</p>

      <div>${tags}</div>

      ${
        !t.isFinish
          ? `
          <div class="card-buttons">
            <button onclick="marcar(${t.id})">Completar</button>
            <button onclick="editar(${t.id})">Editar</button>
          </div>
        `
          : `
          <p class="completada">✔ Completada</p>
          <div class="card-buttons">
            <button onclick="eliminar(${t.id})">Borrar</button>
          </div>
        `
      }
    `;

    if (t.isFinish) {
      completadas.appendChild(div);
    } else {
      pendientes.appendChild(div);
    }

  });
}

/* =========================
   ACCIONES
========================= */
function irCrearTarea() {
  window.location.href = "creartarea.html";
}

function editar(id) {
  localStorage.setItem("tareaId", id);
  window.location.href = "editartarea.html";
}

async function marcar(id) {
  try {
    const res = await fetch(`${API}/tareas/${id}/completar`, {
      method: "PUT"
    });

    if (!res.ok) throw new Error();

    mostrarMensaje("Tarea completada ");
    cargarTareas();

  } catch {
    mostrarMensaje("Error al completar tarea", "red");
  }
}

async function eliminar(id) {
  if (!confirm("¿Eliminar tarea?")) return;

  try {
    const res = await fetch(`${API}/tareas/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) throw new Error();

    mostrarMensaje("Tarea eliminada 🗑");
    cargarTareas();

  } catch {
    mostrarMensaje("No se pudo eliminar", "red");
  }
}

function volver() {
  window.location.href = "proyectos.html";
}