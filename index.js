const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { exec } = require('child_process');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve HTML page with video player
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected');
});

// Execute raspivid to capture video and stream
const raspividCmd = 'raspivid -t 0 -hf -vf -fps 30 -w 640 -h 480 -o -';
const ffmpegCmd = 'ffmpeg -i - -vcodec copy -an -f flv rtmp://localhost/live/stream';

const raspividProcess = exec(raspividCmd, (err, stdout, stderr) => {
  if (err) {
    console.error('raspivid error:', err);
    return;
  }
  console.log('raspivid closed');
});

const ffmpegProcess = exec(ffmpegCmd, (err, stdout, stderr) => {
  if (err) {
    console.error('ffmpeg error:', err);
    return;
  }
  console.log('ffmpeg closed');
});

// Handle exit gracefully
process.on('SIGINT', () => {
  raspividProcess.kill();
  ffmpegProcess.kill();
  process.exit();
});

server.listen(5000, () => {
  console.log('Server listening on port 5000');
});
