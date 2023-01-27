
// Two windows resize
document.addEventListener('DOMContentLoaded', function () {

	// Query the element
	const resizerWindow = document.getElementById('dragMe');

	const leftSide = resizerWindow.previousElementSibling;

	let rightSide;

	if (window.w2) {
		const rightSide = resizerWindow.nextElementSibling;
	}

	// The current position of mouse
	let x = 0;
	let y = 0;
	let leftWidth = 0;

	// Handle the mousedown event
	// that's triggered when user drags the resizer
	const mouseDownHandler = function (e) {

		if (window.w2) {
			rightSide = resizerWindow.nextElementSibling;
		}

		// Get the current mouse position
		x = e.clientX;
		y = e.clientY;
		leftWidth = leftSide.getBoundingClientRect().width;

		// Attach the listeners to `document`
		document.addEventListener('mousemove', mouseMoveHandler);
		document.addEventListener('mouseup', mouseUpHandler);
	};

	const mouseMoveHandler = function (e) {

		// How far the mouse has been moved
		const dx = e.clientX - x;
		const dy = e.clientY - y;

		const newLeftWidth =  ((leftWidth + dx) * 100) / resizerWindow.parentNode.getBoundingClientRect().width;
		leftSide.style.width = `${newLeftWidth}%`;

		if (window.w2) {
			rightSide.style.width = `${100 - newLeftWidth}%`;
		}

		document.getElementById("left_container").children["menubar"].style.fontSize =
			Math.min(parseInt(leftSide.style.width) / 3, 14) + "px";

		if (window.w2) {
			document.getElementById("right_container").children["menubar"].style.fontSize =
				Math.min(parseInt(rightSide.style.width) / 3, 14) + "px";
		}


		document.getElementById("left_container").children["viewport_left_container"].children["info"].style.fontSize=
			Math.min(parseInt(leftSide.style.width) / 8, 11) + "px";

		if (window.w2) {
			document.getElementById("right_container").children["viewport_right_container"].children["info"].style.fontSize =
				Math.min(parseInt(rightSide.style.width) / 8, 11) + "px";
		}


		resizerWindow.style.cursor = 'col-resize';
		document.body.style.cursor = 'col-resize';

		leftSide.style.userSelect = 'none';
		leftSide.style.pointerEvents = 'none';

		if (window.w2) {
			rightSide.style.userSelect = 'none';
			rightSide.style.pointerEvents = 'none';
		}



		window.w1.editor.signals.windowResize.dispatch();

		if (window.w2) {
			window.w2.editor.signals.windowResize.dispatch();


			if (window.w2.editor.container.offsetWidth < window.w2.editor.sidebar.dom.offsetWidth) {
				window.w2.editor.resizer.dom.style.left = "1px";
			} else {
				window.w2.editor.resizer.dom.style.left = window.w2.editor.sidebar.dom.offsetLeft + "px";
			}
		}
	};

	const mouseUpHandler = function () {
		resizerWindow.style.removeProperty('cursor');
		document.body.style.removeProperty('cursor');

		leftSide.style.removeProperty('user-select');
		leftSide.style.removeProperty('pointer-events');

		if (window.w2) {
			rightSide.style.removeProperty('user-select');
			rightSide.style.removeProperty('pointer-events');
		}

		// Remove the handlers of `mousemove` and `mouseup`
		document.removeEventListener('mousemove', mouseMoveHandler);
		document.removeEventListener('mouseup', mouseUpHandler);
	};

	// Attach the handler
	resizerWindow.addEventListener('mousedown', mouseDownHandler);

});
