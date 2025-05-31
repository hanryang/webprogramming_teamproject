//board
let board;
let boardWidth = 500;
let boardHeight = 500;
let context;

//players
let playerWidth = 200; //500 for testing, 80 normal
let playerHeight = 10;
let playerVelocityX = 5; //프레임당 10px 이동

let player = {
  x: boardWidth / 2 - playerWidth / 2,
  y: boardHeight - playerHeight - 5,
  width: playerWidth,
  height: playerHeight,
  velocityX: playerVelocityX,
};

//ball
let ballRad = 8;
let ballVelocityX = 0; //15 for testing, 3 normal
let ballVelocityY = 5; //10 for testing, 2 normal

let ball = {
  x: boardWidth / 2,
  y: boardHeight / 2,
  width: ballWidth,
  height: ballHeight,
  velocityX: ballVelocityX,
  velocityY: ballVelocityY,
};

//blocks
let blockArray = [];
let blockWidth = 55;
let blockHeight = 55;
let blockColumns = 8;
let blockRows = 3; //add more as game goes on
let blockMaxRows = 10; //limit how many rows
let blockCount = 0;

//starting block corners top left
let blockX = 15;
let blockY = 45;

let score = 0;
let gameOver = false;
let gameStartTime = 0;
let timeLimit = 90; //90초
const gameOverLine = boardHeight - 100;

//save key press status
let keys = {
  ArrowLeft: false,
  ArrowRight: false,
};

window.onload = function () {
  start = document.getElementById("game_start");
  startMenu = document.getElementById("start_menu");
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d"); //used for drawing on the board

  start.onclick = function () {
    startMenu.style.display = "none";
    board.style.display = "block";
    gameStartTime = performance.now();
    requestAnimationFrame(update); // SetInterval과 비슷한 역할을 한다.
    //create blocks
    createBlocks(); // Block을 생성하는 역할
  };

  //draw initial player
  context.fillStyle = "skyblue";
  context.fillRect(player.x, player.y, player.width, player.height);

  document.addEventListener("keydown", (e) => {
    if (e.code in keys) keys[e.code] = true;

    if (gameOver && e.code === "Space") {
      resetGame();
    }
  });

  document.addEventListener("keyup", (e) => {
    if (e.code in keys) keys[e.code] = false;
  });
};

//캔버스 화질 개선
function setupCanvas() {
  const dpr = window.devicePixelRatio || 1;

  // 내부 픽셀 크기 (고해상도 적용)
  board.width = boardWidth * dpr;
  board.height = boardHeight * dpr;

  // CSS로 보이는 크기 (고정)
  board.style.width = boardWidth + "px";
  board.style.height = boardHeight + "px";

  // 좌표계 스케일 조정 (픽셀 밀도 보정)
  context.setTransform(1, 0, 0, 1, 0, 0); // 초기화
  context.scale(dpr, dpr);
}

function update() {
  requestAnimationFrame(update);
  //stop drawing
  if (gameOver) {
    return;
  }
  context.clearRect(0, 0, board.width, board.height);

  //game over line
  context.strokeStyle = "red";
  context.beginPath();
  context.moveTo(0, gameOverLine);
  context.lineTo(boardWidth, gameOverLine);
  context.stroke();

  //check time limit
  const elapsedTime = (time - gameStartTime) / 1000;
  if (elapsedTime > timeLimit) {
    gameOver = true;
  }

  //player 움직임 처리
  if (keys.ArrowLeft) {
    // player.x -= player.velocityX;
    let nextplayerX = player.x - player.velocityX;
    if (!outOfBounds(nextplayerX)) {
      player.x = nextplayerX;
    }
  }
  if (keys.ArrowRight) {
    let nextplayerX = player.x + player.velocityX;
    if (!outOfBounds(nextplayerX)) {
      player.x = nextplayerX;
    }
  }

  // player
  context.fillStyle = "lightgreen";
  context.fillRect(player.x, player.y, player.width, player.height);

  // ball
  context.fillStyle = "white";
  ball.x += ball.velocityX;
  ball.y += ball.velocityY;
  context.fillRect(ball.x, ball.y, ball.width, ball.height);

  //bar 맞는 위치에 따라 공 굴절 각도 달라짐짐
  if (topCollision(ball, player)) {
    console.log("paddle");
    // 공 중심 위치와 패들 왼쪽 위치 차이
    let relativeIntersectX = ball.x + ball.width / 2 - player.x;
    let normalizedIntersectX = (relativeIntersectX / player.width) * 2 - 1; // -1 ~ 1 범위

    // 최대 X 속도 설정
    let maxBounceAngle = Math.PI / 3; // 60도 정도 각도 제한
    let bounceAngle = normalizedIntersectX * maxBounceAngle;

    let speed = Math.sqrt(ball.velocityX ** 2 + ball.velocityY ** 2);

    // 새 속도 설정
    ball.velocityX = speed * Math.sin(bounceAngle);
    ball.velocityY = -speed * Math.cos(bounceAngle); // 위로 튕기니까 음수
  }

  if (ball.y <= 0) {
    // if ball touches top of canvas
    ball.velocityY *= -1; //rev erse direction
  } else if (ball.x <= 0 || ball.x + ball.width >= boardWidth) {
    // if ball touches left or right of canvas
    ball.velocityX *= -1; //reverse direction
  } else if (ball.y + ball.height >= boardHeight) {
    // if ball touches bottom of canvas
    context.font = "20px sans-serif";
    context.fillText("Game Over: Press 'Space' to Restart", 80, 400);
    gameOver = true;
  }

  let startRow = level1MaxRows - blockRows;

  for (let block of blockArray) {
    if (block.break || block.breaking) continue;
    if (block.row >= startRow) {
      if (detectCollision(ball, block)) {
        let collDirect = getCollisionDirection(ball, block);
        if (collDirect) {
          console.log(collDirect);

          handleCollision(ball, block, collDirect);
          block.breaking = true;
          score += 100;
          blockCount -= 1;
          break;
        }
      }
    }
    context.fillRect(block.x, block.y, block.width, block.height);
  }

  updateBlocks(deltaTime);

  //next level
  if (blockCount <= 0) {
    score += 100 * blockRows * blockColumns; //bonus points :)
    gameStartTime = time; //?
    blockRows = 3;
  }

  //display time
  //score
  context.font = "20px sans-serif";
  context.fillText(score, 10, 25);
  context.fillText(elapsedTime.toFixed(0), 500, 25);
}

function outOfBounds(xPosition) {
  return xPosition < 0 || xPosition + playerWidth > boardWidth;
}

function detectCollision(ball, block) {
  const distX = Math.abs(ball.x - (block.x + block.width / 2));
  const distY = Math.abs(ball.y - (block.y + block.height / 2));

  if (distX > block.width / 2 + ball.rad) return false;
  if (distY > block.height / 2 + ball.rad) return false;

  // 완전 안쪽까지 들어간 경우
  if (distX <= block.width / 2) return true;
  if (distY <= block.height / 2) return true;

  // 코너 체크
  const dx = distX - block.width / 2;
  const dy = distY - block.height / 2;
  return dx * dx + dy * dy <= ball.rad * ball.rad;
}

// function detectCollision(ball, block) {
//   let closestX = Math.max(block.x, Math.min(ball.x, block.x + block.width));
//   let closestY = Math.max(block.y, Math.min(ball.y, block.y + block.height));
//   let distanceX = ball.x - closestX;
//   let distanceY = ball.y - closestY;
//   return distanceX ** 2 + distanceY ** 2 <= ball.rad ** 2;
// }

//

function getCollisionDirection(ball, block) {
  const distTop = Math.abs(ball.y + ball.rad - block.y); // 위에서 블럭 위에 닿음
  const distBottom = Math.abs(block.y + block.height - (ball.y - ball.rad)); // 아래에서 블럭 아래에 닿음
  const distLeft = Math.abs(ball.x + ball.rad - block.x); // 오른쪽에서 블럭 왼쪽에 닿음
  const distRight = Math.abs(block.x + block.width - (ball.x - ball.rad)); // 왼쪽에서 블럭 오른쪽에 닿음

  const minDist = Math.min(distTop, distBottom, distLeft, distRight);

  if (minDist == distTop) return "top";
  if (minDist == distBottom) return "bottom";
  if (minDist == distLeft) return "left";
  if (minDist == distRight) return "right";

  return "unknown";
}

function handleCollision(ball, block, collDirect) {
  switch (collDirect) {
    case "top":
      ball.y = block.y - ball.height;
      ball.velocityY *= -1;
      break;
    case "bottom":
      ball.y = block.y + block.height + ball.rad;
      ball.velocityY *= -1;
      break;
    case "left":
      ball.x = block.x - ball.width;
      ball.velocityX *= -1;
      break;
    case "right":
      ball.x = block.x + block.width + ball.rad;
      ball.velocityX *= -1;
      break;
  }
}

function topCollision(ball, block) {
  //a is above b (ball is above block)
  return (
    detectCollision(ball, block) &&
    ball.y + ball.rad >= block.y &&
    ball.velocityY > 0
  );
}

function bottomCollision(ball, block) {
  //a is above b (ball is below block)
  return detectCollision(ball, block) && block.y + block.height >= ball.y;
}

function leftCollision(ball, block) {
  //a is left of b (ball is left of block)
  return detectCollision(ball, block) && ball.x + ball.width >= block.x;
}

function rightCollision(ball, block) {
  //a is right of b (ball is right of block)
  return detectCollision(ball, block) && block.x + block.width >= ball.x;
}

// 13*12
const level1Pattern = [
  [0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
  [1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
  [0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
];

let level1MaxRows = 12;
let blockFallingInterval = 3000;
let blockFallCounter = 0;

function createBlocks() {
  // 이 부분에서 난수로 0~10(?)개 정도 난수로 뽑아서 열로 내려오는 것을 구현하면 될 것 같습니다.
  blockArray = []; //clear blockArray
  for (let r = 0; r < level1MaxRows; r++) {
    for (let c = 0; c < blockColumns; c++) {
      if (level1Pattern[r][c]) {
        let block = {
          break: false,
          breaking: false,
          alpha: 1.0,
          row: r,
          col: c,
          x: blockX + c * (blockWidth + 2),
          y: blockY + r * (blockHeight + 2),
          width: blockWidth,
          height: blockHeight,
        };
        blockArray.push(block);
        if (!block.break) {
          blockCount++;
        }
      }
    }
  }
}

function updateBlocks(deltaTime) {
  blockFallCounter += deltaTime;
  if (blockFallCounter >= blockFallingInterval) {
    blockFallCounter = 0;
    if (blockRows < blockMaxRows) {
      blockRows++;
    }
  }

  let startRow = level1MaxRows - blockRows; // 하위 blockRows 줄 렌더링
  for (let block of blockArray) {
    if (block.breaking) {
      block.alpha -= 0.05;
      if (block.alpha <= 0) {
        block.alpha = 0;
        block.breaking = false;
        block.break = true;
      }
    }
    if (block.break) continue;
    if (block.row >= startRow) {
      let visibleRowIndex = block.row - startRow;
      block.x = blockX + block.col * (block.width + 2);
      block.y = blockY + visibleRowIndex * (block.height + 2);

      context.globalAlpha = block.alpha ?? 1.0;
      context.fillStyle = "lightgray";
      context.fillRect(block.x, block.y, block.width, block.height);
      context.globalAlpha = 1.0;
    }
  }
}

function resetGame() {
  // 게임 초기화
  gameOver = false;
  player = {
    x: boardWidth / 2 - playerWidth / 2,
    y: boardHeight - playerHeight - 5,
    width: playerWidth,
    height: playerHeight,
    velocityX: playerVelocityX,
  };
  ball = {
    x: boardWidth / 2,
    y: boardHeight / 2,
    width: ballWidth,
    height: ballHeight,
    velocityX: ballVelocityX,
    velocityY: ballVelocityY,
  };
  blockArray = [];
  blockRows = 3;
  score = 0;
  createBlocks();
}
