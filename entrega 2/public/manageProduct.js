document.addEventListener('DOMContentLoaded', async () => {
  const token = sessionStorage.getItem('token');
  const res = await fetch('/api/products', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const products = await res.json();
  const productList = document.getElementById('productList');
  products.forEach(product => {
    const productDiv = document.createElement('div');
    productDiv.innerHTML = `
      <h3>${product.title}</h3>
      <p>${product.description}</p>
      <span>$${product.price}</span>
      <button>Editar</button>
      <button>Eliminar</button>
    `;
    productList.appendChild(productDiv);
  });
});

document.getElementById('addProductBtn').addEventListener('click', () => {
  window.location.href = 'addProduct.html';  // Redirige a la página de añadir producto
});
