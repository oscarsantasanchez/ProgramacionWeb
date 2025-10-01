const express = require('express');
const mongoose = require('mongoose'); //conexion con mongoose
const cors = require('cors');
const app = express();

//Ruta para la página principal
app.get('/', (res,req) => {
    res.send('Bienvenido a la página principal');
});

//conexión con la base de datos
mongoose.connect('mongodb://localhost:27017/productos')
    .then (() => console.log('Conectado a mongodb' ));
    .catch(error => console.error('Error al conectar con la bd'));

    const Producto = mongoose.model ('Producto', new mongoose. Schema ({
        nombre: String, 
        precio: Number, 
        descripcion: String
    }));

//ruta para productos
app.get('/productos', async (req, res) => {
    const productos= await Producto.find();
    res.send (productos);
});

//guardando un producto
app.post ('/productos', async (req, res) =>{
    const nuevoProducto = new Producto (req, body);
    await nuevoProducto, save();
    res, send (nuevoProducto);
});

app.listen(3000, () =>{
    console.log('Servidor corriendo en http://localhost:3000/');
})
