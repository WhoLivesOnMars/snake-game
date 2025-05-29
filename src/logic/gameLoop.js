import { gameState } from './gameState.js';

export function update(ctx, terrain, serpent1, serpent2, tailleCellule) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
    terrain.draw(ctx, tailleCellule);
  
    serpent1.move(terrain);
    serpent2.move(terrain);
  
    serpent1.draw(ctx, tailleCellule);
    serpent2.draw(ctx, tailleCellule);
  }

export function resetTimerDisplay() {
  clearInterval(gameState.countdownInterval);
  clearTimeout(gameState.levelTimer);
  gameState.timerDisplay.textContent = "";
}

export function showGameOverOverlay() {
    const overlay = document.getElementById("overlay");
    const overlayMessage = document.getElementById("overlay-message");
    const restartButton = document.getElementById("restart-button");
  
    overlay.classList.remove("hidden");
    overlayMessage.classList.remove("hidden");
    overlayMessage.textContent = "💀 Game Over !";
    restartButton.textContent = "Recommencer";
  }

  export function endGame() {
    resetTimerDisplay();
    clearInterval(gameState.updateInterval);
    gameState.gameOver = true;
    gameState.gameStarted = false;
  
    showGameOverOverlay();
  }

  export function startLevelTimer() {
    let remainingTime = gameState.levelDuration;

    gameState.timerDisplay.textContent = `⏳ Temps restant : ${remainingTime}s`;

    gameState.countdownInterval = setInterval(() => {
        remainingTime--;
        gameState.timerDisplay.textContent = `⏳ Temps restant : ${remainingTime}s`;

        if (remainingTime <= 0) {
            clearInterval(gameState.countdownInterval);
            endGame();
        }
    }, 1000);
}