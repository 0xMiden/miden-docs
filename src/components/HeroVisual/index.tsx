import React from "react";
import styles from "./styles.module.css";

/**
 * A static SVG "proof lattice" — an 8×8 grid of dots with a diagonal
 * ember scanline sweeping across. Each dot gets a staggered opacity
 * animation so the sweep visually "activates" them in sequence.
 *
 * Pure SVG + CSS. No canvas, no JS. Respects prefers-reduced-motion
 * via the global guard in _motion.css.
 */
export default function HeroVisual(): JSX.Element {
  const rows = 8;
  const cols = 8;
  const cell = 28; // px
  const pad = 14;
  const size = pad * 2 + (cols - 1) * cell;

  const dots: JSX.Element[] = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const idx = r * cols + c;
      const delay = ((r + c) * 120) % 2000;
      dots.push(
        <circle
          key={idx}
          cx={pad + c * cell}
          cy={pad + r * cell}
          r={2}
          className={styles.dot}
          style={{ animationDelay: `${delay}ms` }}
        />,
      );
    }
  }

  return (
    <div className={styles.root} aria-hidden="true">
      <svg
        className={styles.lattice}
        viewBox={`0 0 ${size} ${size}`}
        xmlns="http://www.w3.org/2000/svg"
        role="presentation"
      >
        <defs>
          <linearGradient id="heroSweep" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="45%" stopColor="var(--color-brand)" stopOpacity="0.9" />
            <stop offset="55%" stopColor="var(--color-brand)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* Static dots */}
        {dots}

        {/* Sweeping ember line */}
        <line
          x1={pad}
          y1={-size}
          x2={size - pad}
          y2={size}
          stroke="url(#heroSweep)"
          strokeWidth={1.5}
          className={styles.sweep}
        />
      </svg>

      {/* Mono hex ticker — decorative, low-signal */}
      <div className={styles.hashTicker}>
        <span className={styles.hashLabel}>proof</span>
        <code className={styles.hashValue}>
          0x
          <span data-anim-cycle>a3</span>
          <span data-anim-cycle>f9</span>
          <span data-anim-cycle>12</span>
          <span data-anim-cycle>7b</span>
          <span data-anim-cycle>e0</span>
          <span data-anim-cycle>4c</span>
          <span data-anim-cycle>55</span>
          <span data-anim-cycle>d8</span>
        </code>
      </div>
    </div>
  );
}
