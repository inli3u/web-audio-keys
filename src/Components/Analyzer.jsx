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

function getSamplesForNote(audio, samples) {
  const freq = audio.getCurrentFreq();
  const samplesPerCycle = Math.floor(audio.getSampleRate() / freq);

  // Don't go past end of array
  const limit = Math.min(samplesPerCycle, samples.length - 1);

  let min = Number.MAX_VALUE;
  let minIndex;
  for (let i = 0; i <= limit; i += 1) {
    if (samples[i] < min) {
      min = samples[i];
      minIndex = i;
    }
  }

  return [minIndex, minIndex + samplesPerCycle];
}

function draw(canvas, ctx, audio, samples) {
  audio.getFloatTimeDomainData(samples);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (samples[0] === 0) return;
  

  // Find cycle start / end

  const freq = audio.getCurrentFreq();
  const samplesPerCycle = Math.floor(audio.getSampleRate() / freq);

  // Don't go past end of array
  const limit = Math.min(samplesPerCycle, samples.length - 1);

  let min = Number.MAX_VALUE;
  let minIndex;
  for (let i = 0; i <= limit; i += 1) {
    if (samples[i] < min) {
      min = samples[i];
      minIndex = i;
    }
  }
  const maxIndex = minIndex + samplesPerCycle;
  

  // Draw samples

  const SAMPLES_PER_PIXEL = 3;
  const xStep = 2;
  const iStep = SAMPLES_PER_PIXEL * xStep;
  let x = 0;
  let i = minIndex;

  ctx.lineWidth = 3;
  ctx.strokeStyle = window.noteColor;
  ctx.beginPath();
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
    if (i > maxIndex) {
      i = minIndex;
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
