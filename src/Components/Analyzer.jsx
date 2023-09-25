import React, {useEffect, useRef} from 'react';
import './Analyzer.css';

export default function Analyzer(props) {
  let canvasRef = useRef(null);

  useEffect(() => {
    // Init.
    let ctx = canvasRef.current.getContext('2d');
    let samples = new Float32Array(props.audio.getFftSize());

    // Loop.
    let cancel = null;
    let frame = () => {
      draw(canvasRef.current, ctx, props.audio, samples);
      cancel = requestAnimationFrame(frame);
    };

    // Start loop.
    frame();

    // Cleanup.
    return () => cancelAnimationFrame(cancel);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="Analyzer">
      <canvas ref={canvasRef} />
    </div>
  );
}


function getSamplesBasic(audio, samples) {
  audio.getFloatTimeDomainData(samples);

  const skip = 5;

  let min = Number.MAX_VALUE;
  let max = Number.MIN_VALUE;
  let minIndex;
  for (let i = 0; i < samples.length * 0.75; i += 5) {
    // if (samples[i] > max) max = samples[i];
    // if (samples[i] < min) min = samples[i];

    if (samples[i] < min) {
      min = samples[i];
      minIndex = i;
    }
  }

  return [minIndex, samples.length - 1];

  // let between = [];
  // let found = false;
  // for (let i = 0; i < samples.length; i += 1) {
  //   if (!found && samples[i] === min) {
  //     between.push(i);
  //     found = true;
  //   } else if (found && samples[i] > min) {
  //     found = false;
  //   }

  //   if (between.length >= 2) {
  //     break;
  //   }
  // }

  // let [beginIndex, endIndex] = between;

  // let start = 0;
  // let longestStart = 0;
  // let longestDist = 0;
  // let bottom = false;
  // for (var i = 0; i < samples.length; i += 1) {
  //   if (!bottom && samples[i] <= min * 0.98) {
  //     start = i;
  //     bottom = true;
  //   } else if (bottom && samples[i] >= max * 0.98) {
  //     const dist = i - start;
  //     if (dist > longestDist) {
  //       longestDist = dist;
  //       longestStart = i;
  //     }
  //     bottom = false;
  //   }
  // }
}

function getSamplesForNote(audio, samples) {
  const skip = 1;

  const freq = audio.getCurrentFreq();
  const samplesPerCycle = Math.floor(audio.getSampleRate() / freq);
  console.log('samplesPerCycle', samplesPerCycle);

  // Don't go past end of array
  const limit = Math.min(samplesPerCycle, samples.length - 1);

  let min = Number.MAX_VALUE;
  let minIndex;
  for (let i = 0; i <= limit; i += skip) {
    if (samples[i] < min) {
      min = samples[i];
      minIndex = i;
    }
  }

  return [minIndex, minIndex + samplesPerCycle];
}

function draw(canvas, ctx, audio, samples) {
  audio.getFloatTimeDomainData(samples);
  
  // const [begin, end] = getSamplesBasic(audio, samples);
  const [begin, end] = getSamplesForNote(audio, samples);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (samples[0] === 0) return;

  // canvas.width = canvas.clientWidth;
  // canvas.height = canvas.clientHeight;
  ctx.lineWidth = 3;
  ctx.strokeStyle = window.noteColor;
  ctx.beginPath();

  const freq = audio.getCurrentFreq();
  const samplesPerCycle = Math.floor(audio.getSampleRate() / freq);
  const SAMPLES_PER_PIXEL = 3;
  const xStep = 2;
  const iStep = SAMPLES_PER_PIXEL * xStep;
  let x = 0;

  let i = begin;
  while (x <= canvas.width) {
    const ii = i < samples.length ? i : i - samplesPerCycle;
    const v = samples[ii] * (canvas.height / 2);
    const y = canvas.height / 2 + v;

    if (x === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    x += xStep;
    i += iStep;
    if (i > end) {
      i = begin;
    }
  }

  ctx.stroke();
}


// eslint-disable-next-line no-unused-vars
function useAnimationFrame() {
  useEffect(() => {
      let animationFrame = null;

      function loop() {
        animationFrame = requestAnimationFrame(loop);
      }

      // Start.
      animationFrame = requestAnimationFrame(loop);

      // Clean things up
      return () => cancelAnimationFrame(animationFrame);
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    true // Only run once (value is static and doesn't change)
  );
}
