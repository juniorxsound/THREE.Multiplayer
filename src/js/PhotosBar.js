import { UIPanel, UIButton, UICheckbox, UIDiv} from './libs/ui.js';

function PhotosBar( editor ) {

	const signals = editor.signals;
	const strings = editor.strings;

	const container = new UIDiv();
	container.setId( 'photosBar' );

	// ---------  = Draggable Header ---------------------
	let movableHeader = new UIDiv();
	movableHeader.setId("photosBarHeader")
	movableHeader.dom.classList.add("movableHeader");
	movableHeader.setInnerHTML('<span class="material-symbols-outlined">drag_handle</span>');
	container.add(movableHeader);

	setTimeout( function(){dragElement(container.dom);}, 1000);

	// ------- Close Header   X ---------
	let closeHeader = new UIDiv();
	closeHeader.setId("photosBarCloseHeader");
	closeHeader.dom.classList.add("movableCloseHeader");
	closeHeader.setInnerHTML('<span class="material-symbols-outlined">close</span>');
	container.add(closeHeader);
	closeHeader.onClick(function(){container.dom.style.visibility="hidden";}); //

	// ----------- Resizable Div -|- ----------------------
	let resizableDiv = new UIDiv();
	resizableDiv.setId("photosBarResizableDiv")
	container.add(resizableDiv);

	// Dragging functions

	function dragElement(elmnt) {
		var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    	//if (document.getElementById(elmnt.id + "Header")) {
			// if present, the header is where you move the DIV from:
			document.getElementById(elmnt.id + "Header").onmousedown = dragMouseDown;
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

	return container;

}

export { PhotosBar };
