import { Anneau } from './Anneau.js';
import {
    CASE_EMPTY,
    CASE_OBSTACLE,
    CASE_PLAYER,
    CASE_FOOD,
    CASE_BOT
} from '../utils/constants.js';
import { gameState } from '../logic/gameState.js';
import { resetTimerDisplay, endGame } from '../logic/gameLoop.js';

export class Serpent {
    constructor(length, i, j, direction, isPlayer = false) {
        this.anneaux = [];
        this.direction = direction;
        this.isPlayer = isPlayer;
        this.lastTurnTime = Date.now();
        this.lastBotTurn = Date.now();

        for (let k = 0; k < length; k++) {
            this.anneaux.push(new Anneau(i, j, "black"));
        }

        this.updateColors();
    }

    updateColors() {
        const length = this.anneaux.length;
        for (let k = 0; k < length; k++) {
            const t = k / (length - 1);
            if (this.isPlayer) {
                const r = Math.floor(0 + (153 - 0) * t);
                const g = Math.floor(100 + (255 - 100) * t);
                const b = Math.floor(0 + (153 - 0) * t);
                this.anneaux[k].color = `rgb(${r},${g},${b})`;
            } else {
                const gray = Math.floor(102 + (221 - 102) * t);
                this.anneaux[k].color = `rgb(${gray},${gray},${gray})`;
            }
        }
    }

    draw(ctx, tailleCellule) {
        this.anneaux.forEach(anneau => anneau.draw(ctx, tailleCellule));
    }

    move(terrain) {
        const head = this.anneaux[0];
        let cellCode = head.read(this.direction, terrain);

        if (!this.isPlayer) {
            const now = Date.now();
            const changeInterval = 1000;

            if ([CASE_OBSTACLE, CASE_PLAYER, CASE_FOOD, CASE_BOT].includes(cellCode) || now - this.lastBotTurn > changeInterval) {
                const directions = [0, 1, 2, 3];
                let moved = false;

                while (directions.length > 0 && !moved) {
                    const idx = Math.floor(Math.random() * directions.length);
                    const newDir = directions.splice(idx, 1)[0];
                    const newCode = head.read(newDir, terrain);

                    if (newCode === CASE_EMPTY) {
                        this.direction = newDir;
                        cellCode = newCode;
                        this.lastBotTurn = now;
                        moved = true;
                    }
                }

                if (!moved) return;
            }
        }

        if (typeof cellCode === 'object' && cellCode.type === 'PORTAL') {
            const oldTail = this.anneaux[this.anneaux.length - 1];
            terrain.write(oldTail.i, oldTail.j, CASE_EMPTY);
            for (let k = this.anneaux.length - 1; k > 0; k--) {
                this.anneaux[k].copy(this.anneaux[k - 1]);
            }
            head.i = cellCode.target.i;
            head.j = cellCode.target.j;
            this.writeBodyToTerrain(terrain);
            this.updateColors();
            return;
        }

        if (cellCode === CASE_EMPTY || (cellCode === CASE_FOOD && this.isPlayer)) {
            const tail = this.anneaux[this.anneaux.length - 1];
            terrain.write(tail.i, tail.j, CASE_EMPTY);

            for (let k = this.anneaux.length - 1; k > 0; k--) {
                this.anneaux[k].copy(this.anneaux[k - 1]);
            }

            switch (this.direction) {
                case 0: head.i--; break;
                case 1: head.j++; break;
                case 2: head.i++; break;
                case 3: head.j--; break;
            }

            this.writeBodyToTerrain(terrain);

            if (cellCode === CASE_FOOD && this.isPlayer) {
                const oldTail = this.anneaux[this.anneaux.length - 1];
                const newTail = new Anneau(oldTail.i, oldTail.j, "yellow");
                this.anneaux.push(newTail);

                gameState.score++;
                gameState.scoreDisplay.textContent = `Score : ${gameState.score}`;
                terrain.generateFood();

                if (gameState.mode === "aventure") {
                    gameState.fruitsCollected++;

                    if (gameState.fruitsCollected >= gameState.fruitsToCollect) {
                        resetTimerDisplay();
                        clearInterval(gameState.updateInterval);

                        gameState.level++;
                        gameState.fruitsCollected = 0;
                        gameState.fruitsToCollect++;
                        gameState.levelDuration += 3;
                        gameState.awaitingNextLevel = true;

                        gameState.messageDisplay.textContent = `✅ Niveau ${gameState.level - 1} réussi ! Appuyez sur une flèche pour continuer...`;
                        gameState.gameStarted = false;
                    }
                }
            }

            this.updateColors();
            return;
        }

        if ([CASE_OBSTACLE, CASE_PLAYER, CASE_BOT].includes(cellCode)) {
            if (this.isPlayer) {
                endGame();
            } else {
                this.direction = Math.floor(Math.random() * 4);
            }
        }
    }

    writeBodyToTerrain(terrain) {
        for (let k = 0; k < this.anneaux.length; k++) {
            const val = this.isPlayer ? CASE_PLAYER : CASE_BOT;
            terrain.write(this.anneaux[k].i, this.anneaux[k].j, val);
        }
    }

    extend() {
        const oldTail = this.anneaux[this.anneaux.length - 1];
        const newTail = new Anneau(oldTail.i, oldTail.j, "yellow");
        this.anneaux.push(newTail);
        this.updateColors();
    }
}
