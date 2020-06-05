import './index.css';
import stochasticModel from './stochasticModel.js';
import dbm from './dbm.js';
import dbm1 from './dbm1.js';
import GLBL from './DielectricBreakdownModel/Globals';
import ElectroStaticSystem from './DielectricBreakdownModel/ElectroStaticSystem';
import * as utils from './DielectricBreakdownModel/Utils';
import testModel from './test';

// const i = parseInt(prompt("enter index of model:"));
// if (i === 0) {
//     stochasticModel();
// }
// else if (i === 1) {
//     dbm();
// }
// else if (i == 2) {
//     dbm1();
// }

// let system = new ElectroStaticSystem([[0,0,0],[1,1,1],[2,2,2]],1,(pos)=>{
//     return utils.distance(pos,[0,0,0])>GLBL.R2;
// },utils.potFuncForUnitCenteredCharge)


// system.init()
// system.evolve(5)
// console.log(JSON.parse(JSON.stringify(system)))

// testModel();s