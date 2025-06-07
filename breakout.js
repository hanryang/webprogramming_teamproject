// 보듸의 크기
let board;
const boardWidth = 800;
const boardHeight = 600;
let context;

//players
let playerWidth = 180; //500 for testing, 80 normal
let playerHeight = 25;
let playerVelocityX = 10; //프레임당 10px 이동

//바 이미지 가져오기기
const playerImg = new Image();
playerImg.src = "./sources/gameBar.png";

let player = {
  x: boardWidth / 2 - playerWidth / 2,
  y: boardHeight - playerHeight,
  width: playerWidth,
  height: playerHeight,
  velocityX: playerVelocityX,
  img: playerImg,
};

//ball
let ballRad = 8;

let ballspeed; // 벡터의 크기 (속력)
let angle; // 0 ~ 2π 범위의 무작위 각도 (라디안)

let ballVelocityX; // x 방향 성분
let ballVelocityY; // y 방향 성분

// ball의 구조체
let ball = {
  x: boardWidth / 2,
  y: boardHeight / 2,
  rad: ballRad,
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
let blockX = 30;
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

let storyMode = true;

// 컷신 상태 변수 및 타이머
let isCutscenePlaying = false;
let currentCutsceneImages = [];
let currentCutsceneIndex = 0;
let cutsceneTimer = null;

// onclick 내부 수정 사항-> Start 버튼 클릭 시 intro1~intro4 재생
const introImages = [
  "./sources/cutscene/intro1.png",
  "./sources/cutscene/intro2.png",
  "./sources/cutscene/intro3.png",
  "./sources/cutscene/intro4.png",
];

const level1ending = ["./sources/cutscene/fin1.png"];

const level2beginning = [
  "./sources/cutscene/pre2_1.png",
  "./sources/cutscene/pre2_2.png",
];

const level2ending = ["./sources/cutscene/fin2.png"];

const level3beginning = ["./sources/cutscene/pre3.png"];

const level3ending = ["./sources/cutscene/fin3.png"];

const levelSettings = [
  {
    ballVelocityX: 0,
    ballVelocityY: 10,
    playerWidth: 250,
    timeLimit: 90,
  },
  {
    ballVelocityX: 0,
    ballVelocityY: 10,
    playerWidth: 200,
    timeLimit: 80,
  },
  {
    ballVelocityX: 0,
    ballVelocityY: 10,
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
  gameOverImg = document.getElementById("gameover_screen");
  gameOverMenu = document.getElementById("gameover_menu");
  revenge = document.getElementById("revenge");

  returnB = document.getElementById("return");
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d"); //used for drawing on the board

  // 컷신 스킵 버튼 기능
  document.getElementById("cutscene-skip").onclick = function () {
    if (cutsceneTimer) clearInterval(cutsceneTimer);
    endCutscene();
  };

  setupCanvas();

  //#region 클릭 처리
  start.onclick = function () {
    startMenu.style.display = "none";
    board.style.display = "none"; // 컷신이 끝난 뒤 보여지므로 숨김
    storyMode = true;
    level = 1;
    score = 0;
    // 컷신 재생 후 게임 시작
    playCutscene(introImages, countdown321);
  };

  levelSelect.onclick = function () {
    startMenu.style.display = "none";
    levelSelectMenu.style.display = "block";

    levelSelectMenu.style.backgroundImage =
      "url('./sources/background/stageSelect.png')";
  };
  level1.onclick = function () {
    levelSelectMenu.style.display = "none";
    board.style.display = "block";
    level = 1;
    score = 0;
    storyMode = false;
    countdown321();
  };
  level2.onclick = function () {
    levelSelectMenu.style.display = "none";
    board.style.display = "block";
    level = 2;
    score = 0;
    storyMode = false;
    countdown321();
  };
  level3.onclick = function () {
    levelSelectMenu.style.display = "none";
    board.style.display = "block";
    level = 3;
    score = 0;
    storyMode = false;
    countdown321();
  };
  revenge.onclick = () => {
    storyMode = true;
    gameOverMenu.style.display = "none";
    board.style.display = "block";
    countdown321();
  };

  returnB.onclick = function () {
    startMenu.style.display = "block";
    levelSelectMenu.style.display = "none";
  };

  document.addEventListener("keydown", (e) => {
    if (e.code in keys) keys[e.code] = true;

    if (gameOver && e.code === "Space" && !storyMode) {
      resetGame();
    }
    if (levelCompleted && e.code === "Space" && leftTimeToScoreHandled) {
      if (isCutscenePlaying) {
        return;
      }

      if (level < 3) {
        // 다음 레벨로 넘어가기 전에 컷신 재생

        let nextendingCutscene = level1ending;
        if (level === 2) nextendingCutscene = level2ending;
        else if (level === 3) nextendingCutscene = level3ending;

        let nextstartingCutscene = level2beginning;
        if (level === 2) nextstartingCutscene = level3beginning;

        playCutscene(nextendingCutscene, () => {
          playCutscene(nextstartingCutscene, () => {
            level++;
            countdown321();
          });
        });
      } else {
        playCutscene(level3ending, () => {
          level = 1;
          isAnimationRunning = false;
          startMenu.style.display = "block";
          board.style.display = "none";
        });
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
  // 아마 일시정지 구현을 위한 처리라고 생각이 든다.
  if (!isAnimationRunning) {
    console.log("animation stopping");
    return;
  }

  // 재귀 함수
  requestAnimationFrame(update);

  // 시간 차이 계산
  if (lastTime === 0) lastTime = time;
  const deltaTime = time - lastTime;
  lastTime = time;

  // 만약 게임이 끝났다면...
  if (gameOver) {
    isAnimationRunning = false;
    if (storyMode) {
      board.style.display = "none";
      gameOverImg.style.display = "block";
      setTimeout(() => {
        gameOverImg.style.display = "none";
        gameOverMenu.style.display = "block";
      }, 2000);
    } else {
      context.fillStyle = "lightBlue";
      context.font = "25px 'DOSIyagiMedium'";
      context.textAlign = "center";
      context.fillText(
        "Game Over: Press 'Space' to Restart",
        boardWidth / 2,
        400
      );
      context.textAlign = "left";
    }
    return;
  }

  // Canvas 초기화
  context.clearRect(0, 0, board.width, board.height);

  // 게임 오버 라인 그리기
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

  // player  공 이미지 변경을 위해 fillRect->drawImage로 변경
  context.fillStyle = "lightgreen";
  context.drawImage(
    player.img,
    player.x,
    player.y,
    player.width,
    player.height
  );

  // ball
  context.fillStyle = "white";
  ball.x += ball.velocityX;
  ball.y += ball.velocityY;
  context.beginPath();
  context.arc(ball.x, ball.y, ball.rad, 0, Math.PI * 2);
  context.fill();

  //bar 맞는 위치에 따라 공 굴절 각도 달라짐짐
  if (topCollision(ball, player)) {
    console.log("paddle");
    // 공 중심 위치와 패들 왼쪽 위치 차이
    let relativeIntersectX = ball.x - player.x;
    let normalizedIntersectX = (relativeIntersectX / player.width) * 2 - 1; // -1 ~ 1 범위

    // 최대 X 속도 설정
    let maxBounceAngle = Math.PI / 3; // 60도 정도 각도 제한
    let bounceAngle = normalizedIntersectX * maxBounceAngle;

    let speed = Math.sqrt(ball.velocityX ** 2 + ball.velocityY ** 2);

    // 새 속도 설정
    ball.velocityX = speed * Math.sin(bounceAngle);
    ball.velocityY = -speed * Math.cos(bounceAngle); // 위로 튕기니까 음수
  }

  if (ball.y - ball.rad <= 0) {
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
    // if (block.break || block.breaking) continue;
    if (block.HP <= -1 || block.breaking) continue;
    if (block.row >= startRow) {
      if (detectCollision(ball, block)) {
        const collisionSound = new Audio("./sources/sound/collision.wav");
        collisionSound.play();
        block.HP -= 1; // 충돌 시 HP 감소
        let collDirect = getCollisionDirection(ball, block);
        if (collDirect) {
          console.log(collDirect);

          handleCollision(ball, block, collDirect);
          if (block.HP == 0) {
            block.breaking = true;
            blockCount -= 1;
          }
          // break;
        }
      }
    }
  }

  //display time
  const minutes = Math.floor(timeLeft / 60);
  const seconds = Math.floor(timeLeft % 60);
  const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  context.font = "20px 'DOSIyagiMedium'";
  context.fillText(`time left: ${timeString}`, 642, 25);

  //display lines left
  context.fillText(`lines left:${linesLeft}`, 10, 25);
  context.textAlign = "center";
  context.fillText(`LEVEL ${level}`, boardWidth / 2, 25);
  context.textAlign = "left";

  //아래 선 넘은 블럭이 있는지 확인
  for (let block of blockArray) {
    if (
      block.HP != 0 &&
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
        "You Completed Every Level!: Press 'Space' to Continue";
    }
    //공, 바 못 움직이게
    ball.velocityX = 0;
    ball.velocityY = 0;
    player.velocityX = 0;

    context.fillStyle = "lightBlue";
    context.font = "20px 'DOSIyagiMedium'";
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

    //점수로 변환되는 시간 표시
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

      context.fillText(`TIME LEFT: ${scoreTimeString}`, boardWidth / 2, 400);

      context.fillText(`SCORE: ${score}`, boardWidth / 2, 450);

      context.textAlign = "left";
    }
  }
}

function outOfBounds(xPosition) {
  return xPosition < 0 || xPosition + player.width > boardWidth;
}

// 충돌 감지 코드
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

// 충돌 위치 감지 코드
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

// 충돌 처리 함수
function handleCollision(ball, block, collDirect) {
  switch (collDirect) {
    case "top":
      ball.y = block.y - ball.rad;
      ball.velocityY *= -1;
      break;
    case "bottom":
      ball.y = block.y + block.height + ball.rad;
      ball.velocityY *= -1;
      break;
    case "left":
      ball.x = block.x - ball.rad;
      ball.velocityX *= -1;
      break;
    case "right":
      ball.x = block.x + block.width + ball.rad;
      ball.velocityX *= -1;
      break;
  }
}

//#region 충돌 방향에 따른 충돌 처리 함수들
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
  return detectCollision(ball, block) && ball.x + ball.rad >= block.x;
}

function rightCollision(ball, block) {
  //a is right of b (ball is right of block)
  return detectCollision(ball, block) && block.x + block.width >= ball.x;
}

//#endregion

// 13*12
const patterns = [
  //level1
  [[0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0]],
  [[0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0]],
  [[0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0]],

  // [
  //   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  //   [0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0],
  //   [0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
  //   [0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0],
  //   [0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0],
  //   [0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
  //   [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  //   [0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0],
  //   [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0],
  // ],
  //level2
  // [
  //   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  //   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  //   [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
  //   [0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0],
  //   [0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0],
  //   [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  //   [0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0],
  //   [0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0],
  //   [0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0],
  // ],

  //level3
  // [
  //   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  //   [0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  //   [0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0],
  //   [0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1],
  //   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  //   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  //   [0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1],
  //   [0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0],
  //   [0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  // ],
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
        //#region 변경 block 생성 수정
        // 확률에 따라 색상 및 HP 결정
        const rand = Math.random();
        let block;

        if (rand < 0.05) {
          // 5% 확률: 초록색
          block = new green_Enemy(2, 0, 0, r, c);
          block.color();
        } else if (rand < 0.3) {
          // 다음 25% 확률: 빨간색
          block = new red_Enemy(2, 0, 0, r, c);
          block.color();
        } else {
          // 나머지 70% 확률: 검정색
          block = new black_Enemy(1, 0, 0, r, c);
          block.color();
        }
        //#endregion
        blockArray.push(block);
        // if (!block.break) {
        // if (block.HP != 0) { // 필요가 없지 않나?
        blockCount++;
        // }
      }
    }
  }
}

function updateBlocks(deltaTime) {
  // 블록이 일정 시간마다 한 줄씩 아래로 내려오게 하는 로직
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

  // 블록이 깨지는 애니메이션 처리
  for (let block of blockArray) {
    if (block.HP == 1 && block.colorValue != "white") {
      block.alpha -= 0.05;
      if (block.alpha <= 0) {
        if (block.colorValue == "green") {
          block.position_change(); // 초록색 블록은 위치 변경
        }
        block.alpha = 0;
        block.color();
      }
    }
    if (block.HP == 1 && block.colorValue == "white" && block.alpha < 1.0) {
      block.alpha += 0.05;
      if (block.alpha >= 1.0) {
        block.alpha = 1.0;
      }
    }
    if (block.HP === 0 && block.breaking) {
      // block.alpha -= 0.01;
      // if (block.alpha <= 0) {
      block.alpha -= 0.05;
      if (block.alpha <= 0) {
        block.alpha = 0;
        block.breaking = false;
        block.HP = -1; // 블록이 깨졌으므로 HP를 -1으로 설정
      }
    }

    /*  
    blockArray = [];
    blockRows = 3;
    score = 0;
    createblocks();
*/
    if (block.HP == -1) continue;
    if (block.row >= startRow) {
      let visibleRowIndex = block.row - startRow;
      block.x = blockX + block.col * (block.width + 2);
      block.y = blockY + visibleRowIndex * (block.height + 2);

      context.globalAlpha = block.alpha ?? 1.0;
      // context.fillStyle = block.colorValue ?? "white"; // 기본 색상 및 색 지정
      block.draw(context);
      // context.fillRect(block.x, block.y, block.width, block.height);
      context.globalAlpha = 1.0;
    }
  }
}

function resetGame() {
  const settings = levelSettings[level - 1];
  // 게임 초기화
  gameOver = false;
  levelCompleted = false;
  isCutscenePlaying = false;
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

  createBlocks();

  if (!isAnimationRunning) {
    requestAnimationFrame(update); // SetInterval과 비슷한 역할을 한다.
    isAnimationRunning = true;
  }
}

// 컷신 재생
function playCutscene(images, onComplete) {
  isCutscenePlaying = true;
  currentCutsceneImages = images;
  currentCutsceneIndex = 0;

  document.getElementById("cutscene").style.display = "block";
  document.getElementById("cutscene-img").src = images[currentCutsceneIndex];
  board.style.display = "none";

  cutsceneTimer = setInterval(() => {
    currentCutsceneIndex++;
    if (currentCutsceneIndex >= images.length) {
      endCutscene(onComplete);
    } else {
      document.getElementById("cutscene-img").src =
        images[currentCutsceneIndex];
    }
  }, 2000);
}

//  컷신 종료 후 게임 시작
function endCutscene(callback) {
  document.getElementById("cutscene").style.display = "none";
  // isCutscenePlaying = false;
  if (cutsceneTimer) clearInterval(cutsceneTimer);
  if (callback) callback();
}

//#region Enemy 모든 클래스 정의
// Enemy
class Enemy {
  // 생성자
  constructor(HP, x, y, r, c) {
    this.HP = HP;
    this.breaking = false;
    this.x = x;
    this.y = y;
    this.row = r;
    this.col = c;
    this.width = 55;
    this.height = 55;
    this.colorValue; // 기본 색상
    this.alpha = 1.0; // 블록의 투명도

    this.image = new Image();
  }

  loadImage(path) {
    this.image.src = path;
  }
  // 죽는 메소드
  die() {
    return this.HP <= 0;
  }

  // block를 그리는 메소드
  draw(context) {
    if (this.image.complete) {
      context.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
      this.image.onload = () => {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
      };
    }
  }
}

// 목숨이 하나인 적
class black_Enemy extends Enemy {
  color() {
    this.colorValue = "white";
    this.loadImage("./sources/block/white.png");
  }
}

// 목숨이 2개인 적
class red_Enemy extends Enemy {
  color() {
    if (this.HP === 2) {
      this.colorValue = "red";
      this.loadImage("./sources/block/red.png");
    } else if (this.HP === 1) {
      this.colorValue = "white";
      this.loadImage("./sources/block/white.png");
    }
  }
}

// 목숨이 2개인 적 + 랜덤 이동
class green_Enemy extends Enemy {
  color() {
    if (this.HP === 2) {
      this.colorValue = "green";
      this.loadImage("./sources/block/green.png");
    } else if (this.HP === 1) {
      this.colorValue = "white";
      this.loadImage("./sources/block/white.png");
    }
  }

  position_change() {
    // 현재 행(row)에서 pattern의 값이 0인 열(col)만 추출
    const currentPattern = patterns[level - 1][this.row];
    const emptyCols = [];
    for (let col = 0; col < currentPattern.length; col++) {
      if (currentPattern[col] === 0) {
        emptyCols.push(col);
      }
    }

    // 빈 칸이 있다면 그 중 하나로 이동
    if (emptyCols.length > 0) {
      const randomCol = emptyCols[Math.floor(Math.random() * emptyCols.length)];
      this.col = randomCol;
      // this.x = blockX + this.col * (this.width + 2);
      this.x = this.col;
    } else {
      // 빈 칸이 없다면 현재 위치를 유지
      this.HP = 0;
    }
  }

  //#endregion
}

function countdown321() {
  let countdown = 3;

  // 카운트다운 이미지 요소 생성
  let countdownImg = $("<img id='countdown-img'>").css({
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "200px",
    zIndex: 100,
  });

  countdownImg.attr("src", `./sources/background/${countdown}.png`);
  $("body").append(countdownImg);

  let countdownInterval = setInterval(function () {
    countdown--;
    if (countdown > 0) {
      $("#countdown-img").attr("src", `./sources/background/${countdown}.png`);
    } else {
      clearInterval(countdownInterval);
      $("#countdown-img").remove();

      board.style.display = "block"; // 컷신 후 보드 표시
      resetGame(); // 게임 시작
    }
  }, 1000);
}
