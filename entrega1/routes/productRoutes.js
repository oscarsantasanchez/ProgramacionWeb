const express = require('express');
const Product = require('../models/Product');
const authenticateJWT = require('../middleware/authenticateJWT');
const checkRole = require('../middleware/authorizeRole');

const router = express.Router();

// Obtener todos los productos (acceso público o autenticado)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los productos' });
  }
});

// Crear un producto (solo admin)
router.post('/', authenticateJWT, checkRole('admin'), async (req, res) => {
  try {
    const { title, description, price } = req.body;
    const newProduct = new Product({ title, description, price });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear el producto' });
  }
});

// Editar un producto (solo admin)
router.put('/:id', authenticateJWT, checkRole('admin'), async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProduct) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: 'Error al editar el producto' });
  }
});

// Eliminar un producto (solo admin)
router.delete('/:id', authenticateJWT, checkRole('admin'), async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado con éxito' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar el producto' });
  }
});

// Ver producto individual (todos pueden verlo)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el producto' });
  }
});

module.exports = router;