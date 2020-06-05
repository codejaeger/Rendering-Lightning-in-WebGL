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

}

