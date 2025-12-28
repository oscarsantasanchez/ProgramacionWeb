import { createOrder } from './graphql/client.js';  // Asegúrate de que esta función esté correctamente importada
let cart = [];

export async function loadCart() {
  // Si el carrito está vacío, podemos ocultar la sección de pedidos
  const cartSection = document.getElementById('cartSection');
  const cartItems = document.getElementById('cartItems');
  
  if (cart.length === 0) {
    cartSection.classList.add('hidden');
  } else {
    cartSection.classList.remove('hidden');
  }

  cartItems.innerHTML = ''; // Limpiar la lista de productos actuales en el carrito

  cart.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.innerHTML = `
      <span>${item.title}</span> - $${item.price} x ${item.quantity}
    `;
    cartItems.appendChild(itemDiv);
  });
}

// Función para añadir productos al carrito
export function addToCart(id, title, price) {
  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.quantity += 1;  // Si el producto ya está en el carrito, incrementamos la cantidad
  } else {
    cart.push({ id, title, price, quantity: 1 });
  }
  loadCart();
}

// Función para realizar el pedido
export async function placeOrder() {
  if (cart.length === 0) {
    alert('El carrito está vacío.');
    return;
  }

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const productIds = cart.map(item => item.id);

  try {
    const order = await createOrder(productIds, total);
    alert('Pedido realizado con éxito');
    cart = [];  // Vaciar el carrito después de realizar el pedido
    loadCart();
  } catch (error) {
    alert('Hubo un problema al realizar el pedido. Intenta nuevamente.');
  }
}
