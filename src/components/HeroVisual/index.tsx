import React from "react";
import styles from "./styles.module.css";

/**
 * A stylized "proof lattice" — a bordered terminal-like frame containing:
 *   - an 8×8 grid of dots (the state space)
 *   - a merkle-tree pattern of 1.5px edges overlaid on the grid (the
 *     commitment structure)
 *   - three highlighted nodes that pulse in ember (the live computation)
 *   - an ember scan line that sweeps top→bottom, revealing the tree
 *   - a chromed "root hash" ticker at the bottom
 *
 * Pure SVG + CSS. No canvas, no JS. Respects prefers-reduced-motion via
 * the global guard in _motion.css.
 */
export default function HeroVisual(): JSX.Element {
  const rows = 8;
  const cols = 8;
  const cell = 32;
  const pad = 20;
  const size = pad * 2 + (cols - 1) * cell;

  const xy = (r: number, c: number) => ({
    cx: pad + c * cell,
    cy: pad + r * cell,
  });

  // --- Background dots (8x8 grid) ---
  const dots: JSX.Element[] = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      dots.push(
        <circle
          key={`dot-${r}-${c}`}
          cx={pad + c * cell}
          cy={pad + r * cell}
          r={1.75}
          className={styles.dot}
        />,
      );
    }
  }

  // --- Merkle-tree overlay: 4 levels, 15 nodes, 14 edges ---
  //        [root]
  //       /      \
  //    [L1a]    [L1b]
  //    /  \     /   \
  //  L2a L2b  L2c   L2d
  //  / \ / \  / \   / \
  //  …leaves at row 6…
  //
  // Positions chosen to occupy the grid cleanly; cols are even positions
  // so the 4 leaves live on rows 6 and the root lives near top-center.
  const treeNodes: Array<[number, number, "root" | "branch" | "leaf"]> = [
    // root
    [1, 3.5, "root"],
    // level 1
    [2.5, 1.5, "branch"],
    [2.5, 5.5, "branch"],
    // level 2
    [4, 0.5, "branch"],
    [4, 2.5, "branch"],
    [4, 4.5, "branch"],
    [4, 6.5, "branch"],
    // leaves
    [6, 0, "leaf"],
    [6, 1, "leaf"],
    [6, 2, "leaf"],
    [6, 3, "leaf"],
    [6, 4, "leaf"],
    [6, 5, "leaf"],
    [6, 6, "leaf"],
    [6, 7, "leaf"],
  ];

  // Edges: (parent index, child index) relative to treeNodes order
  const edges: Array<[number, number]> = [
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4],
    [2, 5],
    [2, 6],
    [3, 7],
    [3, 8],
    [4, 9],
    [4, 10],
    [5, 11],
    [5, 12],
    [6, 13],
    [6, 14],
  ];

  return (
    <div className={styles.root} aria-hidden="true">
      {/* frame chrome */}
      <div className={styles.frame}>
        <div className={styles.chromeTop}>
          <span className={styles.chromeLabel}>Proof lattice · RPO-256</span>
          <span className={styles.chromeStatus}>
            <span className={styles.chromeDot} />
            proving
          </span>
        </div>

        <svg
          className={styles.lattice}
          viewBox={`0 0 ${size} ${size}`}
          xmlns="http://www.w3.org/2000/svg"
          role="presentation"
        >
          <defs>
            {/* diagonal ember sweep */}
            <linearGradient id="heroSweep" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="transparent" />
              <stop
                offset="48%"
                stopColor="var(--color-brand)"
                stopOpacity="0.9"
              />
              <stop
                offset="52%"
                stopColor="var(--color-brand)"
                stopOpacity="0.9"
              />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            {/* edge shadow / glow */}
            <filter id="heroGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* background dots */}
          {dots}

          {/* Merkle-tree edges */}
          {edges.map(([a, b], i) => {
            const p = xy(treeNodes[a][0], treeNodes[a][1]);
            const q = xy(treeNodes[b][0], treeNodes[b][1]);
            return (
              <line
                key={`edge-${i}`}
                x1={p.cx}
                y1={p.cy}
                x2={q.cx}
                y2={q.cy}
                className={styles.edge}
                style={{ animationDelay: `${i * 80}ms` }}
              />
            );
          })}

          {/* Merkle-tree nodes */}
          {treeNodes.map(([r, c, kind], i) => {
            const { cx, cy } = xy(r, c);
            return (
              <circle
                key={`node-${i}`}
                cx={cx}
                cy={cy}
                r={kind === "root" ? 4 : kind === "branch" ? 3 : 2.5}
                className={`${styles.node} ${styles[`node-${kind}`]}`}
                style={{ animationDelay: `${i * 90}ms` }}
                filter={kind === "root" ? "url(#heroGlow)" : undefined}
              />
            );
          })}

          {/* ember scan sweep — vertical */}
          <rect
            x={0}
            y={-size}
            width={size}
            height={size * 0.6}
            fill="url(#heroSweep)"
            className={styles.sweep}
          />
        </svg>

        {/* bottom strip — hash commitment */}
        <div className={styles.chromeBottom}>
          <span className={styles.chromeLabel}>Root</span>
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
            …
          </code>
          <span className={styles.verifyBadge}>
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="m2 5 2 2 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            verified
          </span>
        </div>
      </div>

      {/* decorative soft ember glow behind the whole thing */}
      <div className={styles.glow} aria-hidden="true" />
    </div>
  );
}
