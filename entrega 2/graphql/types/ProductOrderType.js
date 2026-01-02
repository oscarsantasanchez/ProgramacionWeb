const { GraphQLObjectType, GraphQLInt } = require('graphql');
const ProductType = require('./ProductType');

const ProductOrderType = new GraphQLObjectType({
  name: 'ProductOrder',
  fields: () => ({
    product: { type: ProductType },
    quantity: { type: GraphQLInt }
  })
});

module.exports = ProductOrderType;
