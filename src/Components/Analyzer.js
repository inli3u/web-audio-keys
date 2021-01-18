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
  const skip = 5;

  for (var i = 0; i < samples.length; i += skip) {
    var v = samples[i] * (canvas.height / 2);
    var y = canvas.height / 2 + v;

    if(i === 0) {
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
