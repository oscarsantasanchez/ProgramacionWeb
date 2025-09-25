const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");

app.use(cookieParser());

app.get("/", (req, res) => {
    let intVeces = (req.cookies.veces) ? (parseInt(req.cookies.veces) + 1) : 1; //es un condicional, la interrogacion = If  : else
    res.cookie("veces", intVeces, { maxAge: (Date.now() + 100000) });
    res.send("visitas:" + intVeces.toString());
})


app.use((req, res, next) => {
    res.send(404, "recurso no encontrado"); // termina
});

app.listen(8080, () => {
    console.log('servidor funcionando en puerto 8080');
})