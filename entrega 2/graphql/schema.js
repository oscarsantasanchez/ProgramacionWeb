const { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLInt, GraphQLList, GraphQLFloat, GraphQLID } = require('graphql');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

// Tipo Producto
const ProductType = new GraphQLObjectType({
  name: 'Product',
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    price: { type: GraphQLFloat },
    image: { type: GraphQLString }
  })
});

// Tipo Pedido
const OrderType = new GraphQLObjectType({
  name: 'Order',
  fields: () => ({
    id: { type: GraphQLID },
    userId: { type: GraphQLID },
    products: { type: new GraphQLList(ProductType) },
    total: { type: GraphQLFloat },
    status: { type: GraphQLString },
    createdAt: { type: GraphQLString }
  })
});

// Middleware para verificar el JWT
const authenticate = (context) => {
  const token = context.headers.authorization || '';
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    throw new Error('No autorizado');
  }
};

// Consultas
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    products: {
      type: new GraphQLList(ProductType),
      resolve(parent, args) {
        return Product.find();
      }
    },
    orders: {
      type: new GraphQLList(OrderType),
      resolve(parent, args) {
        return Order.find();
      }
    },
  }
});

// Mutaciones
const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addProduct: {
      type: ProductType,
      args: {
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        price: { type: GraphQLFloat },
        image: { type: GraphQLString }
      },
      resolve(parent, args, context) {
        const user = authenticate(context); // Verificación del usuario autenticado
        const product = new Product({
          title: args.title,
          description: args.description,
          price: args.price,
          image: args.image
        });
        return product.save();
      }
    },
    createOrder: {
      type: OrderType,
      args: {
        products: { type: new GraphQLList(GraphQLID) },  // Productos seleccionados
        total: { type: GraphQLFloat },
        status: { type: GraphQLString }
      },
      resolve(parent, args, context) {
        const user = authenticate(context); // Verificación del usuario autenticado
        const order = new Order({
          userId: user.id,
          products: args.products,
          total: args.total,
          status: args.status
        });
        return order.save();
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
