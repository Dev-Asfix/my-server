// Importa los módulos necesarios
const http = require('http'); // Módulo para crear un servidor HTTP
const WebSocket = require('ws'); // Módulo para gestionar conexiones WebSocket
const express = require('express'); // Módulo para crear una aplicación web

const app = express(); // Crea una instancia de la aplicación Express
const port = 3000; // Define el puerto en el que el servidor escuchará

// Middleware para interpretar los cuerpos de las solicitudes POST como JSON
app.use(express.json()); // Permite que Express procese solicitudes JSON

// Ruta para manejar las solicitudes POST en '/notify'
app.post('/notify', (req, res) => {
  const { status } = req.body; // Extrae el estado del cuerpo de la solicitud
  
  if (status) {
    console.log(`Estado recibido: ${status}`); // Imprime el estado recibido en la consola
    
    // Envía el estado a todos los clientes conectados a WebSocket
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) { // Verifica si el cliente está abierto
        client.send(JSON.stringify({ status })); // Envía el estado al cliente
      }
    });
    res.status(200).send('Estado recibido'); // Responde al cliente con un mensaje de éxito
  } else {
    res.status(400).send('No se recibió estado'); // Responde con un error si no se recibió estado
  }
});

// Inicia el servidor HTTP y escucha en el puerto definido
const server = http.createServer(app); // Crea el servidor HTTP con la aplicación Express
server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`); // Imprime un mensaje cuando el servidor esté en funcionamiento
});

// Configura el WebSocket para trabajar con el servidor HTTP existente
const wss = new WebSocket.Server({ server }); // Crea un servidor WebSocket con el servidor HTTP

// Maneja las conexiones WebSocket
wss.on('connection', ws => {
  console.log('Nuevo cliente conectado'); // Imprime un mensaje cuando un nuevo cliente se conecte
  ws.on('message', message => {
    console.log(`Mensaje recibido: ${message}`); // Imprime los mensajes recibidos del cliente
  });
});

// Sirve archivos estáticos desde la carpeta 'public'
app.use(express.static('public')); // Permite que Express sirva archivos estáticos desde la carpeta 'public'
