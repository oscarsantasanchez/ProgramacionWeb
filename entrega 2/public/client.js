import { useQuery, gql } from '@apollo/client';  // Importar Apollo Client

// Definir la query de GraphQL para obtener productos
const GET_PRODUCTS = gql`
  query {
    products {
      id
      title
      description
      price
      image
    }
  }
`;

document.addEventListener('DOMContentLoaded', () => {
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('userRole');
  const username = sessionStorage.getItem('username');

  // Redirigir al login si no hay token
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // Verificar expiración del token
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isExpired = payload.exp * 1000 < Date.now();
    if (isExpired) {
      sessionStorage.clear();
      window.location.href = 'login.html';
      return;
    }
  } catch (e) {
    console.error('❌ Error verificando token:', e);
    sessionStorage.clear();
    window.location.href = 'login.html';
    return;
  }

  // ===============================
  // Mostrar interfaz según rol
  // ===============================
  document.getElementById('authSection').classList.add('hidden');
  document.getElementById('productSection').classList.remove('hidden');
  document.getElementById('logoutBtn').classList.remove('hidden');
  document.getElementById('loginBtn').classList.add('hidden');
  document.getElementById('registerBtn').classList.add('hidden');
  document.getElementById('userWelcome').classList.remove('hidden');
  document.getElementById('usernameDisplay').textContent = username;

  // Botones según rol
  if (role === 'Administrador') {
    document.getElementById('manageProductsBtn').classList.remove('hidden');
    document.getElementById('manageUsersBtn').classList.remove('hidden');
    document.getElementById('manageOrdersBtn').classList.remove('hidden');
    document.getElementById('createProductBtn').classList.remove('hidden');
    document.getElementById('viewOrdersBtn').classList.remove('hidden');

    document.getElementById('manageProductsBtn').addEventListener('click', () => window.location.href = 'manageProducts.html');
    document.getElementById('manageUsersBtn').addEventListener('click', () => window.location.href = 'manageUsers.html');
    document.getElementById('manageOrdersBtn').addEventListener('click', () => window.location.href = 'manageOrders.html');
    document.getElementById('createProductBtn').addEventListener('click', () => window.location.href = 'createProduct.html');
    document.getElementById('viewOrdersBtn').addEventListener('click', () => window.location.href = 'order.html');
  } else if (role === 'Logística') {
    document.getElementById('manageProductsBtn').classList.remove('hidden');
    document.getElementById('manageOrdersBtn').classList.remove('hidden');
    document.getElementById('createProductBtn').classList.remove('hidden');

    document.getElementById('manageProductsBtn').addEventListener('click', () => window.location.href = 'manageProducts.html');
    document.getElementById('manageOrdersBtn').addEventListener('click', () => window.location.href = 'manageOrders.html');
    document.getElementById('createProductBtn').addEventListener('click', () => window.location.href = 'createProduct.html');
  } else if (role === 'Cliente') {
    document.getElementById('viewCartBtn').classList.remove('hidden');
    document.getElementById('viewCartBtn').addEventListener('click', () => window.location.href = 'order.html');
  }

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.clear();
    localStorage.removeItem('cart');
    window.location.href = 'login.html';
  });

  loadProducts();

  // Solo Admin puede cargar los pedidos
  if (role === 'Administrador') {
    loadOrders();
  }

  // ===============================
  // Botón "Inicio" para volver al panel principal
  // ===============================
  const homeBtn = document.getElementById('homeBtn');
  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      switch(role) {
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
});

// ===============================
// FUNCIONES DE PRODUCTOS
// ===============================
function loadProducts() {
  const token = sessionStorage.getItem('token');
  fetch('/api/products', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(response => response.json())
    .then(products => {
      const productList = document.getElementById('productList');
      productList.innerHTML = '';
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
    }).catch(error => console.error('Error al cargar productos:', error));
}

// ===============================
// FUNCIONES DE PEDIDOS (solo Admin)
// ===============================
function loadOrders() {
  const token = sessionStorage.getItem('token');
  fetch('/api/orders', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(response => response.json())
    .then(orders => {
      const orderList = document.getElementById('orderList');
      if (!orderList) return;
      orderList.innerHTML = '';
      orders.forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.classList.add('order-card');
        orderDiv.innerHTML = `
          <h3>Pedido #${order._id}</h3>
          <p>Status: ${order.status}</p>
          <p>Total: $${order.total}</p>
          <button onclick="viewOrderDetails('${order._id}')">Ver Detalle</button>
        `;
        orderList.appendChild(orderDiv);
      });
    }).catch(error => console.error('Error al cargar pedidos:', error));
}

function viewOrderDetails(orderId) {
  const token = sessionStorage.getItem('token');
  fetch(`/api/orders/${orderId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(res => res.json())
    .then(order => {
      const orderDetailsSection = document.getElementById('orderDetailsSection');
      if (!orderDetailsSection) return;
      orderDetailsSection.innerHTML = `
        <h3>Detalle del Pedido #${order._id}</h3>
        <p>Status: ${order.status}</p>
        <p>Total: $${order.total}</p>
        <p>Fecha: ${new Date(order.createdAt).toLocaleDateString()}</p>
        <h4>Productos:</h4>
        <ul>
          ${order.products.map(p => `
            <li>
              <strong>${p.productId.title}</strong><br>
              Descripción: ${p.productId.description}<br>
              Precio: $${p.productId.price}<br>
              Cantidad: ${p.quantity}<br>
              <img src="${p.productId.image}" alt="${p.productId.title}" style="max-width: 100px;">
            </li>
          `).join('')}
        </ul>
        <button onclick="closeOrderDetails()">Cerrar</button>
      `;
      orderDetailsSection.classList.remove('hidden');
    }).catch(error => console.error('Error al cargar detalles del pedido:', error));
}

function closeOrderDetails() {
  const orderDetailsSection = document.getElementById('orderDetailsSection');
  if (orderDetailsSection) orderDetailsSection.classList.add('hidden');
}
