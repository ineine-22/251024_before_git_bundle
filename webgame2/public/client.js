//client.js
const socket = io(); // 이게 실행돼야 서버와 연결됨
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const players = {};
let map = { walls: [] };

const player = {
  x: 100,
  y: 200,
  width: 10,
  height: 30,
  color: 'blue',
  speed: 5,
  dy: 0,
  jumpPower: 15,
  isJumping: false,
  gravity: 0.8
};

// 맵 정보 수신
socket.on('mapData', (serverMap) => {
  map = serverMap;
  document.getElementById('info').innerText = '게임 시작!';
});



// 현재 플레이어 정보 수신
//socket.on('currentPlayers', (serverPlayers) => {
//  Object.assign(players, serverPlayers);
//});

// 서버에서 currentPlayers 수신 시
socket.on('currentPlayers', (serverPlayers) => {
  Object.assign(players, serverPlayers);
  // 내 플레이어 정보 복사
  if (players[socket.id]) {
    Object.assign(player, players[socket.id]);
  }
});


// 새 플레이어 등장
socket.on('newPlayer', (player) => {
  players[player.id] = player;
});

// 플레이어 나감
socket.on('playerDisconnected', (id) => {
  delete players[id];
});






// 키 입력 상태 저장 객체 추가
const keys = {
  left: false,
  right: false
};

// 키 입력 이벤트 리스너 추가 오른쪽, 왼쪽, 스페이스바
document.addEventListener('keydown', e => {
  if (e.code === 'ArrowLeft') keys.left = true;
  if (e.code === 'ArrowRight') keys.right = true;
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    if (!player.isJumping) {
      player.dy = -player.jumpPower;
      player.isJumping = true;
    }
  }
});
document.addEventListener('keyup', e => {
  if (e.code === 'ArrowLeft') keys.left = false;
  if (e.code === 'ArrowRight') keys.right = false;
});

// 서버에서 currentPlayers 수신 시
socket.on('currentPlayers', (serverPlayers) => {
  Object.assign(players, serverPlayers);
  // 내 플레이어 정보 복사
  //if (players[socket.id]) {
  //  Object.assign(player, players[socket.id]);
  //}
});

function updatePlayer() {
  // 이동하려는 다음 위치 후보 계산 (현재 위치에서 이동량 더해서)
  let nextX = player.x;
  let nextY = player.y;

  // 좌우 이동 후보 위치 계산
  if (keys.left) nextX -= player.speed;
  if (keys.right) nextX += player.speed;

  // 중력 적용한 수직 이동 후보 위치 계산
  player.dy += player.gravity;
  nextY += player.dy;

  // 충돌 검사 함수
  function isColliding(x, y) {
    for (const wall of map.walls) {
      if (
        x < wall.x + wall.width &&
        x + player.width > wall.x &&
        y < wall.y + wall.height &&
        y + player.height > wall.y
      ) {
        return true; // 충돌 발생
      }
    }
    return false; // 충돌 없음
  }

  // 좌우 이동 가능하면 적용
  if (!isColliding(nextX, player.y)) {
    player.x = nextX;
  }

  // 상하 이동 가능하면 적용, 아니라면 낙하 멈춤 처리
  if (!isColliding(player.x, nextY)) {
    player.y = nextY;
  } else {
    // 충돌 발생 시 낙하 멈추고 점프 상태 해제
    player.dy = 0;
    player.isJumping = false;
  }

  if (player.y >= 500)
  {
    player.x = 600; // 플레이어 위치 초기화
    player.y = 0; // 플레이어 위치 초기화
  }




  // 위치를 서버에 전송
  socket.emit('move', {
    x: player.x,
    y: player.y,
    color: player.color
  });

}






// 렌더링
function drawMap() {
  ctx.fillStyle = '#999999';
  map.walls.forEach(wall => {
    ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
  });
}

// 플레이어 그리기
function drawPlayers() {
  for (const id in players) {
    const p = players[id];
    ctx.fillStyle = p.color || 'blue';
    ctx.fillRect(p.x, p.y, p.width, p.height);
    // ID 일부 표시
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.fillText(id.slice(0,4), p.x, p.y - 5);
  }
}

// 메인 루프
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updatePlayer(); // ← 이 줄 추가!
  drawMap();
  drawPlayers();
  requestAnimationFrame(gameLoop);
}

gameLoop();