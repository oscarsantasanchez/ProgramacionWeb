const express = require('express');
const User = require('../models/User');
const authenticateJWT = require('../middleware/authenticateJWT');
const authorizeRole = require('../middleware/authorizeRole');  // Middleware para verificar roles

const router = express.Router();

// Obtener todos los usuarios (solo Admin puede acceder)
router.get('/', authenticateJWT, authorizeRole('Administrador'), async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Excluimos la contraseña en la respuesta
    res.json(users);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ message: 'Error al obtener los usuarios' });
  }
});

// Crear un nuevo usuario (solo Admin puede acceder)
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

// Actualizar un usuario (solo Admin puede acceder)
router.put('/:id', authenticateJWT, authorizeRole('Administrador'), async (req, res) => {
  try {
    const { username, email, role } = req.body;

    // Validar el rol solo si es uno de los roles permitidos
    if (role && !['Administrador', 'Logística', 'Cliente'].includes(role)) {
      return res.status(400).json({ message: 'Rol inválido. Solo se permite "Administrador", "Logística" o "Cliente".' });
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (role) updateData.role = role;

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedUser) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json(updatedUser);
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ message: 'Error al actualizar el usuario' });
  }
});

// Eliminar un usuario (solo Admin puede acceder)
router.delete('/:id', authenticateJWT, authorizeRole('Administrador'), async (req, res) => {
  try {
    // No permitir eliminar el usuario que está realizando la solicitud (preventivo)
    if (req.user.id === req.params.id) {
      return res.status(403).json({ message: 'No puedes eliminar tu propio usuario.' });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ message: 'Error al eliminar el usuario' });
  }
});

module.exports = router;
