import { client } from './graphql/client.js';
import { gql } from '@apollo/client';

// =========================
// QUERIES Y MUTATIONS
// =========================

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      username
      email
      role
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($username: String!, $email: String!, $password: String!, $role: String!) {
    createUser(username: $username, email: $email, password: $password, role: $role) {
      id
      username
      email
      role
    }
  }
`;

const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($id: ID!, $role: String!) {
    updateUserRole(id: $id, role: $role) {
      id
      role
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      id
    }
  }
`;

// =========================
// CARGA INICIAL
// =========================

document.addEventListener('DOMContentLoaded', () => {
  loadUsers();

  const createUserForm = document.getElementById('createUserForm');
  createUserForm.addEventListener('submit', handleCreateUser);
});

// =========================
// FUNCIONES PRINCIPALES
// =========================

async function loadUsers() {
  try {
    const { data } = await client.query({
      query: GET_USERS,
      fetchPolicy: 'no-cache'
    });

    const users = data.users;
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    users.forEach(user => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${user.id}</td>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>
          <select data-user-id="${user.id}" class="role-select">
            <option value="Administrador" ${user.role === 'Administrador' ? 'selected' : ''}>Administrador</option>
            <option value="Logística" ${user.role === 'Logística' ? 'selected' : ''}>Logística</option>
            <option value="Cliente" ${user.role === 'Cliente' ? 'selected' : ''}>Cliente</option>
          </select>
        </td>
        <td>
          <button data-delete-id="${user.id}" class="delete-btn">Eliminar</button>
        </td>
      `;

      tbody.appendChild(tr);
    });

    attachRoleChangeHandlers();
    attachDeleteHandlers();

  } catch (error) {
    console.error(error);
    alert('Error al cargar usuarios.');
  }
}

async function handleCreateUser(e) {
  e.preventDefault();

  const username = document.getElementById('newUsername').value.trim();
  const email = document.getElementById('newEmail').value.trim();
  const password = document.getElementById('newPassword').value.trim();
  const role = document.getElementById('newRole').value;

  if (!username || !email || !password || !role) {
    alert('Todos los campos son obligatorios.');
    return;
  }

  try {
    await client.mutate({
      mutation: CREATE_USER,
      variables: { username, email, password, role }
    });

    document.getElementById('createUserForm').reset();
    await loadUsers();

  } catch (error) {
    console.error(error);
    alert('Error al crear usuario.');
  }
}

// =========================
// HANDLERS DE ROL Y ELIMINAR
// =========================

function attachRoleChangeHandlers() {
  const selects = document.querySelectorAll('.role-select');

  selects.forEach(select => {
    select.addEventListener('change', async (e) => {
      const userId = e.target.getAttribute('data-user-id');
      const newRole = e.target.value;

      try {
        await client.mutate({
          mutation: UPDATE_USER_ROLE,
          variables: { id: userId, role: newRole }
        });

      } catch (error) {
        console.error(error);
        alert('Error al actualizar el rol.');
      }
    });
  });
}

function attachDeleteHandlers() {
  const buttons = document.querySelectorAll('.delete-btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const userId = e.target.getAttribute('data-delete-id');

      const confirmDelete = window.confirm('¿Seguro que quieres eliminar este usuario?');
      if (!confirmDelete) return;

      try {
        await client.mutate({
          mutation: DELETE_USER,
          variables: { id: userId }
        });

        await loadUsers();

      } catch (error) {
        console.error(error);
        alert('Error al eliminar usuario.');
      }
    });
  });
}
