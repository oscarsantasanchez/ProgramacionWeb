const productSection = document.getElementById('productSection');
const productList = document.getElementById('productList');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const chatBtn = document.getElementById('chatBtn');
const adminActions = document.getElementById('adminActions');
const userWelcome = document.getElementById('userWelcome');
const usernameDisplay = document.getElementById('usernameDisplay');

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

    // Ocultar botones de login y registro, mostrar elementos de usuario logueado
    document.getElementById('authSection').classList.add('hidden');
    productSection.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
    chatBtn.classList.remove('hidden');
    loginBtn.classList.add('hidden');
    registerBtn.classList.add('hidden');
    userWelcome.classList.remove('hidden');
    usernameDisplay.textContent = username;
    
    if (role === 'admin') adminActions.classList.remove('hidden');
    loadProducts();
  } else {
    // Si no hay token, asegurarse de que los botones de auth sean visibles
    loginBtn.classList.remove('hidden');
    registerBtn.classList.remove('hidden');
    userWelcome.classList.add('hidden');
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
    const productImageInput = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');
    const removeImageBtn = document.getElementById('removeImageBtn');
    
    let currentImageBase64 = '';
    let currentImageType = '';

    // Manejar selección de imagen
    productImageInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
          alert('❌ Por favor, selecciona un archivo de imagen válido');
          this.value = '';
          return;
        }

        // Validar tamaño (1MB máximo)
        if (file.size > 1048576) {
          alert('❌ La imagen no puede ser mayor a 1MB');
          this.value = '';
          return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
          currentImageBase64 = e.target.result;
          currentImageType = file.type;
          
          // Mostrar preview
          imagePreview.innerHTML = `<img src="${currentImageBase64}" alt="Vista previa" class="preview-image">`;
          removeImageBtn.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
      }
    });

    // Manejar eliminación de imagen
    removeImageBtn.addEventListener('click', function() {
      productImageInput.value = '';
      currentImageBase64 = '';
      currentImageType = '';
      imagePreview.innerHTML = '';
      this.classList.add('hidden');
    });

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

      // Validar campos
      if (!title || !price) {
        alert('❌ Título y precio son requeridos');
        return;
      }

      if (isNaN(price) || parseFloat(price) <= 0) {
        alert('❌ El precio debe ser un número válido mayor que 0');
        return;
      }

      try {
        console.log('🔄 Enviando solicitud para crear producto...');
        
        const productData = { 
          title: title.trim(), 
          description: description.trim(), 
          price: parseFloat(price)
        };

        // Agregar imagen si existe
        if (currentImageBase64 && currentImageType) {
          productData.image = currentImageBase64;
          productData.imageType = currentImageType;
        }

        const res = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(productData),
        });

        console.log('📨 Respuesta del servidor:', res.status);

        if (res.ok) {
          const data = await res.json();
          console.log('✅ Producto creado:', data);
          alert('✅ Producto creado correctamente');
          form.reset();
          imagePreview.innerHTML = '';
          removeImageBtn.classList.add('hidden');
          currentImageBase64 = '';
          currentImageType = '';
          loadProducts();
        } else {
          // Manejar diferentes códigos de error
          if (res.status === 401) {
            alert('❌ Sesión expirada. Por favor, inicia sesión nuevamente.');
            sessionStorage.clear();
            window.location.reload();
          } else if (res.status === 403) {
            alert('❌ No tienes permisos para crear productos. Se requiere rol de administrador.');
          } else {
            let errorMessage = 'Error al crear el producto';
            try {
              const errorData = await res.json();
              errorMessage = errorData.message || errorMessage;
            } catch (e) {
              errorMessage = `Error ${res.status}: ${res.statusText}`;
            }
            alert(`❌ ${errorMessage}`);
          }
        }
      } catch (error) {
        console.error('❌ Error de red:', error);
        alert('❌ Error de conexión. Verifica que el servidor esté funcionando y vuelve a intentarlo.');
      }
    });
  }
});

async function loadProducts() {
  try {
    const token = sessionStorage.getItem('token');
    const role = sessionStorage.getItem('userRole');
    
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
      
      // Mostrar imagen si existe
      const imageHtml = p.image ? 
        `<div class="product-image">
          <img src="${p.image}" alt="${p.title}" loading="lazy">
        </div>` : 
        '<div class="product-image placeholder">📷 Sin imagen</div>';
      
      div.innerHTML = `
        ${imageHtml}
        <h3>${p.title}</h3>
        <p>${p.description || 'Sin descripción'}</p>
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

