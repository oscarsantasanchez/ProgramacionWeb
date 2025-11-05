const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const config = require('../config');

const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe.' });
    }

    const user = new User({
      username,
      email,
      password,
      role: role || 'user'
    });

    await user.save();
    res.status(201).json({ message: 'Usuario registrado con éxito.' });
  } catch (err) {
    res.status(500).json({ message: 'Error al registrar el usuario.', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta.' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      config.jwtSecret,
      { expiresIn: '2h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error en el login.', error: err.message });
  }
});

module.exports = router;