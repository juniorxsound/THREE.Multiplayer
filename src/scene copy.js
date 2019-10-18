//Three.js
import * as THREE from "three";

import FirstPersonControls from "./fpscontrols";
FirstPersonControls(THREE);

// Event emitter implementation for ES6
import EventEmitter from "event-emitter-es6";
import OrbitControls from "three-orbitcontrols";
import * as dat from "dat.gui";

// OrbitControls(THREE);
class Scene extends EventEmitter {
  constructor(
    domElement = document.getElementById("gl_context"),
    _width = window.innerWidth,
    _height = window.innerHeight,
    hasControls = true,
    clearColor = "black"
  ) {
    //Since we extend EventEmitter we need to instance it from here
    super();

    //THREE scene
    this.scene = new THREE.Scene();

    //Utility
    this.width = _width;
    this.height = _height;

    // THREE Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.width / this.height,
      0.1,
      1000
    );
    this.camera.position.z = 10;
    this.camera.position.x = 40;
    this.camera.position.y = 50;
    this.camera.lookAt(this.scene.position);
    this.camera.updateMatrixWorld();

    //THREE WebGL renderer
    this.renderer = new THREE.WebGLRenderer({
      antialiasing: true
    });

    this.renderer.setClearColor(new THREE.Color(clearColor));

    this.renderer.setSize(this.width, this.height);

    //Push the canvas to the DOM
    domElement.append(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.update();

    var geometry = new THREE.SphereGeometry(5, 15, 15);
    var material = new THREE.MeshPhongMaterial({
      color: 0x404040
    });
    this.sphere = new THREE.Mesh(geometry, material);
    this.scene.add(this.sphere);

    // Options to be added to the GUI

    // Star params
    // lumn =>
    // size => (white) => dwarf or a nutron  (red) => dwarf or gaint (blue) => Super gaint
    // color => (red/white/blue)
    // age =>
    //
    //

    // Planet the params
    // state (gas/solid/ice)
    // color => (made of/ aalbedos) rocky => gray/redish brown/yellow gas=> red/blue/white/yellow  ice=> blu
    // volume => 4/3 * pi * r^3 || mass/density
    // radius =>  (3* vol/4*pi)^1/3
    // angular velocity => speed/radius
    // albedos => if ice => 0.5 if rock => 0.03  if gas=> 0.5

    // temp => 279*(1-albedos)^(1/4)*1/des^1/2    kelvin

    // mass => volume * density  kg

    // density => mass / vol

    // dist => Rocky => (0.3-1.5) AU || GAs=>(5.2-9.58)AU || Ice (19-30)AU

    // orbital velocity => Gc*Mass/R ^1/2

    // atmosphere =>

    // age

    this.options = {
      velx: 0,
      vely: 0.01,
      camera: {
        speed: 0.0001
      },
      stop: function() {
        this.velx = 0;
        this.vely = 0;
      },
      reset: function() {
        this.velx = 0.1;
        this.vely = 0.1;
        camera.position.z = 75;
        camera.position.x = 0;
        camera.position.y = 0;
        this.sphere.scale.x = 1;
        this.sphere.scale.y = 1;
        this.sphere.scale.z = 1;
        this.sphere.material.wireframe = true;
      }
    };
    var gui = new dat.GUI();

    var cam = gui.addFolder("Camera");
    // cam.add(this.options.camera, "speed", 0, 0.001).listen();
    cam.add(this.camera.position, "y", 0, 100).listen();
    cam.open();

    var velocity = gui.addFolder("Velocity");
    // velocity
    //   .add(this.options, "velx", -0.2, 0.2)
    //   .name("X")
    //   .listen();
    velocity
      .add(this.options, "vely", -0.2, 0.2)
      .name("Y")
      .listen();
    velocity.open();

    var box = gui.addFolder("Cube");
    var testVal = box.add(this.sphere.scale, "x", 0, 3).name("D");
    // console.log("testVal", testVal.getValue());
    testVal.onChange(t => {
      this.sphere.scale.y = t;
      this.sphere.scale.z = t;

      // console.log(t);
    });
    testVal.listen();

    // box
    //   .add(this.sphere.scale, "y", 0, 3)
    //   .name("Height")
    //   .listen();
    // box
    //   .add(this.sphere.scale, "z", 0, 3)
    //   .name("Length")
    //   .listen();
    box.add(this.sphere.material, "wireframe").listen();
    box.open();

    gui.add(this.options, "stop");
    gui.add(this.options, "reset");

    var light = new THREE.AmbientLight(0xffffff);
    {
      const planeSize = 40;

      const loader = new THREE.TextureLoader();
      const texture = loader.load(
        "https://threejsfundamentals.org/threejs/resources/images/checker.png"
      );
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.magFilter = THREE.NearestFilter;
      const repeats = planeSize / 2;
      texture.repeat.set(repeats, repeats);

      const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
      const planeMat = new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(planeGeo, planeMat);
      mesh.rotation.x = Math.PI * -0.5;
      this.scene.add(mesh);
    }

    // {
    //   const skyColor = 0xb1e1ff; // light blue
    //   const groundColor = 0xb97a20; // brownish orange
    //   const intensity = 1;
    //   const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);

    //   this.scene.add(light);
    // }

    {
      const color = 0xffffff;
      const intensity = 1;
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.set(0, 10, 0);
      light.target.position.set(-8, 0, 0);
      this.scene.add(light);
      this.scene.add(light.target);
    }

    {
      const color = 0xffffff;
      const intensity = 1;
      const light = new THREE.SpotLight(color);
      light.position.set(0, -100, 0);
      // light.target.position.set(-8, 0, 0);
      this.scene.add(light);
      // this.scene.add(light.target);
    }
    // var material = new THREE.MeshDepthMaterial({
    //   opacity: 0.1,
    //   blending: THREE.NormalBlending,
    //   depthTest: true
    // });

    // domElement.requestFullscreen();

    // // if (hasControls) {
    //   this.controls = new THREE.FirstPersonControls(
    //     this.camera,
    //     this.renderer.domElement
    //   );
    //   this.controls.lookSpeed = 0.05;
    // }

    //Setup event listeners for events and handle the states
    // window.addEventListener("resize", e => this.onWindowResize(e), false);
    // domElement.addEventListener(
    //   "mouseenter",
    //   e => this.onEnterCanvas(e),
    //   false
    // );
    // domElement.addEventListener(
    //   "mouseleave",
    //   e => this.onLeaveCanvas(e),
    //   false
    // );
    // window.addEventListener("keydown", e => this.onKeyDown(e), false);

    this.helperGrid = new THREE.GridHelper(10, 10);
    this.helperGrid.position.y = -0.5;
    this.scene.add(this.helperGrid);
    // this.clock = new THREE.Clock();

    this.update();
  }

  // drawUsers(positions, id) {
  //   for (let i = 0; i < Object.keys(positions).length; i++) {
  //     if (Object.keys(positions)[i] != id) {
  //       this.users[i].position.set(
  //         positions[Object.keys(positions)[i]].position[0],
  //         positions[Object.keys(positions)[i]].position[1],
  //         positions[Object.keys(positions)[i]].position[2]
  //       );
  //     }
  //   }
  // }

  update() {
    requestAnimationFrame(() => this.update());
    this.controls.update();
    // this.controls.update(this.clock.getDelta());
    // this.controls.target = new THREE.Vector3(0, 0, 0);
    this.sphere.rotation.x += this.options.velx;
    this.sphere.rotation.y += this.options.vely;

    this.render();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  // onWindowResize(e) {
  //   this.width = window.innerWidth;
  //   this.height = Math.floor(window.innerHeight - window.innerHeight * 0.3);
  //   this.camera.aspect = this.width / this.height;
  //   this.camera.updateProjectionMatrix();
  //   this.renderer.setSize(this.width, this.height);
  // }

  // onLeaveCanvas(e) {
  //   this.controls.enabled = false;
  // }
  // onEnterCanvas(e) {
  //   this.controls.enabled = true;
  // }
  // onKeyDown(e) {
  //   this.emit("userMoved");
  // }
}

export default Scene;
