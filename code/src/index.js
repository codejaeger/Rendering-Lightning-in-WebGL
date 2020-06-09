// css
import './index.css';

// test
import stochasticModel from './test-scripts/stochasticModel.js';
import dbm from './test-scripts/dbm.js';
import dbm1 from './test-scripts/dbm1.js';
import dbm2 from './test-scripts/dbm2.js';
import dbm3 from './test-scripts/dbm3.js';
import GLBL from './DielectricBreakdownModel/Globals';
import testModel2 from './test-scripts/test2';
import testModel3 from './test-scripts/test3';
import testModel1 from './test-scripts/test1';

// scenes
import teslaCoil from './scenes/teslaCoil';
import plasmaBall from './scenes/plasmaBall';
import electrodes from './scenes/electrodes';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module';


function renderModel(model) {
    switch (model) {
        case 'teslacoil':
            teslaCoil();
            break;
        case 'plasmaball':
            plasmaBall();
            break;
        case 'electrodes':
            electrodes();
            break;
        default:
            console.log('nothing selected');
    }
}

let models = ['teslacoil', 'plasmaball', 'electrodes']

models.forEach((model) => {
    document.getElementById(model).onclick = ((event) => {
        document.getElementById('modelForm').innerHTML = `
            <canvas id='c'></canvas>
        `;

        renderModel(model);
    })
})