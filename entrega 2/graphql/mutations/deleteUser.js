const { GraphQLNonNull, GraphQLID } = require('graphql');
const UserType = require('../types/UserType');
const User = require('../../models/User');

const deleteUser = {
  type: UserType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) }
  },
  async resolve(_, { id }, context) {
    if (!context.user || context.user.role !== 'Administrador') {
      throw new Error('Acceso denegado');
    }

    return await User.findByIdAndDelete(id);
  }
};

module.exports = deleteUser;
