const { GraphQLNonNull, GraphQLString } = require('graphql');
const UserType = require('../types/UserType');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

const createUser = {
  type: UserType,
  args: {
    username: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
    role: { type: new GraphQLNonNull(GraphQLString) }
  },
  async resolve(_, { username, email, password, role }, context) {
    if (!context.user || context.user.role !== 'Administrador') {
      throw new Error('Acceso denegado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      role
    });

    return await user.save();
  }
};

module.exports = createUser;
