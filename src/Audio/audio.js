// class AudioGraph {
  // }
  
  // class WebAudioNode
  //     constructor() {
  //         this.defs = {
  // //         // Analyser​
  // //         // Audio​Buffer​Source
  // //         // Audio​Destination​
  // //         // Audio​
  // //         // Audio​Scheduled​Source​
  //             Biquad​Filter​: {
  //                 params: {
  //                     detune: {type: 'AudioParam', default: 0, min: 0, max: 0},
  //                     frequency: {type: 'AudioParam', default: 0, min: 0, max: 0},
  //                     gain: {type: 'AudioParam', default: 0, min: 0, max: 0},
  //                     Q: {type: 'AudioParam', default: 0, min: 0, max: 0},
  //                     type: {type: 'radio', default: 'lowpass', options: ['lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf', 'peaking', 'notch', 'allpass']}
  //                 }
  //             },
  // //         // Channel​Merger​
  // //         // Channel​Splitter​
  // //         // Constant​Source​
  // //         // Convolver​
  //             Delay​: {
  //                 params: {
  //                     delayTime: {type: 'AudioParam', default: 0, min: 0, max: 0}
  //                 }
  //             },
  // //         // Dynamics​Compressor​
  //             Gain​: {
  //                 params: {
  //                     value: {type: 'AudioParam', default: 0, min: 0, max: 0}
  //                 }
  //             },
  // //         // IIRFilter​
  // //         // Media​Element​Audio​Source​
  // //         // Media​Stream​Audio​Destination​
  // //         // Media​Stream​Audio​Source​
  //             OscillatorNode: {
  //                 params: {
  //                     detune: {type: 'AudioParam', default: 0, min: 0, max: 0},
  //                     frequency: {type: 'AudioParam', default: 0, min: 0, max: 0},
  //                     type: {type: 'radio', default: 'sine', options: ['sine', 'square', 'sawtooth', 'triangle']}
  //                 }
  //             }
  // //         // Panner​
  // //         // Stereo​Panner​
  // //         // Wave​Shaper​
  //         };
  //     }
  
  
  // }

  // let params = {
  //     osc1Type: {type: 'select', options: ['sine', 'square']},
  //     osc1Gain: {type: 'range', min: 0, max: 1, default: 0.5},
  //     osc2Type: {type: 'select', options: ['sine', 'square']},
  //     osc2Gain: {type: 'range', min: 0, max: 1, default: 0.5},
  //     filterFreq: {},
  // }


// True when we're listening for events that might trigger audio.
let listening = false;

// True when audio graph initialized.
let init = false;

let audioCtx = null;

let control = {};


// eslint-disable-next-line no-unused-vars
class NodeGate {
    constructor() {
        this.pairs = [];
    }

    add(src, dest) {
        this.pairs.push([src, dest]);
    }

    connect() {
        for (let p of this.pairs) {
            p[0].connect(p[1]);
        }
    }

    disconnect() {
        for (let p of this.pairs) {
            p[0].disconnect();
        }
    }
}





//const oscGate = new NodeGate();
const ZERO_GAIN = 0;

const nodes = {
    osc1: null,
    osc1gain: null,
    osc2: null,
    osc2gain: null,
    ampGain: null,
    filter: null,
    delay: null,
    delayGain: null,
    analyzer: null
};

function initNodes() {
    nodes.osc1 = audioCtx.createOscillator();
    nodes.osc2 = audioCtx.createOscillator();

    nodes.osc1gain = audioCtx.createGain();
    nodes.osc2gain = audioCtx.createGain();
    nodes.ampGain = audioCtx.createGain();

    nodes.filter = audioCtx.createBiquadFilter();

    nodes.delay = audioCtx.createDelay();
    nodes.delayGain = audioCtx.createGain();

    nodes.analyzer = audioCtx.createAnalyser();

    // Oscillators are special.
    oscillators.push(nodes.osc1);
    oscillators.push(nodes.osc2);
    nodes.osc1.start();
    nodes.osc2.start();
}

function initParams() {
    nodes.osc1.type = 'square';
    nodes.osc2.type = 'sawtooth';
    //nodes.osc2.detune.value = -1200;

    nodes.osc1gain.gain.value = 0.25;
    nodes.osc2gain.gain.value = 0.25;
    nodes.ampGain.gain.value = ZERO_GAIN;

    nodes.filter.type = 'lowpass';
    nodes.filter.frequency.value = 800;
    nodes.filter.Q.value = 10;

    nodes.delay.delayTime.value = 0.06;
    nodes.delayGain.gain.value = 0.5;

    nodes.analyzer.fftSize = Math.pow(2, 10);
    nodes.analyzer.minDecibels = -90;
    nodes.analyzer.maxDecibels = -10;
}

function initGraph() {
    //oscGate.add(nodes.osc1, nodes.osc1gain);
    //oscGate.add(nodes.osc2, nodes.osc2gain);
    nodes.osc1.connect(nodes.osc1gain);
    nodes.osc2.connect(nodes.osc2gain);

    nodes.osc1gain.connect(nodes.filter);
    nodes.osc2gain.connect(nodes.filter);

    nodes.filter.connect(nodes.ampGain);

    nodes.ampGain.connect(audioCtx.destination);

    nodes.ampGain.connect(nodes.delay);
    nodes.delay.connect(nodes.delayGain);
    nodes.delayGain.connect(audioCtx.destination);
    nodes.delayGain.connect(nodes.delay);

    nodes.ampGain.connect(nodes.analyzer);
}

function triggerADS(param, a, av, d, s) {
    let now = audioCtx.currentTime;
    param.cancelScheduledValues(now);
    param.setValueAtTime(param.value, now);
    param.linearRampToValueAtTime(av, now + a);
    param.linearRampToValueAtTime(s, now + a + d);
}

function triggerR(param, r, value) {
    let now = audioCtx.currentTime;
    param.cancelScheduledValues(now);
    param.setValueAtTime(param.value, now);
    param.linearRampToValueAtTime(value, now + r);
}




/**
 * keys -> key map, to midi message
 * arp / repeater -> read midi notes, output own midi message
 * osc (many for one note, many for many notes)
 *  single: recent note played
 *  poly: each note played spawns chain / own signal path for poly
 */


export class AudioEngine {
    start() {
        if (listening) return;

        initControls();

        // Audio will initialize automatically when first event is registered.
        listening = true;
        document.body.addEventListener('keydown', handleKeyDown);
        document.body.addEventListener('keyup', handleKeyUp);
    }

    getFftSize() {
        return Math.pow(2, 10);
    }

    getFloatTimeDomainData(samples) {
        if (!nodes.analyzer) return;
        if (!nodes.analyzer.getFloatTimeDomainData) return;
        nodes.analyzer.getFloatTimeDomainData(samples);
    }
}

export function main() {
    if (init) return false;
    init = true;

    // create web audio api context
    initAudio();

    // create Oscillator node
    //initOscillators();
    //oscInit();
    initNodes();
    initParams();
    initGraph();
    //noteStart();
}

export function getAnalyzer() {
    return nodes.analyzer;
}

function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function handleKeyDown(e) {
    // Can only initialize audio after user input.
    if (!init) main();

    let midiEvent = VirtualKeyboard.keyDown(e.key);
    if (!midiEvent) return;
    handleMidi(midiEvent);
}

function handleKeyUp(e) {
    let midiEvent = VirtualKeyboard.keyUp(e.key);
    if (!midiEvent) return;
    handleMidi(midiEvent);
}





function addControlGroup(name, label, cb) {
    let legend = document.createElement('legend');
    legend.innerText = label;
    let fieldset = document.createElement('fieldset');
    fieldset.id = name;
    fieldset.append(legend);
    // document.body.append(fieldset);
}

function addRange(group, name, label, min, max, value) {
    let id = group + '-' + name;
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
}

function initControls() {
    addControlGroup('keyboard', 'Keyboard');
    addRange('keyboard', 'octave', 'Octave', -1, 9, 4);
}







let oscillators = [];

function oscStart(note) {
    let freq = Midi.freqFromNote(note);
    for (let o of oscillators) {
        o.frequency.setValueAtTime(freq, audioCtx.currentTime);
    }

    triggerADS(nodes.ampGain.gain, 0.01, 1, 0.1, 0.8);
    triggerADS(nodes.filter.frequency, 1, 1500, 0.8, 330);
}

function oscStop() {
    triggerR(nodes.ampGain.gain, 0.2, ZERO_GAIN);
    triggerR(nodes.filter.frequency, 0.1, 330);
}






function handleMidi(data) {
    // Value is unused: cmd
    //let cmd = data[0] >> 4;

    // Value is unused: channel
    //let channel = data[0] & 0xf;

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
        
        default:
            console.log('Unknown MIDI value: ' + type);
    }
}

const Midi = {
    NOTE_ON: 144,
    NOTE_OFF: 128,

    freqFromNote: function(note) {
        return 440 * Math.pow(2, (note - 69) / 12);
    }
}


// TODO track and debounce keys here instead of in noteStart... or both!
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


/**
 * Monophonic note controller.
 * 
 * Resumes previous note after release.
 */

let noteStack = [];

function noteStart(note, velocity) {
    // debounce, each note can only be added once.
    if (noteStack.indexOf(note) !== -1) return;

    noteStack.push(note);
    oscStart(note);

    updateColor();
}

function noteStop(note, velocity) {
    // Remove note that was released.
    noteStack = noteStack.filter((n) => note !== n);

    if (noteStack.length) {
        let  prevNote = noteStack[noteStack.length - 1];
        oscStart(prevNote);
        updateColor();
    } else {
        oscStop();
        unsetColor();
    }
}

let lastH = 0;
function updateColor() {
    let inc = Math.floor(Math.random() * 128) + 64;
    let h = (lastH + inc) % 255;
    lastH = h;

    let primary = `hsl(${h}, 100%, 75%)`;
    let secondary = `hsl(${h}, 10%, 50%)`;
    let background = `hsl(${h}, 10%, 10%)`;

    document.body.style.backgroundColor = background;

    document.querySelectorAll('button').forEach((b) => {
        b.style.backgroundColor = secondary;
    });

    document.querySelector('.App-title').style.color = secondary;

    window.noteColor = primary;
}

function unsetColor() {
    document.body.style.backgroundColor = '';
    document.querySelectorAll('button').forEach((b) => {
        b.style.backgroundColor = '';
    });
    document.querySelector('.App-title').style.color = '';
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
  