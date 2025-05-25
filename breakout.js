// 보듸의 크기
let board;
let boardWidth = 1000;
let boardHeight = 650;
let context; 

// 플레이어의 크기 및 속력
let playerWidth = 80;
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
let ballWidth = 10;
let ballHeight = 10;

let ballspeed; // 벡터의 크기 (속력)
let angle; // 0 ~ 2π 범위의 무작위 각도 (라디안)

let ballVelocityX; // x 방향 성분
let ballVelocityY; // y 방향 성분

// ball의 구조체
let ball = {
    x : boardWidth/2,
    y : boardHeight/2,
    width: ballWidth,
    height: ballHeight,
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

    let ballspeed = 3; // 벡터의 크기 (속력)
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

      enemyAppear(); // enemy을 생성하는 역할
    });

    $("#setting").click(function() {

    })


});


// Update 해줘야 할 것들 1. Enemy와 ball의 충돌 여부와 동시에 Enemy와 Player의 충돌 여부 2. Enemy의 내려옴 구현
function update() {
    requestAnimationFrame(update);
    //stop drawing
    if (gameOver) {
        return;
    }
    // 그린 것 초기화
    context.clearRect(0, 0, board.width, board.height);

    // player 그리기
    context.fillStyle = "lightgreen";
    context.fillRect(player.x, player.y, player.width, player.height);

    // ball 그리기
    context.fillStyle = "white";
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    context.fillRect(ball.x, ball.y, ball.width, ball.height);

    // enemy 그리기
    context.fillStyle = "red";
    for (let i = 0; i < enemyArray.length; ++i) {
      enemyArray[i].x += enemyVelocitX;
      enemyArray[i].y += enemyVelocitY;
      context.fillRect(enemyArray[i].x, enemyArray[i].y, enemyArray[i].width, enemyArray[i].height);
    }

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
    else if (ball.x <= 0 || (ball.x + ball.width >= boardWidth)) {
        // if ball touches left or right of canvas
        ball.velocityX *= -1; //reverse direction
    }
    else if (ball.y + ball.height >= boardHeight) {
        // if ball touches bottom of canvas
        context.font = "20px sans-serif";
        context.fillText("Game Over: Press 'Space' to Restart", 80, 400);
        gameOver = true;
    }

    enemyDraw();

    //next level
    if (enemyCount == 0) {
        score +=  100 * enemyRows * enemyColumns; //bonus points :)
        enemyRows = Math.min(enemyRows + 1, enemyMaxRows);
        createenemys();
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

function detectCollision(ball, enemy) {
    return ball.x < enemy.x + enemy.width &&   //ball의 왼쪽 위 코너 corner doesn't reach b's top right corner
           ball.x + ball.width > enemy.x &&   //a's top right corner passes b's top left corner
           ball.y < enemy.y + enemy.height &&  //a's top left corner doesn't reach b's bottom left corner
           ball.y + ball.height > enemy.y;    //a's bottom left corner passes b's top left corner
}

function topCollision(ball, enemy) { //a is above b (ball is above enemy)
    return detectCollision(ball, enemy) && (ball.y + ball.height) >= enemy.y;
}

function bottomCollision(ball, enemy) { //a is above b (ball is below enemy)
    return detectCollision(ball, enemy) && (enemy.y + enemy.height) >= ball.y;
}

function leftCollision(ball, enemy) { //a is left of b (ball is left of enemy)
    return detectCollision(ball, enemy) && (ball.x + ball.width) >= enemy.x;
}

function rightCollision(ball, enemy) { //a is right of b (ball is right of enemy)
    return detectCollision(ball, enemy) && (enemy.x + enemy.width) >= ball.x;
}


function enemyAppear() {
  createenemys();


}
function createenemys() { // 이 부분에서 난수로 0~10(?)개 정도 난수로 뽑아서 열로 내려오는 것을 구현하면 될 것 같습니다.
    enemyArray = []; //clear enemyArray
    for (let c = 0; c < enemyColumns; c++) {
        for (let r = 0; r < enemyRows; r++) {
            let x = enemyX + c * enemyWidth + c * 100; // c * 10 의 공간을 둔다. colum
            let y = enemyY + r*enemyHeight + r*20 // r * 10 의 공간을 둔다. rows
            let enemy = new Enemy(1, x, y, enemyVelocitX, enemyVelocitY);
            // let enemy = {
            //     x : enemyX + c*enemyWidth + c*10, //c*10 space 10 pixels apart columns
            //     y : enemyY + r*enemyHeight + r*10, //r*10 space 10 pixels apart rows
            //     width : enemyWidth,
            //     height : enemyHeight,
            //     break : false
            // }
            enemyArray.push(enemy);
        }
    }
    enemyCount = enemyArray.length;
}

function enemyDraw() {
    //enemys
    context.fillStyle = "skyblue";
    for (let i = 0; i < enemyArray.length; i++) {
        let enemy = enemyArray[i];
        if (enemy.HP > 0) {
            if (topCollision(ball, enemy) || bottomCollision(ball, enemy)) {
                enemy.HP -= 1;     // enemy is broken
                ball.velocityY *= -1;   // flip y direction up or down
                score += 100;
                enemyCount -= 1;
            }
            else if (leftCollision(ball, enemy) || rightCollision(ball, enemy)) {
                enemy.HP -= 1;     // enemy is broken
                ball.velocityX *= -1;   // flip x direction left or right
                score += 100;
                enemyCount -= 1;
            }
            context.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
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

class Enemy {
  constructor(HP, x, y, velocityX, velocityY) {
    this.HP = HP;
    this.x = x; // 이름 수정
    this.y = y; // 이름 수정
    this.width = enemyWidth;
    this.height = enemyHeight;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
  }

  move_down() {
    this.y += this.velocityY;
  }

  die() {
    return this.HP <= 0;
  }
}

