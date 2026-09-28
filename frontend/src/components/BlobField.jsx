import React from 'react';

/** Decorative animated gradient blobs used behind auth-page glass cards. */
export default function BlobField() {
  return (
    <div className="blob-field" aria-hidden="true">
      <span className="blob b1" />
      <span className="blob b2" />
      <span className="blob b3" />
    </div>
  );
}
