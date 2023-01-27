import {UIPanel, UIButton, UICheckbox, UIRow, UINumber, UIInteger, UIText, UISlider, UIElement} from './libs/ui.js';
import {DragDropAreas} from "./Viewport.DragDropAreas.js";



function ToolbarHorizontalAnimation( editor ) {

	const signals = editor.signals;
	const strings = editor.strings;

	editor.displacementMultiplier = 1.0;
	editor.animationSpeed = 0.005;

	// GUIs
	const container = new UIPanel();
	container.setId( 'toolbarHorizontalAnimation' );
	container.addClass( 'toolbarAnimation' );

	const widgetWidth = "620px";
	const widgetHeight = "36px";

	container.dom.style.width = widgetWidth;
	container.dom.style.height = widgetHeight;

	const animationRow = new UIRow();
	animationRow.dom.classList.add("animationRow");

	// Add the row to the container
	container.add( animationRow );

	// Initialize Animation mixers when a model has been loaded
	signals.objectAdded.add( initAnimation );

	// --- Make a new class for animation buttons extending the UIButton class  ---
	class UIButtonAnimation extends UIButton {

		constructor( altTextKey, icon, onClickFunctionality, parentDiv ) {
			super();

			this.dom.classList.add("animationBt");
			this.BtDiv = document.createElement( 'div' );
			this.BtDiv.title = strings.getKey(altTextKey);
			this.BtDiv.innerHTML = `<img src="images/animation/${icon}"
											class="animationBtImg" style="filter:revert; opacity:revert;"/>`;
			this.BtDiv.classList.add("advToolbarImg"); // invert the colors of the image
			this.BtDiv.classList.add("animationBtDiv");
			this.dom.appendChild( this.BtDiv );
			this.onClick( onClickFunctionality );
			parentDiv.add(this);
		}
	}

	// Init
	function initAnimation() {



		//------------------ Shader ------------------------
		// const textureLoader = new THREE.TextureLoader();
		//
		// editor.uniforms = {
		//
		// 	'fogDensity': { value: 0.05 },
		// 	'fogColor': { value: new THREE.Vector3( 0, 0, 0 ) },
		// 	'time': { value: 1.0 },
		// 	'uvScale': { value: new THREE.Vector2( 1.0, 1.0 ) },
		// 	'texture1': { value: textureLoader.load( '../examples/textures/lava/cloud.png' ) },
		// 	'texture2': { value: textureLoader.load( '../examples/textures/lava/lavatile.jpg' ) }
		//
		// };
		//
		// editor.uniforms[ 'texture1' ].value.wrapS = editor.uniforms[ 'texture1' ].value.wrapT = THREE.RepeatWrapping;
		// editor.uniforms[ 'texture2' ].value.wrapS = editor.uniforms[ 'texture2' ].value.wrapT = THREE.RepeatWrapping;
		//
		// const material_new = new THREE.ShaderMaterial( {
		//
		// 	uniforms: editor.uniforms,
		// 	vertexShader: document.getElementById( 'vertexShader' ).textContent,
		// 	fragmentShader: document.getElementById( 'fragmentShader' ).textContent
		//
		// } );
		//
		// //------------------------------------
		//
		// // The 3D model with the animation. Todo A selector for multiple models with animation.
		editor.group = editor.scene.children[2]; // Children 0 and 1 are lights

		let material_new = null;

		//
		//console.log(editor.group);
		//
		for (let i=0 ; i < editor.group.children.length; i++){
		// 	// editor.group.children[i].scale.x = 10000;
		// 	// editor.group.children[i].scale.y = 10000;
		// 	// editor.group.children[i].scale.z = 10000;
		//
		// 	editor.group.children[i].material.transparent = true;
		// 	editor.group.children[i].material.opacity = 0.5; // = material_new;
		// 	editor.group.children[i].material.color = new THREE.Color('blue');


			editor.group.children[i].morph_displacement_multiplier = editor.displacementMultiplier;

			// console.log(editor.group.children[i].material.vertexColors);
		}


		//-------------------------------------------


		// Create an AnimationMixer, and get the list of AnimationClip instances
		editor.mixer = new THREE.AnimationMixer( editor.group );

		editor.iTime = 0; // iTime is the indexed time, namely the current frame number
		editor.animationDirection = + 1; // +1 for forwards, -1 for backwards
		editor.isFrameMode = false;

		if (editor.group.animations[0]) {

			const animation = editor.group.animations[0];
			editor.action = editor.mixer.clipAction(animation);
			const tracks = editor.action.getClip(0).tracks[0];

			editor.animationDuration = animation.duration;
			editor.animationFrameRate = Math.round(1 / ( tracks.times[1] - tracks.times[0] ) );

			editor.animationFrames = tracks.times.length;

			sliderAnimation.setRange( 0, tracks.times.length - 1);
			editor.action.setDuration( animation.duration );

		}

	}

	// Update
	function updateAnimation( direction ) {

		// iTime current frame number
		editor.iTime = editor.iTime + direction;

		// Update Slider UI from its dom value
		sliderAnimation.setValue(sliderAnimation.dom.value);

		// Update frame indication UI
		animationFrameNumber.setValue(sliderAnimation.dom.value);

		if (sliderAnimation.dom.value >= 1) { // -1: GoToStart, > 1 : FrameBack, FrameForward, GoToEnd,
			editor.action.stop();
			editor.action.paused = false;

			const startFrame = sliderAnimation.dom.value - 1;
			const endFrame = parseInt(sliderAnimation.dom.value);

			let newClip = new THREE.AnimationUtils.subclip(editor.group.animations[0], "tempClip", startFrame,
																								   endFrame,
											      					               editor.animationFrameRate);
			editor.mixer = new THREE.AnimationMixer(editor.group);
			editor.action = editor.mixer.clipAction(newClip);
			editor.action.paused = true;
			editor.action.play();

		} else {

			editor.action.stop();
			editor.action.paused = false;

		}
	}

	//  1. bt :  Go to Start --------------
	const goToStartBt = new UIButtonAnimation(  'toolbar/animationGoToStart',
														"toolbarAnimationPlaybackReverse-22.png",
		() => {
								editor.isFrameMode = true;
								editor.animationDirection = + 1;
								sliderAnimation.dom.value = -1; // denotes start
								editor.iTime = -1; // it will increase and go to 0
								updateAnimation( editor.animationDirection );

								signals.animationStatusChanged.dispatch(false);
							 }
		, animationRow);

	//  2 bt : Go 1 frame back --
	const reverseFrameBt = new UIButtonAnimation( 'toolbar/animationGoToStart',
														'toolbarAnimationPlaybackReverseFrame-22.png',
		() => {
			editor.isFrameMode = true;
			editor.animationDirection = - 1; // Direction of animation (+1 forward, -1 backwards)
			sliderAnimation.dom.value = parseInt( sliderAnimation.dom.value ) - 1;
			updateAnimation( editor.animationDirection );
		}, animationRow);

	// 3 bt : Play-Pause animation --
	const playAnimationBt = new UIButtonAnimation( 'toolbar/playCircle',
														'toolbarAnimationPlayCircle-22.png',
		() => {

								if(editor.isFrameMode){
									initAnimation();
								}

								// Pause when animation is running
								editor.action.paused = editor.action.isRunning();

								// If not running then run
								if (! editor.action.isRunning() ) {
									editor.action.play();
								}

								// Update button icon
								let iconBt = editor.action.paused ? "toolbarAnimationPlayCircle-22.png" :
																	"toolbarAnimationPlaybackPause-22.png" ;

								playAnimationBt.BtDiv.innerHTML = `<img src="images/animation/${iconBt}"
																		class="animationBtImg"
																		style="filter:revert; opacity:revert;"/>`;


								signals.animationStatusChanged.dispatch(true);

		}, animationRow);

	// 4 Bt : Frame forward ------
	const forwardFrameBt = new UIButtonAnimation( 'toolbar/playFrameForwards',
		'toolbarAnimationPlaybackForwardFrame-22.png',
		() =>
							{
								editor.isFrameMode = true;
								editor.animationDirection = + 1;
								sliderAnimation.dom.value = parseInt(sliderAnimation.dom.value) +  1;
								updateAnimation( editor.animationDirection );
							},
		animationRow);


	// 5 Bt : Go to end ------
	const goToEndBt = new UIButtonAnimation( 'toolbar/animationGoToEnd',
														 'toolbarAnimationPlaybackForward-22.png',
		() =>
							{
								editor.isFrameMode = true;
								editor.animationDirection = + 1;
								sliderAnimation.dom.value = editor.animationFrames - 1;
								updateAnimation( editor.animationDirection );

							},
			animationRow);

	// ---- Input 6 UI Integer Frame number ----
	const animationFrameNumber = new UIInteger( 0 ).onChange(
		()=>
			{
			 sliderAnimation.setValue(animationFrameNumber.dom.value);
			 updateAnimation(+1);
			}
		);

	animationFrameNumber.setId("animationFrameNumber");
	animationFrameNumber.dom.classList.add("animationFrameNumber");
	editor.animationFrameNumber = animationFrameNumber;
	animationRow.add( animationFrameNumber );

	// ------------------------ Sliders Animation -------------------
	// The container of sliders
	const slidersAnimationContainer = new UIPanel();
	slidersAnimationContainer.dom.classList.add("slidersAnimationContainer")
	animationRow.add(slidersAnimationContainer);

	// 7. Slider Animation Frame
	let sliderAnimation = new UISlider( 0 ).setWidth( '300px' ).onInput(
		  () =>
				{
   				  updateAnimation(+1);
				  animationFrameNumber.setValue(sliderAnimation.dom.value);
				}
		);

	sliderAnimation.setId("sliderAnimation");
	sliderAnimation.dom.classList.add("sliderAnimation");
	editor.sliderAnimation = sliderAnimation;
	slidersAnimationContainer.add( sliderAnimation  );

	//  8. Slider Animation Speed
	let sliderAnimationSpeed = new UISlider( 0.05 ).setWidth( '300px' ).setRange(0, 0.5).onInput(
		() => {
			    editor.animationSpeed = parseFloat(sliderAnimationSpeed.dom.value);
			    animationSpeedIndicatorNumber.dom.value = sliderAnimationSpeed.dom.value;
			    animationSpeedIndicatorNumber.value = animationSpeedIndicatorNumber.dom.value;
			  }
		);

	sliderAnimationSpeed.setValue(0.25);
	sliderAnimationSpeed.setStep(0.0005);
	sliderAnimationSpeed.setId("sliderAnimationSpeed");
	sliderAnimationSpeed.dom.classList.add("sliderAnimation");
	sliderAnimationSpeed.dom.classList.add("sliderAnimationSpeed");
	editor.sliderAnimationSpeed = sliderAnimationSpeed;
	slidersAnimationContainer.add( sliderAnimationSpeed  );

	// ----------------------- Indicators --------------------------------------
	// 9. Number Speed indicator
	const animationSpeedIndicatorNumber = new UINumber( 0.05 ).onChange(
		() => {
			   editor.animationSpeed = parseFloat(animationSpeedIndicatorNumber.dom.value);
			   sliderAnimationSpeed.dom.value = animationSpeedIndicatorNumber.dom.value;
			   sliderAnimationSpeed.value = sliderAnimationSpeed.dom.value;
			 }
	);

	animationSpeedIndicatorNumber.setId("animationSpeedIndicatorNumber");
	animationSpeedIndicatorNumber.dom.classList.add("animationSpeedIndicatorNumber");
	editor.animationSpeedIndicatorText = animationSpeedIndicatorNumber;
	animationRow.add( animationSpeedIndicatorNumber );

	// 10. Displacement multiplier indicator
	const animationDisplacementMultiplier = new UINumber( 1 ).setValue(1).onChange(
		() => {
			let displacementMultiplierValue = parseFloat(animationDisplacementMultiplier.dom.value);

			editor.displacementMultiplier = displacementMultiplierValue;
			initAnimation();
		}
	);

	animationDisplacementMultiplier.setId("animationDisplacementMultiplier");
	animationDisplacementMultiplier.dom.classList.add("animationDisplacementMultiplier");
	editor.animationDisplacementMultiplier = animationDisplacementMultiplier;
	animationRow.add( animationDisplacementMultiplier );


	//========== Drag and Drop ============================
	// ----- Add Drop Areas -----------
	let idDraggable = "toolbarHorizontalAnimation";
	let classNameDroppables = "animationControlsDroppable";
	let widgetDimensions = {width: widgetWidth, height: widgetHeight};
	let areasVectors = [
						{top:"15%", right:"inherit", bottom:"inherit", left:"35%"}, // Top
						{top:"90%", right:"inherit", bottom:"inherit", left:"35%"}, // Bottom
					   ];

	let dragdropAreas = new DragDropAreas();
	dragdropAreas.CreateDroppables(idDraggable, classNameDroppables, areasVectors, widgetDimensions, editor);
	dragdropAreas.CreateDraggable(idDraggable, classNameDroppables, editor);
	//-------------------------------

	return container;
}

export { ToolbarHorizontalAnimation };
