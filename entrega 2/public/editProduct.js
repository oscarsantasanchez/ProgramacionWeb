document.addEventListener('DOMContentLoaded', async () => {
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('userRole');

  // Solo Admin y Logística pueden acceder
  if (role !== 'Administrador' && role !== 'Logística') {
    window.location.href = 'index.html';
    return;
  }

  // Obtener ID del producto desde la URL
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  if (!productId) {
    alert('ID de producto no válido');
    window.location.href = 'manageProducts.html';
    return;
  }

  const titleInput = document.getElementById('title');
  const descriptionInput = document.getElementById('description');
  const priceInput = document.getElementById('price');
  const imageInput = document.getElementById('image');
  const previewImage = document.getElementById('previewImage');

  let imageBase64 = '';
  let imageType = '';

  // Cargar datos del producto
  try {
    const res = await fetch(`/api/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const products = await res.json();
    const product = products.find(p => p._id === productId);

    if (!product) {
      alert('Producto no encontrado');
      window.location.href = 'manageProducts.html';
      return;
    }

    // Rellenar formulario
    titleInput.value = product.title;
    descriptionInput.value = product.description;
    priceInput.value = product.price;

    if (product.image) {
      previewImage.src = product.image;
      previewImage.style.display = 'block';
    }

  } catch (err) {
    console.error('Error cargando producto:', err);
    alert('Error al cargar el producto');
  }

  // Convertir imagen a base64 si se selecciona una nueva
  imageInput.addEventListener('change', () => {
    const file = imageInput.files?.[0];
    if (!file) return;

    imageType = file.type;

    const reader = new FileReader();
    reader.onload = () => {
      imageBase64 = reader.result;
      previewImage.src = imageBase64;
      previewImage.style.display = 'block';
    };
    reader.readAsDataURL(file);
  });

  // Guardar cambios
  document.getElementById('editProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const body = {
      title: titleInput.value.trim(),
      description: descriptionInput.value.trim(),
      price: parseFloat(priceInput.value),
    };

    // Solo enviar imagen si se seleccionó una nueva
    if (imageBase64) {
      body.image = imageBase64;
      body.imageType = imageType;
    }

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.ok) {
        alert('Producto actualizado con éxito');
        window.location.href = 'manageProducts.html';
      } else {
        alert(data.message || 'Error al actualizar el producto');
      }

    } catch (err) {
      console.error('Error al actualizar producto:', err);
      alert('Error inesperado al actualizar el producto.');
    }
  });
});
