const { GraphQLObjectType, GraphQLString, GraphQLFloat, GraphQLID, GraphQLList } = require('graphql');
const ProductType = require('./ProductType');  // Para los productos asociados a la orden

const OrderType = new GraphQLObjectType({
  name: 'Order',
  fields: () => ({
    id: { type: GraphQLID },
    user: { type: GraphQLID },  // ID del usuario que hizo el pedido
    products: { type: new GraphQLList(ProductType) },  // Lista de productos en el pedido
    status: { type: GraphQLString },
    total: { type: GraphQLFloat },
    createdAt: { type: GraphQLString },
  }),
});

module.exports = OrderType;
