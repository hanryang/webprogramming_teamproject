// 보듸의 크기
let board;
const boardWidth = 800;
const boardHeight = 600;
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

// music
let bgmPlayer = null;
const musicMap = {
  music1 : "sources/music/music1.mp3",
  music2 : "sources/music/music2.mp3",
  music3 : "sources/music/music3.mp3"
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

// ball 옵션


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

  setupCanvas();

  start.onclick = function () {
    
    // 게임 시작 클릭 시, 메인 메뉴를 숨기고 게임 보드를 표시
    startMenu.style.display = "none";
    board.style.display = "block";
    level = 1;
    score = 0;
      // 게임 시작 클릭 후 UI를 숨긴다
      // $("#game_ui").hide();

    // bgm 플레이
    playBGM(selectedMusic); 
    // 카운트다운 텍스트 생성 및 표시
    let countdown = 3;

    // 카운트 다운
    let countdownDiv = $("<div id='countdown'></div>").css({
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      fontSize: "60px",
      fontWeight: "bold",
      color: "red",
      zIndex: 100
    }).text(countdown);

    // 카운트 다운 생성
    $("body").append(countdownDiv);

    // countdownInterval을 통해 3초간 게임을 시작하지 않고 기다린다.
    let countdownInterval = setInterval(function () {
      countdown--;
      if (countdown > 0) {
        $("#countdown").text(countdown);
      } else {
        clearInterval(countdownInterval);
        $("#countdown").remove();

        // ⏱ 3초 후에 게임 시작
        // requestAnimationFrame(update);
        resetGame();
        // $(document).on("keydown", movePlayer);
      }
    }, 1000); // 1초 간격으로 카운트다운
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

  // 환경 설정
  const settingsMenu = document.getElementById("settings_menu");
  const btnSetting = document.getElementById("setting");

  btnSetting.addEventListener("click", function () {
    // 메인 메뉴 숨기기
    startMenu.style.display = "none";
    // 설정 메뉴 보이기
    settingsMenu.style.display = "flex";
  });

  const settingsNavItems = document.querySelectorAll("#settings_nav .nav-item");
  const panels = document.querySelectorAll("#settings_content .panel");

  const musicForm = document.getElementById("music_form");
  const ballForm = document.getElementById("ball_form");

  // 네비게이션 아이템 클릭
  settingsNavItems.forEach((navItem) => {
    navItem.addEventListener("click", function () {
      const targetPanel = navItem.getAttribute("data-panel");

      // 모든 nav-item에서 active 클래스 제거
      settingsNavItems.forEach((ni) => ni.classList.remove("active"));
      // 클릭된 항목에만 active 클래스 추가
      navItem.classList.add("active");

      // 모든 패널 숨기기
      panels.forEach((panel) => panel.classList.add("hidden"));

      // “Back”이 클릭된 경우 → 설정 레이어 닫고 메인 메뉴로 복귀
      if (targetPanel === "back") {
        setTimeout(() => {
          settingsMenu.style.display = "none";
          startMenu.style.display = "block";
        }, 100);
      }
      // 그 외 패널이면 해당 패널만 보여주기
      else {
        document.getElementById(targetPanel).classList.remove("hidden");
      }
    });
  });


  let selectedMusic = musicForm.querySelector("input[name='music']:checked").value;

  function playBGM(musicKey) {
    if (bgmPlayer) {
      bgmPlayer.pause();
      bgmPlayer.currentTime = 0;
    }
    bgmPlayer = new Audio(musicMap[musicKey]);
    bgmPlayer.loop = true;
    bgmPlayer.volume = 0.5;
  }

  musicForm.addEventListener("change", (e) => {
    if (e.target.name === "music") {
      selectedMusic = e.target.value;
      playBGM(selectedMusic);
    }
  });

  let selectedBall = ballForm.querySelector("input[name='ball']:checked").value;
  ballForm.addEventListener("change", (e) => {
    if (e.target.name === "ball") {
      selectedBall = e.target.value;
      // TODO: 실제 공 크기/속성 변경 로직을 여기에 추가
    }
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

  // player
  context.fillStyle = "lightgreen";
  context.fillRect(player.x, player.y, player.width, player.height);

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
    if (block.HP === 0) continue;
    if (block.row >= startRow) {
      if (detectCollision(ball, block)) {
        block.HP -= 1; // 충돌 시 HP 감소
        if (block.colorValue == "green") {
          block.position_change(); // 초록색 블록은 위치 변경
        }
        block.color(); // 색상 업데이트
        let collDirect = getCollisionDirection(ball, block);
        if (collDirect) {
          console.log(collDirect);

          handleCollision(ball, block, collDirect);
          if (block.HP <= 0) {
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

// 무작위 block을 만들어 배열에 저장해두는 함수이다. 배열에는 각 block 객체를 집어넣었다.
function createblocks() {
    blockArray = []; // clear blockArray

    // 0~10개의 적을 무작위로 생성
    blockCount = Math.floor(Math.random() * 11); // 0~10

    for (let i = 0; i < blockCount; i++) {
        // 열 위치는 무작위로 지정 (가로 위치)
        const c = Math.floor(Math.random() * blockColumns); // 열 인덱스
        const x = blockX + c * 50 + c * 100;
        const y = blockY; // 처음엔 상단에서 시작

        // 확률에 따라 색상 및 HP 결정
        const rand = Math.random();
        let block;

        // if (rand < 0.90) { // 5% 확률: 초록색
        //     block = new green_Enemy(2, 0, 0, 0, -1); // 목숨, x, y, 속도X, 속도Y
        //     block.color();
        // } else if (rand < 0.95) { // 다음 25% 확률: 빨간색
        //     block = new red_Enemy(2, 0, 0, 0, -1);
        //     block.color();
        // } else { // 나머지 70% 확률: 검정색
        //     block = new black_Enemy(1, 0, 0, -1, -1);
        //     block.color();
        // }

        blockArray.push(block);
    }

    // 총 적 수 저장
    blockCount = blockArray.length;
}


// blockArray에 있는 적들을 그리는 함수이다. 만약에 HP가 0일 경우 더이상 그리지 않는다.
// function blockDraw() {
//     for (let i = 0; i < blockArray.length; i++) {
//         let block = blockArray[i];

//         if (block.HP > 0) {
//             // 충돌 판정
//             let wasHit = false;

//             if (topCollision(ball, block) || bottomCollision(ball, block)) {
//                 ball.velocityY *= -1;
//                 block.HP -= 1;
//                 wasHit = true;
//             } else if (leftCollision(ball, block) || rightCollision(ball, block)) {
//                 ball.velocityX *= -1;
//                 block.HP -= 1;
//                 wasHit = true;
//             }

//             // HP가 줄었을 경우에만 색 갱신
//             if (wasHit) {
//                 if (block instanceof green_Enemy) {
//                   block.position_change();
//                 }
//                 if (block.color) block.color();
//                 if (block.HP === 0) blockCount -= 1;
//             }

//             // 그리기 및 이동
//             block.draw(context);
//             block.update(); // x/y 이동
//           }
//   }
// }

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
  [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0]
  ],
  //level2
  [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0]
  ],
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
  [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1],
    [0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0],
    [0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0]
  ],
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

        // 이부분 수정
        // let block = {
        //   break: false,
        //   breaking: false,
        //   alpha: 1.0,
        //   row: r,
        //   col: c,
        //   x: 0,
        //   y: 0,
        //   width: blockWidth,
        //   height: blockHeight,
        // };

        //#region 변경 block 생성 수정
        // 확률에 따라 색상 및 HP 결정
        const rand = Math.random();
        let block;

        if (rand < 0.05) { // 5% 확률: 초록색
          block = new green_Enemy(2, 0, 0, r, c, 0, 1);
          block.color();
        } else if (rand < 0.30) { // 다음 25% 확률: 빨간색
          block = new red_Enemy(2, 0, 0, r, c, 0, 1);
          block.color();
        } else { // 나머지 70% 확률: 검정색
          block = new black_Enemy(1, 0, 0, r, c, 1, 1);
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
    // if (block.breaking) {
    if (block.HP == 0) {
      block.alpha -= 0.05;
      if (block.alpha <= 0) {
        block.alpha = 0;
        block.breaking = false;
        block.HP == -1; // 블록이 깨졌으므로 HP를 0으로 설정
      }
    }

/*  
    blockArray = [];
    blockRows = 3;
    score = 0;
    createblocks();
*/
    if (block.HP == 0) continue;
    if (block.row >= startRow) {
      let visibleRowIndex = block.row - startRow;
      block.x = blockX + block.col * (block.width + 2);;
      block.y = blockY + visibleRowIndex * (block.height + 2);

      context.globalAlpha = block.alpha ?? 1.0;
      context.fillStyle = block.colorValue ?? "white"; // 기본 색상 및 색 지정
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

  createBlocks();

  if (!isAnimationRunning) {
    requestAnimationFrame(update); // SetInterval과 비슷한 역할을 한다.
    isAnimationRunning = true;
  }

}

// Enemy 
class Enemy {

  // 생성자
  constructor(HP, x, y, r, c, velocityX, velocityY) {
    this.HP = HP;
    this.breaking = false;
    this.x = x;
    this.y = y;
    this.row = r;
    this.col = c;
    this.width = 55;
    this.height = 55;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.colorValue; // 기본 색상
  }

  update() {
    this.x += this.velocityX;
    this.y += this.velocityY;
  }

  // 내려가는 메소드
  move_down() {
    this.y += this.velocityY;
  }

  // 죽는 메소드
  die() {
    return this.HP <= 0;
  }

  // block를 그리는 메소드
  draw(context) {
    context.beginPath();
    context.fillStyle = this.colorValue;
    context.fillRect(this.x, this.y, this.width, this.height);
    context.closePath();
  }
}

// 목숨이 하나인 적
class black_Enemy extends Enemy {
  color() {
    this.colorValue = "white";
  }
}

// 목숨이 2개인 적
class red_Enemy extends Enemy {
  color() {
    if (this.HP === 2) {
      this.colorValue = "red";
    } else if (this.HP === 1) {
      this.colorValue = "white";
    }
  }
}

// 목숨이 2개인 적 + 랜덤 이동
class green_Enemy extends Enemy {
  color() {
    if (this.HP === 2) {
      this.colorValue = "green";
    } else if (this.HP === 1) {
      this.colorValue = "white";
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
}
