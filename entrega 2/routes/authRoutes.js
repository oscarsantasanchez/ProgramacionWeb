const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config');

const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'El correo ya está registrado.' });

    const user = new User({ username, email, password, role });
    await user.save();

    res.status(201).json({ message: 'Usuario registrado correctamente.' });
  } catch (err) {
    res.status(500).json({ message: 'Error al registrar usuario.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Credenciales inválidas.' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(400).json({ message: 'Contraseña incorrecta.' });

    // ✅ Token ahora incluye username
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: { username: user.username, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al iniciar sesión.' });
  }
});

module.exports = router;

