//Three.js
import * as THREE from 'three';
import { Interaction } from 'three.interaction';

import FirstPersonControls from './fpscontrols';
FirstPersonControls(THREE);

// Event emitter implementation for ES6
import EventEmitter from 'event-emitter-es6';
import OrbitControls from 'three-orbitcontrols';
import * as dat from 'dat.gui';

// OrbitControls(THREE);
class HomeScene extends EventEmitter {
	constructor(
		domElement = document.getElementById('home_context'),
		_width = window.innerWidth,
		_height = window.innerHeight,
		hasControls = true,
		clearColor = 'blacl',
		currentScene = 1
	) {
		//Since we extend EventEmitter we need to instance it from here
		super();
		(this.ctx = document.body.appendChild(document.createElement('canvas')).getContext('2d')),
			(this.renderer = new THREE.WebGLRenderer({
				antialias: true,
				alpha: true,
			}));

		this.renderer.domElement.style.position = this.ctx.canvas.style.position = 'fixed';
		this.ctx.canvas.style.backgroundImage = 'url(/images/bgTextureImage.png)';
		//Utility
		this.width = _width;
		this.height = _height;

		// THREE Camera
		this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
		this.camera.position.z = 190;
		this.camera.position.x = 130;
		this.camera.position.y = 90;
		// this.camera.lookAt(this.scene.position);
		this.camera.updateMatrixWorld();

		this.renderer = new THREE.WebGLRenderer({
			antialiasing: true,
		});
		domElement.append(this.renderer.domElement);

		this.renderer.setSize(this.width, this.height);

		this.scene2 = new THREE.Scene();
		// this.interaction_second = new Interaction(this.renderer, this.scene2, this.camera);
		// bg
		this.loader2 = new THREE.TextureLoader();
		this.loader2.load('/images/bgTextureImage.png', texture => {
			this.scene2.background = texture;
		});
		{
			const color = 0xffffff;
			const intensity = 1;
			const light = new THREE.DirectionalLight(color, intensity);
			light.position.set(0, 10, 0);
			light.target.position.set(-8, 0, 0);
			this.scene2.add(light);
			this.scene2.add(light.target);
		}

		{
			const color = 0xffffff;
			const intensity = 1;
			const light = new THREE.SpotLight(color);
			light.position.set(0, -100, 0);
			this.scene2.add(light);

			this.helperGrid = new THREE.GridHelper(10, 10);
			this.helperGrid.position.y = -0.5;
			this.scene2.add(this.helperGrid);
			// this.update(this.scene2, this.camera);
		}

		//scene 1

		//THREE scene
		this.scene = new THREE.Scene();

		// this.renderer.setClearColor(new THREE.TextureLoader(clearColor));

		// new a interaction, then you can add interaction-event with your free style
		this.interaction = new Interaction(this.renderer, this.scene, this.camera);

		//Push the canvas to the DOM

		// this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		// this.controls.update();

		var geometry = new THREE.SphereGeometry(5, 15, 15);
		var material = new THREE.MeshPhongMaterial({
			color: 0x404040,
		});
		this.sphere = new THREE.Mesh(geometry, material);
		this.scene.add(this.sphere);

		// bg
		this.loader = new THREE.TextureLoader();
		this.loader.load('/images/bgTextureImage.png', texture => {
			this.scene.background = texture;
		});

		// heading text select game
		// this.loaderHeader = new THREE.TextureLoader();
		// this.loaderHeader.load('/images/chooseyourgame.png', texture => {
		// 	this.scene.add(texture);
		// });

		// Create a texture loader so we can load our image file
		this.loaderHeader = new THREE.TextureLoader();

		// Load an image file into a custom material
		this.materialHeader = new THREE.MeshLambertMaterial({
			map: this.loaderHeader.load('/images/chooseyourgame.png'),
		});

		// create a plane geometry for the image with a width of 10
		// and a height that preserves the image's aspect ratio
		this.headerGeometry = new THREE.PlaneGeometry(300, 300);
		this.imgSrc = '/images/chooseyourgame.png';
		this.mesh;
		this.tex = new THREE.TextureLoader().load(this.imgSrc, tex => {
			tex.needsUpdate = true;
			this.mesh.scale.set(1.0, tex.image.height / tex.image.width, 1.0);
		});
		this.material = new THREE.MeshBasicMaterial({
			map: this.tex,
			transparent: true,
		});
		this.mesh = new THREE.Mesh(this.headerGeometry, this.material);
		this.mesh.position.set(150, 200, 0);
		this.scene.add(this.mesh);
		// this.scene2.add(this.mesh);
		// START GAME IMAGE

		this.startGameButtonGeometry = new THREE.PlaneGeometry(200, 150);
		this.imgSrcStart = '/images/startGame.png';
		this.meshStartButton;
		this.tex = new THREE.TextureLoader().load(this.imgSrcStart, tex => {
			tex.needsUpdate = true;
			this.meshStartButton.scale.set(1.0, tex.image.height / tex.image.width, 1.0);
		});
		this.materialStartButton = new THREE.MeshBasicMaterial({
			map: this.tex,
			transparent: true,
		});
		this.meshStartButton = new THREE.Mesh(this.startGameButtonGeometry, this.materialStartButton);
		this.meshStartButton.position.set(150, 100, 0);
		this.scene.add(this.meshStartButton);
		this.meshStartButton.cursor = 'pointer';
		this.meshStartButton.on('click', ev => {
			console.log('i am here', ev);
			currentScene = 2;
			this.renderer.clear();
			console.log('scene', currentScene);
			this.update(this.scene2, this.camera);
			return currentScene;
		});
		//Objects
		var starColor = (function() {
			var colors = [0xffff00, 0x559999, 0xff6339, 0xffffff];
			return colors[Math.floor(Math.random() * colors.length)];
		})();

		this.star = new THREE.Mesh(
			new THREE.SphereGeometry(5, 32, 32),
			new THREE.MeshBasicMaterial({
				color: 0xffffff,
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
					opacity: 0.5,
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
				z: scaleZ,
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
			0x267257, //bluegreen
		];
		this.planets = [];

		for (var p = 0, radii = 0; p < 4; p++) {
			var size = 4 + Math.random() * 7,
				type = Math.floor(Math.random() * planetColors.length),
				roughness = Math.random() > 0.6 ? 1 : 0,
				planetGeom = new THREE.Mesh(
					new THREE.IcosahedronGeometry(size, roughness),
					new THREE.MeshLambertMaterial({
						color: planetColors[type],
						shading: THREE.FlatShading,
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
						opacity: 0.5,
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
					opacity: 0.1,
					side: THREE.BackSide,
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
				y: Math.random(),
			};

			this.bgStars.push(tw);
		}

		this.t = 0;

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
		}

		//scene 2

		if (currentScene === 1) {
			this.update(this.scene, this.camera);
		} else if (currentScene === 2) {
			this.update(this.scene2, this.camera);
		}

		console.log('scene', currentScene);
	}

	MainScreenDisplay(planets, ctx, bgStars, t, star, glows) {
		for (var p in planets) {
			var planet = planets[p];
			planet.rot += planet.rotSpeed;
			planet.rotation.set(0, planet.rot, 0);
			planet.orbit += planet.orbitSpeed;
			planet.position.set(
				Math.cos(planet.orbit) * planet.orbitRadius,
				0,
				Math.sin(planet.orbit) * planet.orbitRadius
			);
		}
		ctx.fillStyle = 'rgba(0,0,0,0.25)';
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.fillStyle = 'rgba(255,255,255,0.25)';

		for (var s in bgStars) {
			var q = bgStars[s],
				oX = q.x * ctx.canvas.width,
				oY = q.y * ctx.canvas.height,
				size = Math.random() < 0.9998 ? Math.random() : Math.random() * 3;

			ctx.beginPath();
			ctx.moveTo(oX, oY - size);
			ctx.lineTo(oX + size, oY);
			ctx.lineTo(oX, oY + size);
			ctx.lineTo(oX - size, oY);
			ctx.closePath();
			ctx.fill();
		}

		t += 0.01;
		star.rotation.set(0, t, 0);
		for (var g in glows) {
			var glow = glows[g];
			glow.scale.set(
				Math.max(
					glow.origScale.x - 0.2,
					Math.min(glow.origScale.x + 0.2, glow.scale.x + (Math.random() > 0.5 ? 0.005 : -0.005))
				),
				Math.max(
					glow.origScale.y - 0.2,
					Math.min(glow.origScale.y + 0.2, glow.scale.y + (Math.random() > 0.5 ? 0.005 : -0.005))
				),
				Math.max(
					glow.origScale.z - 0.2,
					Math.min(glow.origScale.z + 0.2, glow.scale.z + (Math.random() > 0.5 ? 0.005 : -0.005))
				)
			);
			glow.rotation.set(0, t, 0);
		}
	}

	update(scene, camera) {
		requestAnimationFrame(() => this.update(scene, camera));

		this.MainScreenDisplay(this.planets, this.ctx, this.bgStars, this.t, this.star, this.glows);
		this.renderer.clear();

		this.render(scene, camera);
	}

	render(scene, camera) {
		this.renderer.render(scene, camera);
	}
}

export default HomeScene;
