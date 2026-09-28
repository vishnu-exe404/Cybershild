import React, { useEffect, useRef } from 'react';
import { useTheme } from '../services/theme.jsx';

const GLYPHS = '01アイウエオカキクケコサシスセソ<>/{}[]$#%&*+=';

/**
 * Animated cyber backdrop: matrix rain (canvas) + perspective grid floor + scanlines.
 * - Pauses when the tab is hidden, capped at ~30fps, DPR-limited for performance.
 * - Respects prefers-reduced-motion (draws one static frame, no loop).
 */
export default function CyberBackground() {
  const canvasRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fontSize = 16;
    let width = 0;
    let height = 0;
    let drops = [];
    let raf = 0;
    let last = 0;

    const color = () => getComputedStyle(document.documentElement).getPropertyValue('--c1').trim() || '#00f5d4';

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.ceil(width / fontSize);
      drops = Array.from({ length: cols }, () => Math.floor(Math.random() * (height / fontSize)));
    }

    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (now - last < 33) return; // ~30fps
      last = now;
      // Fade previous frame toward transparent to create trails.
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.09)';
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';
      ctx.font = `${fontSize}px "Share Tech Mono", monospace`;
      const c = color();
      for (let i = 0; i < drops.length; i++) {
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillStyle = '#ffffff'; // bright head
        ctx.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)], x, y);
        ctx.fillStyle = c;
        ctx.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)], x, y - fontSize);
        if (y > height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 1;
      }
    }

    function onVisibility() {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduce) raf = requestAnimationFrame(frame);
    }

    resize();
    if (reduce) {
      // one static frame
      ctx.font = `${fontSize}px monospace`;
      ctx.fillStyle = color();
      drops.forEach((d, i) => ctx.fillText(GLYPHS[(i * 7) % GLYPHS.length], i * fontSize, d * fontSize));
    } else {
      raf = requestAnimationFrame(frame);
    }
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [theme]);

  return (
    <div className="cyber-bg" aria-hidden="true">
      <canvas ref={canvasRef} className="cyber-rain" />
      <div className="cyber-grid" />
      <div className="cyber-vignette" />
      <div className="scanlines" />
    </div>
  );
}
