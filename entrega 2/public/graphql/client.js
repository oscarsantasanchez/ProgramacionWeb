import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:3000/graphql',
  cache: new InMemoryCache()
});

// Obtener productos desde GraphQL
export async function getProducts() {
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
  return data.products;
}

// Crear pedido usando la mutation addOrder del backend
export async function createOrder(userId, products, total) {
  const { data } = await client.mutate({
    mutation: gql`
      mutation AddOrder($userId: ID!, $products: [String!]!, $total: Float!) {
        addOrder(userId: $userId, products: $products, total: $total, status: "Pendiente") {
          id
          user
          status
          total
          createdAt
        }
      }
    `,
    variables: {
      userId,
      products, // lista de IDs de productos
      total
    }
  });

  return data.addOrder;
}
