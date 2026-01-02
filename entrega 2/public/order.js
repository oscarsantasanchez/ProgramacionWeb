import { createOrder } from './graphql/client.js';

// Cargar carrito desde localStorage al iniciar
let cart = JSON.parse(localStorage.getItem('cart')) || [];

export async function loadCart() {
  const cartSection = document.getElementById('cartSection');
  const cartItems = document.getElementById('cartItems');
  
  if (cart.length === 0) {
    cartSection.classList.add('hidden');
  } else {
    cartSection.classList.remove('hidden');
  }

  cartItems.innerHTML = '';

  cart.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.innerHTML = `
      <span>${item.title}</span> - $${item.price} x ${item.quantity}
    `;
    cartItems.appendChild(itemDiv);
  });
}

export function addToCart(id, title, price) {
  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id, title, price, quantity: 1 });
  }

  // Guardar carrito por usuario
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    localStorage.setItem(`cart_${user.id}`, JSON.stringify(cart));
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  loadCart();
}

export async function placeOrder() {
  if (cart.length === 0) {
    alert('El carrito está vacío.');
    return;
  }

  // Obtener usuario logueado
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.id) {
    alert('Debes iniciar sesión para realizar un pedido.');
    return;
  }

  const userId = user.id;

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // El backend espera SOLO IDs de productos
  const productIds = cart.map(item => item.id);

  try {
    const order = await createOrder(userId, productIds, total);
    alert('Pedido realizado con éxito');

    // Vaciar carrito en memoria y en localStorage
    cart = [];
    localStorage.setItem(`cart_${user.id}`, JSON.stringify([]));
    localStorage.setItem('cart', JSON.stringify([]));

    loadCart();
  } catch (error) {
    console.error(error);
    alert('Hubo un problema al realizar el pedido. Intenta nuevamente.');
  }
}
