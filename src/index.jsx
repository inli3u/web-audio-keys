import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {AudioEngine} from './Audio/audio.js';

const audio = new AudioEngine();
audio.start();

ReactDOM.render(<App audio={audio} />, document.getElementById('root'));
