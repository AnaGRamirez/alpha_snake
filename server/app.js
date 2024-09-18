// Define the snake's starting position and initial settings
let snake = [{ x: 10, y: 10 }]; // Snake starting position
let direction = { x: 1, y: 0 }; // Initial direction to the right
let currentObstacle = 'A'; // Starting obstacle for easy level
let score = 0;
const boardSize = 20; // Size of the game board
let speed = 200; // Game speed in milliseconds
let gameInterval; // Game interval for controlling the game loop
let level = 'easy'; // Current game level, default to 'easy'


// Retrieve the highest score from localStorage for each level or initialize to 0 if not set
let highestScoreKey = `highestScore_${level}`; // Unique key for each level
let highestScore = localStorage.getItem(highestScoreKey) ? parseInt(localStorage.getItem(highestScoreKey)) : 0;


// Display initial highest score and set up the game
document.addEventListener('DOMContentLoaded', () => {
    const highestScoreElement = document.getElementById('highest-score');
    if (highestScoreElement) highestScoreElement.textContent = `High Score: ${highestScore}`;
    startGame(level); // Start the game in the current level
});


function startGame(selectedLevel) {
    level = selectedLevel;
    highestScoreKey = `highestScore_${level}`; // Update the key based on the level
    highestScore = localStorage.getItem(highestScoreKey) ? parseInt(localStorage.getItem(highestScoreKey)) : 0;


    const gameBoard = document.getElementById('game-board');
    if (!gameBoard) {
        console.error('Game board not found!');
        return; // Stop execution if the game board is not found
    }


    gameBoard.innerHTML = ''; // Clear the board
    snake = [{ x: 10, y: 10 }]; // Reset snake position
    direction = { x: 1, y: 0 }; // Reset direction
    score = 0; // Reset score


    createSnake(gameBoard);


    // Set initial obstacle based on the level
    if (level === 'easy') {
        currentObstacle = 'A'; // Start with 'A' for easy level
    } else if (level === 'medium') {
        currentObstacle = 'Z'; // Start with 'Z' for medium level
    } else if (level === 'hard') {
        currentObstacle = getRandomObstacle();
    }


    placeObstacle(gameBoard, currentObstacle);
    document.addEventListener('keydown', changeDirection);


    // Display initial scores
    updateScoreDisplays();


    // Game interval for moving the snake
    gameInterval = setInterval(() => {
        moveSnake();
        if (checkCollisions()) {
            endGame();
        } else {
            updateGameBoard(); // Update game board after moving
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
    console.log('Snake segments rendered:', snake); // Debug log
}


function placeObstacle(gameBoard, obstacle) {
    let obstacleElement = document.querySelector('.obstacle');
    if (obstacleElement) {
        obstacleElement.remove(); // Remove previous obstacle
    }


    obstacleElement = document.createElement('div');
    obstacleElement.classList.add('obstacle');


    // Ensure obstacle letters are capitalized
    obstacleElement.textContent = typeof obstacle === 'string' ? obstacle.toUpperCase() : obstacle;


    let obstacleX, obstacleY;
    do {
        obstacleX = Math.floor(Math.random() * boardSize);
        obstacleY = Math.floor(Math.random() * boardSize);
    } while (snake.some(segment => segment.x === obstacleX && segment.y === obstacleY));


    obstacleElement.style.left = obstacleX * 20 + 'px';
    obstacleElement.style.top = obstacleY * 20 + 'px';
    gameBoard.appendChild(obstacleElement);
    console.log('Obstacle placed at:', obstacleX, obstacleY, obstacle); // Debug log
}


function moveSnake() {
    const newHead = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };


    const obstacle = document.querySelector('.obstacle');
    if (obstacle) {
        const obstacleX = parseInt(obstacle.style.left) / 20;
        const obstacleY = parseInt(obstacle.style.top) / 20;


        if (newHead.x === obstacleX && newHead.y === obstacleY) {
            // Snake eats the obstacle
            score++;
            console.log('Obstacle eaten:', currentObstacle, 'Score:', score); // Debug log


            // Determine the next obstacle based on the level
            if (level === 'easy') {
                if (currentObstacle === 'Z') {
                    currentObstacle = '1'; // Switch to numbers after letters
                } else if (currentObstacle >= '1' && parseInt(currentObstacle) < 100) {
                    currentObstacle = (parseInt(currentObstacle) + 1).toString();
                } else {
                    currentObstacle = String.fromCharCode(currentObstacle.charCodeAt(0) + 1);
                }
            } else if (level === 'medium') {
                if (currentObstacle === 'A') {
                    currentObstacle = '100'; // Switch to numbers after letters in reverse order
                } else if (currentObstacle <= '100' && parseInt(currentObstacle) > 1) {
                    currentObstacle = (parseInt(currentObstacle) - 1).toString();
                } else {
                    currentObstacle = String.fromCharCode(currentObstacle.charCodeAt(0) - 1);
                }
            } else if (level === 'hard') {
                currentObstacle = getRandomObstacle();
            }


            placeObstacle(document.getElementById('game-board'), currentObstacle);
            updateScoreDisplays(); // Update scores display


            // Only grow the snake if an obstacle is eaten
            snake.unshift(newHead);
        } else {
            // Move the snake without growing
            snake.unshift(newHead);
            snake.pop();
        }
    } else {
        snake.unshift(newHead);
        snake.pop();
    }


    // Check for collisions and update the game board
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


    // Check for collision with walls
    if (head.x < 0 || head.x >= boardSize || head.y < 0 || head.y >= boardSize) {
        return true; // Snake collided with the wall
    }


    // Check for collision with itself
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            return true; // Snake collided with itself
        }
    }


    return false; // No collision detected
}


function endGame() {
    clearInterval(gameInterval); // Stop the game loop


    // Check if current score is higher than the highest score
    if (score > highestScore) {
        highestScore = score;
        localStorage.setItem(highestScoreKey, highestScore.toString()); // Save the new highest score in localStorage
    }


    alert(`Game Over! Your score is ${score}`);
    updateScoreDisplays(); // Update scores after the game ends
}


function updateGameBoard() {
    createSnake(document.getElementById('game-board'));
}


function updateScoreDisplays() {
    const highestScoreElement = document.getElementById('highest-score');
    const currentScoreElement = document.getElementById('current-score');


    if (highestScoreElement) highestScoreElement.textContent = `High Score: ${highestScore}`;
    if (currentScoreElement) currentScoreElement.textContent = `Score: ${score}`;
}


function getRandomObstacle() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return characters.charAt(Math.floor(Math.random() * characters.length));
}
