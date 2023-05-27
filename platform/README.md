# ScanRefer Browser
A WebGL-based interactive data browser for ScanRefer dataset. Learn more about the ScanRefer project at [the project website](https://daveredrum.github.io/ScanRefer/).

## Getting started

### 1. Install NodeJS

NodeJS is required to be installed for this application. If you haven't install NodeJS, Node Version Manager (nvm) is the easiest way you can try:

```shell
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.1/install.sh | bash
source ~/.bashrc
nvm install v10.13.0
```

### 2. Install requirements

The necessary packages for this application are listed in `package.json` and `server/package.json` (for server of course). Run the following commands to install and build those packages:

```shell
npm install
cd server && npm install
```

### 3. Configure the application watch list

There are two `.sh` scripts that runs and monitors the server and applications: `server/run.sh` and `watch.sh`, which corresponds to the application watch list in `package.json`. Before you start the server or customize any of your own applications, you need to make sure the applications are corrected listed in the `package.json` as the following example:

```json
"scripts": {
    "build": "mkdir -p ./client/build && browserify ./client/js/apps/Demo/Demo.js ./client/js/apps/Common/Common.js --standalone Base -o ./client/build/Bundle.js -t [ babelify --presets [ es2015 react ] ]",
    "watch": "mkdir -p ./client/build && watchify ./client/js/apps/Demo/Demo.js ./client/js/apps/Common/Common.js --standalone Base -o ./client/build/Bundle.js -t [ babelify --presets [ es2015 react ] ] --debug --verbose"
  }
```

> Note that `./client/js/apps/Common/Common.js` must be included, because it handles basic communications between the server and the middleware.

Currently, there is only one `./client/js/apps/Demo/Demo.js` as the available application. Once the configuration is finished, you can add your own applications into the list.

### 4. Start the server and monitor the application changes

Now we can start the server and let it host the applications:

```shell
cd server && bash run.sh
```

You can make changes to the application in `client/js/apps`. But in order to make the changes effective afterwards, run the monitoring script for the applications:

```shell
bash watch.sh
```

## Applications

The applications can be reached in browser at `localhost:8081/apps/`