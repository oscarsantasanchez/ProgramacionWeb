import { client } from './graphql/client.js';
import { gql } from '@apollo/client';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Query GraphQL para obtener productos
    const { data } = await client.query({
      query: gql`
        query GetProducts {
          products {
            id
            title
            description
            price
            image
            stock
          }
        }
      `
    });

    const products = data.products;
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

  } catch (error) {
    console.error(error);
    alert('Error al cargar los productos.');
  }
});

document.getElementById('addProductBtn').addEventListener('click', () => {
  window.location.href = 'addProduct.html';
});
