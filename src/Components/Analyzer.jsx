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



function draw(canvas, ctx, audio, samples) {
  audio.getFloatTimeDomainData(samples);

  const skip = 5;

  let min = Number.MAX_VALUE;
  let max = Number.MIN_VALUE;
  for (var i = 0; i < samples.length; i += 1) {
    if (samples[i] > max) max = samples[i];
    if (samples[i] < min) min = samples[i];
  }

  let start = 0;
  let longestStart = 0;
  let longestDist = 0;
  let bottom = false;
  for (var i = 0; i < samples.length; i += 1) {
    if (!bottom && samples[i] === min) {
      start = i;
      bottom = true;
    } else if (bottom && samples[i] === max) {
      const dist = i - start;
      if (dist > longestDist) {
        longestDist = dist;
        longestStart = i;
      }
      bottom = false;
    }
  }

  //ctx.fillStyle = 'rgb(200, 200, 200)';
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (samples[0] === 0) return;

  // canvas.width = canvas.clientWidth;
  // canvas.height = canvas.clientHeight;
  ctx.lineWidth = 3;
  ctx.strokeStyle = window.noteColor;
  ctx.beginPath();

  var sliceWidth = canvas.width * 1.0 / samples.length;
  var x = 0;

  for (var i = longestStart; i < samples.length; i += skip) {
    var v = samples[i] * (canvas.height / 2);
    var y = canvas.height / 2 + v;

    if(i === longestStart) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    x += sliceWidth * skip;
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
