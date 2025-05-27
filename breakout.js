//board
let board;
let boardWidth = 500;
let boardHeight = 500;
let context;

//players
let playerWidth = 100; //500 for testing, 80 normal
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
let ballWidth = 10;
let ballHeight = 10;
let ballVelocityX = 3; //15 for testing, 3 normal
let ballVelocityY = 2; //10 for testing, 2 normal

let ball = {
  x: boardWidth / 2,
  y: boardHeight / 2,
  width: ballWidth,
  height: ballHeight,
  velocityX: ballVelocityX,
  velocityY: ballVelocityY,
};
//충돌 이전 위치와 이를 통한 충돌 방향 계산
let prevBall = {
  x: ball.x - ball.velocityX,
  y: ball.y - ball.velocityY,
  width: ball.width,
  height: ball.height,
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
  };

  //draw initial player
  context.fillStyle = "skyblue";
  context.fillRect(player.x, player.y, player.width, player.height);

  requestAnimationFrame(update); // SetInterval과 비슷한 역할을 한다.
  document.addEventListener("keydown", (e) => {
    if (e.code in keys) keys[e.code] = true;

    if (gameOver && e.code === "Space") {
      resetGame();
    }
  });

  document.addEventListener("keyup", (e) => {
    if (e.code in keys) keys[e.code] = false;
  });

  //create blocks
  createBlocks(); // Block을 생성하는 역할
};

function movePlayer(e) {
  if (gameOver) {
    if (e.code == "Space") {
      resetGame();
      console.log("RESET");
    }
    return;
  }
  if (e.code == "ArrowLeft") {
    // player.x -= player.velocityX;
    let nextplayerX = player.x - player.velocityX;
    if (!outOfBounds(nextplayerX)) {
      player.x = nextplayerX;
    }
  } else if (e.code == "ArrowRight") {
    let nextplayerX = player.x + player.velocityX;
    if (!outOfBounds(nextplayerX)) {
      player.x = nextplayerX;
    }
    // player.x += player.velocityX;
  }
}

function update() {
  requestAnimationFrame(update);
  //stop drawing
  if (gameOver) {
    return;
  }
  context.clearRect(0, 0, board.width, board.height);

  prevBall.x = ball.x;
  prevBall.y = ball.y;

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

  let brokenBlocks = [];

  context.fillStyle = "skyblue";
  for (let i = 0; i < blockArray.length; i++) {
    let block = blockArray[i];

    if (block.breakingTimer > 0) {
      block.breakingTimer--;
      context.fillRect(block.x, block.y, block.width, block.height);
      continue;
    }

    if (block.break) continue;

    let collided = false; //한 프레임 당 블럭 하나만 깨지게 수정.

    let collDirect = getCollisionDirection(ball, prevBall, block);

    if (collDirect) {
      handleCollision(ball, block, collDirect);
      collided = true;
    }

    if (collided) {
      brokenBlocks.push(block);
      block.breakingTimer = 5; //블럭이 너무 빨리 깨지는 것 방지
      score += 100;
      blockCount -= 1;
    }
    context.fillRect(block.x, block.y, block.width, block.height);
  }

  for (let b of brokenBlocks) {
    b.break = true;
  }

  //next level
  if (blockCount == 0) {
    score += 100 * blockRows * blockColumns; //bonus points :)
    blockRows = Math.min(blockRows + 1, blockMaxRows);
    createBlocks();
  }

  //score
  context.font = "20px sans-serif";
  context.fillText(score, 10, 25);
}

function outOfBounds(xPosition) {
  return xPosition < 0 || xPosition + playerWidth > boardWidth;
}

function detectCollision(ball, block) {
  return (
    ball.x < block.x + block.width && //ball의 왼쪽 위 코너 corner doesn't reach b's top right corner
    ball.x + ball.width > block.x && //a's top right corner passes b's top left corner
    ball.y < block.y + block.height && //a's top left corner doesn't reach b's bottom left corner
    ball.y + ball.height > block.y
  ); //a's bottom left corner passes b's top left corner
}

function getCollisionDirection(ball, prevBall, block) {
  if (!detectCollision(ball, block)) return null;

  const prevBottom = prevBall.y + prevBall.height;
  const currBottom = ball.y + ball.height;

  const prevTop = prevBall.y;
  const currTop = ball.y;

  const prevRight = prevBall.x + prevBall.width;
  const currRight = ball.x + ball.width;

  const prevLeft = prevBall.x;
  const currLeft = ball.x;

  // 위에서 들어옴
  if (prevBottom <= block.y && currBottom >= block.y) {
    return "top";
  }

  // 아래에서 들어옴
  if (prevTop >= block.y + block.height && currTop <= block.y + block.height) {
    return "bottom";
  }

  // 왼쪽에서 들어옴
  if (prevRight <= block.x && currRight >= block.x) {
    return "left";
  }

  // 오른쪽에서 들어옴
  if (prevLeft >= block.x + block.width && currLeft <= block.x + block.width) {
    return "right";
  }

  return "unknown";
}

function handleCollision(ball, block, collDirect) {
  switch (collDirect) {
    case "top":
      ball.y = block.y - ball.height;
      ball.velocityY *= -1;
      break;
    case "bottom":
      ball.y = block.y + block.height;
      ball.velocityY *= -1;
      break;
    case "left":
      ball.x = block.x - ball.width;
      ball.velocityX *= -1;
      break;
    case "right":
      ball.x = block.x + block.width;
      ball.velocityX *= -1;
      break;
  }
}

function topCollision(ball, block) {
  //a is above b (ball is above block)
  return detectCollision(ball, block) && ball.y + ball.height >= block.y;
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

function createBlocks() {
  // 이 부분에서 난수로 0~10(?)개 정도 난수로 뽑아서 열로 내려오는 것을 구현하면 될 것 같습니다.
  blockArray = []; //clear blockArray
  for (let c = 0; c < blockColumns; c++) {
    for (let r = 0; r < blockRows; r++) {
      let block = {
        x: blockX + c * blockWidth + c * 2, //c*2 space 10 pixels apart columns
        y: blockY + r * blockHeight + r * 2, //r*2 space 10 pixels apart rows
        width: blockWidth,
        height: blockHeight,
        break: false,
        breakingTimer: 0,
      };
      blockArray.push(block);
    }
  }
  blockCount = blockArray.length;
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
