document.addEventListener('DOMContentLoaded', () => {
  loadCart();
});

function loadCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartList = document.getElementById('cartList');
  let total = 0;
  
  cart.forEach(item => {
    const productDiv = document.createElement('div');
    productDiv.innerHTML = `
      <strong>${item.title}</strong>
      <p>Precio: $${item.price}</p>
      <p>Cantidad: ${item.quantity}</p>
    `;
    cartList.appendChild(productDiv);
    total += item.price * item.quantity;
  });
  
  const totalDiv = document.createElement('div');
  totalDiv.innerHTML = `<strong>Total: $${total}</strong>`;
  cartList.appendChild(totalDiv);
}

document.getElementById('finalizePurchaseBtn').addEventListener('click', async () => {
  const token = sessionStorage.getItem('token');
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ products: cart })
  });
  
  const data = await res.json();
  if (res.ok) {
    alert('Compra realizada con éxito');
    localStorage.removeItem('cart');
    window.location.href = 'index.html';
  } else {
    alert('Error al realizar la compra');
  }
});
