import { UIPanel, UIButton, UICheckbox, UIPanelMovable} from './libs/ui.js';

function ToolbarAdv( editor ) {

	const signals = editor.signals;
	const strings = editor.strings;

	const container = new UIPanelMovable();
	container.setId( 'toolbarAdv' );


	// -- 1 Home button : switch to initial view
	const homeBt = new UIButton();
	//sliceBt.dom.className = 'Button selected';
	homeBt.dom.style.height = "36px";

		const homeBtDom = document.createElement( 'div' );
		homeBtDom.title = strings.getKey( 'toolbar/homeInitialView' );
		homeBtDom.style.height = "36px";
		homeBtDom.innerHTML = '<img src="images/viewtoolbarHome-32.png" style="width:32px;filter:revert; opacity:revert;"/>';

		homeBtDom.classList.add("advToolbarImg");

	homeBt.dom.appendChild( homeBtDom );
	homeBt.onClick( function () {
		signals.fitViewportPressed.dispatch();
	} );
	container.add( homeBt );


	// -- 2 Browser Hierarchy view button
	const browserHierarchyViewBt = new UIButton();
	//sliceBt.dom.className = 'Button selected';
	browserHierarchyViewBt.dom.style.height = "36px";

		const browserHierarchyViewBtDiv = document.createElement( 'div' );
		browserHierarchyViewBtDiv.title = strings.getKey( 'toolbar/browserHierarchyView' );
		browserHierarchyViewBtDiv.style.height = "24px";
		browserHierarchyViewBtDiv.style.marginLeft = "0px";
		browserHierarchyViewBtDiv.innerHTML = '<img src="images/browserViewHierarchy-24.png" style="width:24px; filter:revert; opacity:revert;"/>';
		browserHierarchyViewBtDiv.classList.add("advToolbarImg");

	browserHierarchyViewBt.dom.appendChild( browserHierarchyViewBtDiv );
	browserHierarchyViewBt.onClick( function () {

		signals.browserToolbarVisibilityToggle.dispatch( this.dom );

	} );
	container.add( browserHierarchyViewBt );



	// -- 3 Views button : Take screenshots

	const viewsBt = new UIButton();
	//sliceBt.dom.className = 'Button selected';
	viewsBt.dom.style.height = "36px";

			const viewsBtDiv = document.createElement( 'div' );
			viewsBtDiv.title = strings.getKey( 'toolbar/viewsBt' );
			viewsBtDiv.style.height = "36px";
			viewsBtDiv.style.marginLeft = "-30px";
			viewsBtDiv.innerHTML = '<img src="images/viewtoolbarViewsStrip-32.png" style="width:192px; clip-path:inset(0 130px 0px 32px); filter:revert; opacity:revert;"/>';

	viewsBt.dom.appendChild( viewsBtDiv );
	viewsBt.onClick( function () {

		signals.takeScreenshotPressed.dispatch( );

	} );
	container.add( viewsBt );


	// -- 4 Meshing Mode button : Changing mesh vis

	const meshingModeBt = new UIButton();
	//sliceBt.dom.className = 'Button selected';
	meshingModeBt.dom.style.height = "36px";

		const meshingModeBtDiv = document.createElement( 'div' );
		meshingModeBtDiv.title = strings.getKey( 'toolbar/viewsBt' );
		meshingModeBtDiv.style.height = "36px";
		//meshingModeBtDiv.style.marginLeft = "-30px";
		meshingModeBtDiv.innerHTML = '<img src="images/modeMeshing/viewMeshShaded32.png" style="height:32px;width:32px;filter:revert; opacity:revert;"/>';

	meshingModeBt.dom.appendChild( meshingModeBtDiv );
	meshingModeBt.onClick( function () {

		//signals.takeScreenshotPressed.dispatch( );

	} );
	container.add( meshingModeBt );


	// -- 5 Hide button : Take screenshots
	const showHideBt = new UIButton();
	//sliceBt.dom.className = 'Button selected';
	showHideBt.dom.style.height = "36px";

		const showHideBtDiv = document.createElement( 'div' );
		showHideBtDiv.title = strings.getKey( 'toolbar/showHideBt' );
		showHideBtDiv.style.height = "36px";
		showHideBtDiv.style.marginLeft = "-30px";
		showHideBtDiv.innerHTML = '<img src="images/viewcontrolsShowHideStrip-32.png" style="width:192px; clip-path:inset(0 132px 0px 32px); filter:revert; opacity:revert;"/>';

	showHideBt.dom.appendChild( showHideBtDiv );
	showHideBt.onClick( function () {

		signals.transformModeChanged.dispatch( 'translate' );

	} );
	container.add( showHideBt );


	// -- 6. Ortho-Perspective button
	const orthoPerspectiveBt = new UIButton();
	//sliceBt.dom.className = 'Button selected';
	orthoPerspectiveBt.dom.style.height = "36px";

		const orthoPerspectiveBtDiv = document.createElement( 'div' );
		orthoPerspectiveBtDiv.title = strings.getKey( 'toolbar/perspectiveBt' );
		orthoPerspectiveBtDiv.style.height = "36px";
		orthoPerspectiveBtDiv.style.marginLeft = "-30px";
		orthoPerspectiveBtDiv.innerHTML = '<img src="images/viewPerspectiveStrip-32.png" style="width:192px; clip-path:inset(0 135px 0px 30px); filter:revert; opacity:revert;"/>';

	orthoPerspectiveBt.dom.appendChild( orthoPerspectiveBtDiv );
	orthoPerspectiveBt.onClick( function () {

		signals.transformModeChanged.dispatch( 'translate' );

	} );
	container.add( orthoPerspectiveBt );

	// -- 7. Rotate to closest principal axis button
	const closestPrincipalBt = new UIButton();
	//sliceBt.dom.className = 'Button selected';
	closestPrincipalBt.dom.style.height = "36px";

		const closestPrincipalBtDiv = document.createElement( 'div' );
		closestPrincipalBtDiv.title = strings.getKey( 'toolbar/rotatePrincipal' );
		closestPrincipalBtDiv.style.height = "36px";
		closestPrincipalBtDiv.style.marginLeft = "-30px";
		closestPrincipalBtDiv.innerHTML = '<img src="images/viewRotateClosestAxesStrip-32.png" style="width:192px; clip-path:inset(0 132px 0px 32px); filter:revert; opacity:revert;"/>';

	closestPrincipalBt.dom.appendChild( closestPrincipalBtDiv );
	closestPrincipalBt.onClick( function () {

		signals.transformModeChanged.dispatch( 'translate' );

	} );
	container.add( closestPrincipalBt );

	// -- 8. Fit Selected button
	const fitBt = new UIButton();
	//sliceBt.dom.className = 'Button selected';
	fitBt.dom.style.height = "36px";

		const fitBtDiv = document.createElement( 'div' );
		fitBtDiv.title = strings.getKey( 'toolbar/rotatePrincipal' );
		fitBtDiv.style.height = "36px";
		fitBtDiv.style.marginLeft = "-30px";
		fitBtDiv.innerHTML = '<img src="images/viewtoolbarFitSelectedStrip-32.png" style="width:192px; clip-path:inset(0 132px 0px 34px); filter:revert; opacity:revert;"/>';

	fitBt.dom.appendChild( fitBtDiv );
	fitBt.onClick( function () {

		signals.transformModeChanged.dispatch( 'translate' );

	} );
	container.add( fitBt );

	// -- 9. Slice button
	const sliceBt = new UIButton();
	//sliceBt.dom.className = 'Button selected';
	sliceBt.dom.style.height = "36px";

		const sliceBtDiv = document.createElement( 'div' );
		sliceBtDiv.title = strings.getKey( 'toolbar/sliceBt' );
		sliceBtDiv.style.height = "36px";
		sliceBtDiv.style.marginLeft = "-30px";
		sliceBtDiv.innerHTML = '<img src="images/viewtoolbarSectionCutsStrip-32.png" style="width:192px; clip-path:inset(0 132px 0px 32px); filter:revert; opacity:revert;"/>';

	sliceBt.dom.appendChild( sliceBtDiv );
	sliceBt.onClick( function () {

		signals.transformModeChanged.dispatch( 'translate' );

	} );
	container.add( sliceBt );

	// -- 10. Explode button
	const explodeBt = new UIButton();
	//sliceBt.dom.className = 'Button selected';
	explodeBt.dom.style.height = "36px";

		const explodeBtDiv = document.createElement( 'div' );
		explodeBtDiv.title = strings.getKey( 'toolbar/explodeBt' );
		explodeBtDiv.style.height = "36px";
		explodeBtDiv.style.marginLeft = "-30px";
		explodeBtDiv.innerHTML = '<img src="images/viewExplodedStrip-32.png" '
								+ ' style="width:192px; clip-path:inset(0 134px 0px 34px); filter:revert; opacity:revert;" />';

		explodeBtDiv.classList.add("advToolbarImg");


	explodeBt.dom.appendChild( explodeBtDiv );
	explodeBt.onClick( function () {

		signals.transformModeChanged.dispatch( 'translate' );

	} );
	container.add( explodeBt );


	// signals.transformModeChanged.add( function ( mode ) {
	//
	// 	translate.dom.classList.remove( 'selected' );
	// 	rotate.dom.classList.remove( 'selected' );
	// 	scale.dom.classList.remove( 'selected' );
	//
	// 	switch ( mode ) {
	//
	// 		case 'translate': translate.dom.classList.add( 'selected' ); break;
	// 		case 'rotate': rotate.dom.classList.add( 'selected' ); break;
	// 		case 'scale': scale.dom.classList.add( 'selected' ); break;
	//
	// 	}
	//
	// } );


	signals.browserToolbarVisibilityToggle.add( function(domBt){

		// Show altair small browser or three.js default browser
		const simpleBrowser = true;

		if(simpleBrowser){

			const dom = document.getElementById('viewportBrowserWrapper');

			dom.style.visibility = dom.style.visibility === 'hidden' ? 'visible' : 'hidden';

		} else {

			// Get resize (the line that splits sidebar with viewport)
			const dom = document.getElementById('resizer_' + editor.container.id);

			// Get Width of Editor + Sidebar + any offset if it is the second window
			const offsetWidth = editor.container.offsetLeft + editor.container.offsetWidth;
			const domSidebar = document.getElementById('sidebar_' + editor.container.id);

			// Check if Sidebar width is set to 0 (invisible)
			const clientX = domSidebar.offsetWidth > 0 ? offsetWidth : offsetWidth - 300;

			const cX = clientX < editor.container.offsetLeft ? editor.container.offsetLeft : clientX > offsetWidth ? offsetWidth : clientX;

			const x = offsetWidth - cX;

			dom.style.right = x + 'px';

			domSidebar.style.width = x + 'px';
			document.getElementById('player').style.right = x + 'px';
			document.getElementById('script').style.right = x + 'px';

			document.getElementById('viewport_' + editor.container.id).style.right = x + 'px';

			signals.windowResize.dispatch();


		}


		// Change the color of the button
		if (domBt.classList.contains("toolbarAdvBtPressed"))
			domBt.classList.remove("toolbarAdvBtPressed");
		else
			domBt.classList.add("toolbarAdvBtPressed");

	});

	// Fit camera view to objects in scene
	signals.fitViewportPressed.add( function (){


		const boundingBox = new THREE.Box3();

		boundingBox.setFromObject(editor.scene);

		const center = boundingBox.getCenter(new THREE.Vector3());

		const size = boundingBox.getSize(new THREE.Vector3());

		const maxSize = Math.max(size.x, size.y, size.z);

		let newPositionCamera = new THREE.Vector3(maxSize + center.x, maxSize + center.y, maxSize + + center.z);

		if (editor.viewportCamera.isOrthographicCamera) {

			editor.viewportCamera.zoom = 1;
			editor.viewportCamera.left = -(2 * maxSize);
			editor.viewportCamera.bottom = -(2 * maxSize);
			editor.viewportCamera.top = 2 * maxSize;
			editor.viewportCamera.right = 2 * maxSize;
			editor.viewportCamera.near = -maxSize * 4;
			editor.viewportCamera.far = maxSize * 4;

		} else {


		}


		// camera;
		editor.viewportCamera.position.set(
			newPositionCamera.x,
			newPositionCamera.y,
			newPositionCamera.z
		);

		editor.viewportCamera.lookAt(center.x, center.y, center.z);
		editor.viewportCamera.updateProjectionMatrix();

	});

	return container;
}

export { ToolbarAdv };
