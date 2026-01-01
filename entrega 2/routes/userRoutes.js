const express = require('express');
const User = require('../models/User');
const authenticateJWT = require('../middleware/authenticateJWT');
const authorizeRole = require('../middleware/authorizeRole');

const router = express.Router();

// Obtener todos los usuarios (requiere ser SuperAdmin)
router.get('/', authenticateJWT, authorizeRole('Administrador'), async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Excluir contraseñas
    res.json(users);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ message: 'Error al obtener los usuarios' });
  }
});

// Crear un nuevo usuario (requiere ser SuperAdmin)
router.post('/', authenticateJWT, authorizeRole('Administrador'), async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Verificar si faltan datos
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Verificar si el correo ya está registrado
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'El correo ya está registrado' });

    // Siempre asignar el rol 'Cliente' a los nuevos usuarios
    const user = new User({ username, email, password, role: 'Cliente' });
    await user.save();

    res.status(201).json({ message: 'Usuario creado correctamente' });
  } catch (err) {
    console.error('Error al crear usuario:', err);
    res.status(500).json({ message: 'Error al crear el usuario' });
  }
});

// Actualizar un usuario (requiere ser SuperAdmin)
router.put('/:id', authenticateJWT, authorizeRole('Administrador'), async (req, res) => {
  try {
    const { username, email, role } = req.body;

    // Verificar si el rol intenta cambiar de 'Cliente' a otro rol
    if (role && role !== 'Cliente') {
      return res.status(400).json({ message: 'El rol no puede ser cambiado desde esta ruta. Solo se asigna "Cliente" por defecto.' });
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedUser) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json(updatedUser);
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ message: 'Error al actualizar el usuario' });
  }
});

// Eliminar un usuario (requiere ser SuperAdmin)
router.delete('/:id', authenticateJWT, authorizeRole('Administrador'), async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ message: 'Error al eliminar el usuario' });
  }
});

module.exports = router;
