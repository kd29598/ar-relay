

// SCENE
var scene = new THREE.Scene();
scene.position.set(0,0,0);
// var plane = new THREE.GridHelper(100, 10);
// scene.add(plane);
scene.background = null;
// CAMERA
var camera = new THREE.Camera( 80, window.innerWidth / window.innerHeight, 1, 800 );
// camera.position.set(0,0,0.01);


// RENDERER
const dpr = window.devicePixelRatio;
let h=window.innerWidth , w = window.innerHeight;
let d = w<h?w:h
d=w
d=d*0.3
var renderer = new THREE.WebGLRenderer( { antialias: true , alpha:true} );
renderer.setSize(d,d);
renderer.setClearColor( 0x000000, 0 ); // the default

var container=document.getElementById('canvas-container')
container.appendChild( renderer.domElement);

var light2 = new THREE.AmbientLight( 0x20202A, 20, 100 );
light2.position.set( 0,0,0);
scene.add( light2 );


var loader = new THREE.GLTFLoader();

loader.crossOrigin = true;

loader.load( '../arrow.gltf', function ( data ) {
    var object = data.scene;
    console.log(object);
    // boundingBox = new THREE.Box3().setFromObject(object)
    // size = boundingBox.getSize() // Returns Vector3
    // var aa=Math.floor(80/(size.y*100))
    // var bb=Math.floor(250/(size.x*100))
    // console.log(d)
    object.position.set(0,0,0);
    object.scale.set(3,3,1)
    scene.add( object );
    this.object=object;
});

/* //////////////////////////////////////// */

// Render animation on every rendering phase
function render () {
  requestAnimationFrame( render ); 
  renderer.render( scene, camera ); // Render Scene and Camera
  // controls.update(); // For Orbit Controller
}

render();


// Update Camera Aspect Ratio and Renderer ScreenSize on Window resize
// window.addEventListener( 'resize', function () {
//   const dpr = window.devicePixelRatio;
//   let h=window.innerWidth , w = window.innerHeight;
//   // let d = w<h?w:h
//   // w=w*0.3
//   // h=h*0.3
//   // camera.aspect = window.innerWidth / window.innerHeight;
//   // camera.updateProjectionMatrix();
//   // renderer.setSize( d,d );
//   // var aa=Math.floor(1000/d)
//   var aa=Math.floor((d-50)/(this.msize.x))

//   console.log(d,aa,this.msize)
//   // this.object.scale.set(5,aa,1)
// }, false );



/* **************
Created using a tutorial from Redstapler
GLTF 3D Model from Shaw Pen https://codepen.io/shshaw/pen/yPPOEg
************** */
