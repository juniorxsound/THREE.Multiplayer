import * as THREE from "./three.module.js"

// import EventEmitter3D from './eventEmitter3D';
// import Communications from './communications';



import { Editor } from './js/Editor.js';
import { Viewport } from './js/Viewport.js';
import { Toolbar } from './js/Toolbar.js';
import { ToolbarInfo } from './js/Toolbar.Info.js';
import { PhotosBar } from './js/PhotosBar.js';
import { ToolbarAdv } from './js/ToolbarAdv.js';
import { ToolbarHorizontalAnimation } from './js/ToolbarHorizontalAnimation.js';
// import { Script } from './js/Script.js';
// import { Player } from './js/Player.js';
import { Sidebar } from './js/Sidebar.js';
import { UpperRibbon } from './js/UpperRibbon.js';
import { Menubar } from './js/Menubar.js';
import { Resizer } from './js/Resizer.js';
// import { VRButton } from './jsm/webxr/VRButton.js';
import { ViewportBrowser } from './js/Viewport.Browser.js';
import { Footer } from './js/Footer.js';
import SocketPlayerReceiver from "./js/SocketPlayerReceiver";





// -------- THREE JS EDITOR ---------------

window.URL = window.URL || window.webkitURL;
window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

window.THREE = THREE;
//window.VRButton = VRButton; // Expose VRButton to APP Scripts

var theme, prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

if (prefersDarkScheme.matches)
    theme = document.body.classList.contains("light-mode") ? "light" : "dark";
else
    theme = document.body.classList.contains("dark-mode") ? "dark" : "light";

localStorage.setItem("theme", theme);

// ---------- THE WRAPPER CLASS FOR EDITOR ------------------

class WrapperOfEditorClass {

    constructor(containerId, containerPercentageWidth, initialModel) {

        this.editor = new Editor();

        Number.prototype.format = function () {
            return this.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
        };

        this.container = document.getElementById(containerId);
        this.container.style.width = containerPercentageWidth;

        // Receive or send events of socket io
        this.socketPlayerReceiver = new SocketPlayerReceiver(this);

        //
        this.editor.container = this.container;
        //this.VRButton = VRButton;

        this.viewport = new Viewport(this.editor, this);
        this.container.appendChild(this.viewport.dom);

        const toolbar = new Toolbar(this.editor);
        toolbar.dom.classList.add("toolbar");
        this.container.appendChild(toolbar.dom);

        const toolbarInfo = new ToolbarInfo( this.editor );
        this.container.appendChild( toolbarInfo.dom );

        const toolbarAdv = new ToolbarAdv(this.editor);
        //toolbarAdv.dom.classList.add("toolbar");
        this.container.appendChild(toolbarAdv.dom);

        const toolbarHorizontalAnimation = new ToolbarHorizontalAnimation(this.editor);
        toolbarHorizontalAnimation.dom.classList.add("toolbar");
        toolbarHorizontalAnimation.dom.classList.add("toolbarHorizontalAnimation");
        this.container.appendChild(toolbarHorizontalAnimation.dom);

        const photosBar = new PhotosBar(this.editor);
        photosBar.dom.classList.add("photosBar");
        this.container.appendChild(photosBar.dom);

        // loading screen - loader spin
        const loading_screen = document.createElement("div");
        loading_screen.classList.add("loading-screen");
        loading_screen.id = "loading-screen";

        const loaderSpin = document.createElement("div");
        loaderSpin.id = "loaderSpin";
        loading_screen.appendChild(loaderSpin);

        this.container.appendChild(loading_screen);
        this.editor.loading_screen = loading_screen;

        /// ToDo: Ververidis Revert : Player contains a WebGLRenderer is only for the JS editor. The actual renderer is in Sidebar.Project.Renderer
        // const player = new Player(this.editor);
        // this.container.appendChild(player.dom);

        const sidebar = new Sidebar(this.editor);
        this.container.appendChild(sidebar.dom);
        this.editor.sidebar = sidebar;

        const upperRibbon = new UpperRibbon(this.editor);
        this.container.appendChild(upperRibbon.dom);
        this.editor.upperRibbon = upperRibbon;

        const viewportBrowser = new ViewportBrowser( this.editor );
        this.container.appendChild(viewportBrowser.dom);
        this.editor.browser = viewportBrowser;

        const menubar = new Menubar(this.editor);
        this.container.appendChild(menubar.dom);

        const footer = new Footer(this.editor);
        this.container.appendChild(footer.dom);

        const resizer = new Resizer(this.editor);
        this.container.appendChild(resizer.dom);

        this.editor.resizer = resizer;

        let classThis = this;

        this.editor.storage.init(function () {

            classThis.editor.storage.get(function (state) {
                if (isLoadingFromHash) return;
                if (state !== undefined) {
                    classThis.editor.fromJSON(state);
                }
                const selected = classThis.editor.config.getKey('selected');
                if (selected !== undefined) {
                    classThis.editor.selectByUuid(selected);
                }
            });

            let timeout;
            function saveState() {
                if (classThis.editor.config.getKey('autosave') === false) {
                    return;
                }
                clearTimeout(timeout);
                timeout = setTimeout(function () {
                    classThis.editor.signals.savingStarted.dispatch();
                    timeout = setTimeout(function () {
                        classThis.editor.storage.set(classThis.editor.toJSON());
                        classThis.editor.signals.savingFinished.dispatch();
                    }, 100);

                }, 1000);

            }

            const signals = classThis.editor.signals;

            signals.geometryChanged.add(saveState);
            signals.objectAdded.add(saveState);
            signals.objectChanged.add(saveState);
            signals.objectRemoved.add(saveState);
            signals.materialChanged.add(saveState);
            signals.sceneBackgroundChanged.add(saveState);
            signals.sceneEnvironmentChanged.add(saveState);
            signals.sceneFogChanged.add(saveState);
            signals.sceneGraphChanged.add(saveState);
            signals.scriptChanged.add(saveState);
            signals.historyChanged.add(saveState);

            if (initialModel) {

                let filename_extension_loadFromJSONorGLB = initialModel.split('.').pop();

                if (filename_extension_loadFromJSONorGLB === "json") {

                    const loader = new THREE.FileLoader();

                    loader.load('examples/' + initialModel, function (text) {

                        classThis.editor.clear("fileExample");
                        classThis.editor.fromJSON(JSON.parse(text));

                        // setTimeout(function() {
                        // 	window.w1.editor.setViewportMode("Objects and Nodes per Part");
                        // }, 1000);

                        //classThis.editor.signals.viewportModeChanged.dispatch();
                    });

                } else if (filename_extension_loadFromJSONorGLB === "glb" ||
                    filename_extension_loadFromJSONorGLB === "gltf") {

                    signals.downloadProgressChanged.dispatch(0.01);
                    signals.readProgressChanged.dispatch(0.01);
                    signals.parseProgressChanged.dispatch(0.01);
                    signals.renderProgressChanged.dispatch(0.01);

                    // let f = {};
                    // f.name = "./examples/" + initialModel;
                    //
                    // let loader = classThis.editor.loader.loadFile(f);

                    // let promiseLoad = loader.loadAsync(   //"./examples/" + initialModel);
                    //
                    // 	whatToload + compressionLevels[compressionIndex] + '.' + format,
                    // 	progressFunction);

                    // GLB
                    function myCallback( response ) {

                        classThis.file = new File([response], initialModel, {type: 'model/gltf-binary'});

                        classThis.editor.loader.loadFile( classThis.file );

                        setTimeout( function() {

                            // window.w1.editor.viewportVertexColors =  "Contour";
                            // signals.viewportVertexColorsChanged.dispatch("jet", 9);


                            // 	window.w1.editor.setViewportMode("Objects and Nodes");
                        }, 200 );
                        // classThis.editor.signals.viewportModeChanged.dispatch();


                    }

                    function downloader(url, callback) {
                        const xhr = new XMLHttpRequest();

                        xhr.onprogress = (ev) => {

                            //Downloading Progress
                            signals.downloadProgressChanged.dispatch(ev.loaded / ev.total);

                        }

                        xhr.onload = () => {
                            callback(xhr.response);
                        }
                        xhr.open('GET', url, true);
                        xhr.setRequestHeader("Accept", "model/gltf-binary");
                        xhr.responseType = "arraybuffer";
                        xhr.send('');
                    }

                    downloader("./examples/" + initialModel, myCallback);
                }

            }

        });



        document.addEventListener('dragover', function (event) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
        });

        document.addEventListener('drop', function (event) {
            event.preventDefault();
            if (event.dataTransfer.types[0] === 'text/plain') return; // Outliner drop
            if (event.dataTransfer.items) {
                // DataTransferItemList supports folders
                classThis.editor.loader.loadItemList(event.dataTransfer.items);
            } else {
                classThis.editor.loader.loadFiles(event.dataTransfer.files);
            }
        });

        function onWindowResize() {
            classThis.editor.signals.windowResize.dispatch();
        }

        window.addEventListener('resize', onWindowResize);

        onWindowResize();


        //
        let isLoadingFromHash = false;
        const hash = window.location.hash;

        if (hash.slice(1, 6) === 'file=') {

            const file = hash.slice(6);

            if (confirm('Any unsaved data will be lost. Are you sure?')) {

                const loader = new THREE.FileLoader();
                loader.crossOrigin = '';
                loader.load(file, function (text) {
                    classThis.editor.clear();
                    classThis.editor.fromJSON(JSON.parse(text));
                });

                isLoadingFromHash = true;
            }
        }

        // Resize Resizer of each editor between viewport and sidebar
        this.editor.signals.windowResize.add( function () {
            resizer.dom.style.left =
                classThis.editor.container.offsetWidth < sidebar.dom.offsetWidth ? "1px" :
                    sidebar.dom.offsetLeft + "px";
        });

        // ServiceWorker
        // if ('serviceWorker' in navigator) {
        //     try {
        //         navigator.serviceWorker.register('sw.js');
        //     } catch (error) {
        //     }
        // }

    }



}

window.w1 = new WrapperOfEditorClass('left_container', '100%', ''); //'Explorer12.h3d.glb'); //bumper.h3d.glb'); // 'owl_good.gltf'); //'mymodel20.glb');   // 'owl_good.gltf'); //'boltsExample.glb'); //'mymodel_attributeScalar.glb'); // 'boltsExample.glb'); // 'iBeam.glb'); //A4Mil.glb'); //front_suspension.app.json'); //A4Mil.glb' ); // ""
