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
      `;
      ordersList.appendChild(orderDiv);
    });

  } catch (error) {
    console.error(error);
    alert('Error al cargar los pedidos.');
  }
});
