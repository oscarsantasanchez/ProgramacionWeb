const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const authenticateJWT = require('../middleware/authenticateJWT');
const authorizeRole = require('../middleware/authorizeRole');

const router = express.Router();

/* ============================================================
   1. CREAR PEDIDO (solo Cliente)
============================================================ */
router.post('/', authenticateJWT, authorizeRole('Cliente'), async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'El carrito está vacío' });
    }

    let total = 0;
    const productDetails = [];

    for (let item of products) {
      const productData = await Product.findById(item.productId);

      if (!productData) {
        return res.status(400).json({ message: `Producto con ID ${item.productId} no encontrado` });
      }

      const price = productData.price;
      total += price * item.quantity;

      productDetails.push({
        productId: item.productId,
        quantity: item.quantity,
        price
      });
    }

    const newOrder = new Order({
      user: req.user.id,
      products: productDetails,
      status: 'Pendiente',
      total
    });

    await newOrder.save();

    await User.findByIdAndUpdate(req.user.id, { $push: { orderHistory: newOrder._id } });

    res.status(201).json(newOrder);

  } catch (err) {
    console.error('Error al crear pedido:', err);
    res.status(500).json({ message: 'Error al crear el pedido' });
  }
});

/* ============================================================
   2. OBTENER TODOS LOS PEDIDOS (Admin + Logística)
============================================================ */
router.get('/', authenticateJWT, authorizeRole('Administrador', 'Logística'), async (req, res) => {
  try {
    const { status } = req.query;

    const query = status ? { status } : {};

    const orders = await Order.find(query)
      .populate('user', 'username email')
      .populate('products.productId', 'title price image');

    res.json(orders);

  } catch (err) {
    console.error('Error al obtener pedidos:', err);
    res.status(500).json({ message: 'Error al obtener los pedidos' });
  }
});

/* ============================================================
   3. OBTENER UN PEDIDO POR ID
   - Cliente: solo si es suyo
   - Logística/Admin: cualquiera
============================================================ */
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'username email')
      .populate('products.productId', 'title description price image');

    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Cliente solo puede ver sus pedidos
    if (req.user.role === 'Cliente' && order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permiso para ver este pedido' });
    }

    res.json(order);

  } catch (err) {
    console.error('Error al obtener pedido:', err);
    res.status(500).json({ message: 'Error al obtener el pedido' });
  }
});

/* ============================================================
   4. CAMBIAR ESTADO DEL PEDIDO (Admin + Logística)
============================================================ */
router.put('/:id/status', authenticateJWT, authorizeRole('Administrador', 'Logística'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Pendiente', 'Completado'].includes(status)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    res.json(updated);

  } catch (err) {
    console.error('Error al actualizar estado:', err);
    res.status(500).json({ message: 'Error al actualizar el estado del pedido' });
  }
});

/* ============================================================
   5. ELIMINAR PEDIDO (solo Admin)
============================================================ */
router.delete('/:id', authenticateJWT, authorizeRole('Administrador'), async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    res.json({ message: 'Pedido eliminado correctamente' });

  } catch (err) {
    console.error('Error al eliminar pedido:', err);
    res.status(500).json({ message: 'Error al eliminar el pedido' });
  }
});

module.exports = router;
