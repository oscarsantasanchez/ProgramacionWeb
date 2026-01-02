document.addEventListener('DOMContentLoaded', async () => {
  const token = sessionStorage.getItem('token');
  const res = await fetch('/api/users', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const users = await res.json();
  const userList = document.getElementById('userList');
  users.forEach(user => {
    const userDiv = document.createElement('div');
    userDiv.innerHTML = `
      <h3>${user.username}</h3>
      <p>${user.email}</p>
      <button>Editar</button>
      <button>Eliminar</button>
    `;
    userList.appendChild(userDiv);
  });
});
