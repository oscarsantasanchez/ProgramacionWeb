const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const authenticateJWT = require('../middleware/authenticateJWT');
const authorizeRole = require('../middleware/authorizeRole');

const router = express.Router();

// Obtener todos los pedidos (requiere autenticación y puede ser visto por SuperAdmin o Logística)
router.get('/', authenticateJWT, authorizeRole('Administrador'), async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'username email').populate('products.productId', 'title price');
    res.json(orders);
  } catch (err) {
    console.error('Error al obtener pedidos:', err);
    res.status(500).json({ message: 'Error al obtener los pedidos' });
  }
});

// Crear un nuevo pedido (requiere ser cliente, ya que el cliente realiza el pedido)
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'No se han añadido productos al pedido' });
    }

    // Calcular el total
    let total = 0;
    const productDetails = [];
    for (let product of products) {
      const productData = await Product.findById(product.productId);
      if (!productData) {
        return res.status(400).json({ message: `Producto con ID ${product.productId} no encontrado` });
      }
      const price = productData.price;
      total += price * product.quantity;
      productDetails.push({ productId: product.productId, quantity: product.quantity, price });
    }

    const newOrder = new Order({
      user: req.user.id,
      products: productDetails,
      status: 'pending', // Estado inicial
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

// Actualizar el estado de un pedido (requiere ser SuperAdmin o Logística)
router.put('/:id', authenticateJWT, authorizeRole('Administrador'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['pending', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updatedOrder) return res.status(404).json({ message: 'Pedido no encontrado' });

    res.json(updatedOrder);
  } catch (err) {
    console.error('Error al actualizar pedido:', err);
    res.status(500).json({ message: 'Error al actualizar el pedido' });
  }
});

// Eliminar un pedido (requiere ser SuperAdmin)
router.delete('/:id', authenticateJWT, authorizeRole('Administrador'), async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return res.status(404).json({ message: 'Pedido no encontrado' });
    res.json({ message: 'Pedido eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar pedido:', err);
    res.status(500).json({ message: 'Error al eliminar el pedido' });
  }
});

module.exports = router;
