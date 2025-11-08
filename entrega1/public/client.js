const productSection = document.getElementById('productSection');
const productList = document.getElementById('productList');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const chatBtn = document.getElementById('chatBtn');
const adminActions = document.getElementById('adminActions');

const token = sessionStorage.getItem('token');
const role = sessionStorage.getItem('userRole');
const username = sessionStorage.getItem('username');

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
    sessionStorage.clear();
    window.location.reload();
  });

  loginBtn.addEventListener('click', () => (window.location.href = 'login.html'));
  registerBtn.addEventListener('click', () => (window.location.href = 'register.html'));
  chatBtn.addEventListener('click', () => (window.location.href = 'chat.html'));

  const form = document.getElementById('createProductForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = document.getElementById('productTitle').value; // ✅ corregido
      const description = document.getElementById('productDescription').value;
      const price = document.getElementById('productPrice').value;

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, price }),
      });

      if (res.ok) {
        alert('✅ Producto creado correctamente');
        form.reset();
        loadProducts();
      } else {
        const error = await res.json();
        alert(`❌ Error al crear el producto: ${error.message || 'Intenta de nuevo'}`);
      }
    });
  }
});

async function loadProducts() {
  try {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error('Error al cargar productos');

    const products = await res.json();
    productList.innerHTML = '';

    products.forEach((p) => {
      const div = document.createElement('div');
      div.classList.add('product-card');
      div.innerHTML = `
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <span>$${p.price}</span>
        ${
          role === 'admin'
            ? `
          <div class="admin-buttons">
            <button onclick="editProduct('${p._id}')">Editar</button>
            <button onclick="deleteProduct('${p._id}')">Eliminar</button>
          </div>
        `
            : ''
        }
      `;
      productList.appendChild(div);
    });
  } catch (error) {
    console.error('Error cargando productos:', error);
  }
}

async function deleteProduct(id) {
  if (!confirm('¿Seguro que quieres eliminar este producto?')) return;

  const res = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.ok) {
    alert('Producto eliminado correctamente');
    loadProducts();
  } else {
    alert('Error al eliminar producto');
  }
}
