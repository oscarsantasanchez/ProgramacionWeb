const productSection = document.getElementById('productSection');
const productList = document.getElementById('productList');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const chatBtn = document.getElementById('chatBtn');
const adminActions = document.getElementById('adminActions');

const token = localStorage.getItem('token');
const role = localStorage.getItem('userRole');
const username = localStorage.getItem('username');

document.addEventListener('DOMContentLoaded', () => {
  if (token) {
    document.getElementById('authSection').classList.add('hidden');
    productSection.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
    chatBtn.classList.remove('hidden');
    if (role === 'admin') adminActions.classList.remove('hidden');
    loadProducts();
  }

  logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    window.location.reload();
  });

  loginBtn.addEventListener('click', () => (window.location.href = 'login.html'));
  registerBtn.addEventListener('click', () => (window.location.href = 'register.html'));
  chatBtn.addEventListener('click', () => (window.location.href = 'chat.html'));

  const form = document.getElementById('createProductForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('productName').value;
      const description = document.getElementById('productDescription').value;
      const price = document.getElementById('productPrice').value;

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description, price }),
      });

      if (res.ok) {
        alert('Producto creado');
        loadProducts();
        form.reset();
      } else {
        alert('Error al crear el producto');
      }
    });
  }
});

async function loadProducts() {
  const res = await fetch('/api/products');
  const products = await res.json();

  productList.innerHTML = '';
  products.forEach((p) => {
    const div = document.createElement('div');
    div.classList.add('product-card');
    div.innerHTML = `
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <span>$${p.price}</span>
      ${role === 'admin' ? `
        <div class="admin-buttons">
          <button onclick="editProduct('${p._id}')">Editar</button>
          <button onclick="deleteProduct('${p._id}')">Eliminar</button>
        </div>` : ''}
    `;
    productList.appendChild(div);
  });
}

async function deleteProduct(id) {
  if (!confirm('¿Seguro que quieres eliminar este producto?')) return;

  const res = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.ok) {
    alert('Producto eliminado');
    loadProducts();
  } else {
    alert('Error al eliminar producto');
  }
}