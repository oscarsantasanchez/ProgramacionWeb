document.addEventListener('DOMContentLoaded', () => {
  loadCart();
});

function loadCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartList = document.getElementById('cartList');
  let total = 0;

  // Limpiar la lista de productos en el carrito
  cartList.innerHTML = '';

  // Mostrar los productos en el carrito
  cart.forEach(item => {
    const productDiv = document.createElement('div');
    productDiv.innerHTML = `
      <strong>${item.title}</strong>
      <p>Precio: $${item.price}</p>
      <p>Cantidad: ${item.quantity}</p>
      <p>Subtotal: $${item.price * item.quantity}</p>
    `;
    cartList.appendChild(productDiv);
    total += item.price * item.quantity; // Calcular el precio total
  });

  // Mostrar el total del carrito
  const totalDiv = document.getElementById('totalPrice');
  totalDiv.innerHTML = `<strong>Total: $${total}</strong>`;

  // Mostrar el botón de finalizar compra solo si hay productos
  if (cart.length > 0) {
    document.getElementById('finalizePurchaseBtn').style.display = 'block';
  } else {
    document.getElementById('finalizePurchaseBtn').style.display = 'none';
  }
}

// Finalizar la compra y vaciar el carrito
document.getElementById('finalizePurchaseBtn').addEventListener('click', async () => {
  const token = sessionStorage.getItem('token');
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  if (cart.length === 0) {
    alert('El carrito está vacío');
    return;
  }

  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ products: cart })
  });

  const data = await res.json();
  if (res.ok) {
    alert('Compra realizada con éxito');
    localStorage.removeItem('cart'); // Limpiar el carrito después de la compra
    window.location.href = 'index.html'; // Redirigir al inicio
  } else {
    alert('Error al realizar la compra');
  }
});
