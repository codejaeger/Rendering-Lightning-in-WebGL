/**
 * class representing charge particle
 * Attr:
 *  key
 *  radius
 *  posistion
 *  calcPotential(potential function)
 * 
 * Methods:
 *  
 */

export default class Charge {

    constructor(key, radius, position, calcPotential) {
        this.key = key;
        this.radius = radius;
        this.position = position;
        this.calcPotential = calcPotential
    }
    getCandidatesPos(a) {
        // generate neighbour cells given cell width 'a'
        const pos = this.position;
        const res = [];
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                for (let k = -1; k <= 1; k++) {
                    if (i == j && k == j && i == 0) continue;
                    res.push([pos[0] + i * a, pos[1] + j * a, pos[2] + k * a]);
                }
            }
        }
        return res;
    }
}

