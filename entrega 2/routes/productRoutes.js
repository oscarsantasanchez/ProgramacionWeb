const express = require('express');
const Product = require('../models/Product');
const authenticateJWT = require('../middleware/authenticateJWT');
const authorizeRole = require('../middleware/authorizeRole');

const router = express.Router();

// Obtener todos los productos (requiere autenticación)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).json({ message: 'Error al obtener los productos' });
  }
});

// Crear un nuevo producto (requiere ser SuperAdmin)
router.post('/', authenticateJWT, authorizeRole('Administrador'), async (req, res) => {
  try {
    const { title, description, price, image, imageType } = req.body;

    // Validar campos requeridos
    if (!title || !price) {
      return res.status(400).json({ message: 'Título y precio son requeridos' });
    }

    const productData = {
      title,
      description: description || '',
      price: parseFloat(price),
      createdBy: req.user.id
    };

    if (image && imageType) {
      productData.image = image;
      productData.imageType = imageType;
    }

    const newProduct = new Product(productData);
    await newProduct.save();

    console.log('✅ Producto creado:', newProduct.title);
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Error al crear producto:', err);
    res.status(500).json({ message: 'Error al crear el producto: ' + err.message });
  }
});

// Actualizar un producto (requiere ser SuperAdmin)
router.put('/:id', authenticateJWT, authorizeRole('Administrador'), async (req, res) => {
  try {
    const { title, description, price, image, imageType } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price) updateData.price = parseFloat(price);

    if (image && imageType) {
      updateData.image = image;
      updateData.imageType = imageType;
    } else if (image === '') {
      updateData.image = '';
      updateData.imageType = '';
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedProduct) return res.status(404).json({ message: 'Producto no encontrado' });

    res.json(updatedProduct);
  } catch (err) {
    console.error('Error al actualizar producto:', err);
    res.status(500).json({ message: 'Error al editar el producto' });
  }
});

// Eliminar un producto (requiere ser SuperAdmin)
router.delete('/:id', authenticateJWT, authorizeRole('Administrador'), async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado con éxito' });
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    res.status(500).json({ message: 'Error al eliminar el producto' });
  }
});

module.exports = router;
