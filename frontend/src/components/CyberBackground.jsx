import React from 'react';

/**
 * Heritage backdrop: two slowly turning gold mandalas and a faint temple
 * skyline. Pure CSS (transform-only animation) so it is cheap on the GPU and
 * is switched off automatically under prefers-reduced-motion.
 */
export default function CyberBackground() {
  return (
    <div className="heritage-bg" aria-hidden="true">
      <span className="heritage-mandala hm-a" />
      <span className="heritage-mandala hm-b" />
      <span className="heritage-temples" />
    </div>
  );
}
