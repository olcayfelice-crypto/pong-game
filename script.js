const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const leftScoreEl = document.getElementById("leftScore");
const rightScoreEl = document.getElementById("rightScore");

const paddleWidth = 16;
const paddleHeight = 110;
const ballRadius = 10;

const leftPaddle = {
  x: 25,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  speed: 8,
  targetY: canvas.height / 2 - paddleHeight / 2
};

const rightPaddle = {
  x: canvas.width - 25 - paddleWidth,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  speed: 6
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: ballRadius,
  speed: 6,
  vx: 5,
  vy: 4
};

const keys = {
  ArrowUp: false,
  ArrowDown: false
};

let leftScore = 0;
let rightScore = 0;

function updateScoreboard() {
  leftScoreEl.textContent = leftScore;
  rightScoreEl.textContent = rightScore;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function resetBall(direction) {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speed = 6;

  const randomAngle = (Math.random() * 1.2 - 0.6); // between -0.6 and 0.6 radians
  ball.vx = direction * (Math.random() * 2 + 5);
  ball.vy = Math.sin(randomAngle) * 5;
}

function handleInput() {
  if (keys.ArrowUp) {
    leftPaddle.y -= leftPaddle.speed;
  }
  if (keys.ArrowDown) {
    leftPaddle.y += leftPaddle.speed;
  }

  leftPaddle.y = clamp(leftPaddle.y, 0, canvas.height - leftPaddle.height);
}

function updateComputer() {
  const targetY = ball.y - rightPaddle.height / 2;
  const diff = targetY - rightPaddle.y;
  rightPaddle.y += diff * 0.09;
  rightPaddle.y = clamp(rightPaddle.y, 0, canvas.height - rightPaddle.height);
}

function collidesWithPaddle(paddle, ballItem) {
  return (
    ballItem.x + ballItem.radius > paddle.x &&
    ballItem.x - ballItem.radius < paddle.x + paddle.width &&
    ballItem.y + ballItem.radius > paddle.y &&
    ballItem.y - ballItem.radius < paddle.y + paddle.height
  );
}

function updateBall() {
  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
    ball.vy *= -1;
    ball.y = clamp(ball.y, ball.radius, canvas.height - ball.radius);
  }

  if (ball.x - ball.radius <= 0) {
    rightScore++;
    updateScoreboard();
    resetBall(1);
  }

  if (ball.x + ball.radius >= canvas.width) {
    leftScore++;
    updateScoreboard();
    resetBall(-1);
  }

  if (collidesWithPaddle(leftPaddle, ball)) {
    ball.x = leftPaddle.x + leftPaddle.width + ball.radius;
    ball.vx = Math.abs(ball.vx) + 0.25;

    const deltaY = ball.y - (leftPaddle.y + leftPaddle.height / 2);
    ball.vy = deltaY * 0.12 + ball.vy * 0.45;
  }

  if (collidesWithPaddle(rightPaddle, ball)) {
    ball.x = rightPaddle.x - ball.radius;
    ball.vx = -Math.abs(ball.vx) - 0.25;

    const deltaY = ball.y - (rightPaddle.y + rightPaddle.height / 2);
    ball.vy = deltaY * 0.12 + ball.vy * 0.45;
  }
}

function drawPaddle(paddle) {
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#f8fafc";
  ctx.fill();
  ctx.closePath();
}

function drawCenterLine() {
  ctx.setLineDash([10, 12]);
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawCenterLine();
  drawPaddle(leftPaddle);
  drawPaddle(rightPaddle);
  drawBall();
}

function gameLoop() {
  handleInput();
  updateComputer();
  updateBall();
  draw();
  requestAnimationFrame(gameLoop);
}

canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseY = event.clientY - rect.top;
  leftPaddle.y = mouseY - leftPaddle.height / 2;
  leftPaddle.y = clamp(leftPaddle.y, 0, canvas.height - leftPaddle.height);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp" || event.key === "ArrowDown") {
    event.preventDefault();
  }
  if (event.key in keys) {
    keys[event.key] = true;
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key in keys) {
    keys[event.key] = false;
  }
});

updateScoreboard();
resetBall(Math.random() > 0.5 ? 1 : -1);
requestAnimationFrame(gameLoop);