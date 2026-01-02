const { GraphQLList } = require('graphql');
const UserType = require('../types/UserType');
const User = require('../../models/User');

const usersQuery = {
  type: new GraphQLList(UserType),
  async resolve(_, __, context) {
    if (!context.user || context.user.role !== 'Administrador') {
      throw new Error('Acceso denegado');
    }

    return await User.find();
  }
};

module.exports = usersQuery;
