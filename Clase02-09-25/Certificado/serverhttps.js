const https = require('https');
const fs = require ('fs');

const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

const server = https.createServer(options, (req,seq) => {
    res.writeHead(200);
    res.end('Servidor HTTPS funcionando en https://localhost:300/')

});

server.listen(3000, () => {
    console.log('servido https en https://localhost:3000/')
});