const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  price:       { type: Number, required: true },
  image:       { type: String, default: '' }, // Almacenaremos la imagen en base64
  imageType:   { type: String, default: '' }, // Tipo de imagen: 'image/jpeg', 'image/png', etc.
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);


