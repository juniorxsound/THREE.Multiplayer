

# THREE.js Multiplayer Editor 
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

by Dimitrios Ververidis (dververidis@europe.altair.com),
Thermi, Greece

> It is a fork of: https://github.com/juniorxsound/THREE-Multiplayer 
> Boilerplate Node.js server and client setup for Three.js multiplayer projects using Socket.io

Extra features
- supports GLTF animated results as exported from HyperWorks
- Various UI modifications to resemble HyperWorks


# Quick start

- [Installation](#installation)
- [Usage](#usage)
- [Pushing to Heroku](#pushing-to-heroku)



## Installation
1. Clone the repo, e.g ```git clone https://gitlab.com/dververidisgroup/three.multiplayer.git```
1. Run ```npm install``` to install all the dependencies

Tested on Windows 10 using Node.js 16.17.0 and npm 8.15.0 

## Usage
Use ```npm run buildall``` to build the necessary bundler.js and copy socket.io.js in public folder
Use ```npm run start``` to start the server 


The start script launches:
- ```nodemon``` Which restarts the server on every change (port: 1989)
- ```watchify``` Which bundles the client code from ```src/``` on every change to ```./public/js/bundle.js```



On connection each client receives it's uniqe ID and on every movement broadcasts to all the other clients all the locations of everyone connected
```js
{
  'some-user-id': {
    position: [0.4, 1.4, -0.5],
    rotation: [0, 0, 0]
  }
}
```

You can also run ```npm run build``` to bundle and minify the client code to ```./public/js/bundle.min.js```

Browserify is setup to transform both ES6 Javascript and ```glslify``` for GLSL shader bundling ([example](https://github.com/juniorxsound/DepthKit.js) of a project that uses ```glslify```)

## Pushing to Heroku
[This is a detailed tutorial](https://devcenter.heroku.com/articles/getting-started-with-nodejs#introduction) of how to push your code to Heroku through Github to serve your experience publicly






