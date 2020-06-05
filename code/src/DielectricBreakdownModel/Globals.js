import * as THREE from 'three';

export default  {
    EPS : 1e-10,
    ETA:5, 
    R1 : 1.5, // charge size
    A: 3, // grid cell width
    R2: 20, // outer radius limit
    primRad: 0.30, // primary arc radius
    secRad:0.15, // seondary arc radius,
    primCol:new THREE.Color(0,50,255), // color of primary arc
    secCol:new  THREE.Color(0,40, 255), // color of secondary arc
}