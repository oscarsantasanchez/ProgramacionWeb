// =========================
// VARIABLES
// =========================
let cart = JSON.parse(localStorage.getItem('cart')) || [];

const token = sessionStorage.getItem('token');
const role = sessionStorage.getItem('userRole');
const userId = sessionStorage.getItem('userId');

// =========================
// CARGAR CARRITO (solo Cliente)
// =========================
export function loadCart() {
  const cartSection = document.getElementById('cartSection');
  const cartItems = document.getElementById('cartItems');

  if (role !== 'Cliente') {
    cartSection.classList.add('hidden');
    return;
  }

  if (cart.length === 0) {
    cartSection.classList.add('hidden');
  } else {
    cartSection.classList.remove('hidden');
  }

  cartItems.innerHTML = '';

  cart.forEach(item => {
    const div = document.createElement('div');
    div.innerHTML = `${item.title} - $${item.price} x ${item.quantity}`;
    cartItems.appendChild(div);
  });
}

// =========================
// REALIZAR PEDIDO (solo Cliente)
// =========================
export async function placeOrder() {
  if (role !== 'Cliente') {
    alert('Solo los clientes pueden realizar pedidos.');
    return;
  }

  if (cart.length === 0) {
    alert('El carrito está vacío.');
    return;
  }

  const products = cart.map(item => ({
    productId: item.productId,
    quantity: item.quantity
  }));

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ products })
    });

    const data = await res.json();

    if (res.ok) {
      alert('Pedido realizado con éxito');
      cart = [];
      localStorage.setItem('cart', JSON.stringify([]));
      loadCart();
      loadOrders();
    } else {
      alert(data.message);
    }

  } catch (err) {
    console.error(err);
    alert('Error al realizar el pedido.');
  }
}

// =========================
// CARGAR PEDIDOS
// =========================
export async function loadOrders() {
  const ordersList = document.getElementById('ordersList');
  ordersList.innerHTML = '';

  let url = '/api/orders';

  // Cliente solo ve sus pedidos
  if (role === 'Cliente') {
    url = `/api/orders/user/${userId}`;
  }

  try {
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const orders = await res.json();

    if (orders.length === 0) {
      ordersList.innerHTML = '<p>No hay pedidos.</p>';
      return;
    }

    orders.forEach(order => {
      const div = document.createElement('div');
      div.classList.add('order-card');

      div.innerHTML = `
        <p><strong>Pedido #${order._id}</strong></p>
        <p>Estado: ${order.status}</p>
        <p>Total: $${order.total}</p>
      `;

      // Cambiar estado (Logística + Admin)
      if (role === 'Logística' || role === 'Administrador') {
        div.innerHTML += `
          <select data-id="${order._id}" class="statusSelect">
            <option value="Pendiente" ${order.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
            <option value="Completado" ${order.status === 'Completado' ? 'selected' : ''}>Completado</option>
          </select>
        `;
      }

      // Eliminar (solo Admin)
      if (role === 'Administrador') {
        div.innerHTML += `
          <button class="deleteBtn" data-id="${order._id}">Eliminar</button>
        `;
      }

      ordersList.appendChild(div);
    });

    // EVENTO CAMBIAR ESTADO
    document.querySelectorAll('.statusSelect').forEach(select => {
      select.addEventListener('change', async e => {
        const id = e.target.dataset.id;
        const status = e.target.value;

        await fetch(`/api/orders/${id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        });

        alert('Estado actualizado');
      });
    });

    // EVENTO ELIMINAR
    document.querySelectorAll('.deleteBtn').forEach(btn => {
      btn.addEventListener('click', async e => {
        const id = e.target.dataset.id;

        if (!confirm('¿Eliminar pedido?')) return;

        await fetch(`/api/orders/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        alert('Pedido eliminado');
        loadOrders();
      });
    });

  } catch (err) {
    console.error(err);
    ordersList.innerHTML = '<p>Error al cargar pedidos.</p>';
  }
}

// =========================
// INICIALIZACIÓN
// =========================
document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  loadOrders();

  const placeOrderBtn = document.getElementById('placeOrderBtn');
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', placeOrder);
  }
});
