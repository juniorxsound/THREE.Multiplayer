import { UIElement } from './libs/ui.js';

function Resizer( editor ) {

	const signals = editor.signals;

	const dom = document.createElement( 'div' );
	dom.id = 'resizer_' + editor.container.id;
	dom.classList.add('resizerSidebar');


	function onPointerDown( event ) {

		if ( event.isPrimary === false ) return;

		dom.ownerDocument.addEventListener( 'pointermove', onPointerMove,  {passive: true } );
		dom.ownerDocument.addEventListener( 'pointerup', onPointerUp , {passive: true });

	}

	function onPointerUp( event ) {

		if ( event.isPrimary === false ) return;

		dom.ownerDocument.removeEventListener( 'pointermove', onPointerMove);
		dom.ownerDocument.removeEventListener( 'pointerup', onPointerUp );

	}

	function onPointerMove( event ) {

		// PointerEvent's movementX/movementY are 0 in WebKit

		if ( event.isPrimary === false ) return;

		const offsetWidth = editor.container.offsetLeft + editor.container.offsetWidth; // document.body.offsetWidth;

		const clientX = event.clientX;


		const cX = clientX < editor.container.offsetLeft ? editor.container.offsetLeft : clientX > offsetWidth ? offsetWidth : clientX;

		const x = offsetWidth - cX;

		dom.style.right = x + 'px';

		document.getElementById( 'sidebar_' + editor.container.id ).style.width = x + 'px';
		document.getElementById( 'player' ).style.right = x + 'px';
		document.getElementById( 'script' ).style.right = x + 'px';

		document.getElementById( 'viewport_' + editor.container.id ).style.right = x + 'px';

		signals.windowResize.dispatch();
	}

	dom.addEventListener( 'pointerdown', onPointerDown, {passive: true } );


	return new UIElement( dom );

}

export { Resizer };
