import React from 'react';
import { VirtualKeyboard } from '../Audio/audio';
import './Keyboard.css';

let TOP_CHARS = 'wetyuop'.split('');
let BOTTOM_CHARS = 'asdfghjkl;'.split('');


let KeyboardRow = function({ labels }) {
  return <>
      {labels.map((label) => <button className={"Keyboard-" + label} key={"Keyboard" + label} value={label}>{label}</button>)}
    </>;
}

function Keyboard(props) {
  const handleMouseDown = (e) => {
    if (e.target.tagName === 'BUTTON') {
      VirtualKeyboard.keyDown(e.target.value);
    }
  };

  const handleMouseUp = (e) => {
    if (e.target.tagName === 'BUTTON') {
      VirtualKeyboard.keyUp(e.target.value);
    }
  };

  return (
    <div className="Keyboard" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
      <div>
        <KeyboardRow labels={TOP_CHARS} />
        <KeyboardRow labels={BOTTOM_CHARS} />
      </div>
    </div>
  );
}

export default Keyboard;
