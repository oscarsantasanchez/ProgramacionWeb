const http=require('hhtp');

const server= http.createServer((req,res) => {
   if (req.url =='/') {
    res.statusCode=200; //codigo http de exito
    res.setHeader('Content-Type', 'text/plain'); //Tipo de respuesta
    res.end('Bienvenido al servidor\n') //respuesta del servidor
   }else if (req.url == '/about'){
    res.statusCode=200; //codigo http de exito
    res.setHeader('Content-Type', 'text/plain'); //Tipo de respuesta
    res.end('Este es un servidor básico\n') //respuesta del servidor
   }else{
    res.statusCode=2; //codigo http de exito
    res.setHeader('Content-Type', 'text/plain'); //Tipo de respuesta
    res.end('Servidor no encontrado\n') //respuesta del servidor
   }
    
});

server.listen(3000, () =>{
 console.log('Servidor corriendo en http://localhost:3000/');
});
