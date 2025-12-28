const express = require('express');
const Order = require('../models/Order');
const authenticateJWT = require('../middleware/authenticateJWT'); // Middleware para la autenticación

const router = express.Router();

// Obtener todos los pedidos (solo administradores)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. Solo los administradores pueden ver todos los pedidos.' });
    }
    const orders = await Order.find().populate('userId', 'username email');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los pedidos.' });
  }
});

// Obtener los pedidos de un usuario (usuario autenticado)
router.get('/my-orders', authenticateJWT, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).populate('products.productId', 'title price');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los pedidos del usuario.' });
  }
});

// Crear un nuevo pedido
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { products, total } = req.body;

    if (!products || !total) {
      return res.status(400).json({ message: 'Faltan productos o total en la solicitud.' });
    }

    const order = new Order({
      userId: req.user.id,
      products,
      total,
      status: 'pending'
    });

    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear el pedido.' });
  }
});

// Actualizar el estado de un pedido (solo admin)
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. Solo los administradores pueden actualizar el estado de un pedido.' });
    }

    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado.' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar el estado del pedido.' });
  }
});

module.exports = router;
