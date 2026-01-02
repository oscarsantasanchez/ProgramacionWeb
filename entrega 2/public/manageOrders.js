import { client } from './graphql/client.js';
import { gql } from '@apollo/client';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Query GraphQL para obtener pedidos
    const { data } = await client.query({
      query: gql`
        query GetOrders {
          orders {
            id
            status
            total
            createdAt
          }
        }
      `
    });

    const orders = data.orders;
    const ordersList = document.getElementById('ordersList');

    orders.forEach(order => {
      const orderDiv = document.createElement('div');
      orderDiv.innerHTML = `
        <h3>Pedido #${order.id}</h3>
        <p>Estado: ${order.status}</p>
        <p>Total: $${order.total}</p>
        <p>Fecha: ${new Date(order.createdAt).toLocaleString()}</p>
        <button onclick="viewOrderDetails('${order.id}')">Ver Detalle</button>
      `;
      ordersList.appendChild(orderDiv);
    });

  } catch (error) {
    console.error(error);
    alert('Error al cargar los pedidos.');
  }
});

// 🔥 FUNCIÓN PARA VER DETALLE DEL PEDIDO (productos completos)
window.viewOrderDetails = async function(orderId) {
  try {
    const { data } = await client.query({
      query: gql`
        query GetOrder($id: ID!) {
          order(id: $id) {
            id
            status
            total
            createdAt
            products {
              quantity
              product {
                id
                title
                description
                price
                image
              }
            }
          }
        }
      `,
      variables: { id: orderId }
    });

    const order = data.order;

    const orderDetailsSection = document.getElementById('orderDetailsSection');

    orderDetailsSection.innerHTML = `
      <h3>Detalle del Pedido #${order.id}</h3>
      <p><strong>Estado:</strong> ${order.status}</p>
      <p><strong>Total:</strong> $${order.total}</p>
      <p><strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleString()}</p>

      <h4>Productos:</h4>
      <ul>
        ${order.products.map(p => `
          <li style="margin-bottom: 15px;">
            <strong>${p.product.title}</strong><br>
            ${p.product.description}<br>
            <strong>Precio:</strong> $${p.product.price}<br>
            <strong>Cantidad:</strong> ${p.quantity}<br>
            <img src="${p.product.image}" alt="${p.product.title}" style="max-width: 100px; margin-top: 5px;">
          </li>
        `).join('')}
      </ul>

      <button onclick="closeOrderDetails()">Cerrar</button>
    `;

    orderDetailsSection.classList.remove('hidden');

  } catch (error) {
    console.error(error);
    alert('Error al cargar el detalle del pedido.');
  }
};

// 🔥 FUNCIÓN PARA CERRAR DETALLE
window.closeOrderDetails = function() {
  document.getElementById('orderDetailsSection').classList.add('hidden');
};
