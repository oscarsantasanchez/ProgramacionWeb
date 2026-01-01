document.addEventListener('DOMContentLoaded', () => {
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('userRole');
  const username = sessionStorage.getItem('username');
  
  // Si el token no está presente, redirigir a la página de login
  if (!token) {
    document.getElementById('loginBtn').addEventListener('click', () => {
      window.location.href = 'login.html'; // Redirige al login
    });
    document.getElementById('registerBtn').addEventListener('click', () => {
      window.location.href = 'register.html'; // Redirige al registro
    });
  }

  // Verificar que el token no haya expirado
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isExpired = payload.exp * 1000 < Date.now();
    
    if (isExpired) {
      sessionStorage.clear();
      window.location.href = 'login.html'; // Redirigir a login si el token ha expirado
      return;
    }
  } catch (e) {
    console.error('❌ Error verificando token:', e);
    sessionStorage.clear();
    window.location.href = 'login.html'; // Redirigir a login si hay un error con el token
    return;
  }

  // Actualizar la interfaz según el rol
  document.getElementById('authSection').classList.add('hidden');
  document.getElementById('productSection').classList.remove('hidden');
  document.getElementById('logoutBtn').classList.remove('hidden');
  document.getElementById('chatBtn').classList.remove('hidden');
  document.getElementById('loginBtn').classList.add('hidden');
  document.getElementById('registerBtn').classList.add('hidden');
  document.getElementById('userWelcome').classList.remove('hidden');
  document.getElementById('usernameDisplay').textContent = username;

  // Dependiendo del rol, mostrar diferentes botones
  if (role === 'Administrador') {
    document.getElementById('manageProductsBtn').classList.remove('hidden');
    document.getElementById('manageUsersBtn').classList.remove('hidden');
    document.getElementById('manageOrdersBtn').classList.remove('hidden');
  } else if (role === 'Logística') {
    document.getElementById('manageOrdersBtn').classList.remove('hidden');
  } else if (role === 'Cliente') {
    document.getElementById('viewCartBtn').classList.remove('hidden');
  }

  loadProducts();
});

logoutBtn.addEventListener('click', () => {
  sessionStorage.clear();
  window.location.href = 'login.html';  // Redirigir al login después de cerrar sesión
});

function loadProducts() {
  const token = sessionStorage.getItem('token');
  const res = fetch('/api/products', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(response => response.json()).then(products => {
    const productList = document.getElementById('productList');
    products.forEach(product => {
      const productDiv = document.createElement('div');
      productDiv.classList.add('product-card');
      productDiv.innerHTML = `
        <h3>${product.title}</h3>
        <p>${product.description}</p>
        <span>$${product.price}</span>
        <button onclick="addToCart(${JSON.stringify(product)})">Añadir al carrito</button>
      `;
      productList.appendChild(productDiv);
    });
  }).catch(error => {
    console.error('Error al cargar productos:', error);
  });
}

function addToCart(product) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.push(product);
  localStorage.setItem('cart', JSON.stringify(cart));
  alert('Producto añadido al carrito');
}
