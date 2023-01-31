import * as THREE from "../three.module.js"
import { CSS2DRenderer, CSS2DObject } from '../jsm/renderers/CSS2DRenderer.js';
import EventEmitter from 'event-emitter-es6';

//---------- MULTIPLAYER EXAMPLE ------------
// const left_container = document.getElementById('left_container')
//
// let eventEmitter3D = new EventEmitter3D(left_container);
//
// // add communications via socket to the scene
// const communications = new Communications(eventEmitter3D);

class SocketPlayerReceiver extends EventEmitter{

    constructor(wrapperClass) {

        //Since we extend EventEmitter we need to instance it from here
        super();

        //---------------  Socket io ------------------------
        wrapperClass.container.addEventListener('mouseenter', e => {
            this.emit('mouseEntered');
            //console.log('mouseEntered');
        }, false);

        //A socket.io instance
        wrapperClass.editor.socket = io();

        let id;
        let clients = new Object();

        let ctx = wrapperClass;

        // Message on entering event
        // this.on('mouseEntered', () => {
        //     //ctx.editor.socket.emit('msg', 'msgContent');
        // });

        // When newUserName comes from server
        wrapperClass.editor.socket.on('newUserName', (id, name)=>{

            document.getElementById("usernameInput").classList.add("userLoggedIn");

            const imageLoader = new THREE.ImageLoader();
            imageLoader.load( 'images/altair-logo.png', (img)=>{

                    //------ Make a CSS2D Label (User name) -------

                    if( !clients[id].mesh.children[0] ) {

                        clients[id].mesh.layers.enableAll();

                        // Wrapper
                        const userLabelDiv = document.createElement('div');
                        userLabelDiv.id = "userLabelDiv";
                        userLabelDiv.className = 'userLabelDiv';

                        // Logo
                        img.classList.add("userCompanyLogo")
                        userLabelDiv.appendChild(img);

                        // Text
                        const userLabelTextDiv = document.createElement('div');
                        userLabelTextDiv.textContent = name;
                        userLabelTextDiv.classList.add("userLabelTextDiv");
                        userLabelDiv.appendChild(userLabelTextDiv);

                        // Append Wrapper to mesh
                        const userLabel = new CSS2DObject(userLabelDiv);
                        userLabel.position.set(0, 0, 100);
                        clients[id].mesh.add(userLabel);
                        userLabel.layers.set(0);

                        ctx.editor.signals.sceneGraphChanged.dispatch();

                    } else {

                        clients[id].mesh.children[0].element.childNodes[1].innerHTML = name;
                        //console.log("clients[id].mesh.children", clients[id].mesh.children[0]);
                    }

                }
            );


        });

        //On connection server sends the client his ID
        wrapperClass.editor.socket.on('introduction', (_id, _clientNum, _ids) => {

            for(let i = 0; i < _ids.length; i++){

                if(_ids[i] != _id){

                    const materialCube = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color:'red' });
                    clients[_ids[i]] = {
                        mesh: new THREE.Mesh(
                            new THREE.BoxGeometry(100,100,100),
                            materialCube)
                    };

                    clients[_ids[i]].mesh.position.set(Math.random()*500, Math.random()*500, Math.random()*500 );

                    //Add initial users to the scene
                    ctx.editor.scene.add( clients[_ids[i]].mesh );
                }
            }

            ctx.editor.signals.sceneGraphChanged.dispatch();
        });

        // New user connect
        wrapperClass.editor.socket.on('newUserConnected', (clientCount, _id, _ids) => {

            let alreadyHasUser = false;

            for(let i = 0; i < Object.keys(clients).length; i++){

                if(Object.keys(clients)[i] == _id){

                    alreadyHasUser = true;

                    break;
                }
            }

            if(_id != id && !alreadyHasUser){

                // Avatar representation

                //------------Make a 3D Model ---------------------
                clients[_id] = {
                    mesh: new THREE.Mesh(  new THREE.BoxGeometry(100,100,100),
                        new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color:'red' }) )
                }

                clients[_id].mesh.position.set(Math.random()*500, Math.random()*500, Math.random()*500 );

                //Add initial users to the scene
                ctx.editor.scene.add(clients[_id].mesh);
                ctx.editor.signals.sceneGraphChanged.dispatch();
            }
        });
        //----------------------------------------------
    }
}

export default SocketPlayerReceiver

