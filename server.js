'use strict'

//////EXPRESS////////
const express = require('express');
const app = express();

////////HTTP/////////
const http = require('http').createServer(app);

//Port and server setup
const port = process.env.PORT || 1989;

//Server
const server = app.listen(port);

//Console the port
console.log('Server is running localhost on port: http://localhost:' + port );

///// SOCKET.IO ///////
const io = require('socket.io').listen(server);

//////// EJS //////////
const ejs = require('ejs');

// Set up the views folder
app.set("views", __dirname + '/editor');

// Setup ejs, so that we can write HTML
app.engine('.html', ejs.__express);
app.set('view-engine', 'html');

// Set up the public client folder
app.use( express.static(__dirname + '/public') );

let clients = {}

// Socket setup
io.on('connection', client => {

  console.log('User ' + client.id + ' connected, there are ' + io.engine.clientsCount + ' clients connected');

  //Add a new client indexed by his id
  clients[client.id] = { position: [0, 0, 0], rotation: [0, 0, 0] }

  //To the client connected only: Make sure to send the client it's ID
  client.emit('introduction', client.id, io.engine.clientsCount, Object.keys(clients));

  //To all: Update everyone that the number of users has changed
  io.sockets.emit('newUserConnected', io.engine.clientsCount, client.id, Object.keys(clients));

  client.on('move', (pos)=>{

    clients[client.id].position = pos;

    io.sockets.emit('userPositions', clients);

  });

  client.on('requestUserNameChange', (msg)=>{

    client.customName = msg;

    console.log("Receive request for username:" + msg + " by client=" + client.id);

    io.sockets.emit('newUserName', client.id, client.customName);

    clients[client.id].customName = client.customName;


  });

  client.on('requestAllUserNames', ()=>{

    client.emit('allUsers', clients);

  });

  //Handle the disconnection
  client.on('disconnect', ()=>{

    //Delete this client from the object
    delete clients[client.id];

    io.sockets.emit('userDisconnected', io.engine.clientsCount, client.id, Object.keys(clients));

    console.log('User ' + client.id + ' disconnected, there are ' + io.engine.clientsCount + ' clients connected');

  });

});

/////////////////////
//////ROUTER/////////
/////////////////////

//Client view
app.get('/', (req, res) => {

	res.render('index.html');

});

//404 view
app.get('/*', (req, res) => {

	res.render('404.html');

});
