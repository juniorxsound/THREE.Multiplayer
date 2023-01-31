import * as THREE from "../three.module.js"
import jscolormaps from "./libs/js-colormaps";

import { TransformControls } from '../jsm/controls/TransformControls.js';

import {UIDiv, UIPanel} from './libs/ui.js';

import { EditorControls } from './EditorControls.js';
import { OrbitControls } from '../jsm/controls/OrbitControls.js';

import { ViewportCamera } from './Viewport.Camera.js';
import { ViewportModeSelector } from './Viewport.ModeSelector.js';
import { ViewportColormap } from './Viewport.Colormap.js';
import { ToolbarInfo } from './Toolbar.Info.js';
import { ViewHelper } from './Viewport.ViewHelper.js';

import { VR } from './Viewport.VR.js';

import { SetPositionCommand } from './commands/SetPositionCommand.js';
import { SetRotationCommand } from './commands/SetRotationCommand.js';
import { SetScaleCommand } from './commands/SetScaleCommand.js';

import { RoomEnvironment } from '../jsm/environments/RoomEnvironment.js';
import { SetMaterialValueCommand } from "./commands/SetMaterialValueCommand.js";

import * as BufferGeometryUtils from '../jsm/utils/BufferGeometryUtils.js';


import { LineSegmentsGeometry } from '../jsm/lines/LineSegmentsGeometry.js';
import { LineSegments2 } from '../jsm/lines/LineSegments2.js';
import { LineMaterial } from '../jsm/lines/LineMaterial.js';

import { OutsideEdgesGeometry } from './conditional-lines/src/OutsideEdgesGeometry.js';
import { ConditionalEdgesGeometry } from './conditional-lines/src/ConditionalEdgesGeometry.js';
import { ConditionalEdgesShader } from './conditional-lines/src/ConditionalEdgesShader.js';
import { ConditionalLineSegmentsGeometry } from './conditional-lines/src/Lines2/ConditionalLineSegmentsGeometry.js';
import { ConditionalLineMaterial } from './conditional-lines/src/Lines2/ConditionalLineMaterial.js';
import { ColoredShadowMaterial } from './conditional-lines/src/ColoredShadowMaterial.js';


function Viewport( editor, parentClassContainer ) {

	const signals = editor.signals;
	let edgesModel;

	const container = new UIPanel();
	container.setId( 'viewport_' + editor.container.id );
	container.dom.classList.add('viewport');
	container.setPosition( 'absolute' );

	container.add( new ViewportCamera( editor ) );
	container.add( new ViewportModeSelector( editor ) );
	container.add( new ViewportColormap( editor ));

	let renderer = null;
	let cssRenderer = null;

	let pmremGenerator = null;

	const camera = editor.camera;
	const scene = editor.scene;
	const sceneHelpers = editor.sceneHelpers;
	let showSceneHelpers = true;

	// helpers

	const grid = new THREE.Group();

	const grid1 = new THREE.GridHelper( 4000, 40, 0x888888 );
	grid1.material.color.setHex( 0x888888 );
	grid1.material.vertexColors = false;
	//grid1.rotation.set(30, 0, 0);
	grid.add( grid1 );

	const grid2 = new THREE.GridHelper( 4000, 4, 0x222222 );
	grid2.material.color.setHex( 0x222222 );
	grid2.material.depthFunc = THREE.AlwaysDepth;
	grid2.material.vertexColors = false;
	grid.add( grid2 );
	grid.rotateX(Math.PI / 2);

	const viewHelper = new ViewHelper( camera, container );
	const vr = new VR( editor );

	//

	const box = new THREE.Box3();

	const selectionBox = new THREE.Box3Helper( box );
	selectionBox.material.depthTest = false;
	selectionBox.material.transparent = true;
	selectionBox.visible = false;
	sceneHelpers.add( selectionBox );

	let objectPositionOnDown = null;
	let objectRotationOnDown = null;
	let objectScaleOnDown = null;

	const transformControls = new TransformControls( camera, container.dom );

	editor.transformControls = transformControls;

	// Change color due to the fact that Z is up instead of Y
	// let i=0;
	// transformControls.traverse(
	// 	function(child){
	// 		i++;
	// 		if(i===7 || i===8 || i===9 || i===20){
	// 			child.material = new THREE.MeshBasicMaterial({color: 0x0000ff, depthTest: false,
	// 				depthWrite: false,
	// 				fog: false,
	// 				toneMapped: false,
	// 				transparent: true});
	// 		}
	// 		if(i===10 || i===11 || i===12 || i===21){
	// 			child.material = new THREE.MeshBasicMaterial({color: 0x00ff00, depthTest: false,
	// 				depthWrite: false,
	// 				fog: false,
	// 				toneMapped: false,
	// 				transparent: true});
	// 		}
	// 	}
	// );


	transformControls.addEventListener( 'change', function () {

		const object = transformControls.object;

		if ( object !== undefined ) {


			box.setFromObject( object, true );

			const helper = editor.helpers[ object.id ];

			if ( helper !== undefined && helper.isSkeletonHelper !== true ) {

				helper.update();

			}

			signals.refreshSidebarObject3D.dispatch( object );
		}

		render();

	} );

	transformControls.addEventListener( 'mouseDown', function () {

		const object = transformControls.object;

		if (editor.viewportMode === "Objects and Nodes") {
			editor.setViewportMode("Objects");
			editor.viewportModePrev = "Objects and Nodes";
		}

		objectPositionOnDown = object.position.clone();
		objectRotationOnDown = object.rotation.clone();
		objectScaleOnDown = object.scale.clone();

		controls.enabled = false;

	} );

	transformControls.addEventListener( 'mouseUp', function () {

		const object = transformControls.object;

		if (editor.viewportMode === "Objects" && editor.viewportModePrev === "Objects and Nodes") {
			editor.setViewportMode("Objects and Nodes");
		}

		if ( object !== undefined ) {

			switch ( transformControls.getMode() ) {

				case 'translate':

					if ( ! objectPositionOnDown.equals( object.position ) ) {

						editor.execute( new SetPositionCommand( editor, object, object.position, objectPositionOnDown ) );

					}

					break;

				case 'rotate':

					if ( ! objectRotationOnDown.equals( object.rotation ) ) {

						editor.execute( new SetRotationCommand( editor, object, object.rotation, objectRotationOnDown ) );

					}

					break;

				case 'scale':

					if ( ! objectScaleOnDown.equals( object.scale ) ) {

						editor.execute( new SetScaleCommand( editor, object, object.scale, objectScaleOnDown ) );

					}

					break;

			}

		}

		controls.enabled = true;

	} );

	sceneHelpers.add( transformControls );

	// object picking
	const raycaster = new THREE.Raycaster();
	const mouse = new THREE.Vector2();

	// events

	function updateAspectRatio() {

		camera.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
		camera.updateProjectionMatrix();

	}

	function getIntersects( point ) {

		mouse.set( ( point.x * 2 ) - 1, - ( point.y * 2 ) + 1 );

		raycaster.setFromCamera( mouse, camera );

		const objects = [];

		scene.traverseVisible( function ( child ) {

			objects.push( child );

		} );

		sceneHelpers.traverseVisible( function ( child ) {

			if ( child.name === 'picker' ) objects.push( child );

		} );

		//raylineVisualize(raycaster);

		let intersected = [];

		intersected = raycaster.intersectObjects( objects, false );

		return intersected;

	}

	function raylineVisualize(raycaster){

		const c = 10000;
		const points = [];

		console.log("raycaster.ray.origin", raycaster.ray.origin);

		//new THREE.Vector3(raycaster.ray.origin.x, raycaster.ray.origin.y-0.1, raycaster.ray.origin.z)
		// Start Point
		points.push( raycaster.ray.origin );

		// End Point
		const endPoint = new THREE.Vector3( raycaster.ray.origin.x +c*raycaster.ray.direction.x,
			raycaster.ray.origin.y +c*raycaster.ray.direction.y,
			raycaster.ray.origin.z +c*raycaster.ray.direction.z);

		points.push(endPoint);

		const geometry = new THREE.BufferGeometry().setFromPoints( points );

		let myBulletLine = new THREE.Line( geometry, new THREE.LineBasicMaterial({color: 0xff0000}));
		myBulletLine.name = 'rayLine';

		scene.add(myBulletLine);


		// This will force scene to update and show the line
		//envir.scene.getObjectByName('orbitCamera').position.x += 0.1;

		// setTimeout(function () {
		// 	envir.scene.getObjectByName('orbitCamera').position.x -= 0.1;
		// }, 1500);

		// Remove the line
		setTimeout(function () {
			scene.remove(scene.getObjectByName('rayLine'));
		}, 3500);

	}


	const onDownPosition = new THREE.Vector2();
	const onUpPosition = new THREE.Vector2();
	const onDoubleClickPosition = new THREE.Vector2();

	function getMousePosition( dom, x, y ) {

		const rect = dom.getBoundingClientRect();
		return [ ( x - rect.left ) / rect.width, ( y - rect.top ) / rect.height ];

	}

	function handleClick() {

		if ( onDownPosition.distanceTo( onUpPosition ) === 0 ) {

			const intersects = getIntersects( onUpPosition );

			signals.intersectionsDetected.dispatch( intersects );

			render();

		}

	}

	function onMouseDown( event ) {

		// event.preventDefault();

		const array = getMousePosition( container.dom, event.clientX, event.clientY );
		onDownPosition.fromArray( array );

		document.addEventListener( 'mouseup', onMouseUp );

	}

	function onMouseUp( event ) {

		const array = getMousePosition( container.dom, event.clientX, event.clientY );
		onUpPosition.fromArray( array );

		handleClick();

		document.removeEventListener( 'mouseup', onMouseUp );

	}

	function onTouchStart( event ) {

		const touch = event.changedTouches[ 0 ];

		const array = getMousePosition( container.dom, touch.clientX, touch.clientY );
		onDownPosition.fromArray( array );

		document.addEventListener( 'touchend', onTouchEnd );

	}

	function onTouchEnd( event ) {

		const touch = event.changedTouches[ 0 ];

		const array = getMousePosition( container.dom, touch.clientX, touch.clientY );
		onUpPosition.fromArray( array );

		handleClick();

		document.removeEventListener( 'touchend', onTouchEnd );

	}

	function onDoubleClick( event ) {

		const array = getMousePosition( container.dom, event.clientX, event.clientY );
		onDoubleClickPosition.fromArray( array );

		const intersects = getIntersects( onDoubleClickPosition );

		if ( intersects.length > 0 ) {

			const intersect = intersects[ 0 ];

			signals.objectFocused.dispatch( intersect.object );

		}

	}

	container.dom.addEventListener( 'mousedown', onMouseDown );
	container.dom.addEventListener( 'touchstart', onTouchStart );
	container.dom.addEventListener( 'dblclick', onDoubleClick );

	// controls need to be added *after* main logic,
	// otherwise controls.enabled doesn't work.

	const controls = new OrbitControls( camera, container.dom );



	controls.addEventListener( 'change', function () {
		signals.cameraChanged.dispatch( camera );
		signals.refreshSidebarObject3D.dispatch( camera );

	} );

	viewHelper.controls = controls;

	// signals
	signals.editorCleared.add( function () {

		//controls.center.set( 0, 0, 0 );

		render();

	} );

	signals.transformModeChanged.add( function ( mode ) {

		transformControls.setMode( mode );

	} );

	signals.snapChanged.add( function ( dist ) {

		transformControls.setTranslationSnap( dist );

	} );

	signals.spaceChanged.add( function ( space ) {

		transformControls.setSpace( space );

	} );

	signals.rendererUpdated.add( function () {

		scene.traverse( function ( child ) {

			if ( child.material !== undefined ) {

				child.material.needsUpdate = true;

			}

		} );

		render();

	} );




	signals.rendererCreated.add( function ( newRenderer, newCSSRenderer ) {

		if ( renderer !== null ) {

			renderer.setAnimationLoop( null );
			renderer.dispose();
			pmremGenerator.dispose();

			container.dom.removeChild( renderer.domElement );

		}

		renderer = newRenderer;
		cssRenderer = newCSSRenderer;

		renderer.setAnimationLoop( animate );
		renderer.setClearColor( 0xaaaaaa );

		if ( window.matchMedia ) {

			const mediaQuery = window.matchMedia( '(prefers-color-scheme: dark)' );
			mediaQuery.addEventListener( 'change', function ( event ) {

				renderer.setClearColor( event.matches ? 0x333333 : 0xaaaaaa );
				updateGridColors( grid1, grid2, event.matches ? [ 0x222222, 0x888888 ] : [ 0x888888, 0x282828 ] );

				render();

			} );

			renderer.setClearColor( mediaQuery.matches ? 0x333333 : 0xaaaaaa );
			updateGridColors( grid1, grid2, mediaQuery.matches ? [ 0x222222, 0x888888 ] : [ 0x888888, 0x282828 ] );

		}

		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );

		pmremGenerator = new THREE.PMREMGenerator( renderer );
		pmremGenerator.compileEquirectangularShader();

		container.dom.appendChild( renderer.domElement );


		cssRenderer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );
		cssRenderer.domElement.style.position = 'absolute';
		cssRenderer.domElement.style.top = '0px';
		container.dom.appendChild( cssRenderer.domElement );

		render();

	} );

	signals.sceneGraphChanged.add( function () {

		render();

	} );

	signals.cameraChanged.add( function () {

		render();

	} );


	signals.fitViewportPressed.add( function () {

		setTimeout( function(){render();}, 50);

	} );


	signals.objectSelected.add( function ( object ) {

		selectionBox.visible = false;
		transformControls.detach();

		if ( object !== null && object !== scene && object !== camera ) {

			box.setFromObject( object, true );

			if ( box.isEmpty() === false ) {

				selectionBox.visible = true;

			}

			transformControls.attach( object );

		}

		render();

	} );

	signals.objectFocused.add( function ( object ) {

		controls.focus( object );

	} );

	signals.geometryChanged.add( function ( object ) {

		if ( object !== undefined ) {

			box.setFromObject( object, true );

		}

		render();

	} );

	signals.objectChanged.add( function ( object ) {

		if ( editor.selected === object ) {

			box.setFromObject( object, true );

		}

		if ( object.isPerspectiveCamera ) {

			object.updateProjectionMatrix();

		}

		const helper = editor.helpers[ object.id ];

		if ( helper !== undefined && helper.isSkeletonHelper !== true ) {

			helper.update();

		}

		render();

	} );

	signals.objectRemoved.add( function ( object ) {

		controls.enabled = true; // see #14180
		if ( object === transformControls.object ) {

			transformControls.detach();

		}

	} );

	signals.materialChanged.add( function () {

		render();

	} );

	// background

	signals.sceneBackgroundChanged.add( function ( backgroundType, backgroundColor, backgroundTexture, backgroundEquirectangularTexture, backgroundBlurriness ) {

		switch ( backgroundType ) {

			case 'None':

				scene.background = null;

				break;

			case 'Color':

				scene.background = new THREE.Color( backgroundColor );

				break;

			case 'Texture':

				if ( backgroundTexture ) {

					scene.background = backgroundTexture;

				}

				break;

			case 'Equirectangular':

				if ( backgroundEquirectangularTexture ) {

					backgroundEquirectangularTexture.mapping = THREE.EquirectangularReflectionMapping;
					scene.background = backgroundEquirectangularTexture;
					scene.backgroundBlurriness = backgroundBlurriness;

				}

				break;

		}

		render();

	} );

	// environment

	signals.sceneEnvironmentChanged.add( function ( environmentType, environmentEquirectangularTexture ) {

		switch ( environmentType ) {

			case 'None':

				scene.environment = null;

				break;

			case 'Equirectangular':

				scene.environment = null;

				if ( environmentEquirectangularTexture ) {

					environmentEquirectangularTexture.mapping = THREE.EquirectangularReflectionMapping;
					scene.environment = environmentEquirectangularTexture;

				}

				break;

			case 'ModelViewer':

				scene.environment = pmremGenerator.fromScene( new RoomEnvironment(), 0.04 ).texture;

				break;

		}

		render();

	} );

	// fog

	signals.sceneFogChanged.add( function ( fogType, fogColor, fogNear, fogFar, fogDensity ) {

		switch ( fogType ) {

			case 'None':
				scene.fog = null;
				break;
			case 'Fog':
				scene.fog = new THREE.Fog( fogColor, fogNear, fogFar );
				break;
			case 'FogExp2':
				scene.fog = new THREE.FogExp2( fogColor, fogDensity );
				break;

		}

		render();

	} );

	signals.sceneFogSettingsChanged.add( function ( fogType, fogColor, fogNear, fogFar, fogDensity ) {

		switch ( fogType ) {

			case 'Fog':
				scene.fog.color.setHex( fogColor );
				scene.fog.near = fogNear;
				scene.fog.far = fogFar;
				break;
			case 'FogExp2':
				scene.fog.color.setHex( fogColor );
				scene.fog.density = fogDensity;
				break;

		}

		render();

	} );

	signals.viewportCameraChanged.add( function () {

		const viewportCamera = editor.viewportCamera;

		if ( viewportCamera.isPerspectiveCamera ) {

			viewportCamera.aspect = editor.camera.aspect;
			viewportCamera.projectionMatrix.copy( editor.camera.projectionMatrix );

		} else if ( viewportCamera.isOrthographicCamera ) {

			// TODO

		}

		// disable EditorControls when setting a user camera

		controls.enabled = ( viewportCamera === editor.camera );

		render();

	} );

	function clearNodesFromScene(){

		scene.children.forEach( child => {
				if (child.isMarkerGroup) {
					removeObjectsWithChildren(child);
				}
			}
		);

		signals.sceneGraphChanged.dispatch();
	}



	/* ---------- Release from memory ---------------*/
	// Remove all objects
	function removeObjectsWithChildren(obj){

		if(obj.children.length > 0){
			for (let x = obj.children.length - 1; x>=0; x--){
				removeObjectsWithChildren( obj.children[x]);
			}
		}

		if (obj.geometry) {
			obj.geometry.dispose();
		}

		if (obj.material) {
			if (obj.material.length) {
				for (let i = 0; i < obj.material.length; ++i) {

					if (obj.material[i].map) obj.material[i].map.dispose();
					if (obj.material[i].lightMap) obj.material[i].lightMap.dispose();
					if (obj.material[i].bumpMap) obj.material[i].bumpMap.dispose();
					if (obj.material[i].normalMap) obj.material[i].normalMap.dispose();
					if (obj.material[i].specularMap) obj.material[i].specularMap.dispose();
					if (obj.material[i].envMap) obj.material[i].envMap.dispose();

					obj.material[i].dispose()
				}
			}
			else {
				if (obj.material.map) obj.material.map.dispose();
				if (obj.material.lightMap) obj.material.lightMap.dispose();
				if (obj.material.bumpMap) obj.material.bumpMap.dispose();
				if (obj.material.normalMap) obj.material.normalMap.dispose();
				if (obj.material.specularMap) obj.material.specularMap.dispose();
				if (obj.material.envMap) obj.material.envMap.dispose();

				obj.material.dispose();
			}
		}

		obj.removeFromParent();

		return true;
	}

	//---- Vertex Colors On/Off ----
	signals.viewportVertexColorsApply.add( function(hasVertexColors){
		for (let c = 0; c < scene.children.length; c++) {
			if (!scene.children[c].isLight) {
				for (let m = 0; m < scene.children[c].children.length; m++) {
					let object = scene.children[c].children[m];
					if(object.geometry.morphAttributes.attribute0) { // Handle Morphing Attribute

						// If no vertex colors then return to materials
						if (!hasVertexColors)
							object.material.color.setHex(object.material.originalColorHex);

						object.material["vertexColors"] = hasVertexColors;
						object.material.needsUpdate = true;
					};
				}
			}
		};

		render();
	});

	// ----- Find Min Max of results ----
	signals.findMinMaxOfResults.add(function(){

		// Find Min Max a priori in order to decide for the colors
		for (let c = 0; c < scene.children.length; c++) {
			if (!scene.children[c].isLight) {
				for (let m = 0; m < scene.children[c].children.length; m++) {
					let object = scene.children[c].children[m];

					let MaxValue, MinValue;

					// Handle Morphing Attribute
					if(object.geometry.morphAttributes.attribute0)
					{
						let NSteps = object.geometry.morphAttributes.attribute0.length;
						let NPoints = object.geometry.morphAttributes.attribute0[0].count; // 1st Step contains same points as each steps

						for (let j = 0; j < NSteps; j++)
						{
							MaxValue = Math.max.apply( null, object.geometry.morphAttributes.attribute0[j].array);
							MinValue = Math.min.apply( null, object.geometry.morphAttributes.attribute0[j].array);

							editor.ContourMin = Math.min(editor.ContourMin, MinValue);
							editor.ContourMax = Math.max(editor.ContourMax, MaxValue);
						}
					}
				}
			}
		}

		editor.resultsSpanDomain = editor.ContourMax - editor.ContourMin;
	});

	//----- Calculate Vertex Colors --
	signals.viewportVertexColorsChanged.add( function (colormapName, nColormapBins) {

		const resultsf1 = nColormapBins / editor.resultsSpanDomain;

		const jCmap = new jscolormaps();

		//Parse children to apply colors
		for (let c = 0; c < scene.children.length; c++) {
			if (!scene.children[c].isLight) {
				for (let m = 0; m < scene.children[c].children.length; m++) {
					let object = scene.children[c].children[m];
					if(object.geometry.morphAttributes.attribute0) { // Handle Morphing Attribute

						let NSteps = object.geometry.morphAttributes.attribute0.length;
						let NPoints = object.geometry.morphAttributes.attribute0[0].count;

						if (!object.geometry.morphAttributes.color)
							object.geometry.morphAttributes.color = []; // The place to store colors from scalars

						for (let s = 0; s < NSteps; s++) {
							let floatsColors = new Float32Array(NPoints * 4);

							for (let i = 0; i < NPoints; i++) {

								// If step == 0 then it is base value else it is diff
								let	v = s === 0 ? object.geometry.morphAttributes.attribute0[0].array[i] :
									object.geometry.morphAttributes.attribute0[s].array[i] -
									object.geometry.morphAttributes.attribute0[0].array[i];

								let rgb = jCmap.evaluate_cmap(Math.round(v * resultsf1 ) / nColormapBins, colormapName, false);

								floatsColors[4 * i] = rgb[0] / 255;
								floatsColors[4 * i + 1] = rgb[1] / 255;
								floatsColors[4 * i + 2] = rgb[2] / 255;
								floatsColors[4 * i + 3] = 1;
							}

							object.geometry.morphAttributes.color[s] = new THREE.BufferAttribute(floatsColors, 4);
						}

						// Update the geometry attributes inside the WebGLMorphtargets in the SetProgram
						object.geometry.shouldUpdate = true;

						// Save the material color somewhere so that we can restore it if we want to remove vertex colors
						if (!object.material.originalColorHex) {
							object.material.originalColorHex = object.material.color.getHex();
						}

						// White is showing off the vertex colors better
						object.material.color.setHex(0xFFFFFF);
					};
				}
			}
		};
	});


	/*---------------- Show also Nodes apart from objects---------------------------------*/

	signals.viewportModeChanged.add( function () {

		if (editor.viewportMode === "Objects and Nodes"){

			clearNodesFromScene();

			let blue = new THREE.Color().setHex( 0x0000ff );
			const black = new THREE.Color().setHex( 0x000000 );
			const yellow = new THREE.Color().setHex( 0xffff00 );
			const colorCurr = new THREE.Color();

			// Make a mesh for outlining a vertex (blue cube)
			let vertSize = 2;
			let vertGeometry = new THREE.BoxGeometry(vertSize, vertSize, vertSize);
			let vertMaterial = new THREE.MeshBasicMaterial({
				color: blue,
				transparent: false
			});


			// Estimate the number of instances for the marker
			let countInstances = 0;
			for (let c = 0; c < scene.children.length; c++) {
				if (!scene.children[c].isLight) {
					for (let m = 0; m < scene.children[c].children.length; m++) {

						if(!scene.children[c].children[m].geometry)
							continue;

						if(!scene.children[c].children[m].geometry.attributes)
							continue;

						countInstances += scene.children[c].children[m].geometry.attributes.position.array.length / 3;
					}
				}
			}

			let vertMarker = new THREE.InstancedMesh(vertGeometry, vertMaterial, countInstances);
			vertMarker.instanceMatrix.setUsage( THREE.DynamicDrawUsage ); // will be updated every frame
			vertMarker.name = "Global_vertices_instances";

			let instanceI= -1;

			let matrix = new THREE.Matrix4();

			// Iterate for each vertex of each Object
			for (let c = 0; c < scene.children.length; c++) {
				if (!scene.children[c].isLight) {
					for(let m = 0; m < scene.children[c].children.length; m++ ) {

						if(!scene.children[c].children[m].geometry)
							continue;

						if(!scene.children[c].children[m].geometry.attributes)
							continue;

						let verts = scene.children[c].children[m].geometry.attributes.position.array;

						for (let k = 0; k < verts.length; k += 3) { //

							let v = new THREE.Vector3(verts[k], verts[k+1], verts[k+2]);

							v.applyMatrix4(scene.children[c].children[m].matrix);

							matrix.setPosition(v.x, v.y, v.z);

							vertMarker.setMatrixAt( instanceI++, matrix );
//							vertMarker.setColorAt( instanceI, blue );
						}
					}
				}
			}

			let markerGroup = new THREE.Group();
			markerGroup.isMarkerGroup = true;

			markerGroup.add(vertMarker);
			markerGroup.name = "Nodes";
			scene.add(markerGroup);
			render();
			signals.sceneGraphChanged.dispatch();


			signals.attachRaycaster.dispatch(vertMarker);


		} else if (editor.viewportMode === "Objects"){


			clearNodesFromScene();

			container.dom.removeEventListener("mousemove",
				container.dom.listenerInfo[ container.dom.listenerInfo.length-1 ].b
			);

			container.dom.listenerInfo.pop();
			render();
		}


	} );


	// Enhance window event listener (for mousemove) in order removeEventListener to work
	// Store event listeners so they are discoverable
	container.dom.realAddEventListener = container.dom.addEventListener;

	container.dom.addEventListener = function(etype,b,c){

		this.realAddEventListener(etype,b,c);

		if (etype === 'pointermove')
			return;

		if(!this.listenerInfo){
			this.listenerInfo = new Array();
		};

		this.listenerInfo.push({etype : etype, b : b , c : c});
	};


	// signals.objectAdded.add(function (){
	//
	// 	scene.traverseVisible( function ( child ) {
	//
	// 		if ( child.isMesh ) {
	//
	// 			//var prevMaterial = child.material.valueOf();
	//
	// 			child.material = new THREE.MeshPhongMaterial({color: 0xff0000});
	// 			child.material.needsUpdate = true;
	// 			child.needsUpdate = true;
	//
	//
	// 			editor.signals.objectChanged.dispatch( child.parent );
	// 			editor.signals.materialChanged.dispatch( child.material );
	//
	// 			//THREE.MeshBasicMaterial.prototype.copy.call( child.material, prevMaterial );
	//
	// 			console.log(child.material);
	//
	// 			render();
	//
	// 		}
	//
	// 		//objects.push( child );
	//
	// 	} );
	//
	// });



	// Raycaster for instatiated objects (when presenting nodes)
	// signals.attachRaycaster.add( function (vertMarker){
	//
	// 	let raycaster2 = new THREE.Raycaster();
	//
	// 	// this will be 2D coordinates of the current mouse position, [0,0] is middle of the screen.
	// 	let mouse2 = new THREE.Vector2();
	// 	// this saves the 2D coordinates as pixel values from top left in order to show the tooltip
	// 	let pixelMouse = new THREE.Vector2();
	// 	let tprev = Date.now();
	//
	// 	let latestMouseProjection; // this is the latest projection of the mouse on object (i.e. intersection with ray)
	// 	let instanceIdLatest;
	//
	// 	// tooltip will not appear immediately. If object was hovered shortly,
	// 	// - the timer will be canceled and tooltip will not appear at all.
	// 	let tooltipDisplayTimeout;
	//
	// 	// This will move tooltip to the current mouse position and show it by timer.
	// 	function showTooltip() {
	//
	// 		let divElement = document.getElementById("tooltip");
	//
	// 		if (divElement && latestMouseProjection) {
	//
	// 			divElement.style.display = "block";
	// 			divElement.style.opacity = "0.0";
	// 			divElement.style.userSelect = "none"
	//
	//
	// 			divElement.style.left = "" + (pixelMouse.x - divElement.offsetWidth  / 2)  + "px";
	// 			divElement.style.top  = "" + (pixelMouse.y - divElement.offsetHeight - 5)  + "px";
	// 			divElement.textContent =
	// 				`idx: ${instanceIdLatest}, pos: [${latestMouseProjection.x.toFixed(3)}, ${latestMouseProjection.y.toFixed(3)}, ${latestMouseProjection.z.toFixed(3)}]`;
	//
	// 			setTimeout(function() {
	// 				divElement.style.opacity = "0.85";
	// 			}, 150);
	// 		}
	// 	}
	//
	// 	// This will immediately hide tooltip.
	// 	function hideTooltip() {
	// 		let divElement = document.getElementById("tooltip");
	// 		if (divElement) {
	// 			divElement.style.display = "none";
	// 		}
	// 	}
	//
	// 	function handleManipulationUpdate() {
	//
	// 		raycaster2.setFromCamera(mouse2, camera);
	//
	// 		const intersection = raycaster2.intersectObject( vertMarker );
	//
	// 		if ( intersection.length > 0 ) {
	//
	// 			instanceIdLatest = intersection[ 0 ].instanceId;
	//
	// 			let matrix4 = new THREE.Matrix4();
	// 			vertMarker.getMatrixAt(instanceIdLatest, matrix4);
	//
	// 			latestMouseProjection = new THREE.Vector3();
	// 			latestMouseProjection.setFromMatrixPosition(matrix4);
	//
	// 			//vertMarker.getColorAt( instanceIdLatest, colorCurr );
	// 		}
	//
	// 		if (tooltipDisplayTimeout || !latestMouseProjection) {
	// 			clearTimeout(tooltipDisplayTimeout);
	// 			tooltipDisplayTimeout = undefined;
	// 			hideTooltip();
	// 		}
	//
	// 		if (!tooltipDisplayTimeout && latestMouseProjection) {
	//
	// 			// Show tooltip with a delay
	// 			tooltipDisplayTimeout = setTimeout(function() {
	// 				tooltipDisplayTimeout = undefined;
	// 				showTooltip();
	//
	// 				// Change box color
	// 				// if ( colorCurr.equals( blue ) ) {
	// 				// 	let color = new THREE.Color();
	// 				// 	let randomColor = color.setHex( Math.random() * 0xffffff )
	// 				// 	vertMarker.setColorAt( instanceIdLatest, randomColor );  //
	// 				// 	vertMarker.instanceColor.needsUpdate = true;
	// 				// 	render();
	// 				// }
	// 			}, 500);
	// 		}
	// 	}
	//
	// 	function onMouseMove(event) {
	//
	// 		// Set a time for triggering unecessary raycastings
	// 		let t = Date.now();
	// 		if(t - tprev < 2000){
	// 			return;
	// 		}
	//
	// 		tprev = Date.now();
	//
	// 		// Save pixel coordinates of mouse in order to show the tooltip
	// 		pixelMouse.x = event.clientX;
	// 		pixelMouse.y = event.clientY;
	//
	// 		// from screen to three.js system (where [0,0] is in the middle of the screen)
	// 		mouse2.x = ((event.clientX - window.w1.viewport.dom.offsetLeft + 0.5) / window.w1.viewport.dom.clientWidth) * 2 - 1;
	// 		mouse2.y = -((event.clientY - window.w1.viewport.dom.offsetTop + 0.5) / window.w1.viewport.dom.clientHeight) * 2 + 1; //- renderer.domElement.offsetTop
	//
	// 		latestMouseProjection = undefined;
	//
	// 		handleManipulationUpdate();
	// 	}
	//
	// 	container.dom.addEventListener ('mousemove', onMouseMove); // {passive: true, capture: true}
	//
	//
	//
	// });


	/*--------------------- End of Nodes visualization --------------------- */

	signals.takeScreenshotPressed.add( function() {

		// Make PhotosBar visible
		let photosBar = document.getElementById("photosBar");
		photosBar.style.visibility="visible";


		// Add Modal
		let modal = document.createElement("div");
		modal.id = "myModal";
		modal.className = "modal";
		modal.innerHTML = `<span class="closeModal">&times;</span>
						   <img id="imgModal" class="modal-content">
						   <div id="captionModal"></div>
						  `;

		// Img container
		let domImgContainer = document.createElement("div");
		domImgContainer.classList.add("photoTakenContainer");

		// Add photo description
		let domImgDescription = document.createElement("div");
		domImgDescription.classList.add("photoDescription");
		let projectName = editor.config.getKey( 'project/title' ) === '' ? "Untitled Project, " : editor.config.getKey( 'project/title' );
		domImgDescription.innerText =  projectName + " " + new Date(Date.now()).toUTCString();
		domImgDescription.contentEditable = "plaintext-only";

		// Create an img dom
		let domImg = document.createElement("img");
		domImg.classList.add("photoTaken");

		// Take the screenshot
		renderer.preserveDrawingBuffer = true;
		render();
		domImg.src = renderer.domElement.toDataURL("image/jpeg");
		domImg.alt = domImgDescription.textContent;
		renderer.preserveDrawingBuffer = false;

		// Create a dom for the full screen button
		let domFullScreenBt = document.createElement("div");
		domFullScreenBt.textContent = "Full Screen";
		domFullScreenBt.id = "overlayImgBt";
		domFullScreenBt.classList.add("overlayImgBt");
		domFullScreenBt.addEventListener("click", function(){

			// Get the image
			let img = this.previousElementSibling;

			// -- Display Image in Full screen
			// Modal is the full screen img
			let modal = document.getElementById("myModal");

			let modalImg = document.getElementById("imgModal");

			let captionText = document.getElementById("captionModal");

			captionText.contentEditable = "true";

			modal.style.display = "block";

			modalImg.src = img.src;

			captionText.innerHTML = domImgDescription.innerText;

			captionText.addEventListener("input", (event)=>{
				domImgDescription.innerText = captionText.textContent;
			})

			// Get the <span> element that closes the modal
			let span = document.getElementsByClassName("closeModal")[0];

			// When the user clicks on <span> (x), close the modal
			span.onclick = function() {
				modal.style.display = "none";
			}
		});

		// delete button
		let domImgDelete = document.createElement("div");
		domImgDelete.classList.add("overlayDelete");
		domImgDelete.id = "overlayDelete";
		domImgDelete.innerText = "Delete";
		domImgDelete.addEventListener("click", function(){


			this.parentElement.remove();
			//document.getElementById("containerOfImage").remove

		});

		// delete button
		let domImgDownload = document.createElement("a");

		domImgDownload.href = domImg.src; //`data:image/jpeg;base64,${}`;
		domImgDownload.classList.add("overlayDownload");
		domImgDownload.id = "overlayDownload";
		domImgDownload.innerText = "Download";
		domImgDownload.addEventListener("click", function(){
			domImgDownload.download = domImgDescription.innerText + ".jpg";
		});


		// Append domImg to domImgContainer
		domImgContainer.appendChild(domImgDescription);
		domImgContainer.appendChild(domImgDownload);
		domImgContainer.appendChild(domImg);
		domImgContainer.appendChild(domFullScreenBt);
		domImgContainer.appendChild(modal);
		domImgContainer.appendChild(domImgDelete);

		// Append to resizable part of PhotosBar
		let resizableDiv = document.getElementById("photosBarResizableDiv");
		resizableDiv.appendChild(domImgContainer);
		resizableDiv.scrollTop = resizableDiv.scrollHeight;
	});

	signals.exitedVR.add( render );

	//

	signals.windowResize.add( function () {

		updateAspectRatio();

		renderer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );
		cssRenderer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );

		render();

	} );

	signals.showGridChanged.add( function ( showGrid ) {

		grid.visible = showGrid;
		render();

	} );

	signals.showHelpersChanged.add( function ( showHelpers ) {

		showSceneHelpers = showHelpers;
		transformControls.enabled = showHelpers;

		render();

	} );

	signals.cameraResetted.add( updateAspectRatio );

	// animations

	let prevActionsInUse = 0;

	const clock = new THREE.Clock(); // only used for animations



	function animate() {

		const mixer = editor.mixer;
		let needsUpdate = false;

		let delta = clock.getDelta() * editor.animationSpeed * editor.animationDirection;

		// Animations
		const actions = mixer.stats.actions;

		if ( actions.inUse > 0 || prevActionsInUse > 0 ) {

			prevActionsInUse = actions.inUse;

			mixer.update(delta);

			//editor.uniforms[ 'time' ].value += 0.2 * delta;

			// Estimate iTime
			if(!editor.isFrameMode && !editor.action.paused)
				editor.iTime = Math.round(mixer.time * editor.animationFrameRate) % editor.animationFrames;

			// Update UIs
			if (!editor.action.paused) {
				editor.animationFrameNumber.setValue(editor.iTime);
				editor.sliderAnimation.setValue(editor.iTime);
			}

			needsUpdate = true;
		}

		// View Helper
		if ( viewHelper.animating === true ) {

			viewHelper.update( delta );
			needsUpdate = true;

			//parentClassContainer.stats.update();

		}

		if ( vr.currentSession !== null ) {

			needsUpdate = true;

		}

		if ( needsUpdate === true ) {
			render();
			//parentClassContainer.stats.update();
		}


	}

	//

	let startTime = 0;
	let endTime = 0;

	function render() {

		startTime = performance.now();

		// Adding/removing grid to scene so materials with depthWrite false
		// don't render under the grid.

		scene.add( grid );
		renderer.setViewport( 0, 0, container.dom.offsetWidth, container.dom.offsetHeight );
		renderer.render( scene, editor.viewportCamera );

		scene.remove( grid );

		if ( camera === editor.viewportCamera ) {

			renderer.autoClear = false;
			if ( showSceneHelpers === true ) renderer.render( sceneHelpers, camera );
			if ( vr.currentSession === null ) viewHelper.render( renderer );
			renderer.autoClear = true;

		}

		// Render the labels
		cssRenderer.render( scene, camera );

		// Measure performance
		endTime = performance.now();
		editor.signals.sceneRendered.dispatch( endTime - startTime );

		//parentClassContainer.stats.update();
	}

	// initEdgesModel
	signals.objectAdded.add( function(originalModel){

		const edges_threshold = 80; // visualize an edge if diff from neighbour normals greater than 80 degrees
		const LINE_COLOR = 0x000000;
		editor.visualizeModelLines = true;

		// Add meshes to edge model
		const meshes = [];
		originalModel.traverse( c => {
			if ( c.isMesh ) {

				let lineGeom = new THREE.EdgesGeometry( c.geometry, edges_threshold ); 				// Make geometry

				const line = new THREE.LineSegments( lineGeom, new THREE.LineBasicMaterial( { color: LINE_COLOR } ) ); // Make lines

				c.add( line ); 				// Add line
			}
		} );
	});



	signals.animationStatusChanged.add (function(statusPlayingBoolean){
		scene.traverse( c=>{
			if ( c.isLineSegments ){
				c.visible = !statusPlayingBoolean;
			}
		});
	});

	return container;
}

function updateGridColors( grid1, grid2, colors ) {

	grid1.material.color.setHex( colors[ 0 ] );
	grid2.material.color.setHex( colors[ 1 ] );

}



export { Viewport };




// More edge lines with another algorithm (too heavy for rendering)
// initConditionalModel
// signals.objectAdded.add( function(object){
//
// 	// remove the original model
// 	if ( conditionalModel ) {
// 		conditionalModel.parent.remove( conditionalModel );
// 		conditionalModel.traverse( c => { if ( c.isMesh ) {c.material.dispose();}});
// 	}
//
// 	// if we have no loaded model then exit
// 	if ( ! originalModel ) { return; }
//
// 	conditionalModel = originalModel.clone();
// 	scene.add( conditionalModel );
// 	conditionalModel.visible = false;
//
// 	// get all meshes
// 	const meshes = [];
// 	conditionalModel.traverse( c => {  if(c.isMesh){meshes.push(c);}}  );
//
// 	for ( const key in meshes ) {
// 		const mesh = meshes[ key ];
// 		const parent = mesh.parent;
//
// 		// Remove everything but the position attribute
// 		const mergedGeom = mesh.geometry.clone();
// 		for ( const key in mergedGeom.attributes ) {
// 			if ( key !== 'position' ) {
// 				mergedGeom.deleteAttribute( key );
// 			}
// 		}
//
// 		// Create the conditional edges geometry and associated material
// 		const lineGeom = new ConditionalEdgesGeometry( BufferGeometryUtils.mergeVertices( mergedGeom ) );
// 		const material = new THREE.ShaderMaterial( ConditionalEdgesShader );
// 		material.uniforms.diffuse.value.set( 0x455A64 );
//
// 		// Create the line segments objects and replace the mesh
// 		const line = new THREE.LineSegments( lineGeom, material );
// 		line.position.copy( mesh.position );
// 		line.scale.copy( mesh.scale );
// 		line.rotation.copy( mesh.rotation );
//
// 		// const thickLineGeom = new ConditionalLineSegmentsGeometry().fromConditionalEdgesGeometry( lineGeom );
// 		// const thickLines = new LineSegments2( thickLineGeom, new ConditionalLineMaterial( { color: LIGHT_LINES, linewidth: 2 } ) );
// 		// thickLines.position.copy( mesh.position );
// 		// thickLines.scale.copy( mesh.scale );
// 		// thickLines.rotation.copy( mesh.rotation );
//
// 		parent.remove( mesh );
// 		parent.add( line );
// 		// parent.add( thickLines );
//
// 	}
//
//
// });
