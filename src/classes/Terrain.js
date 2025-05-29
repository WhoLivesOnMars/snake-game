import {   
    CASE_EMPTY,
    CASE_OBSTACLE,
    CASE_PLAYER,
    CASE_FOOD,
    CASE_BOT,
    CASE_PORTAL
} from '../utils/constants.js';
import { getRandomInt } from '../utils/utils.js';

export class Terrain {
    constructor(largeur, hauteur) {
        this.largeur = largeur;
        this.hauteur = hauteur;
        this.sol = new Array(largeur);
        for (let i = 0; i < largeur; i++) {
            this.sol[i] = new Array(hauteur).fill(CASE_EMPTY);
        }

        this.activeRock = null;
        this.portalIn = null;
        this.portalOut = null;

        this.generateRocks();
        this.generatePortals();
    }

    generateRocks() {
        if (this.rockIntervalId) {
            clearInterval(this.rockIntervalId);
        }
    
        this.rockIntervalId = setInterval(() => {
            if (this.activeRock) {
                const { x, y } = this.activeRock;
                if (this.sol[x][y] === 1) {
                    this.sol[x][y] = 0;
                }
            }
    
            let x, y;
            do {
                x = Math.floor(Math.random() * (this.largeur - 2)) + 1;
                y = Math.floor(Math.random() * (this.hauteur - 2)) + 1;
            } while ([2, 4, 5].includes(this.sol[x][y]));
    
            this.sol[x][y] = 1;
            this.activeRock = { x, y };
        }, 3000);
    }

    generatePortals() {
        const margin = 2;

        const getValidCoord = () => {
            let i, j;
            do {
                i = getRandomInt(this.hauteur - margin * 2) + margin;
                j = getRandomInt(this.largeur - margin * 2) + margin;
            } while (this.sol[j][i] !== CASE_EMPTY);
            return { i: j, j: i };
        };

        this.portalIn = getValidCoord();
        this.portalOut = getValidCoord();

        this.sol[this.portalIn.i][this.portalIn.j] = CASE_PORTAL;
        this.sol[this.portalOut.i][this.portalOut.j] = CASE_PORTAL;
    }
    
    generateFood() {
        let x, y;
        do {
            x = getRandomInt(this.largeur - 2) + 1;
            y = getRandomInt(this.hauteur - 2) + 1;
        } while ([CASE_PLAYER, CASE_BOT, CASE_OBSTACLE, CASE_PORTAL].includes(this.sol[x][y]));        
    
        this.sol[x][y] = CASE_FOOD;
    }

    draw(ctx, tailleCellule) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // очищаем
    
        ctx.font = `${tailleCellule * 0.8}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
    
        for (let i = 0; i < this.largeur; i++) {
            for (let j = 0; j < this.hauteur; j++) {
                const code = this.sol[i][j];
                const x = j * tailleCellule + tailleCellule / 2;
                const y = i * tailleCellule + tailleCellule / 2;
    
                if (
                    (this.portalIn && i === this.portalIn.i && j === this.portalIn.j) ||
                    (this.portalOut && i === this.portalOut.i && j === this.portalOut.j)
                ) {
                    ctx.fillText("🌀", x, y);
                    continue;
                }
    
                switch (code) {
                    case 1: // CASE_OBSTACLE
                        ctx.fillText("🚧", x, y);
                        break;
                    case 3: // CASE_FOOD
                        ctx.fillText("🍊", x, y);
                        break;
                }
            }
        }
    
        // Сетка (опционально)
        ctx.strokeStyle = "gray";
        for (let i = 0; i <= this.largeur; i++) {
            ctx.beginPath();
            ctx.moveTo(i * tailleCellule, 0);
            ctx.lineTo(i * tailleCellule, this.hauteur * tailleCellule);
            ctx.stroke();
        }
        for (let j = 0; j <= this.hauteur; j++) {
            ctx.beginPath();
            ctx.moveTo(0, j * tailleCellule);
            ctx.lineTo(this.largeur * tailleCellule, j * tailleCellule);
            ctx.stroke();
        }
    }

    read(i, j ) {
        if (i < 0 || i >= this.largeur || j < 0 || j >= this.hauteur) {
            return CASE_OBSTACLE;
        }
        return this.sol[i][j];
    }

    write(i, j, val) {
        if (i >= 0 && i < this.largeur && j >= 0 && j < this.hauteur) {
            if (this.sol[i][j] === CASE_PORTAL && val === CASE_EMPTY) return;
            this.sol[i][j] = val;
        }
    }
}