const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLList,
  GraphQLID,
  GraphQLFloat,
  GraphQLNonNull
} = require('graphql');

// Tipos
const ProductType = require('./types/ProductType');
const OrderType = require('./types/OrderType');
const UserType = require('./types/UserType');
const ProductOrderType = require('./types/ProductOrderType');

// Modelos
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// ===============================
// QUERIES
// ===============================

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    // Obtener todos los productos
    products: {
      type: new GraphQLList(ProductType),
      resolve() {
        return Product.find();
      }
    },

    // Obtener pedidos con filtro opcional por estado
    orders: {
      type: new GraphQLList(OrderType),
      args: {
        status: { type: GraphQLString }
      },
      async resolve(_, { status }) {
        const filter = status ? { status } : {};
        const orders = await Order.find(filter);

        return Promise.all(
          orders.map(async order => ({
            ...order._doc,
            products: await Promise.all(
              order.products.map(async p => {
                const product = await Product.findById(p.productId);
                return {
                  product,
                  quantity: p.quantity
                };
              })
            )
          }))
        );
      }
    },

    // Obtener un pedido por ID (con productos completos)
    order: {
      type: OrderType,
      args: { id: { type: GraphQLID } },
      async resolve(_, { id }) {
        const order = await Order.findById(id);

        return {
          ...order._doc,
          products: await Promise.all(
            order.products.map(async p => {
              const product = await Product.findById(p.productId);
              return {
                product,
                quantity: p.quantity
              };
            })
          )
        };
      }
    },

    // Obtener un usuario por ID
    user: {
      type: UserType,
      args: { id: { type: GraphQLID } },
      resolve(_, { id }) {
        return User.findById(id);
      }
    },

    // Obtener todos los usuarios (solo admin)
    users: {
      type: new GraphQLList(UserType),
      async resolve(_, __, context) {
        if (!context.user || context.user.role !== 'Administrador') {
          throw new Error('Acceso denegado');
        }
        return User.find();
      }
    }
  }
});

// ===============================
// MUTATIONS
// ===============================

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    // Crear pedido (tu código original)
    addOrder: {
      type: OrderType,
      args: {
        userId: { type: GraphQLID },
        products: { type: new GraphQLList(GraphQLString) },
        total: { type: GraphQLFloat },
        status: { type: GraphQLString }
      },
      resolve(_, args) {
        const order = new Order({
          user: args.userId,
          products: args.products,
          total: args.total,
          status: args.status
        });
        return order.save();
      }
    },

    // Crear usuario (solo admin)
    createUser: {
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

        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
          username,
          email,
          password: hashedPassword,
          role
        });

        return user.save();
      }
    },

    // Actualizar rol del usuario
    updateUserRole: {
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

        return User.findByIdAndUpdate(id, { role }, { new: true });
      }
    },

    // Eliminar usuario
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      async resolve(_, { id }, context) {
        if (!context.user || context.user.role !== 'Administrador') {
          throw new Error('Acceso denegado');
        }

        return User.findByIdAndDelete(id);
      }
    }
  }
});

// ===============================
// EXPORTAR SCHEMA
// ===============================

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
