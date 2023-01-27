import {UIPanel, UIBreak, UIText, UISelect} from './libs/ui.js';
import jscolormaps from "./libs/js-colormaps";

function ViewportColormap( editor ) {

	const signals = editor.signals;
	const strings = editor.strings;

	editor.legendContainerHeight = 90 * Math.log2(editor.NColormapBins) + 150;
	editor.legendColormapDefaultHeight = editor.legendContainerHeight - 120;

	editor.legendColormapDefaultWidth = 15;
	editor.ordinateColormapLegendPrecision = 3;

	// Make options for Colormap bins: 2 to 32;
	editor.NBinsOptionsColormap = {};
	for (let i=2; i<33; i++)
		editor.NBinsOptionsColormap[i] = i.toString();


	editor.NBinsOptionsColormap[1024] = "Infinite";

	editor.colorsOptionsColormap =	{jet:"jet",gray:"gray",cool:"cool",copper:"copper",gist_heat:"gist_heat",rainbow:"rainbow"};

	editor.ContourMax = -1;
	editor.GlobalMinValue = 0;

	// 1. Legend container
	const legendContainer = new UIPanel()
									.setClass('legendContainer')
									.setId( 'legendContainer' )
									.setHeight(editor.legendContainerHeight + 'px')
									//.setTop(editor.legendContainerTop + 'px')
									.setDisplay('none');

	// 2. Panel for Colormap
	const ColormapPanel = new UIPanel()
										.setId( 'colormap' )
										.setClass( 'colormap')
										.setWidth( editor.legendColormapDefaultWidth + 10 + 'px')
										.setHeight(editor.legendColormapDefaultHeight + 'px');


	legendContainer.add( ColormapPanel );

	// 3. Popup for colors
	const colormapSelect = new UISelect()
									.setOptions( editor.colorsOptionsColormap )
									.setValue( editor.ColorMapName )
									.setClass( "colormapSelector" )
									.onChange( () =>
												{
													editor.ColorMapName = colormapSelect.getValue().toString();

													// Redraw legend with new colors
													drawLegendCanvas( editor.ColorMapName, editor.NColormapBins );

													// Change the object contour colors
													signals.viewportVertexColorsChanged.dispatch( editor.ColorMapName, editor.NColormapBins );
												}
											);
	legendContainer.add(colormapSelect);

	// 4. Popup selector for NBins
	const colormapSelectNBins = new UISelect()
									.setClass("colormapSelectNBins")
									.setOptions( editor.NBinsOptionsColormap )
									.setValue( editor.NColormapBins )
									.onChange( ()=>
												{
												 editor.NColormapBins = colormapSelectNBins.getValue();

												if(editor.NColormapBins < 1024) {
													editor.legendContainerHeight = 90 * Math.log2(editor.NColormapBins) + 150;
													legendContainer.setHeight(editor.legendContainerHeight + "px");

													editor.legendColormapDefaultHeight = editor.legendContainerHeight - 120;

													drawLegendCanvas(editor.ColorMapName, editor.NColormapBins);

													drawLegendOrdinates();
												}
												 signals.viewportVertexColorsChanged.dispatch(editor.ColorMapName, editor.NColormapBins);
											   }
											);

	legendContainer.add(colormapSelectNBins);

	let titleLegend = new UIText()
								.setClass('titleLegendColor')
								.setTextContent("Contour plot \n Displacement (Mag) \n Analysis System");

	legendContainer.add(titleLegend);

	// 5. Draw the Canvas Colors
	function drawLegendCanvas(colormapName, nColormapBins)
	{
		// 1. Make the Canvas of Colors for the colormap
		let colormapLegendCanvas = document.createElement('canvas');
		colormapLegendCanvas.width = editor.legendColormapDefaultWidth+15;
		colormapLegendCanvas.height = editor.legendColormapDefaultHeight;
		let contextColorMapLegendCanvas = colormapLegendCanvas.getContext('2d');

		const jsCmap = new jscolormaps();

		// 2. Draw Canvas
		for(let i = 0; i < nColormapBins; i++){

			// +1 to imitate Hyperworks
			let v = (i+1) / nColormapBins;

			// Just to be safe within [0,1] limit
			if(v>1)
			 	v=1;

			// rgb colors based on Colormap Name and N Bins
			let colorLegend = jsCmap.evaluate_cmap(v, colormapName, true);

			// Draw rectangle
			contextColorMapLegendCanvas.fillStyle = "rgb(" + colorLegend.join(",") + ")";
			contextColorMapLegendCanvas.fillRect( 0,
												  i * editor.legendColormapDefaultHeight/editor.NColormapBins,
													 editor.legendColormapDefaultWidth,
												  editor.legendColormapDefaultHeight/editor.NColormapBins);

			// Draw Black line
			contextColorMapLegendCanvas.fillStyle = "rgb(0,0,0)";
			contextColorMapLegendCanvas.fillRect( 0,
				i * (editor.legendColormapDefaultHeight/editor.NColormapBins),
				editor.legendColormapDefaultWidth+7,
				1);

			// The 0 line
			if ( i === nColormapBins-1 ){
				contextColorMapLegendCanvas.fillRect( 0,
					(i+1) * (editor.legendColormapDefaultHeight/editor.NColormapBins)-1,
					editor.legendColormapDefaultWidth+7,
					1);

			}
		}


		// remove old colormap legend
		if (ColormapPanel.dom.firstElementChild)
			ColormapPanel.dom.firstElementChild.remove();

		// Add the new colormapLegendCanvas
		ColormapPanel.dom.appendChild(colormapLegendCanvas);
	}


	// 6. Draw Ordinates
	function drawLegendOrdinates()
	{
		if(editor.NColormapBins >= 1024)
			return;

		//hide if max==-1
		legendContainer.setDisplay(editor.ContourMax === -1 ? 'none' : '');

		// Remove previous legend ordinates
		let elms = legendContainer.dom.querySelectorAll('.legendColormapOrdinate');
		elms.forEach(el => el.remove());

		// Draw Legend Ordinates
		let ordinates = Array(editor.NColormapBins + 1 );


		// Truncate function to remove too many decimal points
		Number.prototype.toFixedDown = function(digits) {
											let re = new RegExp("(\\d+\\.\\d{" + digits + "})(\\d)");
											let	m = this.toString().match(re);
											return m ? parseFloat(m[1]) : this.valueOf();
										};

		function expo(x, f) {
			return Number.parseFloat(x).toExponential(f);
		}

		let a_inclination = editor.legendColormapDefaultHeight / editor.NColormapBins;

		for ( let i = 0; i <= editor.NColormapBins; i++ ) {

			let n = ((editor.ContourMax - editor.ContourMin)* i / editor.NColormapBins +
																		editor.ContourMin);

			//n = n.toFixedDown(editor.ordinateColormapLegendPrecision)

			n = expo(n, editor.ordinateColormapLegendPrecision);

			ordinates[i] = new UIText('v' + i).setClass('legendColormapOrdinate')
												   .setBottom( (a_inclination * i + 43) + 'px')
								                   .setTextContent(n);
			legendContainer.add( ordinates[i] );
		}
	}

	// 7. Add event listener for drawing ordinates
	signals.colormapLimitsChanged.add( drawLegendOrdinates );

	// 8. Draw Canvas Colors
	drawLegendCanvas(editor.ColorMapName, editor.NColormapBins);

	return legendContainer;
}

export { ViewportColormap };
