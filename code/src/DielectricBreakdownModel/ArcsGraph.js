import GLBL from './Globals';
import * as utils from './Utils';


/**
 * class representing graph struicture of lightninng arc generated
 * Attr:
 *  root: key of root node
 *  boundary : key opf leaf boundary node
 *  nodes: all nodes in graph (object)
 *  nodeList: node keys in order of insertion
 *  adjList : adjacency list repr
 * 
 * Methods:
 *  insertNode
 *  rootAt
 *  calcChannels
 *   
 */
export default class ArcsGraph {

    constructor() {
        this.root = undefined;
        this.boundary = undefined;
        this.nodes = {};
        this.adjList = {};
        this.nodeList = [];
    }

    insertNode(key, pos, pot, pkey,updateAdjList = true) {

        this.nodes[key] = {
            key,
            pos,
            pot,
            pkey,
        }
        this.nodeList.push(key);

        if (updateAdjList) {

            // insert object {children key : edge type (primary-0,secondary-1) } to adjList[key]
            if (this.adjList.hasOwnProperty(pkey)) {
                // initially all are secondary channels
                this.adjList[pkey][key] = 1;
            }
            else {
                this.adjList[pkey] = { [key]:1 }
            }
        }
    }

    rootAt(key) {
        this.root = key;
    }
    boundaryAt(key) {
        this.boundary = key;
    }
    calcChannels() {
        // calculate channels for all edges
        let key = this.boundary
        while(key!==this.root) {
            let pkey = this.nodes[key].pkey;
            this.adjList[pkey][key] = 0;
            key = pkey;
        }
    }
}

