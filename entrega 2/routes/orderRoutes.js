const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');  // Asegúrate de importar el modelo User
const authenticateJWT = require('../middleware/authenticateJWT');
const authorizeRole = require('../middleware/authorizeRole');  // Middleware para verificar roles

const router = express.Router();

// Crear un nuevo pedido (requiere ser cliente)
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { products } = req.body; // Productos del carrito

    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'El carrito está vacío' });
    }

    // Calcular el total del pedido y verificar la cantidad de cada producto
    let total = 0;
    const productDetails = [];

    for (let product of products) {
      const productData = await Product.findById(product.productId);
      
      if (!productData) {
        return res.status(400).json({ message: `Producto con ID ${product.productId} no encontrado` });
      }

      // Verificar si hay suficiente cantidad en inventario
      if (product.quantity > productData.stock) {
        return res.status(400).json({ message: `No hay suficiente stock para el producto ${productData.title}` });
      }

      const price = productData.price;
      total += price * product.quantity;

      // Agregar detalle del producto en la orden
      productDetails.push({
        productId: product.productId,
        quantity: product.quantity,
        price,
      });
    }

    // Crear la orden
    const newOrder = new Order({
      user: req.user.id,
      products: productDetails,
      status: 'Pendiente', // Estado inicial
      total,
    });

    await newOrder.save();

    // Actualizar historial de pedidos del usuario
    await User.findByIdAndUpdate(req.user.id, { $push: { orderHistory: newOrder._id } });

    res.status(201).json(newOrder);
  } catch (err) {
    console.error('Error al crear el pedido:', err);
    res.status(500).json({ message: 'Error al crear el pedido' });
  }
});

// Obtener todos los pedidos (filtrados por estado si se proporciona)
router.get('/', authenticateJWT, authorizeRole('Administrador'), async (req, res) => {
  try {
    const { status } = req.query; // Obtener el estado desde los parámetros de consulta

    // Si se proporciona un estado, filtramos por él
    let query = {};
    if (status) {
      // Filtrar por estado Pendiente o Completado
      query.status = status;
    }

    const orders = await Order.find(query).populate('user', 'username email'); // Poblamos los detalles del usuario (nombre y correo)
    
    res.json(orders);
  } catch (err) {
    console.error('Error al obtener pedidos:', err);
    res.status(500).json({ message: 'Error al obtener los pedidos' });
  }
});

// Obtener un pedido específico (requiere autenticación)
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    // Obtener el pedido por ID, incluyendo detalles del usuario y productos
    const order = await Order.findById(req.params.id)
      .populate('user', 'username email')  // Poblamos la información del usuario (nombre y correo)
      .populate('products.productId', 'title description price image stock');  // Poblamos los detalles de los productos

    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Devolver el pedido con toda la información detallada
    res.json(order);
  } catch (err) {
    console.error('Error al obtener el pedido:', err);
    res.status(500).json({ message: 'Error al obtener el pedido' });
  }
});

module.exports = router;
