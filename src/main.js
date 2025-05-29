import { tailleCellule as defaultCellSize } from './utils/constants.js';
import { Serpent } from './classes/Serpent.js';
import { Terrain } from './classes/Terrain.js';
import { update, startLevelTimer } from './logic/gameLoop.js';
import { gameState } from './logic/gameState.js';

// Lien DOM
gameState.messageDisplay = document.getElementById("message");
gameState.timerDisplay = document.getElementById("timer");
gameState.scoreDisplay = document.getElementById("score");

const introMusic = document.getElementById("intro-music");
const musicToggleBtn = document.getElementById("music-toggle");
let musicPlaying = false;

const canvas = document.getElementById("terrain");
const ctx = canvas.getContext("2d");

// Dimensions du terrain
let tailleCellule = defaultCellSize;
let nbColonnes, nbLignes;

// Détection mobile
const isMobile = window.innerWidth <= 767;

if (isMobile) {
  nbColonnes = 15;
  nbLignes = 15;
} else {
  nbColonnes = 20;
  nbLignes = 20;
}
canvas.width = nbColonnes * tailleCellule;
canvas.height = nbLignes * tailleCellule;

// Éléments d'interface
const startButton = document.getElementById("start-button");
const overlay = document.getElementById("overlay");
const restartButton = document.getElementById("restart-button");
const exitButton = document.getElementById("exit-button");

const fullscreenBtn = document.getElementById("fullscreen");
const introScreen = document.getElementById("intro-screen");
const gameWrapper = document.getElementById("game-wrapper");
const rightPanel = document.getElementById("info-panel");

let serpent1, serpent2, terrain;

// Initialisation des objets de jeu
function initGameObjects() {
  serpent1 = new Serpent(5, 5, 5, 1, true);
  serpent2 = new Serpent(7, 10, 10, 2, false);
  terrain = new Terrain(nbColonnes, nbLignes);
  terrain.generateFood();
}

// Sélection du mode "Survivant"
document.getElementById("btn-survivant").addEventListener("click", () => {
  gameState.mode = "survivant";
  introScreen.classList.add("hidden");
  gameWrapper.classList.remove("hidden");
  fullscreenBtn.classList.remove("hidden");
  rightPanel.classList.add("hidden");
});

// Sélection du mode "Aventure"
document.getElementById("btn-aventure").addEventListener("click", () => {
  gameState.mode = "aventure";
  introScreen.classList.add("hidden");
  gameWrapper.classList.remove("hidden");
  fullscreenBtn.classList.remove("hidden");
  rightPanel.classList.add("hidden");
});

function showMobileControlsIfNeeded() {
    const controls = document.getElementById("mobile-controls");
    if (window.innerWidth <= 767) {
      controls.classList.remove("hidden");
    }
  }

// Lancement du jeu
startButton.addEventListener("click", () => {
  startButton.classList.add("hidden");
  document.getElementById("start-panel").classList.add("hidden");
  overlay.classList.add("hidden");
  showMobileControlsIfNeeded();

  resetAndStartGame();
});

// Sortie vers l’écran d’intro
exitButton.addEventListener("click", () => {
  overlay.classList.add("hidden");
  document.getElementById("overlay-message").classList.add("hidden");
  gameWrapper.classList.add("hidden");
  introScreen.classList.remove("hidden");
  document.getElementById("mobile-controls").classList.add("hidden");

  document.getElementById("start-panel").classList.remove("hidden");
  startButton.classList.remove("hidden");

  gameState.mode = null;
  gameState.level = 1;
  gameState.fruitsCollected = 0;
  gameState.fruitsToCollect = 3;
  gameState.levelDuration = 15;
  gameState.score = 0;
  gameState.gameOver = false;
  gameState.gameStarted = false;
  gameState.canRender = false;

  gameState.scoreDisplay.textContent = "Score : 0";
  gameState.messageDisplay.textContent = "";
  gameState.timerDisplay.textContent = "";

  rightPanel.classList.add("hidden");
  fullscreenBtn.classList.add("hidden");
});

// Recommencer après Game Over
restartButton.addEventListener("click", () => {
  if (gameState.gameOver) {
    showMobileControlsIfNeeded();
    resetAndStartGame();
  }
});

// Réinitialisation complète du jeu
function resetAndStartGame() {
  overlay.classList.add("hidden");
  document.getElementById("overlay-message").classList.add("hidden");

  clearInterval(gameState.updateInterval);
  initGameObjects();

  gameState.score = 0;
  gameState.fruitsCollected = 0;
  gameState.level = 1;
  gameState.fruitsToCollect = 3;
  gameState.levelDuration = 15;
  gameState.gameOver = false;
  gameState.gameStarted = true;
  gameState.awaitingNextLevel = false;
  gameState.canRender = true;

  gameState.scoreDisplay.textContent = "Score : 0";
  gameState.timerDisplay.textContent = "";
  gameState.messageDisplay.textContent = "";

  gameState.updateInterval = setInterval(() => {
    update(ctx, terrain, serpent1, serpent2, tailleCellule);
  }, 190);

  if (gameState.mode === "aventure") {
    rightPanel.classList.remove("hidden");
    gameState.messageDisplay.textContent = `🌟 Niveau ${gameState.level} : Collectez ${gameState.fruitsToCollect} fruits`;
    startLevelTimer();
  } else {
    rightPanel.classList.add("hidden");
  }
}

// Passer au niveau suivant (mode aventure)
function nextLevel() {
  clearInterval(gameState.updateInterval);

  terrain.sol.forEach(col => col.fill(0));
  terrain.activeRock = null;
  terrain.portalIn = null;
  terrain.portalOut = null;
  terrain.generateRocks();
  terrain.generatePortals();
  terrain.generateFood();

  serpent1 = new Serpent(5, 5, 5, 1, true);
  serpent1.extend(); serpent1.extend(); serpent1.extend(); serpent1.extend();
  serpent2 = new Serpent(7, 10, 10, 2, false);

  gameState.fruitsCollected = 0;
  gameState.fruitsToCollect++;
  gameState.levelDuration += 3;
  gameState.gameStarted = true;
  gameState.awaitingNextLevel = false;
  gameState.canRender = true;

  gameState.messageDisplay.textContent = `🌟 Niveau ${gameState.level} : Collectez ${gameState.fruitsToCollect} fruits`;

  gameState.updateInterval = setInterval(() => {
    update(ctx, terrain, serpent1, serpent2, tailleCellule);
  }, 190);

  startLevelTimer();
}

// Contrôle clavier
window.addEventListener("keydown", (event) => {
  const keyMap = {
    "ArrowUp": 0,
    "ArrowRight": 1,
    "ArrowDown": 2,
    "ArrowLeft": 3
  };
  const newDirection = keyMap[event.key];

  if (
    newDirection !== undefined &&
    gameState.gameStarted &&
    !gameState.gameOver
  ) {
    serpent1.direction = newDirection;
  }

  if (
    newDirection !== undefined &&
    !gameState.gameStarted &&
    !gameState.gameOver &&
    gameState.mode === "aventure"
  ) {
    nextLevel();
  }
});

// Gestion des flèches tactiles pour mobile
document.querySelectorAll(".arrow-btn").forEach(button => {
    button.addEventListener("click", () => {
      const dir = parseInt(button.dataset.dir);
  
      if (
        gameState.gameStarted &&
        !gameState.gameOver
      ) {
        serpent1.direction = dir;
      }
  
      if (
        !gameState.gameStarted &&
        !gameState.gameOver &&
        gameState.mode === "aventure"
      ) {
        nextLevel();
      }
    });
  });  

// Mode plein écran
fullscreenBtn.addEventListener("click", () => {
  const panel = document.getElementById("game-layout");

  if (panel.requestFullscreen) {
    panel.requestFullscreen();
  }

  setTimeout(() => {
    const scaleX = Math.floor(screen.width / nbColonnes);
    const scaleY = Math.floor(screen.height / nbLignes);
    tailleCellule = Math.min(scaleX, scaleY);

    canvas.width = nbColonnes * tailleCellule;
    canvas.height = nbLignes * tailleCellule;
    canvas.style.width = canvas.width + "px";
    canvas.style.height = canvas.height + "px";

    if (gameState.canRender) {
      update(ctx, terrain, serpent1, serpent2, tailleCellule);
    }
  }, 300);
});

// Revenir à la taille normale après sortie de plein écran
document.addEventListener("fullscreenchange", () => {
  const isFullscreen = !!document.fullscreenElement;

  if (isFullscreen) {
    document.body.classList.add("fullscreen");
  } else {
    document.body.classList.remove("fullscreen");

    tailleCellule = defaultCellSize;
    canvas.width = nbColonnes * tailleCellule;
    canvas.height = nbLignes * tailleCellule;
    canvas.style.width = "";
    canvas.style.height = "";

    if (gameState.canRender) {
      update(ctx, terrain, serpent1, serpent2, tailleCellule);
    }
  } 
});

musicToggleBtn.addEventListener("click", () => {
    if (musicPlaying) {
      introMusic.pause();
      musicToggleBtn.textContent = "🔇";
    } else {
      introMusic.play().catch(() => {});
      musicToggleBtn.textContent = "🔊";
    }
    musicPlaying = !musicPlaying;
});