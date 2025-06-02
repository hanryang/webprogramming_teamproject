// 보듸의 크기
let board;
let boardWidth = 1000;
let boardHeight = 650;
let context; 

// 플레이어의 크기 및 속력
let playerWidth = 500;
let playerHeight = 10;
let playerVelocityX = 30; // 10pixel 정도로 움직임

// 플레이어의 구조체
let player = { // 
    x : boardWidth/2 - playerWidth/2,
    y : boardHeight - playerHeight - 5,
    width: playerWidth,
    height: playerHeight,
    velocityX : playerVelocityX
}

// 공의 크기 및 속도
// let ballWidth = 10;
// let ballHeight = 10;
let ballradius = 10; 

let ballspeed; // 벡터의 크기 (속력)
let angle; // 0 ~ 2π 범위의 무작위 각도 (라디안)

let ballVelocityX; // x 방향 성분
let ballVelocityY; // y 방향 성분

// ball의 구조체
let ball = {
    x : boardWidth/2,
    y : boardHeight/2,
    radius : 10,
    // width: ballWidth,
    // height: ballHeight,
    velocityX : ballVelocityX,
    velocityY : ballVelocityY
}

// enemy의 속성
let enemyArray = [];
let enemyWidth = 80;
let enemyHeight = 80;
let enemyColumns = 8; 
let enemyRows = 3; //add more as game goes on
let enemyMaxRows = 10; //limit how many rows
let enemyCount = 0;
let enemyVelocitX = 0;
let enemyVelocitY = 0.1;

// enemy 정렬 시작 위치
let enemyX = 15;
let enemyY = 45;

// 점수 계산
let score = 0;

// gameover 변수
let gameOver = false;

$(document).ready(function () {

    let ballspeed = 10; // 벡터의 크기 (속력)
    let angle = Math.random() * Math.PI; // 0 ~ 2π 범위의 무작위 각도 (라디안)
    let ballVelocityX = ballspeed * Math.cos(angle); // x 방향 성분
    let ballVelocityY = ballspeed * Math.sin(angle); // y 방향 성분

    ball.velocityX = ballVelocityX;
    ball.velocityY = ballVelocityY;

    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;

    context = board.getContext("2d"); // used for drawing on the board

    // draw initial player
    context.fillStyle = "skyblue";
    context.fillRect(player.x, player.y, player.width, player.height);


    $("#game_start").click(function() {

        // 게임 시작 클릭 후 UI를 숨긴다
        $("#game_ui").hide();
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
              requestAnimationFrame(update);
              $(document).on("keydown", movePlayer);
          }
        }, 1000); // 1초 간격으로 카운트다운

    });

    $("#setting").click(function() {

    })


});


// Update 해줘야 할 것들 1. Enemy와 ball의 충돌 여부와 동시에 Enemy와 Player의 충돌 여부 2. Enemy의 내려옴 구현
function update() {

    if (enemyCount == 0) {
        enemyRows = Math.min(enemyRows + 1, enemyMaxRows);
        createenemys();
    }

    requestAnimationFrame(update);
    //stop drawing
    if (gameOver) {
        return;
    }
    // 그린 것 초기화
    context.clearRect(0, 0, board.width, board.height);

    // player 그리기
    context.beginPath();
    context.fillStyle = "lightgreen";
    context.fillRect(player.x, player.y, player.width, player.height);
    context.closePath();

    // ball 그리기
    context.beginPath();
    context.fillStyle = "white";
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    context.fill();
    context.closePath();

    // for 문을 이용해서 10마리 정도의 enemy를 각각 생성해서 출력하게 제작
    enemyDraw();

    //bounce the ball off player paddle
    if (topCollision(ball, player) || bottomCollision(ball, player)) {
        ball.velocityY *= -1;   // flip y direction up or down
    }
    else if (leftCollision(ball, player) || rightCollision(ball, player)) {
        ball.velocityX *= -1;   // flip x direction left or right
    }

    if (ball.y <= 0) { 
        // if ball touches top of canvas
        ball.velocityY *= -1; //reverse direction
    }
    else if (ball.x <= 0 || (ball.x + ball.radius >= boardWidth)) {
        // if ball touches left or right of canvas
        ball.velocityX *= -1; //reverse direction
    }
    else if (ball.y + ball.radius >= boardHeight) {
        // if ball touches bottom of canvas
        context.font = "20px sans-serif";
        context.fillText("Game Over: Press 'Space' to Restart", 80, 400);
        gameOver = true;
    }

    //score
    context.font = "20px sans-serif";
    context.fillText(score, 10, 25);
}

function outOfBounds(xPosition) {
    return (xPosition < 0 || xPosition + playerWidth > boardWidth);
}

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
    }
    else if (e.code == "ArrowRight") {
        let nextplayerX = player.x + player.velocityX;
        if (!outOfBounds(nextplayerX)) {
            player.x = nextplayerX;
        }
        // player.x += player.velocityX;    
    }
}

// 충돌을 감지하는 함수 ball과 enemy의 충돌감지
// function detectCollision(ball, enemy) {
//     return ball.x < enemy.x + enemy.width &&   //ball의 왼쪽 위 코너 corner doesn't reach b's top right corner
//            ball.x + ball.width > enemy.x &&   //a's top right corner passes b's top left corner
//            ball.y < enemy.y + enemy.height &&  //a's top left corner doesn't reach b's bottom left corner
//            ball.y + ball.height > enemy.y;    //a's bottom left corner passes b's top left corner
// }

function detectCollision(circle, rect) {
    // 원의 중심 좌표
    const cx = circle.x;
    const cy = circle.y;
    const r = circle.radius;

    // 사각형의 가장 가까운 점 계산
    const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.height));

    // 원 중심과 가장 가까운 점 사이의 거리 계산
    const dx = cx - closestX;
    const dy = cy - closestY;

    // 피타고라스 정리로 거리 제곱 계산
    return (dx * dx + dy * dy) <= (r * r);
}

function topCollision(ball, enemy) { // ball이 enemy 위에서 충돌했을 경우
    return detectCollision(ball, enemy) && (ball.y + ball.radius) >= enemy.y;
}

function bottomCollision(ball, enemy) { //a is above b (ball is below enemy)
    return detectCollision(ball, enemy) && (enemy.y + enemy.height) >= ball.radius;
}

function leftCollision(ball, enemy) { //a is left of b (ball is left of enemy)
    return detectCollision(ball, enemy) && (ball.x + ball.radius) >= enemy.x;
}

function rightCollision(ball, enemy) { //a is right of b (ball is right of enemy)
    return detectCollision(ball, enemy) && (enemy.x + enemy.width) >= ball.radius;
}


// 무작위 enemy를 만들어 배열에 저장해두는 함수이다. 배열에는 각 enemy 객체를 집어넣었다.
function createenemys() {
    enemyArray = []; // clear enemyArray

    // 0~10개의 적을 무작위로 생성
    enemyCount = Math.floor(Math.random() * 11); // 0~10

    for (let i = 0; i < enemyCount; i++) {
        // 열 위치는 무작위로 지정 (가로 위치)
        const c = Math.floor(Math.random() * enemyColumns); // 열 인덱스
        const x = enemyX + c * enemyWidth + c * 100;
        const y = enemyY; // 처음엔 상단에서 시작

        // 확률에 따라 색상 및 HP 결정
        const rand = Math.random();
        let enemy;

        if (rand < 0.90) { // 5% 확률: 초록색
            enemy = new green_Enemy(2, x, y, enemyVelocitX, enemyVelocitY);
            enemy.color();
        } else if (rand < 0.95) { // 다음 25% 확률: 빨간색
            enemy = new red_Enemy(2, x, y, enemyVelocitX, enemyVelocitY);
            enemy.color();
        } else { // 나머지 70% 확률: 검정색
            enemy = new black_Enemy(1, x, y, enemyVelocitX, enemyVelocitY);
            enemy.color();
        }

        enemyArray.push(enemy);
    }

    // 총 적 수 저장
    enemyCount = enemyArray.length;
}


// enemyArray에 있는 적들을 그리는 함수이다. 만약에 HP가 0일 경우 더이상 그리지 않는다.
function enemyDraw() {
    for (let i = 0; i < enemyArray.length; i++) {
        let enemy = enemyArray[i];

        if (enemy.HP > 0) {
            // 충돌 판정
            let wasHit = false;

            if (topCollision(ball, enemy) || bottomCollision(ball, enemy)) {
                ball.velocityY *= -1;
                enemy.HP -= 1;
                score += 100;
                wasHit = true;
            } else if (leftCollision(ball, enemy) || rightCollision(ball, enemy)) {
                ball.velocityX *= -1;
                enemy.HP -= 1;
                score += 100;
                wasHit = true;
            }

            // HP가 줄었을 경우에만 색 갱신
            if (wasHit) {
                if (enemy instanceof green_Enemy) {
                  enemy.position_change();
                }
                if (enemy.color) enemy.color();
                if (enemy.HP === 0) enemyCount -= 1;
            }

            // 그리기 및 이동
            enemy.draw(context);
            enemy.update(); // x/y 이동
        }
    }
}

function resetGame() { // 게임 초기화
    gameOver = false;
    player = {
        x : boardWidth/2 - playerWidth/2,
        y : boardHeight - playerHeight - 5,
        width: playerWidth,
        height: playerHeight,
        velocityX : playerVelocityX
    }
    ball = {
        x : boardWidth/2,
        y : boardHeight/2,
        width: ballWidth,
        height: ballHeight,
        velocityX : ballVelocityX,
        velocityY : ballVelocityY
    }
    enemyArray = [];
    enemyRows = 3;
    score = 0;
    createenemys();
}

// Enemy 
class Enemy {

  // 생성자
  constructor(HP, x, y, velocityX, velocityY) {
    this.HP = HP;
    this.x = x;
    this.y = y;
    this.width = enemyWidth;
    this.height = enemyHeight;
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

  // enemy를 그리는 메소드
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

class green_Enemy extends Enemy {
  color() {
    if (this.HP === 2) {
      this.colorValue = "green";
    } else if (this.HP === 1) {
      this.colorValue = "white";
    }
  }

position_change() {
  // 가로 방향으로만 랜덤 이동
  const direction = Math.random() < 0.5 ? -200 : 200;
  this.x += direction;

  // 화면 가로 경계를 벗어나지 않도록 제한 (0 ~ boardWidth 범위 내)
  if (this.x < 0) {
    this.x = 0;
  }
  if (this.x + this.width > boardWidth) {
    this.x = boardWidth - this.width;
  }
}
}

