import { useQuery, gql } from '@apollo/client';  // Importar Apollo Client

// Definir la query de GraphQL para obtener productos
const GET_PRODUCTS = gql`
  query {
    products {
      id
      title
      description
      price
    }
  }
`;

document.addEventListener('DOMContentLoaded', () => {
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('userRole');
  const username = sessionStorage.getItem('username');
  
  // Si el token no está presente, redirigir a la página de login
  if (!token) {
    window.location.href = 'login.html';
    return;
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
  document.getElementById('loginBtn').classList.add('hidden');
  document.getElementById('registerBtn').classList.add('hidden');
  document.getElementById('userWelcome').classList.remove('hidden');
  document.getElementById('usernameDisplay').textContent = username;

  // Dependiendo del rol, mostrar diferentes botones
  if (role === 'Administrador') {
    document.getElementById('manageProductsBtn').classList.remove('hidden');
    document.getElementById('manageUsersBtn').classList.remove('hidden');
    document.getElementById('manageOrdersBtn').classList.remove('hidden');
    document.getElementById('createProductBtn').classList.remove('hidden');
    document.getElementById('viewOrdersBtn').classList.remove('hidden');
  } else if (role === 'Logística') {
    document.getElementById('manageProductsBtn').classList.remove('hidden');
    document.getElementById('manageOrdersBtn').classList.remove('hidden');
    document.getElementById('createProductBtn').classList.remove('hidden');
  } else if (role === 'Cliente') {
    document.getElementById('viewCartBtn').classList.remove('hidden');
  }

  loadProducts();

  // Si es Administrador, cargar los pedidos
  if (role === 'Administrador') {
    loadOrders();
  }
});

// Redirigir a la página de creación de productos cuando se hace clic en el botón
document.getElementById('createProductBtn').addEventListener('click', () => {
  window.location.href = 'createProduct.html';  // Redirigir a la página de crear producto
});

// Redirigir a la página de ver pedidos cuando se hace clic en el botón
document.getElementById('viewOrdersBtn').addEventListener('click', () => {
  window.location.href = 'viewOrders.html';  // Redirigir a la página de ver pedidos
});

// Redirigir a la página de ver carrito cuando se hace clic en el botón
document.getElementById('viewCartBtn').addEventListener('click', () => {
  window.location.href = 'checkout.html';  // Redirigir a la página de checkout (carrito)
});

logoutBtn.addEventListener('click', () => {
  sessionStorage.clear();
  window.location.href = 'login.html';  // Redirigir al login después de cerrar sesión
});

// Cargar los productos disponibles
function loadProducts() {
  const token = sessionStorage.getItem('token');
  fetch('/api/products', {
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

// Cargar los pedidos disponibles para Administradores
function loadOrders() {
  const token = sessionStorage.getItem('token');
  fetch('/api/orders', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(response => response.json()).then(orders => {
    const orderList = document.getElementById('orderList');
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
  }).catch(error => {
    console.error('Error al cargar pedidos:', error);
  });
}

// Ver detalles de un pedido específico
function viewOrderDetails(orderId) {
  const token = sessionStorage.getItem('token');
  fetch(`/api/orders/${orderId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(response => response.json())
  .then(order => {
    // Aquí se cargan los detalles del pedido
    const orderDetailsSection = document.getElementById('orderDetailsSection');
    orderDetailsSection.innerHTML = `
      <h3>Detalle del Pedido #${order._id}</h3>
      <p>Status: ${order.status}</p>
      <p>Total: $${order.total}</p>
      <p>Fecha: ${new Date(order.createdAt).toLocaleDateString()}</p>
      <h4>Productos:</h4>
      <ul>
        ${order.products.map(product => {
          return `
            <li>
              <strong>${product.productId.title}</strong><br>
              Descripción: ${product.productId.description}<br>
              Precio: $${product.productId.price}<br>
              Cantidad: ${product.quantity}<br>
              <img src="${product.productId.image}" alt="${product.productId.title}" style="max-width: 100px;">
            </li>
          `;
        }).join('')}
      </ul>
    `;
    orderDetailsSection.classList.remove('hidden');
  })
  .catch(error => {
    console.error('Error al cargar los detalles del pedido:', error);
  });
}

// Cerrar el detalle del pedido
function closeOrderDetails() {
  const orderDetailsSection = document.getElementById('orderDetailsSection');
  orderDetailsSection.classList.add('hidden');
}
