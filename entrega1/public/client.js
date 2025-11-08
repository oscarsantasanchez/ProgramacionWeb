const productSection = document.getElementById('productSection');
const productList = document.getElementById('productList');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const chatBtn = document.getElementById('chatBtn');
const adminActions = document.getElementById('adminActions');

// Las variables token, role, username se obtendrán dentro de las funciones cuando sea necesario

document.addEventListener('DOMContentLoaded', () => {
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('userRole');
  const username = sessionStorage.getItem('username');
  
  if (token) {
    // Verificar que el token sea válido
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      
      if (isExpired) {
        console.log('❌ Token expirado');
        sessionStorage.clear();
        window.location.reload();
        return;
      }
    } catch (e) {
      console.error('❌ Error verificando token:', e);
      sessionStorage.clear();
      window.location.reload();
      return;
    }

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
      const token = sessionStorage.getItem('token');
      
      if (!token) {
        alert('❌ No hay sesión activa. Por favor, inicia sesión nuevamente.');
        sessionStorage.clear();
        window.location.reload();
        return;
      }

      const title = document.getElementById('productTitle').value;
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
        if (res.status === 401) {
          alert('❌ Sesión expirada. Por favor, inicia sesión nuevamente.');
          sessionStorage.clear();
          window.location.reload();
        } else {
          const error = await res.json();
          alert(`❌ Error al crear el producto: ${error.message || 'Intenta de nuevo'}`);
        }
      }
    });
  }
});

async function loadProducts() {
  try {
    const token = sessionStorage.getItem('token');
    const role = sessionStorage.getItem('userRole');
    
    // Verificar que el token existe
    if (!token) {
      console.error('❌ No hay token disponible');
      alert('Por favor, inicia sesión nuevamente');
      sessionStorage.clear();
      window.location.reload();
      return;
    }

    console.log('🔍 Cargando productos...');
    
    const res = await fetch('/api/products', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', res.status);
    
    if (res.status === 401) {
      // Token inválido o expirado
      console.error('❌ Token inválido o expirado');
      sessionStorage.clear();
      alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
      window.location.reload();
      return;
    }
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error response:', errorText);
      throw new Error(`Error al cargar productos: ${res.status}`);
    }

    const products = await res.json();
    console.log('✅ Productos cargados:', products);
    
    productList.innerHTML = '';

    if (products.length === 0) {
      productList.innerHTML = '<p>No hay productos disponibles</p>';
      return;
    }

    products.forEach((p) => {
      const div = document.createElement('div');
      div.classList.add('product-card');
      div.innerHTML = `
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <span>$${p.price}</span>
        ${
          role === 'admin'
            ? `<div class="admin-buttons">
                 <button onclick="editProduct('${p._id}')">Editar</button>
                 <button onclick="deleteProduct('${p._id}')">Eliminar</button>
               </div>`
            : ''
        }
      `;
      productList.appendChild(div);
    });
  } catch (error) {
    console.error('❌ Error cargando productos:', error);
    productList.innerHTML = '<p>Error al cargar los productos</p>';
  }
}

async function deleteProduct(id) {
  if (!confirm('¿Seguro que quieres eliminar este producto?')) return;

  const token = sessionStorage.getItem('token');
  
  if (!token) {
    alert('❌ No hay sesión activa');
    sessionStorage.clear();
    window.location.reload();
    return;
  }

  const res = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (res.ok) {
    alert('✅ Producto eliminado correctamente');
    loadProducts();
  } else {
    if (res.status === 401) {
      alert('❌ Sesión expirada. Por favor, inicia sesión nuevamente.');
      sessionStorage.clear();
      window.location.reload();
    } else {
      alert('❌ Error al eliminar producto');
    }
  }
}

async function editProduct(id) {
  // Función para editar producto (puedes implementarla según tus necesidades)
  const newTitle = prompt('Nuevo título:');
  if (newTitle) {
    const token = sessionStorage.getItem('token');
    
    if (!token) {
      alert('❌ No hay sesión activa');
      sessionStorage.clear();
      window.location.reload();
      return;
    }

    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title: newTitle })
    });

    if (res.ok) {
      alert('✅ Producto actualizado correctamente');
      loadProducts();
    } else {
      if (res.status === 401) {
        alert('❌ Sesión expirada. Por favor, inicia sesión nuevamente.');
        sessionStorage.clear();
        window.location.reload();
      } else {
        alert('❌ Error al actualizar producto');
      }
    }
  }
}


