import React from 'react';
import './Keyboard.css';

function Keyboard(props) {
  let top = 'wetyuop'.split('');
  let bottom = 'asdfghjkl;'.split('');

  let renderButtons = function(labels) {
    return labels.map((label) => <button className={"Keyboard-" + label} key={"Keyboard" + label}>{label}</button>);
  }

  return (
    <div className="Keyboard">
      <div>
        {renderButtons(top)}
        {renderButtons(bottom)}
      </div>
    </div>
  );
}

export default Keyboard;
