// Create Droppable Areas for InfoStatistics
// Based on Guidelines from: https://www.elated.com/drag-and-drop-with-jquery-your-essential-guide/
// Dimitrios Ververidis 16 Dec 2022 @
// Altair Engineering

import {UIPanel} from "./libs/ui.js";

class DragDropAreas {

	constructor() {

	}

	// Create the areas to Drop a Draggable
	CreateDroppables(idDraggable, classNameDroppables, areasVectors, widgetDimensions, editor){

		// iterate over the input areas and create droppable areas
		areasVectors.forEach((areaVector)=>addCandidateDropArea(areaVector));

		// 1. Create Droppable Div Areas (places where you can leave the widget)
		function addCandidateDropArea(areaVector) {

			const dropArea = new UIPanel();

			dropArea.dom.classList.add(classNameDroppables);
			dropArea.dom.style.top = areaVector.top;
			dropArea.dom.style.right = areaVector.right;
			dropArea.dom.style.bottom = areaVector.bottom;
			dropArea.dom.style.left = areaVector.left;
			dropArea.dom.style.height = widgetDimensions.height;
			dropArea.dom.style.width = widgetDimensions.width;

			editor.container.appendChild(dropArea.dom);

			// Droppable areas properties (how a droppable behaves)
			const droppableProperties = {
				accept: '#' + idDraggable,                 // What this droppable accepts
				hoverClass: 'hoveredDroppable',  // class to a droppable when a draggable is hovered over it
				drop:                            // function to execute when a draggable is left in the droppable
					function (event, ui) {
						ui.draggable.position({of: $(this), my: 'left top', at: 'left top'}); // set new position
						ui.draggable.draggable('option', 'revert', false); // false: draggable only in droppable. Set to true if you want dropped anywhere
					}
			};

			// When document is ready add the droppable
			jQuery(document).ready(()=>{
				jQuery(dropArea.dom).droppable(droppableProperties);
			});
		}
	}

	// 2. Create a Draggable Div
	CreateDraggable(idDraggable, classNameDroppables, editor) {

		let draggableProperties = {
			containment: editor.viewport,
			cursor: 'move',
			snap: editor.viewport,
			revert: true,                 // revert to old position if not in droppable comment if you want dropped anywhere
			start:                        // When start dragging then make droppable areas visible
				function (event, ui) {

					// make droppable positions visible
					// jQuery('.' + classNameDroppables).css({"z-index": "-1"});
					// Without JQuery
					Array.from(document.getElementsByClassName(classNameDroppables)).forEach((e)=>{e.style.zIndex = "1";});

					//ui.draggable.draggable('option', 'revert', true);
				},
			stop: // When stop Dragging make droppable areas invisible
				function handleStop(event, ui) {

					// make droppable positions invisible
					// With JQuary
					// jQuery('.' + classNameDroppables).css({"z-index": "-1"});
					// Without JQuery
					Array.from(document.getElementsByClassName(classNameDroppables)).forEach((e)=>{e.style.zIndex = "-1";});

					jQuery('#' + idDraggable).draggable('option', 'revert', true); // revert to old position if not dropped inside droppables
				}
			//drag: handleDrag // drag: Fired whenever the mouse is moved during the drag operation.
		};


		// When document is ready add the draggable
		jQuery(document).ready(function () {
			jQuery('#'+idDraggable).draggable(draggableProperties);
		});
	}

}


export {DragDropAreas}
