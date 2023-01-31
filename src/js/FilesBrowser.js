import { UIPanel, UIButton, UICheckbox, UIDiv} from './libs/ui.js';

function FilesBrowser( editor ) {

	const signals = editor.signals;
	const strings = editor.strings;
	const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	const container = new UIDiv();
	container.setId( 'filesContainer' );
	container.addClass("filesContainer");

	// ---------  = Draggable Header ---------------------
	let movableHeader = new UIDiv();
	movableHeader.setId("filesContainerHeader")
	movableHeader.dom.classList.add("movableHeader");
	movableHeader.setInnerHTML('<span class="material-symbols-outlined">drag_handle</span>');
	container.add(movableHeader);

	setTimeout( function(){dragElement(container.dom);}, 1000);

	// ------- Close Header   X ---------
	let closeHeader = new UIDiv();
	closeHeader.setId("filesBrowserCloseHeader");
	closeHeader.dom.classList.add("movableCloseHeader");
	closeHeader.setInnerHTML('<span class="material-symbols-outlined">close</span>');
	container.add(closeHeader);
	closeHeader.onClick(function(){container.dom.style.visibility="hidden";}); //

	// ----------- Resizable Div -|- ----------------------
	let resizableDiv = new UIDiv();
	resizableDiv.setId("filesBrowserResizableDiv")
	container.add(resizableDiv);

	function appendDom(container, jsonData) {
		for (let i = -1; i <jsonData.length; i++) {
			let divItem  = document.createElement("div");

			let divFileNameEntry = document.createElement("div");
			divFileNameEntry.textContent = i===-1 ? "Filename":"";
			divFileNameEntry.classList.add(i===-1 ? "divFileNameEntryHeader" : "divFileNameEntry");
			divItem.appendChild(divFileNameEntry);

			if (i!==-1) {
				let divFileNameEntryInner = document.createElement("div");
				divFileNameEntryInner.textContent = jsonData[i].name;
				divFileNameEntryInner.classList.add("fileNameEntry");
				divFileNameEntry.appendChild(divFileNameEntryInner);
			}

			let divFileEntrySize = document.createElement("div");
			divFileEntrySize.textContent = i===-1 ? "Size" : niceBytes(jsonData[i].fileSizeInBytes);
			divFileEntrySize.classList.add(i===-1 ? "divFileEntrySizeHeader" : "divFileEntrySize");
			divItem.appendChild(divFileEntrySize);


			let divFileEntryOpen = document.createElement("div");
			divFileEntryOpen.textContent = i===-1 ? "Action" : "";
			divFileEntryOpen.classList.add(i===-1 ? "divFileEntryOpenHeader" : "divFileEntryOpen");
			divItem.appendChild(divFileEntryOpen);

			if (i!==-1){
				let divFileEntryOpenInner = document.createElement("div");
				divFileEntryOpenInner.textContent = "Open";
				divFileEntryOpenInner.classList.add("OpenFileBt");
				divFileEntryOpen.append(divFileEntryOpenInner);
				divFileEntryOpen.addEventListener("click", ()=>{

					console.log("%c Open File " + jsonData[i].name, "color:green");

					editor.socket.emit('fileFetchRequest', jsonData[i].name);

				});
			}

			container.append(divItem);
		}
	}







	function callbackViewFiles( arrayData ) {

		let jsonData = JSON.parse(arrayData);

		appendDom(resizableDiv.dom, jsonData)

	}




	function downloader(url, callback, headerAccept, responseType) {
		const xhr = new XMLHttpRequest();
		xhr.onprogress = (ev) => {
			//Downloading Progress
			signals.downloadProgressChanged.dispatch(ev.loaded / ev.total);
		}

		xhr.onload = () => {
			callback(xhr.response);
		}
		xhr.open('GET', url, true);
		xhr.setRequestHeader("Accept", headerAccept ) ;//"model/gltf-binary");
		xhr.responseType = responseType; // "arraybuffer"
		xhr.send('');
	}



	downloader("./fnames" , callbackViewFiles, "text/plain", "text" );



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
	// ---------------------



	function niceBytes(x){

		let l = 0, n = parseInt(x, 10) || 0;

		while(n >= 1024 && ++l){
			n = n/1024;
		}

		return(n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
	}






	return container;

}

export { FilesBrowser };
