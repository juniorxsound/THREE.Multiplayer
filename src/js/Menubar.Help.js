import {UIDiv, UIPanel, UIRow} from './libs/ui.js';

function MenubarHelp( editor ) {

	const strings = editor.strings;

	const container = new UIPanel();
	container.setClass( 'menu' );

	const title = new UIPanel();
	title.setClass( 'title' );
	title.setTextContent( strings.getKey( 'menubar/help' ) );
	container.add( title );

	const options = new UIPanel();
	options.setClass( 'options' );
	container.add( options );

	// Source code

	let option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/help/source_code' ) );
	option.onClick( function () {

		window.open( 'https://github.com/mrdoob/three.js/tree/master/editor', '_blank' );

	} );
	options.add( option );

	/*
	// Icon

	let option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/help/icons' ) );
	option.onClick( function () {

		window.open( 'https://www.flaticon.com/packs/interface-44', '_blank' );

	} );
	options.add( option );
	*/

	// About

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/help/about' ) );
	option.onClick( function () {

		window.open( 'https://threejs.org', '_blank' );

	} );
	options.add( option );

	// Manual

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/help/manual' ) );
	option.onClick( function () {

		window.open( 'https://github.com/mrdoob/three.js/wiki/Editor-Manual', '_blank' );

	} );
	options.add( option );

	// Tips for performance

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/help/tips_for_performance' ) );
	option.onClick( function () {

		let resizableDiv = document.createElement("div");
		//resizableDiv.id = "HelpTipsResizableDiv";
		container.dom.appendChild(resizableDiv);

		// Add Modal
		let modalHelpTips = document.createElement("div");
		modalHelpTips.id = "myModal";
		modalHelpTips.className = "modal";
		modalHelpTips.innerHTML = `<span class="closeModal">&times;</span>
						   <div id="captionModal">
						   	<h1>Some information about how to render faster.</h1>
						   	<ul class="HelpTipsPerformanceListStyle">
						   	 <li>Use HDMI or DisplayPort cables. Do not use usb3 cable for screen display! Up to 3 times performance improvement. &#128151;</li>
						   	 <li>Set GPU to Best performance setting! &#128512; &#128516;
						   	 	<br />
						   	 	<img src="./images/supplementary/BestPerformanceTipGPUSet.jpg" alt="Best performance GPU setting"
						   	 	style="width:250px; margin:5px; padding: 5px; border:5px white solid;"/>
						   	 </li>
						   	 <li>@Developers: Do not open web browser inspection tools! &#128525; &#128151;
						   	 </li>
						   	 <li>Overall, the rendering is performed by demand, i.e. no rendering occurs when everything is static.
						   	 		In this manner we save energy and protect your unit from unnecessary burden.
						   	 		<span style='font-size:20px;'>&#128267;</span>
						   	 		<span style='font-size:20px;'>&#128178;</span>
						   	 		<span style='font-size:20px;'>&#127758;</span>
						   	 		<span style='font-size:20px;'>&#127793;</span>
						   	 		<span style='font-size:20px;color:#026928'>&#9851;</span>

						   	 </li>
							</ul>
							</div>
						  `;

		modalHelpTips.style.display = "block";
		resizableDiv.appendChild(modalHelpTips);

		// Get the <span> element that closes the modal
		let span = modalHelpTips.getElementsByClassName("closeModal")[0];

		// When the user clicks on <span> (x), close the modal
		span.onclick = function() {
			modalHelpTips.style.display = "none";
		}

	} );
	options.add( option );

	return container;

}

export { MenubarHelp };
