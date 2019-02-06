import * as THREE from 'three';
var OBJLoader = require('three-obj-loader');
OBJLoader(THREE);
import { ShapeMatcher } from './shape-matching.js';

let T = 0.0;
let DT = 0.0001;
let DEFORMATION_SPEED = 200.0;
let DEFORMATION_SPREAD = 4.0;
let STIFFNESS = 0.2;
let BETA = 0.75;
let DAMP = 0.1;

let scene, camera, renderer, material, mesh, geometry, originalGeometry;
let mouseDown = false;
let selectedVertex = null;
let selectedNormal = null;
let cameraAngle = Math.PI/4.0;
let cameraY = 1;
let cameraRadius = 5;
let cameraSpeed = 0.0;
let cameraTarget = new THREE.Vector3(0,0,0.0)
let loader = new THREE.OBJLoader();
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2(0,0);

loader.load(
	'objects/head.obj',
	function ( object ) {
		geometry = new THREE.Geometry().fromBufferGeometry(object.children[0].geometry).scale(0.10,0.10,0.10).translate(0,0.25,0);
    geometry.vertices.forEach((v,i) => {
  		v['_velocity'] = new THREE.Vector3(0,0,0);
  	});
    init();
	},
	function ( xhr ) {
		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
	},
	function ( error ) {
		console.log( 'An error happened' );
	}
);

let init = () => {
  scene = new THREE.Scene();
  let cubeTex = new THREE.CubeTextureLoader()
  	.setPath( 'textures/mp_goldrush/' )
  	.load( [
      'goldrush_rt.png',
  		'goldrush_lf.png',
  		'goldrush_up.png',
  		'goldrush_dn.png',
  		'goldrush_bk.png',
      'goldrush_ft.png'
  	] );
  scene.background = cubeTex;
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
  camera.position.y = cameraY;
  camera.position.z = Math.sin(cameraAngle) * cameraRadius;
  camera.position.x = Math.cos(cameraAngle) * cameraRadius;
  camera.lookAt(cameraTarget);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.getElementById("three").appendChild( renderer.domElement );
  material = new THREE.ShaderMaterial( {
  	uniforms: {
  		time: { value: 1.0 },
  		resolution: { value: new THREE.Vector2() },
      cameraPosition: { value: camera.position },
      tCube: { value: cubeTex }
  	},
  	vertexShader: document.getElementById( 'vertexShader' ).textContent,
  	fragmentShader: document.getElementById( 'fragmentShader' ).textContent
  });
  originalGeometry = geometry.clone();
  mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );
  animate();
};

let updateMesh = () => {
  if (mouseDown && selectedVertex != null) {
    geometry.vertices.forEach((v,i) => {
      let d = (v.x-selectedVertex.x)*(v.x-selectedVertex.x)+(v.y-selectedVertex.y)*(v.y-selectedVertex.y)+(v.z-selectedVertex.z)*(v.z-selectedVertex.z);
      v._velocity.x = DEFORMATION_SPEED*selectedNormal.x/(1+DEFORMATION_SPREAD*d);
      v._velocity.y = DEFORMATION_SPEED*selectedNormal.y/(1+DEFORMATION_SPREAD*d);
      v._velocity.z = DEFORMATION_SPEED*selectedNormal.z/(1+DEFORMATION_SPREAD*d);
    });
  } else {
    let g = ShapeMatcher(originalGeometry.vertices, geometry.vertices, BETA);
    let avgx = 0; let avgy = 0; let avgz = 0;
    geometry.vertices.forEach((v, i) => {
      avgx += v.x / geometry.vertices.length;
      avgy += v.y / geometry.vertices.length;
      avgz += v.z / geometry.vertices.length;
      v._velocity.x = v._velocity.x + STIFFNESS * ((g[i][0] - v.x) / DT);
      v._velocity.y = v._velocity.y + STIFFNESS * ((g[i][1] - v.y) / DT);
      v._velocity.z = v._velocity.z + STIFFNESS * ((g[i][2] - v.z) / DT);
    });
    let avgr = Math.sqrt(avgx*avgx+avgy*avgy+avgz*avgz);
    if (avgr > 0.01) { // constant force towards origin
      avgx /= avgr; avgy /= avgr; avgz /= avgr;
      geometry.vertices.forEach((v, i) => {
        let r = Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
        v._velocity.x -= 10*avgx;
        v._velocity.y -= 10*avgy;
        v._velocity.z -= 10*avgz;
      });
    }
  }
  geometry.vertices.forEach((v, i) => {
    v._velocity.x -= v._velocity.x * DAMP;
    v._velocity.y -= v._velocity.y * DAMP;
    v._velocity.z -= v._velocity.z * DAMP;
    v.x += v._velocity.x * DT;
    v.z += v._velocity.z * DT;
    v.y += v._velocity.y * DT;
  });

}

var animate = function () {
	updateMesh();
	geometry.verticesNeedUpdate = true;
  geometry.computeVertexNormals();
  cameraAngle += cameraSpeed;
  camera.position.y = cameraY;
  camera.position.z = Math.sin(cameraAngle) * cameraRadius;
  camera.position.x = Math.cos(cameraAngle) * cameraRadius;
  camera.lookAt(cameraTarget);
  requestAnimationFrame( animate );
  renderer.render( scene, camera );
  T += DT;
};

let selectVertex = function(event) {
  let raycaster = new THREE.Raycaster();
  mouse.x = (event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	raycaster.setFromCamera(mouse, camera);
	var intersects = raycaster.intersectObject(mesh);
  if (intersects.length == 0) return;
  selectedVertex = geometry.vertices[intersects[0].face.a];
  selectedNormal = intersects[0].face.normal;
}

let reset = () => {
  geometry.vertices.forEach((v,i) => {
    v.x = originalGeometry.vertices[i].x;
    v.y = originalGeometry.vertices[i].y;
    v.z = originalGeometry.vertices[i].z;
    v._velocity.x = 0;
    v._velocity.y = 0;
    v._velocity.z = 0;
  });
}

document.addEventListener("mousemove", function(event) {
  if (!mouseDown) return;
  selectVertex(event);
});

document.addEventListener("mouseup", function(event) {
  mouseDown = false;
});
document.addEventListener("mousedown", function(event) {
  mouseDown = true;
  selectVertex(event);
});
