import {UITabbedPanel, UISpan, UIPanel, UIButton, UIRow} from './libs/ui.js';

function UpperRibbon( editor ) {

	const strings = editor.strings;
	const signals = editor.signals;

	const ribbonPanel = new UIPanel();
	ribbonPanel.setId( 'upperRibbon_' + editor.container.id );
	ribbonPanel.dom.classList.add('upperRibbon');

	// -- 1 Open ---
	const ribbonOpenFileBt = new UIButton();
	ribbonOpenFileBt.addClass("ribbonButton");
	ribbonOpenFileBt.addClass("ribbonOpenFile");

	const ribbonOpenFileBtDiv = document.createElement( 'div' );
	ribbonOpenFileBtDiv.classList.add("ribbonBtDiv");

	ribbonOpenFileBtDiv.id = "ribbonOpenFile";
	ribbonOpenFileBtDiv.title = strings.getKey( 'upperRibbon/openFile' );
	//ribbonOpenFileBtDiv.style.height = "40px";
	//ribbonOpenFileBtDiv.style.marginLeft = "0px";
	ribbonOpenFileBtDiv.innerHTML = '<img src="images/ribbon/RibbonFileOpen.png" style="width:60px; filter:revert; opacity:revert;"/>';


	ribbonOpenFileBt.dom.appendChild( ribbonOpenFileBtDiv );
	ribbonOpenFileBt.onClick( function () {


		document.getElementById("filesContainer").style.visibility = "visible";


		//signals.browserToolbarVisibilityToggle.dispatch( this.dom );


		// // Local files
		// const form = document.createElement( 'form' );
		// form.style.display = 'none';
		// document.body.appendChild( form );
		//
		// const fileInput = document.createElement( 'input' );
		// fileInput.multiple = true;
		// fileInput.type = 'file';
		// fileInput.addEventListener( 'change', function () {
		// 	editor.clear();
		// 	editor.loader.loadFiles( fileInput.files );
		// 	form.reset();
		// } );
		// form.appendChild( fileInput );
		// fileInput.click();





	} );
	ribbonPanel.add( ribbonOpenFileBt );


	// -- 3 Contour ---
	const contourPlotBt = new UIButton();
	contourPlotBt.addClass('ribbonButton');
	contourPlotBt.addClass("ribbonContourPlot");

	const contourPlotBtDiv = document.createElement( 'div' );
	contourPlotBtDiv.classList.add("ribbonBtDiv");
	contourPlotBtDiv.id = "ribbonContourPlot";
	contourPlotBtDiv.title = strings.getKey( 'upperRibbon/contourPlot' );
	//contourPlotBtDiv.style.height = "80px";
	//contourPlotBtDiv.style.marginLeft = "0";
	contourPlotBtDiv.innerHTML = '<img src="images/ribbon/RibbonContourPlot.png" style=" filter:revert; opacity:revert;"/>';


	contourPlotBt.dom.appendChild( contourPlotBtDiv );
	contourPlotBt.onClick( function () {

		if(contourPlotBtDiv.dataset.status !== "on")
		{
			contourPlotBtDiv.classList.add("permanentClicked");
			contourPlotBtDiv.dataset.status = "on";
			editor.setViewportVertexColors( "Contour" );
		}
		else
		{
			contourPlotBtDiv.classList.remove("permanentClicked");
			contourPlotBtDiv.dataset.status = "off";
			editor.setViewportVertexColors( "No Contour" );
		}


		//signals.browserToolbarVisibilityToggle.dispatch( this.dom );

	} );
	ribbonPanel.add( contourPlotBt );















	//const results = new UISpan().add(ribbonNewFileBt);

	// Default is results
	//ribbonPanel.addTab( 'results', strings.getKey( 'upperRibbon/results' ), results );




	// Sidebar Tabs
	// const scene = new UISpan().add(
	// 	new SidebarScene( editor ),
	// 	new SidebarProperties( editor ),
	// 	new SidebarAnimation( editor ),
	// 	new SidebarScript( editor )
	// );
	// const project = new SidebarProject( editor );
	// const settings = new SidebarSettings( editor );
	//
	// container.addTab( 'scene', strings.getKey( 'sidebar/scene' ), scene );
	// container.addTab( 'project', strings.getKey( 'sidebar/project' ), project );
	// container.addTab( 'settings', strings.getKey( 'sidebar/settings' ), settings );
	//
	// container.select( 'scene' );


	return ribbonPanel;

}

export { UpperRibbon };
