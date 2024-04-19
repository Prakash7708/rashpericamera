const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { spawn } = require('child_process');
const path = require('path'); // Import path module

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve HTML page with video player
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); // Use __dirname to resolve the current directory
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Start raspivid and stream video
  const raspividCmd = 'raspivid -t 0 -hf -vf -fps 30 -w 640 -h 480 -o -';
  const raspividProcess = spawn(raspividCmd, {
    shell: true
  });

  raspividProcess.stdout.on('data', (data) => {
    socket.emit('video', data);
  });

  raspividProcess.stderr.on('data', (data) => {
    console.error(`raspivid stderr: ${data}`);
  });

  raspividProcess.on('close', (code) => {
    console.log(`raspivid process exited with code ${code}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    raspividProcess.kill();
  });
});

server.listen(5000, () => {
  console.log('Server listening on port 5000');
});














// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const { spawn } = require('child_process');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server);

// // Serve HTML page with video player
// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/index.html');
// });

// // Socket.io connection
// io.on('connection', (socket) => {
//   console.log('A user connected');
  
//   // Start raspivid and stream video
//   const raspividCmd = 'raspivid -t 0 -hf -vf -fps 30 -w 640 -h 480 -o -';
//   const raspividProcess = spawn(raspividCmd, {
//     shell: true
//   });

//   raspividProcess.stdout.on('data', (data) => {
//     socket.emit('video', data);
//   });

//   raspividProcess.stderr.on('data', (data) => {
//     console.error(`raspivid stderr: ${data}`);
//   });

//   raspividProcess.on('close', (code) => {
//     console.log(`raspivid process exited with code ${code}`);
//   });

//   // Handle disconnection
//   socket.on('disconnect', () => {
//     console.log('A user disconnected');
//     raspividProcess.kill();
//   });
// });

// server.listen(5000, () => {
//   console.log('Server listening on port 5000');
// });
