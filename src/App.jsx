import React from 'react';

import Analyzer from './Components/Analyzer';
import Keyboard from './Components/Keyboard';
import './App.css';

function App(props) {
  return (
    <div className="App">
      <h1 className="App-title">Web Audio Synth</h1>
      <Analyzer audio={props.audio} />
      <Keyboard />
    </div>
  );
}

export default App;
