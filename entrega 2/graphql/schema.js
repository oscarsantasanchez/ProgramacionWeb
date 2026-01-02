const { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLInt, GraphQLList, GraphQLID, GraphQLFloat } = require('graphql');
const ProductType = require('./types/ProductType');  // Tipo de producto
const OrderType = require('./types/OrderType');      // Tipo de pedido
const UserType = require('./types/UserType');        // Tipo de usuario
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// Query: Obtener datos
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    products: {
      type: new GraphQLList(ProductType),
      resolve(parent, args) {
        return Product.find();  // Obtener todos los productos
      },
    },
    orders: {
      type: new GraphQLList(OrderType),
      resolve(parent, args) {
        return Order.find();  // Obtener todos los pedidos
      },
    },
    user: {
      type: UserType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return User.findById(args.id);  // Obtener un usuario por ID
      },
    },
    order: {
      type: OrderType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return Order.findById(args.id);  // Obtener un pedido por ID
      },
    },
  },
});

// Mutation: Crear pedidos
const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addOrder: {
      type: OrderType,
      args: {
        userId: { type: GraphQLID },
        products: {
          type: new GraphQLList(GraphQLString), // Lista de IDs de productos
        },
        total: { type: GraphQLFloat },
        status: { type: GraphQLString },
      },
      resolve(parent, args) {
        const order = new Order({
          user: args.userId,
          products: args.products,
          total: args.total,
          status: args.status,
        });
        return order.save();  // Crear un nuevo pedido
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
