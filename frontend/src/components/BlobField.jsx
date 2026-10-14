import React from 'react';

/** Decorative mandala/lotus corner ornaments used behind page content. */
export default function BlobField() {
  return (
    <div className="blob-field" aria-hidden="true">
      <span className="corner-mandala cm-tl" />
      <span className="corner-mandala cm-br" />
    </div>
  );
}
