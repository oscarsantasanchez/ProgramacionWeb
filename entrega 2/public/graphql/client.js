import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:3000/graphql',  // Asegúrate de que este es el URI correcto de tu servidor GraphQL
  cache: new InMemoryCache()
});

// Función para cargar productos desde GraphQL
export async function getProducts() {
  const { data } = await client.query({
    query: gql`
      query GetProducts {
        products {
          id
          title
          description
          price
        }
      }
    `
  });
  return data.products;
}

// Función para crear un pedido
export async function createOrder(products, total) {
  const { data } = await client.mutate({
    mutation: gql`
      mutation CreateOrder($products: [ID!]!, $total: Float!) {
        createOrder(products: $products, total: $total, status: "pending") {
          id
          userId
          products {
            productId
            quantity
          }
          total
          status
        }
      }
    `,
    variables: {
      products,
      total
    }
  });
  return data.createOrder;
}
