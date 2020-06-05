import GLBL from './Globals';
import Charge from './Charge';
import Candidate from './Candidate';
import * as utils from './Utils';

/**
 * class representing out breakdown system
 * Attr:
 *  charges
 *  hitsBoundary : predicate that check for boundary reach
 */

export default class ElectroStaticSystem {
    constructor(chargeList, hitsBoundary) {
        this.charges = {};
        chargeList.forEach((pos) => {
            const key = pos.toString();
            this.charges[key] = new Charge(key, GLBL.R1, pos, (p) => {
                let r = utils.distance(p, pos)
                return 1 - GLBL.R1 / r;
            })
        })
        this.hitsBoundary = hitsBoundary;
    }


}
