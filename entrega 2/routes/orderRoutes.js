const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');  // Asegúrate de importar el modelo User
const authenticateJWT = require('../middleware/authenticateJWT');

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

module.exports = router;
