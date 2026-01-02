document.addEventListener('DOMContentLoaded', () => {
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('userRole');

  // Solo Admin y Logística pueden acceder
  if (role !== 'Administrador' && role !== 'Logística') {
    window.location.href = 'index.html';
    return;
  }

  const form = document.getElementById('createProductForm');
  const imageInput = document.getElementById('image');
  let imageBase64 = '';
  let imageType = '';

  // Convertir imagen a base64 automáticamente
  imageInput.addEventListener('change', () => {
    const file = imageInput.files?.[0];
    if (!file) return;

    imageType = file.type;

    const reader = new FileReader();
    reader.onload = () => {
      imageBase64 = reader.result;
    };
    reader.readAsDataURL(file);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const price = parseFloat(document.getElementById('price').value);

    if (!title || !price) {
      alert('El título y el precio son obligatorios.');
      return;
    }

    const body = {
      title,
      description,
      price,
      image: imageBase64,
      imageType
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.ok) {
        alert('Producto creado con éxito');
        window.location.href = 'manageProducts.html';
      } else {
        alert(data.message || 'Error al crear el producto');
      }

    } catch (err) {
      console.error('Error al crear producto:', err);
      alert('Error inesperado al crear el producto.');
    }
  });
});
