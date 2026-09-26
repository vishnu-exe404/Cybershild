import React from 'react';

export function SkeletonLine({ width = '100%', height = '1rem' }) {
  return <div className="skeleton" style={{ width, height }} />;
}

export function SkeletonCard() {
  return (
    <div className="card skeleton-card">
      <SkeletonLine width="40%" height="1.4rem" />
      <SkeletonLine width="70%" />
      <SkeletonLine width="55%" />
    </div>
  );
}

export function SkeletonTableRows({ rows = 5, cols = 4 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((__, c) => (
            <td key={c}>
              <SkeletonLine />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
