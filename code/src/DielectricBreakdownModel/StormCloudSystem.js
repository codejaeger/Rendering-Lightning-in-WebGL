import GLBL from './Globals';
import Charge from './Charge';
import Candidate from './Candidate';
import ArcsGraph from './ArcsGraph';
import * as utils from './Utils';

/**
 * class representing out breakdown system
 * Attr:
 *  chargeList
 *  charges
 *  eta
 *  R1
 *  R2
 *  A
 *  candidates
 *  potFunc: hof that will be used to generate potential function calculater for charges
 *  hitsBoundary : predicate that check for boundary reach
 * 
 * Method:
 *  init: initialises system with root node as a charge chosen randomly
 *         pushes its candidates sites and updates the graph
 *  insertCharge
 *  insertCandidate
 *  evolveOnce
 *  evolve
 */

export default class StormCloudSystem {
    constructor(eta, cloudplane, cloudcenter, groundplane, groundsigma, R1, R2, A, hitsBoundary) {

        this.charges = {};
        // List of dicts since might have multiple candidate selection sets
        this.candidates = [];
        this.eta = eta;
        this.cloudplane = cloudplane;
        this.cloudcenter = cloudcenter;
        this.groundplane = groundplane;
        this.groundsigma = groundsigma;
        this.R1 = R1;
        this.R2 = R2;
        this.A = A;
        this.hitsBoundary = hitsBoundary;
        this.graph = new ArcsGraph();
    }

    init() {
        // free up older configuration
        this.charges = {}
        this.candidates = []
        this.graph = new ArcsGraph()
        // update charges list to original
    }

    planePotential(coord) {
        return - (sigma * coord[1]) / 2 - (sigma * this.groundplane) / 2
    }

    isCandidate(key) {
        for(i = 0; i < this.candidates.length; i++)
        {
            if(this.candidates[i].hasOwnProperty(key))
                return true
        }
        return false
    }

    insertCharge(key, rad, pos, charge) {
        // insert charge
        var potFunc = function (cpos) {
            return  - this.R / distance(this.pos, cpos);
        }
        const ch = new Charge(key, rad, pos, charge, potFunc, GLBL.neighbour)
        this.charges[ch.key] = ch;
        
        // update pot at candidates
        for (i = 0; i < this.candidates.length; i++)
        {
            Object.keys(this.candidates[i]).forEach((k) => {
                this.candidates[i][k].potential += ch.calcPotential(this.candidates[i][k].position)
            })
        }
    }

    insertCandidate(key, pos, pkey, ckey) {
        // insert candidate site and update its potential due to all charges
        if (!this.charges.hasOwnProperty(key) && !this.isCandidate(key)) {
            let potential = this.planePotential(pos);
            Object.keys(this.charges).forEach((k) => {
                potential += this.charges[k].calcPotential(pos)
            })
            const cand = new Candidate(key, pos, potential, pkey)
            this.candidates[ckey][key] = cand;
        }
    }

    evolveOnce(ckey) {
        // calc prob of candidate sites
        const keys = Object.keys(this.candidates[ckey]);
        const phiVals = keys.map(k => this.candidates[ckey][k].potential);
        const phiMin = Math.min(...phiVals);
        const phiMax = Math.max(...phiVals);
        if ((phiMax - phiMin) < GLBL.EPS) throw Error('div by zero diff');

        const phiNormalized = phiVals.map(phi => (phi - phiMin) / (phiMax - phiMin));
        const probs = phiNormalized.map(phi => Math.pow(phi, this.eta));

        // sample a candidate site from prob dist
        const key = keys[utils.getSampleIndex(probs)];
        const cand = this.candidates[ckey][key];
        const res = [this.charges[cand.parentKey].position, cand.position];

        // 0.update graph
        this.graph.insertNode(key, cand.position, cand.potential, cand.parentKey)

        // 1.insert a charge at this site
        this.insertCharge(key, cand.position, this.R1, this.charges[cand.parentKey].charge)

        // 2.delete this as candidate site
        delete this.candidates[ckey][key];

        // 3.insert candidate sites of new charge added
        this.charges[key].getCandidatesPos(this.A).forEach((cpos) => {
            this.insertCandidate(cpos.toString(), cpos, key, ckey);
        })

        return { 'endPoints': res, key };
    }

    evolve(steps = Infinity) {
        // run for step iteration 
        // if end point hits boundary stop
        for (let i = 0; i < steps; i++) {
            console.log(i)
            const { endPoints, key } = this.evolveOnce();
            if (this.hitsBoundary(endPoints[1])) {
                console.log('hit', key)
                // update graph channels 
                this.graph.boundaryAt(key);
                this.graph.calcChannels();
                return true;
            }
        }
        return false;
    }
}
