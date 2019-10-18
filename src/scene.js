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

    (this.ctx = document.body
      .appendChild(document.createElement("canvas"))
      .getContext("2d")),
      (this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
      }));

    this.renderer.domElement.style.position = this.ctx.canvas.style.position =
      "fixed";
    this.ctx.canvas.style.background = "black";

    // function resize() {
    //   var ratio = 16 / 9,
    //     preHeight = window.innerWidth / ratio;

    //   if (preHeight <= window.innerHeight) {
    //     renderer.setSize(window.innerWidth, preHeight);
    //     ctx.canvas.width = window.innerWidth;
    //     ctx.canvas.height = preHeight;
    //   } else {
    //     var newWidth = Math.floor(
    //       window.innerWidth - (preHeight - window.innerHeight) * ratio
    //     );
    //     newWidth -= newWidth % 2 !== 0 ? 1 : 0;
    //     renderer.setSize(newWidth, newWidth / ratio);
    //     ctx.canvas.width = newWidth;
    //     ctx.canvas.height = newWidth / ratio;
    //   }

    //   renderer.domElement.style.width = "";
    //   renderer.domElement.style.height = "";
    //   renderer.domElement.style.left = ctx.canvas.style.left =
    //     (window.innerWidth - renderer.domElement.width) / 2 + "px";
    //   renderer.domElement.style.top = ctx.canvas.style.top =
    //     (window.innerHeight - renderer.domElement.height) / 2 + "px";
    // }

    // window.addEventListener("resize", resize);

    // resize();

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

    //Objects
    var starColor = (function() {
      var colors = [0xffff00, 0x559999, 0xff6339, 0xffffff];
      return colors[Math.floor(Math.random() * colors.length)];
    })();

    this.star = new THREE.Mesh(
      new THREE.SphereGeometry(5, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0xffffff
      })
    );
    this.glows = [];

    this.star.castShadow = false;
    this.scene.add(this.star);

    for (var i = 1, scaleX = 1.1, scaleY = 1.1, scaleZ = 1.1; i < 5; i++) {
      var starGlow = new THREE.Mesh(
        new THREE.SphereGeometry(5, 32, 32),
        new THREE.MeshBasicMaterial({
          color: starColor,
          transparent: true,
          opacity: 0.5
        })
      );
      starGlow.castShadow = false;
      scaleX += 0.4 + Math.random() * 0.5;
      scaleY += 0.4 + Math.random() * 0.5;
      scaleZ += 0.4 + Math.random() * 0.5;
      starGlow.scale.set(scaleX, scaleY, scaleZ);
      starGlow.origScale = {
        x: scaleX,
        y: scaleY,
        z: scaleZ
      };
      this.glows.push(starGlow);
      this.scene.add(starGlow);
    }

    var planetColors = [
      0x333333, //grey
      0x993333, //ruddy
      0xaa8239, //tan
      0x2d4671, //blue
      0x599532, //green
      0x267257 //bluegreen
    ];
    this.planets = [];

    for (var p = 0, radii = 0; p < 3; p++) {
      var size = 4 + Math.random() * 7,
        type = Math.floor(Math.random() * planetColors.length),
        roughness = Math.random() > 0.6 ? 1 : 0,
        planetGeom = new THREE.Mesh(
          new THREE.IcosahedronGeometry(size, roughness),
          new THREE.MeshLambertMaterial({
            color: planetColors[type],
            shading: THREE.FlatShading
          })
        ),
        planet = new THREE.Object3D();

      planet.add(planetGeom);

      if (type > 1 && Math.random() > 0.5) {
        var atmoGeom = new THREE.Mesh(
          new THREE.IcosahedronGeometry(size + 1.5, roughness),
          new THREE.MeshLambertMaterial({
            color: planetColors[3],
            shading: THREE.FlatShading,
            transparent: true,
            opacity: 0.5
          })
        );

        atmoGeom.castShadow = false;
        planet.add(atmoGeom);
      }

      //radii is order
      planet.orbitRadius = Math.random() * 50 + 50 + radii; //?? location of the radius
      planet.rotSpeed = 0.005 + Math.random() * 0.01;
      planet.rotSpeed *= Math.random() < 0.1 ? -1 : 1;
      planet.rot = Math.random();
      planet.orbitSpeed = (0.02 - p * 0.0048) * 0.25;
      planet.orbit = Math.random() * Math.PI * 2; //
      planet.position.set(planet.orbitRadius, 0, 0);

      radii = planet.orbitRadius + size;
      this.planets.push(planet);
      this.scene.add(planet);

      var orbit = new THREE.Line(
        new THREE.CircleGeometry(planet.orbitRadius, 90),
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.3,
          side: THREE.BackSide
        })
      );

      orbit.geometry.vertices.shift();
      orbit.rotation.x = THREE.Math.degToRad(90);
      this.scene.add(orbit);
    }

    //Lights
    var light1 = new THREE.PointLight(starColor, 2, 0, 0);

    light1.position.set(0, 0, 0);
    this.scene.add(light1);

    var light2 = new THREE.AmbientLight(0x090909);
    this.scene.add(light2);

    //2D
    this.bgStars = [];

    for (var i = 0; i < 500; i++) {
      var tw = {
        x: Math.random(),
        y: Math.random()
      };

      this.bgStars.push(tw);
    }

    this.t = 0;

    // //Stat tracking
    // var stats = new Stats();
    // stats.setMode(0);
    // stats.domElement.style.position = "absolute";
    // stats.domElement.style.left = "0px";
    // stats.domElement.style.top = "0px";

    // document.body.appendChild(stats.domElement);

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

    // var light = new THREE.AmbientLight(0xffffff);

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
      this.scene.add(light);

      this.helperGrid = new THREE.GridHelper(10, 10);
      this.helperGrid.position.y = -0.5;
      this.scene.add(this.helperGrid);

      this.update();
    }
  }

  update() {
    requestAnimationFrame(() => this.update());
    this.controls.update();
    for (var p in this.planets) {
      var planet = this.planets[p];
      planet.rot += planet.rotSpeed;
      planet.rotation.set(0, planet.rot, 0);
      planet.orbit += planet.orbitSpeed;
      planet.position.set(
        Math.cos(planet.orbit) * planet.orbitRadius,
        0,
        Math.sin(planet.orbit) * planet.orbitRadius
      );
    }
    this.ctx.fillStyle = "rgba(0,0,0,0.25)";
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.fillStyle = "rgba(255,255,255,0.25)";

    for (var s in this.bgStars) {
      var q = this.bgStars[s],
        oX = q.x * this.ctx.canvas.width,
        oY = q.y * this.ctx.canvas.height,
        size = Math.random() < 0.9998 ? Math.random() : Math.random() * 3;

      this.ctx.beginPath();
      this.ctx.moveTo(oX, oY - size);
      this.ctx.lineTo(oX + size, oY);
      this.ctx.lineTo(oX, oY + size);
      this.ctx.lineTo(oX - size, oY);
      this.ctx.closePath();
      this.ctx.fill();
    }

    this.t += 0.01;
    this.star.rotation.set(0, this.t, 0);
    for (var g in this.glows) {
      var glow = this.glows[g];
      glow.scale.set(
        Math.max(
          glow.origScale.x - 0.2,
          Math.min(
            glow.origScale.x + 0.2,
            glow.scale.x + (Math.random() > 0.5 ? 0.005 : -0.005)
          )
        ),
        Math.max(
          glow.origScale.y - 0.2,
          Math.min(
            glow.origScale.y + 0.2,
            glow.scale.y + (Math.random() > 0.5 ? 0.005 : -0.005)
          )
        ),
        Math.max(
          glow.origScale.z - 0.2,
          Math.min(
            glow.origScale.z + 0.2,
            glow.scale.z + (Math.random() > 0.5 ? 0.005 : -0.005)
          )
        )
      );
      glow.rotation.set(0, this.t, 0);
    }
    this.render();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

export default Scene;
