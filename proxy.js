const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
app.use(cors()); // Permite CORS globalmente para nuestro localhost:8081

// Proxy que redirige todo a Render.com
app.use('/api', createProxyMiddleware({ 
    target: 'https://api-tesoreria-parqueadero.onrender.com', 
    changeOrigin: true,
    onProxyRes: function (proxyRes, req, res) {
        let body = [];
        proxyRes.on('data', function (chunk) {
            body.push(chunk);
        });
        proxyRes.on('end', function () {
            body = Buffer.concat(body).toString();
            console.log(`[${req.method}] ${req.url} -> ${proxyRes.statusCode}`);
            if(proxyRes.statusCode === 500) {
                console.log('Error 500 body:', body);
            }
        });
    }
}));

const PORT = 8010;
app.listen(PORT, () => {
    console.log(`🚀 CORS Proxy Server corriendo en http://localhost:${PORT}`);
    console.log(`Redirigiendo peticiones hacia la API en Render`);
});
