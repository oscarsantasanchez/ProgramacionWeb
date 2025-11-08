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

// POST crear producto (solo admin) - con imagen opcional en base64
router.post('/', authenticateJWT, checkRole('admin'), async (req, res) => {
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

    // Si se proporciona una imagen en base64
    if (image && imageType) {
      // Validar que el tipo de imagen sea válido
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(imageType)) {
        return res.status(400).json({ message: 'Tipo de imagen no válido' });
      }
      
      // Validar tamaño máximo (1MB)
      const base64Length = image.length - (image.indexOf(',') + 1);
      const padding = image.endsWith('==') ? 2 : image.endsWith('=') ? 1 : 0;
      const fileSize = (base64Length * 3) / 4 - padding;
      
      if (fileSize > 1048576) { // 1MB
        return res.status(400).json({ message: 'La imagen no puede ser mayor a 1MB' });
      }

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

// PUT actualizar producto (solo admin) - con imagen opcional
router.put('/:id', authenticateJWT, checkRole('admin'), async (req, res) => {
  try {
    const { title, description, price, image, imageType } = req.body;
    
    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    
    // Si se proporciona una nueva imagen
    if (image && imageType) {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(imageType)) {
        return res.status(400).json({ message: 'Tipo de imagen no válido' });
      }
      
      updateData.image = image;
      updateData.imageType = imageType;
    } else if (image === '') {
      // Si se envía image vacío, eliminar la imagen
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
