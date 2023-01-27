import {UISpan, UIPanel, UIButton, UIText, UIProgress} from './libs/ui.js';

function Footer( editor ) {

	const strings = editor.strings;
	const signals = editor.signals;

	const footer = new UIPanel();
	footer.setId('footer_' + editor.container.id );
	footer.dom.classList.add('footer');

	// --- Downloading --

	let initValue = '';

	let downloadText = new UIText( 'Downloading' ).setId("DownloadText").addClass("footerText").setDisplay(initValue);
	let downloadProgress = new UIProgress(0).setId("DownloadProgress").addClass("processesProgress").setDisplay(initValue);
	let readText = new UIText( 'Reading' ).setId("ReadText").addClass("footerText").setDisplay(initValue);
	let readProgress = new UIProgress(0).setId("ReadProgress").addClass("processesProgress").setDisplay(initValue);
	let parseText = new UIText( 'Parsing' ).setId("ParseText").addClass("footerText").setDisplay(initValue);
	let parseProgress = new UIProgress(0).setId("ParseProgress").addClass("processesProgress").setDisplay(initValue);
	let renderText = new UIText( 'Rendering' ).setId("RenderText").addClass("footerText").setDisplay(initValue);
	let renderProgress = new UIProgress(0).setId("RenderProgress").addClass("processesProgress").setDisplay(initValue);

	// Vertices for Contours progress
	let contourText = new UIText( 'Transform results to colors' ).setId("ContourText").addClass("footerText").setDisplay('none');
	let contourProgress = new UIProgress(0).setId("ContourProgress").addClass("processesProgress").setDisplay('none');

	// ----- Add ---
	footer.add( downloadText );
	footer.add( downloadProgress );
	footer.add( readText );
	footer.add( readProgress );
	footer.add( parseText );
	footer.add( parseProgress );
	footer.add( renderText );
	footer.add( renderProgress );
	footer.add( contourText );
	footer.add( contourProgress );

	// ------ Reactions ----

	// Download
	signals.downloadProgressChanged.add( ( v ) =>{
													 downloadProgress.setValue(v);
													 downloadText.setDisplay(v===1 ? 'none' : '');
													 downloadProgress.setDisplay(v===1 ? 'none' : '');
												}
										);
	// Read
	signals.readProgressChanged.add(  ( v ) =>{
												readProgress.setValue(v);
												readText.setDisplay(v===1 ? 'none' : '');
												readProgress.setDisplay(v===1 ? 'none' : '');
											}
									);
	// Parse
	signals.parseProgressChanged.add(    ( v ) => {
													parseProgress.setValue(v);
													parseText.setDisplay(v===1 ? 'none' : '');
													parseProgress.setDisplay(v===1 ? 'none' : '');
												  }
									);
	// Render
	signals.renderProgressChanged.add(   ( v ) => {
													renderProgress.setValue(v);
													renderText.setDisplay(v===1 ? 'none' : '');
													renderProgress.setDisplay(v===1 ? 'none' : '');
												  }
									  );
	// Contouring
	signals.contourProgressChanged.add(   ( v ) => {
													contourProgress.setValue(v);
													contourText.setDisplay(v===1 ? 'none' : '');
													contourProgress.setDisplay(v===1 ? 'none' : '');
											}
										);
	return footer;
}

export { Footer };
