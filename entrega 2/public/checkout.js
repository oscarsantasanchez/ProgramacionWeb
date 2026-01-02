document.addEventListener('DOMContentLoaded', () => {
  // Obtener el carrito del localStorage
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Calcular el total del carrito
  const totalAmount = cart.reduce((total, product) => total + product.price * product.quantity, 0);
  
  // Mostrar el total en la página
  document.getElementById('totalAmount').textContent = totalAmount.toFixed(2);

  // Mostrar los productos en el carrito
  const cartItemsDiv = document.getElementById('cartItems');
  cart.forEach(product => {
    const productDiv = document.createElement('div');
    productDiv.classList.add('cart-item');
    productDiv.innerHTML = `
      <h4>${product.title}</h4>
      <p>${product.description}</p>
      <span>Cantidad: ${product.quantity}</span>
      <span>Precio unitario: $${product.price}</span>
      <span>Total: $${(product.price * product.quantity).toFixed(2)}</span>
    `;
    cartItemsDiv.appendChild(productDiv);
  });

  // Lógica para finalizar la compra
  document.getElementById('checkoutBtn').addEventListener('click', () => {
    // Obtener el ID del usuario (suponiendo que lo guardaste en sessionStorage)
    const userId = sessionStorage.getItem('userId');
    
    // Crear un array con los IDs de los productos del carrito
    const productIds = cart.map(product => product.id);
    
    // Calcular el total del carrito (esto ya se hizo antes, pero lo usamos aquí también)
    const total = totalAmount;

    // Verificar que el usuario está logueado
    if (!userId) {
      alert('Por favor, inicia sesión para realizar la compra');
      return;
    }

    // Usar Apollo Client para realizar la mutación de crear un pedido
    const { useMutation, gql } = window.ApolloClient; // Usar Apollo Client directamente en el navegador
    const CREATE_ORDER = gql`
      mutation CreateOrder($userId: ID!, $products: [String!]!, $total: Float!, $status: String!) {
        addOrder(userId: $userId, products: $products, total: $total, status: $status) {
          id
          total
          status
        }
      }
    `;
    
    const [createOrder] = useMutation(CREATE_ORDER);
    
    createOrder({
      variables: {
        userId,
        products: productIds,
        total,
        status: 'Pendiente'  // Asignar estado inicial de "Pendiente"
      }
    }).then(() => {
      // Vaciar el carrito después de crear el pedido
      localStorage.removeItem('cart');
      alert('Compra realizada con éxito');
      window.location.href = 'index.html';  // Redirigir al inicio después de completar la compra
    }).catch(err => {
      console.error('Error al crear el pedido:', err);
      alert('Hubo un problema al realizar la compra');
    });
  });
});
