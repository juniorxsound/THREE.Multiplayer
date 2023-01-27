import { UIPanel, UIBreak, UIText } from './libs/ui.js';
import { DragDropAreas } from './Viewport.DragDropAreas.js';

function ToolbarInfo( editor ) {

	const signals = editor.signals;
	const strings = editor.strings;

	const container = new UIPanel();
	container.setId( 'info' );
	container.dom.classList.add("infoStatistics");

	const widgetWidth = "140px";
	const widgetHeight = "100px";

	container.dom.style.width = widgetWidth;
	container.dom.style.height = widgetHeight;

	// Text elements for showing information
	const objectsText = new UIText( '0' ).setMarginLeft( '6px' );
	const verticesText = new UIText( '0' ).setMarginLeft( '6px' );
	const trianglesText = new UIText( '0' ).setMarginLeft( '6px' );
	const frametimeText = new UIText( '0' ).setMarginLeft( '6px' );
	const powerConsumptionText = new UIText( '0' ).setMarginLeft( '6px' );

	// Labels and Text information
	container.add( new UIText( strings.getKey( 'viewport/info/objects' ) ).setTextTransform( 'lowercase' ) );
	container.add( objectsText, new UIBreak() );
	container.add( new UIText( strings.getKey( 'viewport/info/vertices' ) ).setTextTransform( 'lowercase' ) );
	container.add( verticesText, new UIBreak() );
	container.add( new UIText( strings.getKey( 'viewport/info/triangles' ) ).setTextTransform( 'lowercase' ) );
	container.add( trianglesText, new UIBreak() );
	container.add( new UIText( strings.getKey( 'viewport/info/frametime' ) ).setTextTransform( 'lowercase' ) );
	container.add( frametimeText, new UIBreak() );
	// container.add( new UIText( strings.getKey( 'viewport/info/powerconsumption' ) ).setTextTransform( 'lowercase' ) );
	// container.add( powerConsumptionText, new UIBreak() );


	function countStatistics() {

		const scene = editor.scene;

		let objects = 0, vertices = 0, triangles = 0;

		for ( let i = 0, l = scene.children.length; i < l; i ++ ) {

			const object = scene.children[ i ];

			object.traverseVisible( function ( object ) {

				objects ++;

				if ( object.isMesh || object.isPoints ) {

					const geometry = object.geometry;

					vertices += geometry.attributes.position.count;

					if ( object.isMesh ) {

						if ( geometry.index !== null ) {

							triangles += geometry.index.count / 3;

						} else {

							triangles += geometry.attributes.position.count / 3;

						}

					}

				}

			} );

		}

		objectsText.setValue( objects.format() );
		verticesText.setValue( vertices.format() );
		trianglesText.setValue( triangles.format() );

		// updatePowerConsumption();
		// var f = setInterval(()=>{updatePowerConsumption();}, 30000);
	}

	function updateFrametime( frametime ) {
		frametimeText.setValue( Number( frametime ).toFixed( 2 ) + ' ms' );
	}

	function updatePowerConsumption(){

			let xmlhttp = new XMLHttpRequest();

			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState === XMLHttpRequest.DONE) { // XMLHttpRequest.DONE == 4
					if (xmlhttp.status === 200) {
						let response = JSON.parse(xmlhttp.responseText);
						try {
							let powerConsumption = response.data["wattsOutSum"];
							powerConsumptionText.setValue(powerConsumption.format() + " watts");
						}catch(e){

						}
					}
					else {
						console.log("Power error", 'There was an error' + xmlhttp.status);
					}
				}
			};

			xmlhttp.open("GET", "https://api.ecoflow.com/iot-service/open/api/device/queryDeviceQuota?sn=M3EBZ7ZD7280326", true);
			xmlhttp.setRequestHeader("Content-Type", "application/json");
			xmlhttp.setRequestHeader("appKey", "e5d0c974b40e4f32bef1c93801fb2b3c");
			xmlhttp.setRequestHeader("secretKey", "4db9021173714bd0a44de7e59ad803cc");
			xmlhttp.send();
	}

	// Reactions
	signals.objectAdded.add( countStatistics );
	signals.objectRemoved.add( countStatistics );
	signals.geometryChanged.add( countStatistics );
	signals.sceneRendered.add( updateFrametime );




	// ----- Add Drop Areas -----------
	let idDraggable = "info";
	let classNameDroppables = "infoDroppable";
	let widgetDimensions = {width: widgetWidth, height: widgetHeight};
	let areasVectors = [{top:"20%", right:"2%", bottom:"inherit", left:"inherit"}, // Top Right
						{top:"inherit", right:"2%", bottom:"5%", left:"inherit"}, // Bottom Right
						{top:"inherit", right:"inherit", bottom:"5%", left:"10%"}, // Bottom Left
						{top:"15%", right:"inherit", bottom:"inherit", left:"5%"}  // Top Left
	];

	let dragdropAreas = new DragDropAreas();
	dragdropAreas.CreateDroppables(idDraggable, classNameDroppables, areasVectors, widgetDimensions, editor);
	dragdropAreas.CreateDraggable(idDraggable, classNameDroppables, editor);
	//-------------------------------

	return container;
}

export { ToolbarInfo };
