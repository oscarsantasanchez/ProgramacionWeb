const { GraphQLObjectType, GraphQLString, GraphQLFloat, GraphQLID, GraphQLInt } = require('graphql');

const ProductType = new GraphQLObjectType({
  name: 'Product',
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    price: { type: GraphQLFloat },
    image: { type: GraphQLString },
    stock: { type: GraphQLInt },
  }),
});

module.exports = ProductType;
