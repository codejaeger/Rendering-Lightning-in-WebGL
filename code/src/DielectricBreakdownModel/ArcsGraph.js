import GLBL from './Globals';
import * as utils from './Utils';


/**
 * class representing graph struicture of lightninng arc generated
 * Attr:
 *  root: key of root node
 *  nodes: all nodes in graph 
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
        this.nodes = {};
        this.adjList = {};
    }

    insertNode(key, pos, pot, pkey, updateAdjList = true) {

        this.nodes[key] = {
            key,
            pos,
            pot,
            pkey
        }
        if (updateAdjList) {

            // insert object {children key , edge type (primary,secondary) } to adjList
            if (this.adjList.hasOwnProperty(pkey)) {
                this.adjList[pkey].push({ ckey: key, etype: undefined })
            }
            else {
                this.adjList[pkey] = [{ ckey: key, etype: undefined }]
            }
        }
    }

    rootAt(key) {
        this.root = key;
    }

    calcChannels() {

    }
}

