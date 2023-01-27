import * as THREE from '../three.module.js';

import {UIPanel, UIBreak, UIRow, UIColor, UISelect, UIText, UINumber, UIElement, UIDiv} from './libs/ui.js';
import { UITexture, UIOutlinerTable } from './libs/ui.three.js';
import { SetValueCommand } from './commands/SetValueCommand.js';

function ViewportBrowser( editor ) {

	const signals = editor.signals;
	const strings = editor.strings;
	let switchOffCosmeticElements = true;

	const containerViewportBrowserWrapper = new UIPanel();
	containerViewportBrowserWrapper.setId('viewportBrowserWrapper');
	containerViewportBrowserWrapper.dom.style.visibility = 'hidden';
	containerViewportBrowserWrapper.dom.classList.add("viewportBrowserWrapper");

	// ===     Movable Handler for Browser    ===
	let movableHeaderViewportBrowser = new UIDiv();
	movableHeaderViewportBrowser.setId("movableHeaderViewportBrowser");
	movableHeaderViewportBrowser.dom.classList.add("movableHeader");
	movableHeaderViewportBrowser.setInnerHTML('<span class="material-symbols-outlined">drag_handle</span>');
	containerViewportBrowserWrapper.add(movableHeaderViewportBrowser);

	// ========   Close Header X          ======
	let closeHeaderBrowser = new UIDiv();
	closeHeaderBrowser.setId("viewportBrowserCloseHeader");
	closeHeaderBrowser.dom.classList.add("movableCloseHeader");
	closeHeaderBrowser.setInnerHTML('<span class="material-symbols-outlined">close</span>');
	containerViewportBrowserWrapper.add(closeHeaderBrowser);
	closeHeaderBrowser.onClick(function(){containerViewportBrowserWrapper.dom.style.visibility="hidden";}); //

	// =======    Outliner         ============
	let ignoreObjectSelectedSignal = false;

	// Outline is the UI item that can list things
	const outliner = new UIOutlinerTable( editor );
	outliner.setId( 'outliner' );
	outliner.dom.classList.add('outlinerBrowser');
	outliner.onChange( function () {
		ignoreObjectSelectedSignal = true;
		editor.selectById( parseInt( outliner.getValue() ) );
		ignoreObjectSelectedSignal = false;
	} );
	outliner.onDblClick( function () {
		editor.focusById( parseInt( outliner.getValue() ) );
	} );

	containerViewportBrowserWrapper.add( outliner );
	containerViewportBrowserWrapper.add( new UIBreak() );







	// outliner items

	const nodeStates = new WeakMap();

	function buildOption( object, draggable ) {

		if (switchOffCosmeticElements) {

			if (object.type === "AmbientLight" ||
				object.type === "DirectionalLight" ) {
				return;
			}
		}

		const option = document.createElement( 'tr' );
		option.draggable = draggable;
		option.innerHTML = buildHTML( object );
		option.value = object.id;

		if (switchOffCosmeticElements && object.type === "Scene"){
			option.style.display = "none";
		}

		if ( nodeStates.has( object ) ) {

			const state = nodeStates.get( object );

			const opener = document.createElement( 'span' );

			opener.classList.add( 'opener' );

			if ( object.children.length > 0 ) {
				opener.classList.add( state ? 'open' : 'closed' );
			}

			opener.addEventListener( 'click', function () {
				nodeStates.set( object, nodeStates.get( object ) === false ); // toggle
				refreshUI();
			} );

			// Open all children
			//nodeStates.set( object, true ); // toggle

			option.firstChild.prepend(opener);

			//option.insertBefore( opener, option.firstChild );
		}

		return option;
	}

	function buildHTML( object ) {

		let html = "";
		//let html = '<div class="resp-table-row">';

		// Icon
		if ( object.type  === 'Group') {

			html += `<td><img class="icon-object" src="${getObjectIcon(object)}"/>`;

		} else if ( object.type === 'Mesh') {

			html += `<td><img class="icon-object" src="${getObjectIcon(object)}"/>`;


		} else {

			html += `<td><span class="material-symbols-outlined icon-object">
						${getObjectIcon(object)}
					</span>`;     //`<span class="type ${ getObjectType( object ) }"></span>`;
		}


		// Checkbox
		// if (getObjectType( object ) !== 'Camera'
		// 	&& getObjectType( object ) !== 'Scene'
		// 	) {
		//
		// 	if (getObjectType( object ) === 'Mesh') {
		html += `<input type="checkbox" class="outliner-checkbox" value="" ${object.visible ? 'checked' : ''} />`;
		// } else {
		// 	html += `<div class="table-body-cell"><input type="checkbox" value="" ${object.visible ? 'checked' : ''} /></div>`;
		// }
		// }


		// Name
		// if (getObjectType( object ) !== 'Camera'
		// 	&& getObjectType( object ) !== 'Scene'
		// 	&& getObjectType( object ) !== 'Light'
		// 	&& getObjectType( object ) !== 'Group') {

		html += `<input type="text" class="resizableDiv name-mesh table-body-cell" title=${escapeHTML(object.name)}
 						value=${escapeHTML(object.name)}
						/>
					 </td>`;
		// } else {
		//
		// 	html += `<div class="resizableDiv table-body-cell">
		// 				<input type="text" style="font-size: 9pt; margin-top:3px"
		// 						title=${escapeHTML(object.name)}  value=${escapeHTML(object.name)}
		// 				/></div>
		// 			 `;
		// }

		if ( object.isMesh ) {

			const geometry = object.geometry;
			const material = object.material;

			if (!geometry.name)
				geometry.name = "unnamed geometry";

			html += `<td></td>`;

			// Material
			// html += `<td><div class="resizableDiv small table-body-cell">
 			// 			<span class="type color-icon" style="color:#${object.material.color.getHexString()}"></span>
			// 			<input value="${ escapeHTML( getMaterialName( material ) ) }" />
			// 		</div></td>`;

			html += `<td>
 						<span class="type color-icon" style="color:#${object.material.color.getHexString()}"></span>
					</td>`;

			// Geometry
			// html += `<td><div class="resizableDiv medium table-body-cell">
 			// 			<span class="material-icons-outlined geometry-icon">grid_4x4</span>
			// 			<input value="${ escapeHTML( geometry.name ) }"/>
			// 		  </div></td>`; //<span class="type Geometry"></span>

			html += `<td>
 						<span class="material-icons-outlined geometry-icon">grid_4x4</span>
	    			  </td>`; //<span class="type Geometry"></span>

		} else {

			html += '<td></td>' +
				    '<td></td>' +
					'<td></td>';

		}

		html += getScript( object.uuid );

		// Close row
		//html += '</div>';

		return html;
	}

	function getMaterialName( material ) {

		if ( Array.isArray( material ) ) {

			const array = [];

			for ( let i = 0; i < material.length; i ++ ) {

				array.push( material[ i ].name );

			}

			return array.join( ',' );

		}

		return material.name;

	}

	function escapeHTML( html ) {

		return html
			.replace( /&/g, '&amp;' )
			.replace( /"/g, '&quot;' )
			.replace( /'/g, '&#39;' )
			.replace( /</g, '&lt;' )
			.replace( />/g, '&gt;' );

	}

	function getObjectIcon( object ) {

		if ( object.isGroup ) return './images/browserBasic/browserAssemblies-16.png' ; //'category'; //'Scene';
		if ( object.isScene ) return 'collections'; //'Scene';
		if ( object.isCamera ) return 'videocam'; //'Camera';
		if ( object.isLight ) return 'light_mode';    //'Light';
		if ( object.isMesh ) return './images/browserBasic/browserComponents-16.png';           // Mesh
		if ( object.isLine ) return 'timeline'; //'Line';
		if ( object.isPoints ) return 'grain';       // 'Points';

		return 'category'; //'Object3D';

	}

	function getObjectType( object ) {

		if ( object.isGroup ) return 'Group';
		if ( object.isScene ) return 'Scene';
		if ( object.isCamera ) return 'Camera';
		if ( object.isLight ) return 'Light';
		if ( object.isMesh ) return 'Mesh';
		if ( object.isLine ) return 'Line';
		if ( object.isPoints ) return 'Points';

		return 'category'; //'Object3D';

	}

	function getScript( uuid ) {

		if ( editor.scripts[ uuid ] !== undefined ) {
			return ' <span class="type Script"></span>';
		}

		return '';
	}

	function refreshUI() {

		const camera = editor.camera;
		const scene = editor.scene;

		const options = [];

		// Add options to array
		options.push( buildOption( scene, false ) );

		// Add options to rendered ui
		( function addObjects( objects, pad ) {


			for ( let i = 0, l = objects.length; i < l; i ++ ) {

				const object = objects[ i ];

				if ( nodeStates.has( object ) === false ) {

					nodeStates.set( object, false );

				}

				const option = buildOption( object, true );

				if (!option){
					continue;
				}

				//console.log();

				option.firstChild.style.paddingLeft = ( pad * 18 ) + 'px';

				options.push( option );

				if ( nodeStates.get( object ) === true ) {

					addObjects( object.children, pad + 1 );

				}

			}

		} )( scene.children, 0 );


		if (!switchOffCosmeticElements) {
			options.push(buildOption(camera, false));
		}

		// Clear all children in previous rendered ui
		while ( outliner.dom.children.length > 0 ) {
			outliner.dom.removeChild( outliner.dom.firstChild );
		}

		// Add options
		outliner.setOptions( options );

		if ( editor.selected !== null ) {

			outliner.setValue( editor.selected.id );

		}
	}


	refreshUI();

	// events

	signals.editorCleared.add( refreshUI );

	signals.sceneGraphChanged.add( refreshUI );

	signals.objectSelected.add( function ( object ) {

		if ( ignoreObjectSelectedSignal === true ) return;

		if ( object !== null && object.parent !== null ) {

			let needsRefresh = false;
			let parent = object.parent;

			while ( parent !== editor.scene ) {

				if ( nodeStates.get( parent ) !== true ) {

					nodeStates.set( parent, true );
					needsRefresh = true;

				}

				parent = parent.parent;

			}

			if ( needsRefresh ) refreshUI();

			outliner.setValue( object.id );

		} else {

			outliner.setValue( null );

		}

	} );


	// =========== Make the Browser Movable =====================
	setTimeout( function(){dragElementBrowser(containerViewportBrowserWrapper.dom);}, 1000);

	function dragElementBrowser(elmnt) {
		var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

		//if (document.getElementById(elmnt.id + "Header")) {
		// if present, the header is where you move the DIV from:
		//document.getElementById(elmnt.id + "Header").onmousedown = dragMouseDown;

		document.getElementById("movableHeaderViewportBrowser").onmousedown = dragMouseDown;

		// } else {
		// 	// otherwise, move the DIV from anywhere inside the DIV:
		// 	elmnt.onmousedown = dragMouseDown;
		// }


		function dragMouseDown(e) {
			e = e || window.event;
			// e.preventDefault();
			// get the mouse cursor position at startup:
			pos3 = e.clientX;
			pos4 = e.clientY;
			document.onmouseup = closeDragElement;
			// call a function whenever the cursor moves:
			document.onmousemove = elementDrag;
		}

		function elementDrag(e) {
			e = e || window.event;
			// e.preventDefault();
			// calculate the new cursor position:
			pos1 = pos3 - e.clientX;
			pos2 = pos4 - e.clientY;
			pos3 = e.clientX;
			pos4 = e.clientY;
			// set the element's new position:
			elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
			elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
			e.preventDefault();
		}

		function closeDragElement() {
			// stop moving when mouse button is released:
			document.onmouseup = null;
			document.onmousemove = null;
		}
	}

	return containerViewportBrowserWrapper;
}

export { ViewportBrowser };
