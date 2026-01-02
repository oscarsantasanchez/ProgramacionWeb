import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

// Configurar el enlace de Apollo Client para conectar con el servidor GraphQL
const client = new ApolloClient({
  link: new HttpLink({
    uri: 'http://localhost:3000/graphql', // Aquí va la URL de tu servidor GraphQL
  }),
  cache: new InMemoryCache(),  // Usamos un caché en memoria para Apollo Client
});

export default client;
