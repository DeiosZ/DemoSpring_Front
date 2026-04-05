// ── Config ────────────────────────────────────────────────────────────
const API = 'https://demospring-production-38ba.up.railway.app';

// Colores para avatares
const COLORS = ['#e85c3a','#3a7be8','#3acf8f','#e8b43a','#9b3ae8','#e83a8f'];
const color = (id) => COLORS[id % COLORS.length];

// Estado
let currentUser = null;
let doneTasks   = new Set(); // IDs de tareas marcadas localmente

// ── Init ──────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  checkApi();
  loadUsers();
});

// ── API Status ────────────────────────────────────────────────────────
async function checkApi() {
  const dot  = document.getElementById('status-dot');
  const text = document.getElementById('status-text');
  try {
    await fetch(`${API}/usuarios/`);
    dot.className  = 'status-dot online';
    text.textContent = 'API online';
  } catch {
    dot.className  = 'status-dot offline';
    text.textContent = 'API offline';
  }
}

// ── Navegación ────────────────────────────────────────────────────────
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  document.getElementById(`view-${name}`).classList.add('active');

  const map = { 'usuarios': 0, 'nuevo-usuario': 1 };
  if (map[name] !== undefined) {
    document.querySelectorAll('.nav-btn')[map[name]].classList.add('active');
  }
}

// ── Usuarios ──────────────────────────────────────────────────────────
async function loadUsers() {
  const grid = document.getElementById('users-grid');
  grid.innerHTML = '<div class="loading-state">Cargando usuarios...</div>';

  try {
    const res   = await fetch(`${API}/usuarios/`);
    const users = await res.json();

    document.getElementById('users-count').textContent = users.length;

    if (!users.length) {
      grid.innerHTML = `<div class="empty-state">
        <span class="empty-icon">👥</span>
        No hay usuarios. ¡Crea el primero!
      </div>`;
      return;
    }

    grid.innerHTML = '';
    users.forEach((u, i) => {
      const card = document.createElement('div');
      card.className = 'user-card';
      card.style.animationDelay = `${i * 0.06}s`;
      card.innerHTML = `
        <div class="user-avatar" style="background:${color(u.id)}">
          ${u.nombre.charAt(0).toUpperCase()}
        </div>
        <div class="user-card-name">${u.nombre}</div>
        <div class="user-card-email">${u.email}</div>
        <div class="user-card-footer">
          <span class="task-chip" id="chip-${u.id}">Ver tareas →</span>
          <button class="delete-btn" onclick="event.stopPropagation(); confirmarEliminar(${u.id}, '${u.nombre}')">✕</button>
        </div>
      `;
      card.addEventListener('click', () => openUserTasks(u));
      grid.appendChild(card);
    });

  } catch (e) {
    grid.innerHTML = `<div class="empty-state">
      <span class="empty-icon">⚠️</span>
      No se pudo conectar a la API
    </div>`;
  }
}

async function crearUsuario() {
  const nombre = document.getElementById('u-nombre').value.trim();
  const email  = document.getElementById('u-email').value.trim();
  if (!nombre || !email) { toast('Completa todos los campos', 'error'); return; }

  try {
    const res = await fetch(`${API}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email })
    });
    if (!res.ok) throw new Error();
    document.getElementById('u-nombre').value = '';
    document.getElementById('u-email').value  = '';
    toast(`Usuario "${nombre}" creado`);
    showView('usuarios');
    loadUsers();
  } catch {
    toast('Error al crear usuario', 'error');
  }
}

function confirmarEliminar(id, nombre) {
  document.getElementById('modal-text').textContent =
    `¿Eliminar a "${nombre}"? Se borrarán todas sus tareas.`;
  document.getElementById('modal-confirm').onclick = () => eliminarUsuario(id);
  document.getElementById('modal-overlay').classList.add('open');
}

async function eliminarUsuario(id) {
  closeModal();
  try {
    const res = await fetch(`${API}/usuarios/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    toast('Usuario y sus tareas eliminados');
    loadUsers();
    if (currentUser?.id === id) showView('usuarios');
  } catch {
    toast('Error al eliminar usuario', 'error');
  }
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

// ── Tareas ────────────────────────────────────────────────────────────
async function openUserTasks(user) {
  currentUser = user;
  document.getElementById('tareas-user-name').textContent = user.nombre;
  document.getElementById('tareas-user-email').textContent = user.email;
  showView('tareas');
  await loadTareas();
}

async function loadTareas() {
  const list = document.getElementById('tareas-list');
  list.innerHTML = '<div class="loading-state">Cargando tareas...</div>';

  try {
    const res   = await fetch(`${API}/tareas/usuario/${currentUser.id}`);
    const tasks = await res.json();

    if (!tasks.length) {
      list.innerHTML = `<div class="empty-state">
        <span class="empty-icon">✅</span>
        Sin tareas. ¡Agrega la primera!
      </div>`;
      return;
    }

    list.innerHTML = '';
    tasks.forEach((t, i) => {
      const isDone = doneTasks.has(t.id);
      const item   = document.createElement('div');
      item.className = 'tarea-item';
      item.style.animationDelay = `${i * 0.05}s`;
      item.innerHTML = `
        <div class="tarea-check ${isDone ? 'checked' : ''}" id="check-${t.id}" onclick="toggleDone(${t.id})">
          ${isDone ? '✓' : ''}
        </div>
        <div class="tarea-body">
          <div class="tarea-titulo ${isDone ? 'done' : ''}" id="titulo-${t.id}">${t.titulo}</div>
          ${t.descripcion ? `<div class="tarea-desc">${t.descripcion}</div>` : ''}
        </div>
        <button class="delete-btn" onclick="eliminarTarea(${t.id})">✕</button>
      `;
      list.appendChild(item);
    });

  } catch {
    list.innerHTML = `<div class="empty-state">
      <span class="empty-icon">⚠️</span>Error al cargar tareas
    </div>`;
  }
}

async function crearTarea() {
  const titulo = document.getElementById('t-titulo').value.trim();
  const desc   = document.getElementById('t-desc').value.trim();
  if (!titulo) { toast('Escribe un título', 'error'); return; }

  try {
    const res = await fetch(`${API}/tareas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, descripcion: desc, usuario: { id: currentUser.id } })
    });
    if (!res.ok) throw new Error();
    document.getElementById('t-titulo').value = '';
    document.getElementById('t-desc').value   = '';
    toast('Tarea agregada');
    loadTareas();
  } catch {
    toast('Error al crear tarea', 'error');
  }
}

async function eliminarTarea(id) {
  try {
    await fetch(`${API}/tareas/${id}`, { method: 'DELETE' });
    doneTasks.delete(id);
    toast('Tarea eliminada');
    loadTareas();
  } catch {
    toast('Error al eliminar tarea', 'error');
  }
}

function toggleDone(id) {
  if (doneTasks.has(id)) {
    doneTasks.delete(id);
  } else {
    doneTasks.add(id);
  }
  const check  = document.getElementById(`check-${id}`);
  const titulo = document.getElementById(`titulo-${id}`);
  const isDone = doneTasks.has(id);
  check.className  = `tarea-check ${isDone ? 'checked' : ''}`;
  check.textContent = isDone ? '✓' : '';
  titulo.className = `tarea-titulo ${isDone ? 'done' : ''}`;
}

// ── Toast ─────────────────────────────────────────────────────────────
function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast ${type === 'error' ? 'error' : ''}`;
  el.textContent = msg;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3000);
}
