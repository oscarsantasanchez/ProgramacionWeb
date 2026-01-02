const { GraphQLNonNull, GraphQLID, GraphQLString } = require('graphql');
const UserType = require('../types/UserType');
const User = require('../../models/User');

const updateUserRole = {
  type: UserType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    role: { type: new GraphQLNonNull(GraphQLString) }
  },
  async resolve(_, { id, role }, context) {
    if (!context.user || context.user.role !== 'Administrador') {
      throw new Error('Acceso denegado');
    }

    const validRoles = ['Administrador', 'Logística', 'Cliente'];
    if (!validRoles.includes(role)) {
      throw new Error('Rol inválido');
    }

    return await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    );
  }
};

module.exports = updateUserRole;
