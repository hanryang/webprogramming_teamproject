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
  y: boardHeight - playerHeight,
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
let blockColumns = 13;
let initBlockRows = 3; //add more as game goes on
let blockCount = 0;

//starting block corners top left
let blockX = 15;
let blockY = 45;

let levelCompleted = false;
let gameOver = false;
let gameStartTime = 0;
let timeLimit = 90; //90초
let timeLeft;
const gameOverLine = boardHeight - 80;

let isAnimationRunning = false;
let score = 0;
let leftTimeToScore;
let scorePerSecondLeft = 50;
let leftTimetoScoreInit = false;
let leftTimeToScoreHandled = false;
let leftTimeToScoreStartTime;

const levelSettings = [
  {
    ballVelocityX: 0,
    ballVelocityY: 5,
    playerWidth: 250,
    timeLimit: 90,
  },
  {
    ballVelocityX: 0,
    ballVelocityY: 6,
    playerWidth: 200,
    timeLimit: 80,
  },
  {
    ballVelocityX: 0,
    ballVelocityY: 7,
    playerWidth: 150,
    timeLimit: 70,
  },
];

//save key press status
let keys = {
  ArrowLeft: false,
  ArrowRight: false,
};

window.onload = function () {
  start = document.getElementById("game_start");
  startMenu = document.getElementById("start_menu");
  levelSelect = document.getElementById("level_select");
  levelSelectMenu = document.getElementById("level_select_menu");
  level1 = document.getElementById("lev_1");
  level2 = document.getElementById("lev_2");
  level3 = document.getElementById("lev_3");

  returnB = document.getElementById("return");
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d"); //used for drawing on the board

  start.onclick = function () {
    startMenu.style.display = "none";
    board.style.display = "block";
    level = 1;
    score = 0;
    resetGame();
  };

  levelSelect.onclick = function () {
    startMenu.style.display = "none";
    levelSelectMenu.style.display = "block";
  };
  level1.onclick = function () {
    levelSelectMenu.style.display = "none";
    board.style.display = "block";
    level = 1;
    score = 0;
    resetGame();
  };
  level2.onclick = function () {
    levelSelectMenu.style.display = "none";
    board.style.display = "block";
    level = 2;
    score = 0;
    resetGame();
  };
  level3.onclick = function () {
    levelSelectMenu.style.display = "none";
    board.style.display = "block";
    level = 3;
    score = 0;
    resetGame();
  };

  returnB.onclick = function () {
    startMenu.style.display = "block";
    levelSelectMenu.style.display = "none";
  };

  document.addEventListener("keydown", (e) => {
    if (e.code in keys) keys[e.code] = true;

    if (gameOver && e.code === "Space") {
      resetGame();
    }
    if (levelCompleted && e.code === "Space" && leftTimeToScoreHandled) {
      if (level < 3) {
        level++;
        resetGame();
      } else {
        //게임 클리어 시, 스페이스바 누르면 메인 메뉴로 돌아감
        level = 1;
        isAnimationRunning = false;
        startMenu.style.display = "block";
        board.style.display = "none";
      }
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

let lastTime = 0;

function update(time = 0) {
  if (!isAnimationRunning) {
    console.log("animation stopping");
    return;
  }
  requestAnimationFrame(update);
  //stop drawing
  if (gameOver) {
    context.fillStyle = "lightBlue";
    context.font = "20px sans-serif";
    context.textAlign = "center";
    context.fillText(
      "Game Over: Press 'Space' to Restart",
      boardWidth / 2,
      400
    );
    context.textAlign = "left";
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
  if (!gameOver && !levelCompleted) {
    timeLeft = Math.max(0, timeLimit - (time - gameStartTime) / 1000);
  }
  if (timeLeft <= 0) {
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
    ball.y = ball.rad;
    ball.velocityY *= -1; //rev erse direction
  }
  if (ball.x - ball.rad <= 0) {
    // if ball touches left of canvas
    ball.x = ball.rad;
    ball.velocityX *= -1; //reverse direction
  }
  if (ball.x + ball.rad >= boardWidth) {
    // if ball touches right of canvas
    ball.x = boardWidth - ball.rad;
    ball.velocityX *= -1; //reverse direction
  }
  if (ball.y + ball.rad >= boardHeight) {
    // if ball touches bottom of canvas
    gameOver = true;
  }

  //충돌 로직
  let startRow = maxRows - blockRows;

  for (let block of blockArray) {
    if (block.break || block.breaking) continue;
    if (block.row >= startRow) {
      if (detectCollision(ball, block)) {
        let collDirect = getCollisionDirection(ball, block);
        if (collDirect) {
          console.log(collDirect);

          handleCollision(ball, block, collDirect);
          block.breaking = true;
          blockCount -= 1;
          break;
        }
      }
    }
  }

  //display time
  const minutes = Math.floor(timeLeft / 60);
  const seconds = Math.floor(timeLeft % 60);
  const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  context.font = "20px sans-serif";
  context.fillText(`time left: ${timeString}`, 660, 25);

  //display lines left
  context.fillText(`lines left:${linesLeft}`, 10, 25);
  context.textAlign = "center";
  context.fillText(`LEVEL ${level}`, boardWidth / 2, 25);
  context.textAlign = "left";

  //아래 선 넘은 블럭이 있는지 확인
  for (let block of blockArray) {
    if (
      !block.break &&
      !block.breaking &&
      block.y + block.height >= gameOverLine
    ) {
      gameOver = true;
      break; // 하나만 넘어도 종료
    }
  }

  updateBlocks(deltaTime);

  //next level
  if (blockCount <= 0) {
    levelCompleted = true;
    let levelCompletedText;
    if (level < 3) {
      levelCompletedText = "LEVEL COMPLETED!: Press 'Space' to Continue";
    } else {
      levelCompletedText =
        "You completed every level!: Press 'Space' to go back to the Main Menu";
    }
    //공, 바 못 움직이게
    ball.velocityX = 0;
    ball.velocityY = 0;
    player.velocityX = 0;

    context.fillStyle = "lightBlue";
    context.font = "20px sans-serif";
    context.textAlign = "center";
    context.fillText(levelCompletedText, boardWidth / 2, 350);

    context.textAlign = "left";

    //남은시간->점수 위해 남은 시간을 별도의 변수에 저장
    if (!leftTimetoScoreInit) {
      leftTimeToScore = Math.floor(timeLeft);
      leftTimetoScoreInit = true;
      leftTimeToScoreStartTime = performance.now();
    }

    let elapsedTime = time - leftTimeToScoreStartTime;

    //모든 남은 시간이 점수로 환산되고 나면 에니메이션 종료
    if (leftTimeToScore <= 0) {
      leftTimeToScoreHandled = true;
      isAnimationRunning = false;
    }

    //점수로 변환되는 시간 표시시
    let scoreMinutes = Math.floor(leftTimeToScore / 60);
    let scoreSeconds = Math.floor(leftTimeToScore % 60);
    let scoreTimeString = `${scoreMinutes}:${scoreSeconds
      .toString()
      .padStart(2, "0")}`;

    if (elapsedTime < 1000) {
      context.textAlign = "center";
      context.fillText(`TIME LEFT: ${timeString}`, boardWidth / 2, 400);
      context.fillText(`SCORE: ${score}`, boardWidth / 2, 450);
      context.textAlign = "left";
    } else {
      let increment = Math.min(1, leftTimeToScore);
      score += increment * scorePerSecondLeft;
      leftTimeToScore -= increment;

      context.textAlign = "center";

      context.fillText(`TIME LEFT: ${leftTimeToScore}`, boardWidth / 2, 400);

      context.fillText(`SCORE: ${score}`, boardWidth / 2, 450);

      context.textAlign = "left";
    }
  }
}

function outOfBounds(xPosition) {
  return xPosition < 0 || xPosition + player.width > boardWidth;
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
const patterns = [
  //level1
  [[0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0]],
  //level2
  [[0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0]],
  //level3
  // [
  //   [1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1],
  //   [0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0],
  //   [0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0],
  //   [1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1],
  //   [1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1],
  //   [1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
  //   [0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0],
  //   [0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  //   [0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0],
  //   [0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0],
  //   [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
  //   [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  // ],
  //level3
  [[0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0]],
];

let level = 0;
let pattern;
let maxRows;
let blockFallingInterval = 6000;
let blockFallCounter = 0;
let linesLeft;
let blockRows = initBlockRows;

function createBlocks() {
  pattern = patterns[level - 1];
  maxRows = patterns[level - 1].length;
  console.log("maxrows", maxRows);
  blockArray = []; //clear blockArray
  linesLeft = Math.max(0, maxRows - blockRows);
  for (let r = 0; r < maxRows; r++) {
    for (let c = 0; c < blockColumns; c++) {
      if (pattern[r][c]) {
        let block = {
          break: false,
          breaking: false,
          alpha: 1.0,
          row: r,
          col: c,
          x: 0,
          y: 0,
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
    if (blockRows < maxRows) {
      blockRows++;
      linesLeft--;
      console.log(blockRows);
      console.log(linesLeft);
    }
  }
  let startRow = maxRows - blockRows;
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
  const settings = levelSettings[level - 1];
  // 게임 초기화
  gameOver = false;
  levelCompleted = false;
  player.velocityX = playerVelocityX;
  player.width = settings.playerWidth;

  player.x = boardWidth / 2 - player.width / 2;
  player.y = boardHeight - player.height;
  ball.x = boardWidth / 2;
  ball.y = boardHeight / 2;
  ball.velocityX = settings.ballVelocityX;
  ball.velocityY = settings.ballVelocityY;
  timeLimit = settings.timeLimit;

  console.log(ball.velocityX, ball.velocityY);

  blockArray = [];
  blockRows = initBlockRows;
  blockCount = 0;

  //시간 관련 초기화
  lastTime = 0;
  gameStartTime = performance.now();

  //남은시간->점수 확인 변수 초기화
  leftTimeToScoreHandled = false;
  leftTimetoScoreInit = false;

  if (!isAnimationRunning) {
    requestAnimationFrame(update); // SetInterval과 비슷한 역할을 한다.
    isAnimationRunning = true;
  }
  createBlocks();
}
