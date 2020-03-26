import './index.css';
import stochasticModel from './stochasticModel.js';
import dbm from './dbm.js';


const i = parseInt(prompt("enter index of model:"));
if (i === 0) {
    stochasticModel();
}
else if (i === 1) {
    dbm();
}
