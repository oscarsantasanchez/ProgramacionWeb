document.addEventListener('DOMContentLoaded', async () => {
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('userRole');

  // Solo Admin y Logística pueden acceder
  if (role !== 'Administrador' && role !== 'Logística') {
    window.location.href = 'index.html';
    return;
  }

  const productList = document.getElementById('productList');

  try {
    const res = await fetch('/api/products', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const products = await res.json();

    productList.innerHTML = '';

    products.forEach(product => {
      const div = document.createElement('div');
      div.classList.add('product-card');

      div.innerHTML = `
        <h3>${product.title}</h3>
        <p>${product.description}</p>
        <span>$${product.price}</span>

        <button class="edit-btn" data-id="${product._id}">Editar</button>
        <button class="delete-btn" data-id="${product._id}">Eliminar</button>
      `;

      productList.appendChild(div);
    });

    // Botón editar
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        window.location.href = `editProduct.html?id=${id}`;
      });
    });

    // Botón eliminar
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;

        if (!confirm('¿Seguro que deseas eliminar este producto?')) return;

        const delRes = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const delData = await delRes.json();

        if (delRes.ok) {
          alert('Producto eliminado');
          location.reload();
        } else {
          alert(delData.message || 'Error al eliminar el producto');
        }
      });
    });

  } catch (err) {
    console.error('Error cargando productos:', err);
    alert('Error al cargar productos');
  }
});

// Botón para crear producto
document.getElementById('addProductBtn').addEventListener('click', () => {
  window.location.href = 'createProduct.html';
});
