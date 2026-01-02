document.addEventListener('DOMContentLoaded', () => {
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('userRole');
  
  // Verificar si el rol es Admin o Logística para acceder a esta página
  if (role !== 'Administrador' && role !== 'Logística') {
    window.location.href = 'index.html'; // Redirigir al inicio si no es Admin ni Logística
  }
  
  document.getElementById('createProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const price = parseFloat(document.getElementById('price').value);
    const image = document.getElementById('image').value;

    // Enviar la solicitud para crear el producto
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description, price, image })
    });

    const data = await res.json();
    
    if (res.ok) {
      alert('Producto creado con éxito');
      window.location.href = 'index.html';  // Redirigir al inicio después de crear el producto
    } else {
      alert(data.message || 'Error al crear el producto');
    }
  });
});
