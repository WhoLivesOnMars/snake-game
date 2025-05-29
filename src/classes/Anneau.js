export class Anneau {
	constructor(i, j, color) {
		this.i = i;
		this.j = j;
		this.color = color;
	}

    draw(ctx, tailleCellule) {
		ctx.fillStyle = this.color;
		ctx.fillRect(this.j * tailleCellule, this.i * tailleCellule, tailleCellule, tailleCellule);
	}

    copy(a) {
        this.i = a.i;
        this.j = a.j;
    }

    read(direction, terrain) {
        let nextI = this.i;
        let nextJ = this.j;
    
        switch (direction) {
            case 0: nextI = this.i - 1; break; // en haut
            case 1: nextJ = this.j + 1; break; // à droite
            case 2: nextI = this.i + 1; break; // en bas
            case 3: nextJ = this.j - 1; break; // à gauche
        }

        if (
            terrain.portalIn &&
            terrain.portalOut &&
            nextI === terrain.portalIn.i &&
            nextJ === terrain.portalIn.j
        ) {
            return { type: 'PORTAL', target: terrain.portalOut };
        }
    
        if (
            terrain.portalIn &&
            terrain.portalOut &&
            nextI === terrain.portalOut.i &&
            nextJ === terrain.portalOut.j
        ) {
            return { type: 'PORTAL', target: terrain.portalIn };
        }
    
        return terrain.read(nextI, nextJ);
    }
    
}