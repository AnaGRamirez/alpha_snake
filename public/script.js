let snake = [{ x: 10, y: 10 }];
let direction = { x: 1, y: 0 };
let currentObstacle = 'A';
let score = 0;
const boardSize = 20;
let speed;
let gameInterval;
let level = 'easy';

// Retrieve the highest score from localStorage
function getHighestScore(level) {
    const scores = JSON.parse(localStorage.getItem('scores')) || {};
    return scores[level] || 0;
}

// Save the highest score to localStorage
function saveHighestScore(level, score) {
    const scores = JSON.parse(localStorage.getItem('scores')) || {};
    scores[level] = score;
    localStorage.setItem('scores', JSON.stringify(scores));
}

// Initialize game on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    level = document.title.includes('Easy') ? 'easy' : document.title.includes('Medium') ? 'medium' : 'hard';
    speed = level === 'easy' ? 300 : level === 'medium' ? 200 : 100;
    const highestScoreElement = document.getElementById('highest-score');
    highestScore = getHighestScore(level);
    if (highestScoreElement) highestScoreElement.textContent = `High Score: ${highestScore}`;
    startGame(level);
});

function startGame(selectedLevel) {
    level = selectedLevel;
    const gameBoard = document.getElementById('game-board');
    if (!gameBoard) {
        console.error('Game board not found!');
        return;
    }

    gameBoard.innerHTML = '';
    snake = [{ x: 10, y: 10 }];
    direction = { x: 1, y: 0 };
    score = 0;
    highestScore = getHighestScore(level);

    createSnake(gameBoard);

    currentObstacle = 'A';
    placeObstacle(gameBoard, currentObstacle);
    document.addEventListener('keydown', changeDirection);

    updateScoreDisplays();
    gameInterval = setInterval(() => {
        moveSnake();
        if (checkCollisions()) {
            endGame();
        } else {
            updateGameBoard();
        }
    }, speed);
}

function createSnake(gameBoard) {
    document.querySelectorAll('.snake').forEach(element => element.remove());
    snake.forEach(segment => {
        const snakeElement = document.createElement('div');
        snakeElement.style.left = segment.x * 20 + 'px';
        snakeElement.style.top = segment.y * 20 + 'px';
        snakeElement.classList.add('snake');
        gameBoard.appendChild(snakeElement);
    });
}

function placeObstacle(gameBoard, obstacle) {
    let obstacleElement = document.querySelector('.obstacle');
    if (obstacleElement) {
        obstacleElement.remove();
    }

    obstacleElement = document.createElement('div');
    obstacleElement.classList.add('obstacle');
    obstacleElement.textContent = typeof obstacle === 'string' ? obstacle.toUpperCase() : obstacle;

    let obstacleX, obstacleY;
    do {
        obstacleX = Math.floor(Math.random() * boardSize);
        obstacleY = Math.floor(Math.random() * boardSize);
    } while (snake.some(segment => segment.x === obstacleX && segment.y === obstacleY));

    obstacleElement.style.left = obstacleX * 20 + 'px';
    obstacleElement.style.top = obstacleY * 20 + 'px';
    gameBoard.appendChild(obstacleElement);
}

function moveSnake() {
    const newHead = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    const obstacle = document.querySelector('.obstacle');
    if (obstacle) {
        const obstacleX = parseInt(obstacle.style.left) / 20;
        const obstacleY = parseInt(obstacle.style.top) / 20;

        if (newHead.x === obstacleX && newHead.y === obstacleY) {
            score++;
            currentObstacle = String.fromCharCode(currentObstacle.charCodeAt(0) + 1);
            placeObstacle(document.getElementById('game-board'), currentObstacle);
            updateScoreDisplays();
            snake.unshift(newHead);
        } else {
            snake.unshift(newHead);
            snake.pop();
        }
    } else {
        snake.unshift(newHead);
        snake.pop();
    }

    if (checkCollisions()) {
        endGame();
    } else {
        updateGameBoard();
    }
}

function changeDirection(event) {
    if (event.key === 'ArrowUp' && direction.y === 0) {
        direction = { x: 0, y: -1 };
    } else if (event.key === 'ArrowDown' && direction.y === 0) {
        direction = { x: 0, y: 1 };
    } else if (event.key === 'ArrowLeft' && direction.x === 0) {
        direction = { x: -1, y: 0 };
    } else if (event.key === 'ArrowRight' && direction.x === 0) {
        direction = { x: 1, y: 0 };
    }
}

function checkCollisions() {
    const head = snake[0];
    if (head.x < 0 || head.x >= boardSize || head.y < 0 || head.y >= boardSize) {
        return true;
    }

    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            return true;
        }
    }
    return false;
}

function endGame() {
    clearInterval(gameInterval);
    if (score > highestScore) {
        saveHighestScore(level, score);
    }
    alert(`Game Over! Your score is ${score}`);
    updateScoreDisplays();
}

function updateGameBoard() {
    createSnake(document.getElementById('game-board'));
}

function updateScoreDisplays() {
    const highestScoreElement = document.getElementById('highest-score');
    const currentScoreElement = document.getElementById('current-score');
    highestScore = getHighestScore(level);
    if (highestScoreElement) highestScoreElement.textContent = `High Score: ${highestScore}`;
    if (currentScoreElement) currentScoreElement.textContent = `Score: ${score}`;
}
