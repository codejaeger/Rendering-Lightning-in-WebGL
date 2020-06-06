import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module';

import GLBL from '../DielectricBreakdownModel/Globals';
import ElectroStaticSystem from '../DielectricBreakdownModel/ElectroStaticSystem';
import * as utils from '../DielectricBreakdownModel/Utils';
import GraphRenderer from '../DielectricBreakdownModel/GraphRenderer'



export default function teslaCoil() {

    //  create scene and setup camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 100);
    camera.lookAt(0, 0, 0);

    // init the renderer
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // setup lightning
    const color = 0xFFFFFF;
    const intensity = 2;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);

    // enable window resize response
    window.addEventListener('resize', () => {
        const height = window.innerHeight;
        const width = window.innerWidth;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    })

    // add controls to scene
    const controls = new OrbitControls(camera, renderer.domElement);

    // create a 3d object holder and add it to scene
    const objectsHolder = new THREE.Object3D();
    scene.add(objectsHolder);

    // create texture loader
    const texLoader = new THREE.TextureLoader();


    // create bottom box 
    const boxGeo = new THREE.BoxBufferGeometry(50, 5, 50)
    const boxMat = new THREE.MeshPhongMaterial({
        map: texLoader.load('src/data/Walnut.jpg'),
    });
    const bottomBox = new THREE.Mesh(boxGeo, boxMat);

    // create primary coil
    const primCoilRadius = 10;
    const primCoilGeo = new THREE.CylinderBufferGeometry(primCoilRadius, primCoilRadius, 50, 32);
    const primCoilMat = new THREE.MeshPhongMaterial({
        map: texLoader.load('src/data/cwire.jpg')
    })
    const primCoil = new THREE.Mesh(primCoilGeo, primCoilMat);

    // create secondary coil
    const secCoil = new THREE.Object3D();
    const secCoilRadius = 15
    const secGeo = new THREE.TorusBufferGeometry(secCoilRadius, 0.5, 10, 30);
    const secMat = new THREE.MeshPhongMaterial({
        map: texLoader.load('src/data/sc.jpeg')
    });

    ([-2, 0, 2]).forEach((dy) => {
        const sc = new THREE.Mesh(secGeo, secMat);
        sc.translateY(dy);
        sc.rotateX(Math.PI / 2);
        secCoil.add(sc);
    })

    // create holdingrods
    const hrods = new THREE.Object3D();
    const hrodGeo = new THREE.BoxBufferGeometry(2, 5, 2);
    const hrodMat = new THREE.MeshPhongMaterial({
        map: texLoader.load('src/data/rod.jpg')
    });

    ([Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4]).forEach((theta) => {
        const c = Math.cos(theta);
        const s = Math.sin(theta);
        const hrod = new THREE.Mesh(hrodGeo, hrodMat);
        hrod.translateX(secCoilRadius * c);
        hrod.translateZ(secCoilRadius * s);
        hrod.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), theta);
        hrods.add(hrod);
    })

    // create top toroid 
    const toroidGeo = new THREE.TorusBufferGeometry(primCoilRadius + 5, 5, 10, 30);
    const toroidMat = new THREE.MeshPhongMaterial({
        map:texLoader.load('src/data/tor.jpg')
    })
    const toroid = new THREE.Mesh(toroidGeo,toroidMat);
    toroid.rotateX(Math.PI/2);

    objectsHolder.add(toroid);

    // define scene update function
    const update = () => {
        toroid.translateY(0.1)
    }


    // setup the render loop
    let then = 0;
    function render(now) {
        now *= 0.001;
        const delta = now - then;
        then = now;
        update();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

}

