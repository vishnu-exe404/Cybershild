import React, { useEffect, useState } from 'react';

/** Types text out character by character with a blinking caret. Static if reduced-motion. */
export default function TypeText({ text, speed = 22 }) {
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [count, setCount] = useState(reduce ? text.length : 0);

  useEffect(() => {
    if (reduce) {
      setCount(text.length);
      return undefined;
    }
    setCount(0);
    const id = setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          clearInterval(id);
          return c;
        }
        return c + 1;
      });
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, reduce]);

  return (
    <span>
      {text.slice(0, count)}
      <span className="type-caret" aria-hidden="true" />
    </span>
  );
}
