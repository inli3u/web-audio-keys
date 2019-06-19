## Road map (not necessarily in order)

* Make something simple, but playable, polished, and complete
* Make it more playable (arpeggiator, scales, etc)
* Make it programmable (controls for all available parameters)
* Make it more programmable (audio graph editor)
* Make it automated (envelopes, LFOs, etc)
* Make the programming playable (keyboard "quick pad" -- hold key and move mouse to change values)

## TODO

**Make something simple, but playable, polished, and complete**

* Refactor for current goals
  * Introduce react
  * Split components according to audio architecture (virtual keyboard / midi source -> note -> osc etc)
* Create visual keyboard
* Create visualizer
* Make it work with midi in
* Give it an identity
* Publish

## Available Scripts (create-react-app defaults)

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
