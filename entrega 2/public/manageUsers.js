document.addEventListener('DOMContentLoaded', async () => {
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('userRole');

  // Solo Admin puede acceder
  if (role !== 'Administrador') {
    window.location.href = 'index.html';
    return;
  }

  loadUsers();
});

// =========================
// CARGAR USUARIOS
// =========================

async function loadUsers() {
  const token = sessionStorage.getItem('token');
  const tbody = document.getElementById('usersTableBody');

  try {
    const res = await fetch('/api/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const users = await res.json();
    tbody.innerHTML = '';

    users.forEach(user => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${user._id}</td>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>
          <select data-id="${user._id}" class="role-select">
            <option value="Administrador" ${user.role === 'Administrador' ? 'selected' : ''}>Administrador</option>
            <option value="Logística" ${user.role === 'Logística' ? 'selected' : ''}>Logística</option>
            <option value="Cliente" ${user.role === 'Cliente' ? 'selected' : ''}>Cliente</option>
          </select>
        </td>
        <td>
          <button class="delete-btn" data-id="${user._id}">Eliminar</button>
        </td>
      `;

      tbody.appendChild(tr);
    });

    attachRoleHandlers();
    attachDeleteHandlers();

  } catch (err) {
    console.error('Error al cargar usuarios:', err);
    alert('Error al cargar usuarios');
  }
}

// =========================
// CAMBIAR ROL
// =========================

function attachRoleHandlers() {
  const selects = document.querySelectorAll('.role-select');
  const token = sessionStorage.getItem('token');

  selects.forEach(select => {
    select.addEventListener('change', async e => {
      const id = e.target.dataset.id;
      const newRole = e.target.value;

      try {
        const res = await fetch(`/api/users/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ role: newRole })
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || 'Error al actualizar rol');
        }

      } catch (err) {
        console.error('Error al actualizar rol:', err);
        alert('Error al actualizar rol');
      }
    });
  });
}

// =========================
// ELIMINAR USUARIO
// =========================

function attachDeleteHandlers() {
  const buttons = document.querySelectorAll('.delete-btn');
  const token = sessionStorage.getItem('token');

  buttons.forEach(btn => {
    btn.addEventListener('click', async e => {
      const id = e.target.dataset.id;

      if (!confirm('¿Seguro que deseas eliminar este usuario?')) return;

      try {
        const res = await fetch(`/api/users/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();

        if (res.ok) {
          alert('Usuario eliminado');
          loadUsers();
        } else {
          alert(data.message || 'Error al eliminar usuario');
        }

      } catch (err) {
        console.error('Error al eliminar usuario:', err);
        alert('Error al eliminar usuario');
      }
    });
  });
}
