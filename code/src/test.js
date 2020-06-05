import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module';
import GLBL from './DielectricBreakdownModel/Globals';
import ElectroStaticSystem from './DielectricBreakdownModel/ElectroStaticSystem';
import * as utils from './DielectricBreakdownModel/Utils';



const testModel = () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 100);
    camera.lookAt(0, 0, 0);
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({ canvas });

    {
        const color = 0xFFFFFF;
        const intensity = 2;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
    }


    renderer.setSize(window.innerWidth, window.innerHeight);
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new BloomPass(
        2,    // strength
        9,   // kernel size
        0.7,    // sigma ?
        2560,  // blur render target resolution
    );
    composer.addPass(bloomPass);

    const filmPass = new FilmPass(
        0.35,   // noise intensity
        0.025,  // scanline intensity
        648,    // scanline count
        false,  // grayscale
    );
    filmPass.renderToScreen = true;
    // document.body.appendChild(renderer.domElement);
    composer.addPass(filmPass);



    window.addEventListener('resize', () => {
        const height = window.innerHeight;
        const width = window.innerWidth;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    })

    const controls = new OrbitControls(camera, renderer.domElement);
    // const geometry = new THREE.BoxGeometry(10, 10, 10);

    // const material = new THREE.MeshBasicMaterial({color:'white'});
    // const cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);


    function getLine(points) {
        // const material = new THREE.LineBasicMaterial({ color: new THREE.Color(0, 255, 255) });
        // const geometry = new THREE.BufferGeometry().setFromPoints(points);
        // const line = new THREE.Line(geometry, material);
        let p0 = points[0]
        let p1 = points[1]

        let v = p1.clone().sub(p0.clone())
        let u = new THREE.Vector3(0,1,0)
        let mid = ((p1.clone().add(p0.clone()))).divideScalar(2);
        // console.log('v',v)
        // console.log('mid',mid)
        var geometry = new THREE.CylinderGeometry(0.125, 0.2, v.length(), 32);
        var material = new THREE.MeshBasicMaterial({ color: new THREE.Color(0, 255, 255) });
        var cylinder = new THREE.Mesh(geometry, material);

        u = u.normalize();
        v = v.normalize();
        let axis = u.clone().cross(v);
        axis = axis.normalize();
        let angle = Math.acos(u.clone().dot(v));
        // console.log(axis,angle)
        cylinder.translateX(mid.x)
        cylinder.translateY(mid.y)
        cylinder.translateZ(mid.z)
        if(axis.length()>GLBL.EPS) {
            cylinder.rotateOnWorldAxis(axis,angle);
        }


        return cylinder;
    }


    // let flag = false;
    let counter = 500;
    let system = new ElectroStaticSystem([[0, 0, 0]], 1, (pos) => {
        return utils.distance(pos, [0, 0, 0]) > GLBL.R2;
    }, utils.potFuncForUnitCenteredCharge)


    system.init()

    const update = () => {
        if (counter > 0) {
            const endPoints = system.evolveOnce()['endPoints'];
            const _l = getLine(([new THREE.Vector3(...endPoints[0]), new THREE.Vector3(...endPoints[1])]));
            scene.add(_l);
        }
        counter -= 1;
    }

    const gui = new GUI();
    {
        const folder = gui.addFolder('BloomPass');
        folder.add(bloomPass.copyUniforms.opacity, 'value', 0, 2).name('strength');
        folder.open();
    }
    {
        const folder = gui.addFolder('FilmPass');
        folder.add(filmPass.uniforms.grayscale, 'value').name('grayscale');
        folder.add(filmPass.uniforms.nIntensity, 'value', 0, 1).name('noise intensity');
        folder.add(filmPass.uniforms.sIntensity, 'value', 0, 1).name('scanline intensity');
        folder.add(filmPass.uniforms.sCount, 'value', 0, 1000).name('scanline count');
        folder.open();
    }


    let then = 0;
    // let l_ = getLine([new THREE.Vector3(0,0,0),new THREE.Vector3(0,20,0)])
    // scene.add(l_)
    // let l__ = getLine([new THREE.Vector3(10,10,0),new THREE.Vector3(20,20,0)])
    // scene.add(l__)
    
    function render(now) {
        now *= 0.001;
        const deltaTime = now - then;
        then = now;
        // renderer.render(scene, camera);
        update();
        composer.render(deltaTime);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    // const GameLoop = () => {
    //     requestAnimationFrame(GameLoop);
    //     update();
    //     render();
    // }
    // GameLoop()

}

export default testModel;