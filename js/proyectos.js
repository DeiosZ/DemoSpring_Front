const API = "https://demospring-tibp.onrender.com";

// ========================
// INIT
// ========================
document.addEventListener("DOMContentLoaded", () => {
  cargarProyectos();
});

// ========================
// CARGAR PROYECTOS
// ========================
async function cargarProyectos() {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch(`${API}/proyectos/users/${userId}/projects`);

    if (!res.ok) throw new Error("Error al cargar proyectos");

    const data = await res.json();

    renderProyectos(data);

  } catch (error) {
    console.error(error);
    mostrarMensaje("Error cargando proyectos", "red");
  }
}

// ========================
// RENDER
// ========================
function renderProyectos(data) {
  const container = document.getElementById("proyectos");
  container.innerHTML = "";

  if (!data || data.length === 0) {
    container.innerHTML = "<p>No tienes proyectos aún</p>";
    return;
  }

  data.forEach((p) => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h3>${p.name}</h3>
      <p>${p.description || "Sin descripción"}</p>

      <div class="card-buttons">
        <button onclick="verTareas(${p.id})">Tareas</button>
        <button onclick="editarProyecto(${p.id}, \`${p.name}\`, \`${p.description || ""}\`, \`${p.color || ""}\`, \`${p.image || ""}\`)">Editar</button>
        <button onclick="eliminarProyecto(${p.id})">Eliminar</button>
      </div>
    `;

    container.appendChild(div);
  });
}

// ========================
// NAVEGACIÓN
// ========================
function verTareas(proyectoId) {
  localStorage.setItem("proyectoId", proyectoId);
  window.location.href = "tareas.html";
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

// ========================
// MENSAJES
// ========================
function mostrarMensaje(texto, color = "green") {
  const msg = document.getElementById("mensaje");
  if (!msg) return;

  msg.textContent = texto;
  msg.style.color = color;
}

// ========================
// FORMULARIO
// ========================
function mostrarFormulario() {
  document.getElementById("formProyecto").classList.remove("hidden");
  document.getElementById("tituloForm").innerText = "Nuevo Proyecto";
  cargarTags();
}

function ocultarFormulario() {
  document.getElementById("formProyecto").classList.add("hidden");
  limpiarFormulario();
  localStorage.removeItem("proyectoEditando");
  document.getElementById("btnGuardar").innerText = "Guardar";
}

function limpiarFormulario() {
  document.getElementById("name").value = "";
  document.getElementById("description").value = "";
  document.getElementById("color").value = "";
  document.getElementById("image").value = "";
}

// ========================
// TAGS
// ========================
async function cargarTags() {
  try {
    const res = await fetch(`${API}/tags`);
    const tags = await res.json();

    const select = document.getElementById("tag");
    select.innerHTML = "";

    tags.forEach((tag) => {
      const option = document.createElement("option");
      option.value = tag.id;
      option.text = tag.name;
      select.appendChild(option);
    });

  } catch (e) {
    console.error("Error cargando tags", e);
  }
}

// ========================
// CREAR / EDITAR
// ========================
async function crearProyecto() {

  const btn = document.getElementById("btnGuardar");

  const name = document.getElementById("name").value.trim();

  if (!name) {
    mostrarMensaje("El nombre es obligatorio", "red");
    return;
  }

  btn.disabled = true;
  btn.innerText = "Guardando...";

  const userId = localStorage.getItem("userId");
  const proyectoId = localStorage.getItem("proyectoEditando");

  const data = {
    name,
    description: document.getElementById("description").value,
    color: document.getElementById("color").value,
    image: document.getElementById("image").value,
    userId: parseInt(userId)
  };

  try {
    let proyecto;

    // EDITAR
    if (proyectoId) {

      const res = await fetch(`${API}/proyectos/${proyectoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error("Error al actualizar");

      proyecto = await res.json();

      mostrarMensaje("Proyecto actualizado ✏️");

    } else {
      // CREAR
      const res = await fetch(`${API}/proyectos/crear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error("Error al crear proyecto");

      proyecto = await res.json();

      // TAGS
      const select = document.getElementById("tag");
      const tagIds = Array.from(select.selectedOptions)
        .map(o => parseInt(o.value))
        .filter(id => !isNaN(id));

      if (tagIds.length > 0) {
        await fetch(`${API}/proyectos/${proyecto.id}/tags`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tagIds)
        });
      }

      mostrarMensaje("Proyecto creado correctamente");
    }

    ocultarFormulario();
    cargarProyectos();

  } catch (e) {
    mostrarMensaje(e.message, "red");
  } finally {
    btn.disabled = false;
    btn.innerText = "Guardar";
  }
}

// ========================
// EDITAR
// ========================
function editarProyecto(id, name, description, color, image) {

  mostrarFormulario();

  document.getElementById("tituloForm").innerText = "Editar Proyecto";

  document.getElementById("name").value = name;
  document.getElementById("description").value = description;
  document.getElementById("color").value = color;
  document.getElementById("image").value = image;

  localStorage.setItem("proyectoEditando", id);

  document.getElementById("btnGuardar").innerText = "Actualizar";
}

// ========================
// ELIMINAR
// ========================
async function eliminarProyecto(id) {

  if (!confirm("¿Seguro que deseas eliminar este proyecto?")) return;

  try {
    const res = await fetch(`${API}/proyectos/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) throw new Error("No se pudo eliminar");

    mostrarMensaje("Proyecto eliminado");

    cargarProyectos();

  } catch (e) {
    mostrarMensaje(e.message, "red");
  }
}