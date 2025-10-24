//io_stock_ver1.0

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));






io.on('connection', socket => {

  console.log('User connected:', socket.id);

  socket.on('join', ({ name, code }) => {
    let existing = Object.values(players).find(p => p.code === code);

    if (existing) {
      players[socket.id] = existing;
      delete players[existing.socketId];
      existing.socketId = socket.id;
    } else {
      const id = String(nextId++).padStart(2, '0');
      players[socket.id] = {
        id,
        name,
        code,
        socketId: socket.id,
        money: 100000,
        input: 0,
        output: 0,
        pending: 0
      };
    }

    socket.emit('multiplier', rm);
    socket.emit('countdown', ct);
    socket.emit('round', round);
    io.emit('players', players);
    socket.emit('joinSuccess');
  });

  
  socket.on('bet', amount => {
    const p = players[socket.id];
    if (!p) return;

    amount = parseInt(amount);
    if (isNaN(amount) || amount <= 0 || amount > p.money) return;

    p.pending = amount;
  });

  socket.on('disconnect', () => {
    // 삭제하지 않음
    console.log('User disconnected (not deleted):', socket.id);
  });
});

//startGameLoop();


const PORT = 7400;
http.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
