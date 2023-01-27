import { UISelect } from './libs/ui.js';

function ViewportModeSelector(editor ) {

	const signals = editor.signals;

	const viewportModeSelector = new UISelect();
	viewportModeSelector.addClass('viewportModeSelector');

	viewportModeSelector.onChange( function () {
		editor.setViewportMode( this.getValue() );
	} );

	update();

	function update() {

		const options = {};

		options[ "Objects" ] = "Objects";
		options[ "Objects and Nodes" ] = "Objects and Nodes";

		viewportModeSelector.setOptions( options );
		viewportModeSelector.setValue( "Objects" );

	}

	editor.viewportModeUpdate = update;
	return viewportModeSelector;
}

export { ViewportModeSelector };
