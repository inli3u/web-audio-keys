let init = false;
let audioCtx = null;
let oscillators = [];

let control = {};

// let keyboard = {
//     keys: {}
// };

// let arp = {

// };

/**
 * keys -> key map, to midi message
 * arp / repeater -> read midi notes, output own midi message
 * osc (many for one note, many for many notes)
 *  single: recent note played
 *  poly: each note played spawns chain / own signal path for poly
 */

function main() {

    document.addEventListener('DOMContentLoaded', () => {
        document.body.addEventListener('click', handleReady);
    });
}

function handleReady(e) {
    if (init) return false;
    init = true;

    initControls();

    // create web audio api context
    initAudio();

    // create Oscillator node
    initOscillators();

    document.body.addEventListener('keydown', handleKeyDown);
    document.body.addEventListener('keyup', handleKeyUp);
    //noteStart();
}

function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function initOscillators() {
    let oscillator = audioCtx.createOscillator();
    oscillator.type = 'sine';
    oscillator.start();
    oscillators.push(oscillator);
}

function handleKeyDown(e) {
    midiEvent = VirtualKeyboard.keyDown(e.key);
    if (!midiEvent) return;
    handleMidi(midiEvent);
}

function handleKeyUp(e) {
    midiEvent = VirtualKeyboard.keyUp(e.key);
    if (!midiEvent) return;
    handleMidi(midiEvent);
}





function addControlGroup(name, label, cb) {
    let legend = document.createElement('legend');
    legend.innerText = label;
    let fieldset = document.createElement('fieldset');
    fieldset.id = name;
    fieldset.append(legend);
    document.body.append(fieldset);
}

function addRange(group, name, label, min, max, value) {
    let id = group + '-' + name;
    let fieldset = document.getElementById(group);
    let labelElm = document.createElement('label');
    let input = document.createElement('input');

    let updateControlValue = function(value) {
        control[group][name] = value;
        console.log(value);
    };

    control[group] = {};
    control[group][name] = value;

    labelElm.for = id;
    labelElm.innerText = label;

    input.id = id;
    input.type = 'range';
    input.min = min;
    input.max = max;
    input.value = value;
    input.addEventListener('change', (e) => updateControlValue(input.value));

    fieldset.append(labelElm);
    fieldset.append(input);
}

function initControls() {
    addControlGroup('keyboard', 'Keyboard');
    addRange('keyboard', 'octave', 'Octave', -1, 9, 4);
}








function handleMidi(data) {
    let cmd = data[0] >> 4;
    let channel = data[0] & 0xf;
    let type = data[0] & 0xf0;
    let note = data[1];
    let velocity = data[2];

    switch (type) {
        case Midi.NOTE_ON:
            noteStart(note, velocity);
            break;

        case Midi.NOTE_OFF:
            noteStop(note, velocity);
            break;
    }
}

const Midi = {
    NOTE_ON: 144,
    NOTE_OFF: 128,

    freqFromNote: function(note) {
        return 440 * Math.pow(2, (note - 69) / 12);
    }
}

const VirtualKeyboard = {
    velocity: 100,
    
    keyDown: function(key) {
        let note = VirtualKeyboard.noteFromKey(key, control.keyboard.octave);
        if (note === null) return;

        return [Midi.NOTE_ON, note, VirtualKeyboard.velocity];
    },

    keyUp: function(key) {
        let note = VirtualKeyboard.noteFromKey(key, control.keyboard.octave);
        if (note === null) return;
        
        return [Midi.NOTE_OFF, note, VirtualKeyboard.velocity];
    },

    noteFromKey: function(key, octave) {
        let note = "awsedftgyhujkolp;'".indexOf(key.toLowerCase());
        if (note === -1) return null;
    
        return note + (octave - 1) * 12;
    }
};



let noteStack = [];

function noteStart(note, velocity) {
    noteStack.push(note);

    let freq = Midi.freqFromNote(note);

    for (let o of oscillators) {
        o.frequency.setValueAtTime(freq, audioCtx.currentTime);
        o.connect(audioCtx.destination);
    }
}

function noteStop(note, velocity) {
    // Remove note that was released.
    noteStack = noteStack.filter((n) => note != n);

    if (noteStack.length) {
        let  prevNote = noteStack[noteStack.length - 1];
        noteStart(prevNote, velocity);
        return;
    }

    // Get most recent note.

    // for (let i = 0; i < monophonicNoteStack.length; i++) {
    //     if (monophonicNoteStack[i] == note) {
    //         monophon
    //     }
    // }

    for (let o of oscillators) {
        o.disconnect(audioCtx.destination);
    }
}



function noteName(note) {

}

// function noteFromName(name, octave) {
//     let notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
//     let n = notes.indexOf(name);
//     if (n < 0) throw new Error('Invalid note name: ' + name);

//     if (octave < -1 || octave > 9) {
//         throw new Error('Octave out of range. Expecting between -1 and 9, got: ' + octave);
//     } 

//     let note = n + (octave + 1) * notes.length;
//     console.log(note);

//     if (note < 0 || note > 127) {
//         throw new Error('Note out of range. Expecting between 0 and 127, got: ' + note);
//     }

//     return note;
// }

// function noteFromKeyboard(key, startingOctave) {
//     let map = {
//         a: ['C', 0],
//         w: ['C#', 0],
//         s: ['D', 0],
//         e: ['D#', 0],
//         d: ['E', 0],
//         f: ['F', 0],
//         t: ['F#', 0],
//         g: ['G', 0],
//         y: ['G#', 0],
//         h: ['A', 1],
//         u: ['A#', 1],
//         j: ['B', 1],
//         k: ['C', 1],
//         o: ['C#', 1],
//         l: ['D', 1],
//         p: ['D#', 1],
//         ';': ['E', 1],
//         "'": ['F', 1]
//     }

//     let match = map[key.toLowerCase()];
//     return noteFromName(match[0], startingOctave + match[1]);
// }
