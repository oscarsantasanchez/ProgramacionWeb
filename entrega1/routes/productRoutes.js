const express = require('express');
const Product = require('../models/Product');
const authenticateJWT = require('../middleware/authenticateJWT');
const checkRole = require('../middleware/authorizeRole');

const router = express.Router();

// GET todos los productos (requiere token)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).json({ message: 'Error al obtener los productos' });
  }
});

// POST crear producto (solo admin)
router.post('/', authenticateJWT, checkRole('admin'), async (req, res) => {
  try {
    const { title, description, price } = req.body;
    const newProduct = new Product({ 
      title, 
      description, 
      price,
      createdBy: req.user.id
    });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Error al crear producto:', err);
    res.status(500).json({ message: 'Error al crear el producto' });
  }
});

// PUT actualizar producto (solo admin)
router.put('/:id', authenticateJWT, checkRole('admin'), async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProduct) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(updatedProduct);
  } catch (err) {
    console.error('Error al actualizar producto:', err);
    res.status(500).json({ message: 'Error al editar el producto' });
  }
});

// DELETE producto (solo admin)
router.delete('/:id', authenticateJWT, checkRole('admin'), async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado con éxito' });
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    res.status(500).json({ message: 'Error al eliminar el producto' });
  }
});

// GET producto individual
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(product);
  } catch (err) {
    console.error('Error al obtener producto:', err);
    res.status(500).json({ message: 'Error al obtener el producto' });
  }
});

module.exports = router;
