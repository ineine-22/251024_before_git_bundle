//server.js
const express = require('express');
const http = require('http');
const {Server} = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);


app.use(express.static('public'));

const players = {};

const map = {
  walls: [
    { x: 0, y: 450, width: 1200, height: 50 }, // 바닥
    { x: 360, y: 350, width: 240, height: 10 }, // 바닥2
    { x: 0, y: 350, width: 40, height: 10 },
    { x: 100, y: 150, width: 240, height: 10 },
    { x: 0, y: 250, width: 240, height: 10 } // 바닥3
  ]
};


io.on('connection', (socket) => {
////////////////////////////////////////////////////////////////////////////////////////////
    console.log('씨발 접속함', socket.id);

    socket.emit('mapData', map);
    console.log('맵 데이터 보냄 씨발', socket.id);

    const newPlayer = {
        id: socket.id,
        x: Math.floor(Math.random() * 1200),
        y: 30,
        width: 10,
        height: 30,
        color: 'blue',
        speed: 5,
        dy: 0,
        jumpPower: 15,
        isJumping: false,
        gravity: 0.8
    };

    socket.on('move', (data) => {
    if (players[socket.id]) {
        players[socket.id].x = data.x;
        players[socket.id].y = data.y;
        players[socket.id].color = data.color;
        // 필요하면 기타 속성도 갱신
    }
    // 모든 클라이언트에게 갱신된 플레이어 정보 전송
    io.emit('currentPlayers', players);
});

    players[socket.id] = newPlayer;

    console.log('플레이어 생성:', newPlayer.id);

    // 1. 새로 접속한 유저에게 모든 플레이어 정보 전달
    socket.emit('currentPlayers', players);

    // 2. 다른 모든 유저에게 새로운 플레이어 생성 알림
    socket.broadcast.emit('newPlayer', newPlayer);
    
    // 3. 연결 종료 시
    socket.on('disconnect', () => {
    console.log('접속 종료:', socket.id);
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
    });






////////////////////////////////////////////////////////////////////////////////////////////
});



server.listen(3000, () => {
  console.log('[http://localhost:3000]에서 서버 열렸다 씨발 섹스 드디어');
});
