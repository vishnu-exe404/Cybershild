import React, { useEffect, useRef } from 'react';

/**
 * Purely decorative animated radar sweep (ambient visual flourish, same
 * spirit as the matrix-rain background). It does NOT represent real threat
 * telemetry - the actual data lives in <LiveFeed>, sourced from the real
 * database.
 */
export default function RadarCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let angle = 0;
    let raf = 0;
    const blips = Array.from({ length: 6 }, () => ({
      r: 20 + Math.random() * 100,
      theta: Math.random() * Math.PI * 2,
      alpha: 0.3 + Math.random() * 0.6,
    }));

    function draw() {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const maxR = w / 2 - 10;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(0,245,212,0.22)';
      for (let r = 34; r <= maxR; r += 34) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
      grad.addColorStop(0, 'rgba(0,245,212,0.25)');
      grad.addColorStop(1, 'transparent');
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR, angle - 0.5, angle);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      for (const b of blips) {
        const bx = cx + Math.cos(b.theta) * b.r;
        const by = cy + Math.sin(b.theta) * b.r;
        ctx.beginPath();
        ctx.arc(bx, by, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,245,212,${b.alpha})`;
        ctx.fill();
      }
    }

    if (reduce) {
      draw();
    } else {
      const loop = () => {
        angle = (angle + 0.02) % (Math.PI * 2);
        draw();
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} width={160} height={160} className="radar-canvas" aria-hidden="true" />;
}
