document.addEventListener('DOMContentLoaded', () => {
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('userRole');
  const username = sessionStorage.getItem('username');

  // ===============================
  // CONTROL DE SESIÓN
  // ===============================
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      sessionStorage.clear();
      window.location.href = 'login.html';
      return;
    }
  } catch (err) {
    console.error('Token inválido', err);
    sessionStorage.clear();
    window.location.href = 'login.html';
    return;
  }

  // ===============================
  // UI GENERAL
  // ===============================
  showIfExists('userWelcome');
  showIfExists('logoutBtn');
  hideIfExists('loginBtn');
  hideIfExists('registerBtn');
  hideIfExists('authSection');
  showIfExists('productSection');

  if (document.getElementById('usernameDisplay')) {
    document.getElementById('usernameDisplay').textContent = username;
  }

  // ===============================
  // BOTONES SEGÚN ROL
  // ===============================
  if (role === 'Administrador') {
    showAndBind('manageProductsBtn', 'manageProducts.html');
    showAndBind('manageUsersBtn', 'manageUsers.html');
    showAndBind('manageOrdersBtn', 'manageOrders.html');
    showAndBind('createProductBtn', 'createProduct.html');
    showAndBind('viewOrdersBtn', 'order.html');
    loadOrders();
  } else if (role === 'Logística') {
    showAndBind('manageProductsBtn', 'manageProducts.html');
    showAndBind('manageOrdersBtn', 'manageOrders.html');
    showAndBind('createProductBtn', 'createProduct.html');
  } else if (role === 'Cliente') {
    showAndBind('viewCartBtn', 'order.html');
  }

  // ===============================
  // BOTÓN INICIO (volver al panel del rol)
  // ===============================
  const homeBtn = document.getElementById('homeBtn');
  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      switch (role) {
        case 'Administrador':
          window.location.href = 'manageProducts.html';
          break;
        case 'Logística':
          window.location.href = 'manageOrders.html';
          break;
        case 'Cliente':
        default:
          window.location.href = 'index.html';
      }
    });
  }

  // ===============================
  // LOGOUT
  // ===============================
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.clear();
      localStorage.removeItem('cart');
      window.location.href = 'login.html';
    });
  }

  // ===============================
  // CARGAR PRODUCTOS
  // ===============================
  loadProducts();
});

// ===============================
// FUNCIONES UI
// ===============================
function showIfExists(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

function hideIfExists(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

function showAndBind(id, url) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('hidden');
  el.onclick = () => window.location.href = url;
}

// ===============================
// PRODUCTOS
// ===============================
function loadProducts() {
  const token = sessionStorage.getItem('token');
  const productList = document.getElementById('productList');
  if (!productList) return;

  fetch('/api/products', {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(products => {
      productList.innerHTML = '';
      products.forEach(product => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `
          <h3>${product.title}</h3>
          <p>${product.description}</p>
          <p><strong>${product.price} €</strong></p>
          <button class="addCartBtn">Añadir al carrito</button>
        `;
        productList.appendChild(div);

        // Añadir funcionalidad de carrito
        div.querySelector('.addCartBtn').addEventListener('click', () => {
          addToCart(product);
        });
      });
    })
    .catch(err => console.error('Error cargando productos', err));
}

// ===============================
// PEDIDOS (ADMIN)
// ===============================
function loadOrders() {
  const token = sessionStorage.getItem('token');
  const orderList = document.getElementById('orderList');
  if (!orderList) return;

  fetch('/api/orders', {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(orders => {
      orderList.innerHTML = '';
      orders.forEach(order => {
        const div = document.createElement('div');
        div.className = 'order-card';
        div.innerHTML = `
          <h3>Pedido #${order._id}</h3>
          <p>Estado: ${order.status}</p>
          <p>Total: ${order.total} €</p>
        `;
        orderList.appendChild(div);
      });
    })
    .catch(err => console.error('Error cargando pedidos', err));
}

// ===============================
// FUNCION GLOBAL PARA CARRITO
// ===============================
function addToCart(product) {
  const cartKey = `cart_${sessionStorage.getItem('userId')}`;
  let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
  
  // Si el producto ya existe, aumentar cantidad
  const existing = cart.find(p => p.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  localStorage.setItem(cartKey, JSON.stringify(cart));
  localStorage.setItem('cart', JSON.stringify(cart));
  alert(`Producto "${product.title}" añadido al carrito`);
}
