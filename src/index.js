import Scene from './scene';
import * as THREE from 'three';

//A socket.io instance
const socket = io();

//One WebGL context to rule them all !
let glScene = new Scene();
let id;
let instances = [];
let clients = new Object();

glScene.on('userMoved', ()=>{
  socket.emit('move', [glScene.camera.position.x, glScene.camera.position.y, glScene.camera.position.z]);
});

//On connection server sends the client his ID
socket.on('introduction', (_id, _clientNum, _ids)=>{

  for(let i = 0; i < _ids.length; i++){
    if(_ids[i] != _id){
      clients[_ids[i]] = {
        mesh: new THREE.Mesh(
          new THREE.BoxGeometry(1,1,1),
          new THREE.MeshNormalMaterial()
        )
      }

      //Add initial users to the scene
      glScene.scene.add(clients[_ids[i]].mesh);
    }
  }

  console.log(clients);

  id = _id;
  console.log('My ID is: ' + id);

});

socket.on('newUserConnected', (clientCount, _id, _ids)=>{
  console.log(clientCount + ' clients connected');
  let alreadyHasUser = false;
  for(let i = 0; i < Object.keys(clients).length; i++){
    if(Object.keys(clients)[i] == _id){
      alreadyHasUser = true;
      break;
    }
  }
  if(_id != id && !alreadyHasUser){
    console.log('A new user connected with the id: ' + _id);
    clients[_id] = {
      mesh: new THREE.Mesh(
        new THREE.BoxGeometry(1,1,1),
        new THREE.MeshNormalMaterial()
      )
    }

    //Add initial users to the scene
    glScene.scene.add(clients[_id].mesh);
  }

});

socket.on('userDisconnected', (clientCount, _id, _ids)=>{
  //Update the data from the server
  document.getElementById('numUsers').textContent = clientCount;

  if(_id != id){
    console.log('A user disconnected with the id: ' + _id);
    glScene.scene.remove(clients[_id].mesh);
    delete clients[_id];
  }
});

socket.on('connect', ()=>{});

//Update when one of the users moves in space
socket.on('userPositions', _clientProps =>{
  // console.log('Positions of all users are ', _clientProps, id);
  // console.log(Object.keys(_clientProps)[0] == id);
  for(let i = 0; i < Object.keys(_clientProps).length; i++){
    if(Object.keys(_clientProps)[i] != id){

      //Store the values
      let oldPos = clients[Object.keys(_clientProps)[i]].mesh.position;
      let newPos = _clientProps[Object.keys(_clientProps)[i]].position;

      //Create a vector 3 and lerp the new values with the old values
      let lerpedPos = new THREE.Vector3();
      lerpedPos.x = THREE.Math.lerp(oldPos.x, newPos[0], 0.3);
      lerpedPos.y = THREE.Math.lerp(oldPos.y, newPos[1], 0.3);
      lerpedPos.z = THREE.Math.lerp(oldPos.z, newPos[2], 0.3);

      //Set the position
      clients[Object.keys(_clientProps)[i]].mesh.position.set(lerpedPos.x, lerpedPos.y, lerpedPos.z);
    }
  }
});
