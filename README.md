# THREE Multiplayer
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

My boilerplate Node.js server and client setup for Three.js multiplayer projects using Socket.io
- [Installation](#installation)
- [Usage](#usage)
- [Pushing to Heroku](#pushing-to-heroku)

![Multiplayer](https://github.com/juniorxsound/THREE-Multiplayer/blob/master/resources/multiplayer.gif)

## Installation
1. Clone the repo, e.g ```git clone https://github.com/juniorxsound/THREE-Multiplayer.git```
1. Run ```npm install``` to install all the dependencies

> Tested on macOS 10.13.3 using Node.js v8.9.3 and npm v5.6.0

## Usage
Use ```npm run start``` to start the server and bundler

![NPM](https://github.com/juniorxsound/THREE-Multiplayer/blob/master/resources/run_start.gif)

The start script launches:
- ```nodemon``` Which restarts the server on every change (port: 1989)
- ```watchify``` Which bundles the client code from ```src/``` on every change to ```./public/js/bundle.js```

![Server Log](https://github.com/juniorxsound/THREE-Multiplayer/blob/master/resources/Logs.png)

On connection each client recives it's uniqe ID and on every movement broadcasts to all the other clients all the locations of everyone connected
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

> Special thanks to [Dror Ayalon](https://github.com/dodiku)
