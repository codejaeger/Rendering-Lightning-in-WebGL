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
 *  candidates
 *  potFunc: hof that will be used to generate potential function calculater for charges
 *  hitsBoundary : predicate that check for boundary reach
 * Method:
 *  init: initialises system with root node as a charge chosen randomly
 *         pushes its candidates sites and updates the graph
 *  insertCharge
 *  insertCandidate
 */

export default class ElectroStaticSystem {
    constructor(chargeList,eta , hitsBoundary, potFunc) {

        this.chargeList = chargeList; // will be usefull later to reset
        this.charges = {};
        this.eta = eta;
        this.candidates = {}
        this.potFunc = potFunc
        this.hitsBoundary = hitsBoundary;
        this.graph = new ArcsGraph();
    }

    init() {
        // free up older configuration
        this.charges = {}
        this.candidates = {}
        this.graph = new ArcsGraph();
        // update charges list to original 
        this.chargeList.forEach((pos) => {
            const key = pos.toString();
            this.charges[key] = new Charge(key, GLBL.R1, pos, this.potFunc(pos, GLBL.R1))
        })


        //sample a random init site
        const keys = Object.keys(this.charges)
        const si = utils.getSampleIndex(Array(keys.length).fill(1));
        // console.log('si', si);
        const ch = this.charges[keys[si]]

        // insert candidate sites
        ch.getCandidatesPos(GLBL.A).forEach((cpos) => {
            this.insertCandidate(cpos.toString(), cpos, ch.key);
        })
        // update graph and root at this node
        this.graph.insertNode(ch.key, ch.position, 0, -1, false);
        this.graph.rootAt(ch.key);
    }

    insertCharge(key, pos, rad) {
        // insert charge and update the pot at all candidate sites
        if (!this.charges.hasOwnProperty(key)) {
            const ch = new Charge(key, rad, pos, this.potFunc(pos, rad))
            this.charges[ch.key] = ch;
            // update pot at candidates
            Object.keys(this.candidates).forEach((k) => {
                this.candidates[k].potential += ch.calcPotential(this.candidates[k].position)
            })
        }
    }

    insertCandidate(key, pos, pkey) {
        // insert candidate site and update its potential due to all charges
        if (!this.charges.hasOwnProperty(key) && !this.candidates.hasOwnProperty(key)) {
            let potential = 0;
            Object.keys(this.charges).forEach((k)=>{
                potential += this.charges[k].calcPotential(pos)
            })
            const cand = new Candidate(key, pos, potential, pkey)
            this.candidates[key] = cand;
        }
    }

    evolveOnce() {
        // calc prob of candidate sites
        const keys = Object.keys(this.candidates);
        const phiVals = keys.map(k => this.candidates[k].potential);
        const phiMin = Math.min(...phiVals);
        const phiMax = Math.max(...phiVals);
        if ((phiMax - phiMin) < GLBL.EPS) throw Error('div by zero diff');

        const phiNormalized = phiVals.map(phi => (phi - phiMin) / (phiMax - phiMin));
        const probs = phiNormalized.map(phi => Math.pow(phi, this.eta));
        
        // sample a candidate site from prob dist
        const key = keys[utils.getSampleIndex(probs)];
        const cand = this.candidates[key];
        const res = cand.position;
        
        // 0.update graph
        this.graph.insertNode(key,cand.position,cand.potential,cand.parentKey)

        // 1.insert a charge at this site
        this.insertCharge(key,cand.position,GLBL.R1)

        // 2.delete this as candidate site
        delete this.candidates[key];

        // 3.insert candidate sites of new charge added
        this.charges[key].getCandidatesPos(GLBL.A).forEach((cpos) => {
            this.insertCandidate(cpos.toString(), cpos, key);
        })

        return res;
    }

    evolve(steps=Infinity) {
        // run for step iteration 
        // if end point hits boundary stop
        for (let i = 0; i < steps; i++) {
            // console.log(i)
            if (this.hitsBoundary(this.evolveOnce())) {
                console.log('hit')
                break;
            }
        }
    }
}
